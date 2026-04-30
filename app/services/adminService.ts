// app/services/adminService.ts

'use server'

import connectDB from '@/app/lib/mongodb'
import { User } from '@/app/models/User'
import { getSessionUser } from '@/app/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { IProduct } from '@/app/types'
import { Product } from '@/app/models/Product'
import mongoose, { UpdateQuery, Document } from 'mongoose'


export type ProductUpdateDTO = Partial<
  Omit<IProduct, keyof Document | 'updatedBy' | 'category'>
> & {
  category?: string
}

async function ensureAdmin() {
  const currentUser = await getSessionUser()
  const allowedRoles: string[] = ['admin', 'editor']

  if (!currentUser || !allowedRoles.includes(currentUser.role)) {
    throw new Error('Unauthorized: Admins or Editors only')
  }
  return currentUser
}

export async function getAdminStaff() {
  try {
    await ensureAdmin()
    await connectDB()
    // Fetch both admins and editors
    const staff = await User.find({ role: { $in: ['admin', 'editor'] } })
      .select('fullName email image role isSuperAdmin') 
      .lean()
    return JSON.parse(JSON.stringify(staff))
  } catch (error) {
    throw new Error('Failed to fetch staff list')
  }
}

export async function updateStaffRole(
  email: string,
  fullName: string,
  role: 'admin' | 'editor' | 'customer',
) {
  try {
    await ensureAdmin()
    await connectDB()

    const normalizedEmail = email.toLowerCase()
    const existingUser = await User.findOne({ email: normalizedEmail })

    if (!existingUser) {
      return { success: false, error: 'User not found.' }
    }

    // PROTECT SUPER ADMIN: Prevent any role changes to a super admin
    if (existingUser.isSuperAdmin) {
      return {
        success: false,
        error: 'Permission Denied: Super Admin accounts cannot be modified.',
      }
    }

    if (existingUser.role === 'admin' || existingUser.role === 'editor') {
      return { success: false, error: `${email} is already authorized.` }
    }

    existingUser.fullName = fullName
    existingUser.role = role
    await existingUser.save()

    revalidatePath('/admin/team')
    return {
      success: true,
      message: `Successfully promoted ${email} to ${role}`,
    }
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message }
  }
}

export async function revokeAdminAccess(userId: string) {
  try {
    const currentUser = await ensureAdmin()
    await connectDB()

    const targetUser = await User.findById(userId)

    if (!targetUser) {
      return { success: false, error: 'User not found' }
    }

    // PROTECT SUPER ADMIN: Ensure they cannot be revoked
    if (targetUser.isSuperAdmin) {
      return {
        success: false,
        error: 'Critical Error: Super Admin access cannot be revoked.',
      }
    }

    // Optional: Only allow a Super Admin to revoke other Admins
    if (!currentUser.isSuperAdmin && targetUser.role === 'admin') {
      return { success: false, error: 'Only a Super Admin can revoke Admin access.' }
    }

    targetUser.role = 'customer' 
    await targetUser.save()

    revalidatePath('/admin/team')
    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message }
  }
}

export async function updateProduct(id: string, data: ProductUpdateDTO) {
  try {
    const adminUser = await ensureAdmin() 
    await connectDB()

    const updatePayload: UpdateQuery<IProduct> = {
      $set: {
        ...data,
        // updatedBy: adminUser._id,
        updatedBy: new mongoose.Types.ObjectId(adminUser._id as string),
      },
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    })

    // console.log('Updated Product:', updatedProduct)

    if (!updatedProduct) return { success: false, error: 'Product not found' }

    revalidatePath('/admin/products')
    revalidatePath(`/admin/products/edit/${id}`)

    return { success: true, message: 'Product updated successfully' }
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Update failed',
    }
  }
}

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
      return {
        success: false,
        error: 'Only a Super Admin can revoke Admin access.',
      }
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

    if (!adminUser?._id) throw new Error('Admin ID not found in session')

    const updatePayload: UpdateQuery<IProduct> = {
      $set: {
        ...data,
        updatedBy: adminUser._id,
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

export async function getPendingProducts() {
  try {
    await ensureAdmin()
    await connectDB()

    // Fetch products that need review, populating vendor and category details
    const products = await Product.find({ approvalStatus: 'pending' })
      .populate('vendor', 'fullName email vendorProfile')
      .populate('category', 'name')
      .sort({ createdAt: 1 })
      .lean()

      console.log('Fetched pending products:', products)

    return JSON.parse(JSON.stringify(products))
  } catch (error) {
    throw new Error('Failed to fetch pending products')
  }
}

export async function getRejectedProducts() {
  try {
    await connectDB()
    const products = await Product.find({ approvalStatus: 'rejected' })
      .populate('vendor', 'fullName email vendorProfile')
      .populate('category', 'name')
      .sort({ updatedAt: -1 }) // Show most recently rejected first
      .lean()

    return JSON.parse(JSON.stringify(products))
  } catch (error) {
    throw new Error('Failed to fetch rejected products')
  }
}

export async function updateProductApproval(
  productId: string,
  status: 'approved' | 'rejected',
  comment?: string, 
) {
  try {
    const admin = await ensureAdmin()
    await connectDB()

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        $set: {
          approvalStatus: status,
          updatedBy: admin._id,
          isPublished: status === 'approved',
        },
        // We push to the logs array to keep a history of the decision
        $push: {
          approvalLogs: {
            status,
            comment:
              comment ||
              (status === 'approved'
                ? 'Product approved.'
                : 'No reason provided.'),
            adminId: admin._id,
            createdAt: new Date(),
          },
        },
      },
      { new: true },
    )

    if (!updatedProduct) return { success: false, error: 'Product not found' }

    revalidatePath('/admin/products')
    revalidatePath('/vendor/products')


    return {
      success: true,
      message: `Product ${status === 'approved' ? 'is now live' : 'has been rejected'}`,
    }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}
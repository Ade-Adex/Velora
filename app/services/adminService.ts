// app/services/adminService.ts

'use server'

import connectDB from '@/app/lib/mongodb'
import { User } from '@/app/models/User'
import { getSessionUser } from '@/app/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { IProduct } from '@/app/types'
import { Product } from '@/app/models/Product'
import { UpdateQuery, Document } from 'mongoose'


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
    const staff = await User.find({ role: 'admin' })
      .select('fullName email image role')
      .lean()
    return JSON.parse(JSON.stringify(staff))
  } catch (error) {
    throw new Error('Failed to fetch staff list')
  }
}

export async function updateStaffRole(
  email: string,
  fullName: string,
  role: 'admin' | 'user',
) {
  try {
    await ensureAdmin()
    await connectDB()

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { fullName, role },
      { upsert: true, new: true },
    )

    revalidatePath('/admin/team') // Clears cache so the list updates instantly
    return { success: true, message: `Successfully set ${email} as ${role}` }
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message }
  }
}

export async function revokeAdminAccess(userId: string) {
  try {
    await ensureAdmin()
    await connectDB()

    await User.findByIdAndUpdate(userId, { role: 'user' })

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
        updatedBy: adminUser._id, // Set the ID of the person making changes
      },
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    })

    console.log('Updated Product:', updatedProduct)

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
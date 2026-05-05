//  /app/services/vendor-service.ts

'use server'

import connectDB from '@/app/lib/mongodb'
import { Product } from '@/app/models/Product'
import { Order } from '@/app/models/Order'
import { User } from '@/app/models/User'
import { getCurrentUser } from '@/app/services/auth-service'
import {
  IProduct,
  IOrder,
  IUser,
  Serialized,
  IVendorProfile,
  IOrderItem,
} from '@/app/types'
import { revalidatePath } from 'next/cache'



export type ProductUpdateDTO = Partial<
  Omit<IProduct, keyof Document | 'updatedBy' | 'category'>
> & {
  category?: string
}

/**
 * Security: Ensures session exists and user is a Vendor or Admin
 */
export async function ensureVendor(): Promise<Serialized<IUser>> {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'vendor' && user.role !== 'admin')) {
    throw new Error('Unauthorized: Vendor access required.')
  }
  return user as Serialized<IUser>
}

/**
 * Fetches all products belonging to the current vendor
 */
export async function getVendorProducts(): Promise<Serialized<IProduct>[]> {
  await connectDB()
  const user = await ensureVendor()

  const products = await Product.find({ vendor: user._id })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .lean()

  return JSON.parse(JSON.stringify(products))
}


/**
 * Fetches a single product by ID, ensuring it belongs to the current vendor
 */
export async function getVendorProductById(id: string): Promise<Serialized<IProduct> | null> {
  try {
    await connectDB()
    const user = await ensureVendor()

    const product = await Product.findOne({ 
      _id: id, 
      vendor: user._id 
    })
    .populate('category', 'name _id')
    .lean()

    if (!product) return null

    return JSON.parse(JSON.stringify(product))
  } catch (error) {
    console.error('Error fetching vendor product:', error)
    return null
  }
}

/**
 * Fetches orders containing items from this vendor,
 * filtering out items belonging to other sellers.
 */
export async function getVendorOrders(): Promise<Serialized<IOrder>[]> {
  await connectDB()
  const user = await ensureVendor()

  const orders = await Order.find({ 'items.vendor': user._id })
    .sort({ createdAt: -1 })
    .lean()

  const filteredOrders = orders.map((order) => {
    const typedOrder = order as unknown as IOrder
    return {
      ...order,
      items: typedOrder.items.filter(
        (item: IOrderItem) => item.vendor.toString() === user._id.toString(),
      ),
    }
  })

  return JSON.parse(JSON.stringify(filteredOrders))
}

/**
 * Updates Vendor Shop Profile and Bank Details
 */
export async function updateVendorProfile(
  data: Partial<IVendorProfile>,
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB()
    const user = await ensureVendor()

    const updateData: Record<string, unknown> = {}
    if (data.shopName) updateData['vendorProfile.shopName'] = data.shopName
    if (data.description)
      updateData['vendorProfile.description'] = data.description
    if (data.bankDetails)
      updateData['vendorProfile.bankDetails'] = data.bankDetails

    await User.findByIdAndUpdate(user._id, { $set: updateData })

    revalidatePath('/vendor/settings')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Profile update failed',
    }
  }
}


// /app/services/vendor-service.ts (Add this)

export async function updateVendorProduct(id: string, data: ProductUpdateDTO) {
  try {
    const user = await ensureVendor(); 
    await connectDB();

    // CRITICAL: Ensure the vendor actually OWNS the product they are trying to edit
    const product = await Product.findOne({ _id: id, vendor: user._id });
    
    if (!product) {
      return { success: false, error: 'Product not found or unauthorized' };
    }

    // Logic: If a vendor edits an approved product, you might want to set it back to 'pending'
    // so an admin can re-review the changes.
    const updatePayload = {
      ...data,
      approvalStatus: 'pending', // Re-verify on edit (optional but safer)
      updatedBy: user._id,
    };

    await Product.findByIdAndUpdate(id, { $set: updatePayload });

    revalidatePath('/vendor/products');
    return { success: true, message: 'Product updated and sent for review.' };
  } catch (error) {
    return { success: false, error: 'Failed to update product' };
  }
}
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
import { Types } from 'mongoose'

/**
 * Security: Ensures session exists and user is a Vendor or Admin
 */
async function ensureVendor(): Promise<Serialized<IUser>> {
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
 * Updates fulfillment for a specific line item in a multi-vendor order
 */
// export async function updateItemFulfillment(
//   orderId: string,
//   itemId: string,
//   status: IOrderItem['fulfillmentStatus'],
// ): Promise<{ success: boolean; error?: string }> {
//   try {
//     await connectDB()
//     const user = await ensureVendor()

//     const result = await Order.updateOne(
//       {
//         _id: orderId,
//         'items._id': itemId,
//         'items.vendor': user._id,
//       },
//       { $set: { 'items.$.fulfillmentStatus': status } },
//     )

//     if (result.modifiedCount === 0) {
//       return { success: false, error: 'Item not found or unauthorized' }
//     }

//     revalidatePath('/vendor/orders')
//     return { success: true }
//   } catch (error) {
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : 'Update failed',
//     }
//   }
// }

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
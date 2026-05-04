// /app/services/order-service.ts

'use server'

import connectDB from '@/app/lib/mongodb'
import { Order } from '@/app/models/Order'
import { Serialized, IOrder } from '@/app/types'
import { UpdateQuery } from 'mongoose'

export async function getOrderByIdAction(
  orderId: string,
): Promise<Serialized<IOrder> | null> {
  try {
    await connectDB()
    const order = await Order.findById(orderId).populate('items.product').lean()

    if (!order) return null

    return JSON.parse(JSON.stringify(order))
  } catch (error) {
    console.error('Action Error fetching order:', error)
    throw new Error('Failed to fetch order')
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: IOrder['orderStatus'],
  adminId: string,
  trackingNumber?: string,
): Promise<Serialized<IOrder>> {
  await connectDB()

  /**
   * We define the update object using Mongoose's UpdateQuery type 
   * constrained by our IOrder interface. No 'any' allowed.
   */
  const updateData: UpdateQuery<IOrder> = {
    $set: {
      orderStatus: status,
      updatedBy: adminId,
    },
    $push: {
      statusHistory: {
        status,
        updatedAt: new Date(),
        updatedBy: adminId,
      },
    },
  }

  // Handle shipment-specific fields strictly
  if (status === 'shipped') {
    updateData.$set = {
      ...updateData.$set,
      trackingNumber: trackingNumber,
      shippedAt: new Date(),
    }
  }

  if (status === 'delivered') {
    updateData.$set = {
      ...updateData.$set,
      deliveredAt: new Date(),
    }
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    updateData,
    { new: true, runValidators: true }
  ).populate('updatedBy', 'fullName email')

  if (!updatedOrder) throw new Error('Order not found')

  return JSON.parse(JSON.stringify(updatedOrder))
}
export async function confirmBankTransfer(
  orderId: string,
  adminNotes?: string,
) {
  await connectDB()

  // 1. Find the order and ensure it's a transfer
  const order = await Order.findById(orderId)
  if (!order) throw new Error('Order not found')
  if (order.paymentMethod !== 'transfer')
    throw new Error('Order is not a bank transfer')

  // 2. Update payment and order status
  order.paymentStatus = 'paid'
  order.orderStatus = 'confirmed'
  if (adminNotes) order.notes = adminNotes

  await order.save()

  // Professional Step: Here is where you would trigger a "Payment Received" Email via Resend
  // await sendPaymentConfirmationEmail(order.userEmail, order.orderNumber);

  return JSON.parse(JSON.stringify(order))
}

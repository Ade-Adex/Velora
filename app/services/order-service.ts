// /app/services/order-service.ts


"use server"

import connectDB from '@/app/lib/mongodb'
import { Order } from '@/app/models/Order'
import { Serialized, IOrder } from '@/app/types'

export async function getOrderByIdAction(orderId: string): Promise<Serialized<IOrder> | null> {
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
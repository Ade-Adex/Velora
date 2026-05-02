// /app/services/vendor-analytics-service.ts

'use server'

import connectDB from '@/app/lib/mongodb'
import { Order } from '@/app/models/Order'
import { Product } from '@/app/models/Product'
import { getCurrentUser } from '@/app/services/auth-service'
import { Types } from 'mongoose'

export interface VendorStats {
  revenue: number
  orderCount: number
  unitsSold: number
  lowStockAlerts: number
}

export async function getVendorAnalytics(): Promise<VendorStats> {
  await connectDB()
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  const vendorId = new Types.ObjectId(user._id as string)

  const stats = await Order.aggregate([
    { $unwind: '$items' },
    {
      $match: {
        'items.vendor': vendorId,
        paymentStatus: 'paid',
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$items.vendorNetEarning' },
        totalOrders: { $addToSet: '$_id' },
        unitsSold: { $sum: '$items.quantity' },
      },
    },
    {
      $project: {
        totalRevenue: 1,
        orderCount: { $size: '$totalOrders' },
        unitsSold: 1,
      },
    },
  ])

  const lowStock = await Product.countDocuments({
    vendor: vendorId,
    stock: { $lt: 5 },
  })

  return {
    revenue: stats[0]?.totalRevenue || 0,
    orderCount: stats[0]?.orderCount || 0,
    unitsSold: stats[0]?.unitsSold || 0,
    lowStockAlerts: lowStock,
  }
}
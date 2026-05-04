// /app/(vendor)/vendor/page.tsx


import connectDB from '@/app/lib/mongodb'
import { Product } from '@/app/models/Product'
import { Order } from '@/app/models/Order'
import { getCurrentUser } from '@/app/services/auth-service'
import { IUser, IOrder, IProduct, StatItem, Serialized } from '@/app/types'
import DashboardClient from '@/app/(vendor)/vendor/DashboardClient'
import { redirect } from 'next/navigation'
import { Types } from 'mongoose'

export default async function VendorDashboardPage() {
  await connectDB()

  const user = (await getCurrentUser()) as IUser | null

  if (!user) {
    redirect('/auth/login')
  }
const vendorIdString = (user._id as Types.ObjectId).toString()

// Fetch data with lean() for performance and better typing
const [vendorProducts, allOrders] = await Promise.all([
  Product.find({ vendor: user._id }).lean() as unknown as IProduct[],
  Order.find({ 'items.vendor': user._id })
    .sort({ createdAt: -1 })
    .limit(8)
    .lean() as unknown as IOrder[],
])

// Calculate Revenue using the pre-calculated vendorNetEarning from our Order schema
const totalRevenue = allOrders.reduce((acc: number, order: IOrder) => {
  const myItems = order.items.filter(
    (item) => item.vendor.toString() === vendorIdString,
  )

  const orderContribution = myItems.reduce((sum, item) => {
    // Use the pre-calculated field from IOrderItem
    return sum + (item.vendorNetEarning || 0)
  }, 0)

  return acc + orderContribution
}, 0)

const storeRating = user.vendorProfile?.rating || 0

  const stats: StatItem[] = [
    {
      title: 'Total Revenue',
      value: `₦${totalRevenue.toLocaleString()}`,
      diff: 12.5,
      icon: 'wallet',
      color: 'indigo',
    },
    {
      title: 'My Inventory',
      value: vendorProducts.length,
      diff: 2.1,
      icon: 'package',
      color: 'cyan',
    },
    {
      title: 'Active Sales',
      value: allOrders.length,
      diff: 4.3,
      icon: 'cart',
      color: 'orange',
    },
    {
      title: 'Store Rating',
      value: `${storeRating.toFixed(1)}/5`,
      diff: 0.5,
      icon: 'trend',
      color: 'green',
    },
  ]


 const serializedUser = JSON.parse(JSON.stringify(user)) as Serialized<IUser>
 const serializedOrders = JSON.parse(
   JSON.stringify(allOrders),
 ) as Serialized<IOrder>[]

  return (
    <DashboardClient
      user={serializedUser}
      allOrders={serializedOrders}
      stats={stats}
    />
  )
}
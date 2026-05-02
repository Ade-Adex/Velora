// /app/(vendor)/vendor/page.tsx


import connectDB from '@/app/lib/mongodb'
import { Product } from '@/app/models/Product'
import { Order } from '@/app/models/Order'
import { getCurrentUser } from '@/app/services/auth-service'
import { IUser, IOrder, IProduct, StatItem } from '@/app/types'
import DashboardClient from '@/app/(vendor)/vendor/DashboardClient'
import { redirect } from 'next/navigation'

export default async function VendorDashboardPage() {
  await connectDB()

  const user = (await getCurrentUser()) as IUser | null

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch data in parallel for better performance
  const [vendorProducts, allOrders] = await Promise.all([
    Product.find({ vendor: user._id }).lean() as unknown as IProduct[],
    Order.find({ 'items.vendor': user._id })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean() as unknown as IOrder[],
  ])

  // Calculate revenue for THIS vendor only
  const totalRevenue = allOrders.reduce((acc, order) => {
    const myItems = order.items.filter(
      (item) => item.vendor.toString() === user._id.toString(),
    )
    return (
      acc + myItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    )
  }, 0)

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
      value: '4.8/5',
      diff: 0.5,
      icon: 'trend',
      color: 'green',
    },
  ]

  // Deep clone to ensure plain objects are passed to the Client Component
  // This prevents "Only plain objects can be passed to Client Components" errors
  const serializedUser = JSON.parse(JSON.stringify(user))
  const serializedOrders = JSON.parse(JSON.stringify(allOrders))

  return (
    <DashboardClient
      user={serializedUser}
      allOrders={serializedOrders}
      stats={stats}
    />
  )
}
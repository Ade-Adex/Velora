// /app/admin/orders/page.tsx
export const dynamic = 'force-dynamic'

import connectDB from '@/app/lib/mongodb'
import { Order } from '@/app/models/Order'
import { IOrder, IUser } from '@/app/types'
import { Types } from 'mongoose'
import { Filter as MongoFilter } from 'mongodb'
import OrderFilters from '@/app/components/admin/OrderFilters'
import { RealtimeAdminTable } from '@/app/components/admin/RealtimeAdminTable'
import { Stack, Group, Title, Text } from '@mantine/core'

type PopulatedOrder = Omit<IOrder, 'user'> & {
  user: Pick<IUser, 'fullName' | 'email'> | null
  _id: Types.ObjectId
}

interface PageProps {
  searchParams: Promise<{
    page?: string
    q?: string
    status?: string
  }>
}

type OrderQuery = MongoFilter<IOrder>

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const { page, q, status } = await searchParams
  const currentPage = Number(page) || 1
  const limit = 10
  const skip = (currentPage - 1) * limit

  await connectDB()
  const query: OrderQuery = {}

  if (q) {
    query.$or = [
      { orderNumber: { $regex: q, $options: 'i' } },
      { 'shippingAddress.fullName': { $regex: q, $options: 'i' } },
    ]
  }

  if (status && status !== 'all') {
    query.orderStatus = status as IOrder['orderStatus']
  }

  const [orders, totalOrders] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate<{ user: Pick<IUser, 'fullName' | 'email'> }>('user', 'fullName email')
      .lean<PopulatedOrder[]>(),
    Order.countDocuments(query),
  ])

  const totalPages = Math.ceil(totalOrders / limit)
  const serializedOrders = JSON.parse(JSON.stringify(orders))

  return (
    <div className="md:px-4 py-0">
      <Stack gap="xl">
        <header>
          <Group justify="space-between" align="flex-end">
            <Stack gap={2}>
              <Title order={2} fw={900} lts="-0.5px">Customer Orders</Title>
              <Text c="dimmed" size="sm">
                {q || (status && status !== 'all')
                  ? `Found ${totalOrders} results for your search`
                  : `Managing ${totalOrders} total transactions`}
              </Text>
            </Stack>
          </Group>
        </header>

        <OrderFilters currentQuery={q} currentStatus={status} />

        <RealtimeAdminTable 
          initialOrders={serializedOrders} 
          currentPage={currentPage} 
          totalPages={totalPages}
          q={q}
          status={status}
        />
      </Stack>
    </div>
  )
}
// /app/services/shipment-service.ts
'use server'

import connectDB from '@/app/lib/mongodb'
import { Order } from '@/app/models/Order'
import { Shipment } from '@/app/models/Shipment'
import { IOrder, IOrderItem } from '@/app/types'
import { Types } from 'mongoose'

export async function initializeShipments(orderId: string): Promise<void> {
  await connectDB()

  // Find the order and cast it to our IOrder interface
  const order = (await Order.findById(orderId)) as IOrder | null
  if (!order) throw new Error('Order not found')

  // 1. Group items by Vendor ID using a typed Record
  const vendorGroups: Record<string, IOrderItem[]> = {}

  order.items.forEach((item: IOrderItem) => {
    const vId = item.vendor.toString()
    if (!vendorGroups[vId]) vendorGroups[vId] = []
    vendorGroups[vId].push(item)
  })

  // 2. Create a Shipment for each Vendor
  for (const vendorId in vendorGroups) {
    const vendorItems = vendorGroups[vendorId]

    const shipment = await Shipment.create({
      order: order._id,
      vendor: new Types.ObjectId(vendorId),
      // Map to the orderItems structure defined in IShipment
      orderItems: vendorItems.map((item) => ({
        productId: item.product,
        name: item.name,
        quantity: item.quantity,
      })),
      status: 'label_created',
      shippingAddress: order.shippingAddress,
      carrier: 'Standard', // Default carrier
      statusHistory: [
        {
          status: 'label_created',
          timestamp: new Date(),
          description: 'Shipment record initialized after payment.',
        },
      ],
    })

    // 3. Update the master Order document
    // We link the specific items belonging to this vendor to the new Shipment ID
    await Order.updateOne(
      { _id: order._id },
      {
        $set: {
          'items.$[elem].shipment': shipment._id,
        },
      },
      {
        arrayFilters: [{ 'elem.vendor': new Types.ObjectId(vendorId) }],
      },
    )
  }
}

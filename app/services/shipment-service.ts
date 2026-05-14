// /app/services/shipment-service.ts

'use server'

import connectDB from '@/app/lib/mongodb'
import { Order } from '@/app/models/Order'
import { Shipment } from '@/app/models/Shipment'
import { IOrder, IOrderItem } from '@/app/types'
import { Types, ClientSession } from 'mongoose'

/**
 * Initializes shipments for a paid order, splitting items by vendor.
 * @param orderId - The ID of the order to process.
 * @param session - Optional Mongoose session for atomic transactions.
 */
export async function initializeShipments(
  orderId: string, 
  session?: ClientSession
): Promise<void> {
  await connectDB()

  // 1. Fetch order - link to session if provided
  const order = (await Order.findById(orderId).session(session || null)) as IOrder | null
  if (!order) throw new Error('Order not found for shipment initialization')

  // 2. Group items by Vendor ID
  const vendorGroups: Record<string, IOrderItem[]> = {}

  order.items.forEach((item: IOrderItem) => {
    const vId = item.vendor.toString()
    if (!vendorGroups[vId]) {
      vendorGroups[vId] = []
    }
    vendorGroups[vId].push(item)
  })

  // 3. Create Shipments and update Order items
  // Using Object.entries for cleaner iteration without 'any'
  for (const [vendorId, vendorItems] of Object.entries(vendorGroups)) {
    
    // Create the shipment
    // Note: .create() returns an array when a session is passed
    const [shipment] = await Shipment.create(
      [
        {
          order: order._id,
          vendor: new Types.ObjectId(vendorId),
          orderItems: vendorItems.map((item) => ({
            productId: item.product,
            name: item.name,
            quantity: item.quantity,
          })),
          status: 'label_created',
          shippingAddress: order.shippingAddress,
          carrier: 'Standard',
          statusHistory: [
            {
              status: 'label_created',
              timestamp: new Date(),
              description: 'Shipment record initialized after payment.',
            },
          ],
        },
      ],
      { session }
    )

    // 4. Update the master Order document
    // Links specific items belonging to this vendor to the new Shipment ID
    await Order.updateOne(
      { _id: order._id },
      {
        $set: {
          'items.$[elem].shipment': shipment._id,
        },
      },
      {
        session, // Crucial: stay in the transaction
        arrayFilters: [{ 'elem.vendor': new Types.ObjectId(vendorId) }],
      }
    )
  }
}
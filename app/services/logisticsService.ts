// /app/services/logisticsService.ts
'use server' // Critical for calling from Client Components

import connectDB from '@/app/lib/mongodb'
import { Order } from '@/app/models/Order'
import { Shipment } from '@/app/models/Shipment'
import { revalidatePath } from 'next/cache'
import { IOrder, IOrderItem, IShipment, Serialized } from '@/app/types'
import mongoose from 'mongoose'


export async function initializeShipments(orderId: string): Promise<void> {
  await connectDB()

  // Cast the found document to IOrder
  const order = (await Order.findById(orderId)) as IOrder | null
  if (!order) return

  // Type the accumulator: Record<string, IOrderItem[]>
  const vendorGroups = order.items.reduce<Record<string, IOrderItem[]>>(
    (groups, item) => {
      const vendorId = item.vendor.toString()
      if (!groups[vendorId]) {
        groups[vendorId] = []
      }
      groups[vendorId].push(item)
      return groups
    },
    {},
  )

  // Iterate through the grouped items
  for (const vendorId in vendorGroups) {
    const items = vendorGroups[vendorId]

    // Create the shipment with strict property mapping
    const newShipment = (await Shipment.create({
      order: order._id,
      vendor: vendorId,
      orderItems: items.map((i: IOrderItem) => ({
        productId: i.product,
        quantity: i.quantity,
        name: i.name,
      })),
      carrier: 'Velora Logistics',
      status: 'label_created',
    })) as IShipment

    // Link the items in the Order model back to this shipment using arrayFilters
    await Order.updateOne(
      { _id: orderId, 'items.vendor': vendorId },
      { $set: { 'items.$[elem].shipment': newShipment._id } },
      { arrayFilters: [{ 'elem.vendor': vendorId }] },
    )
  }
}


export async function updateShipmentStatus(
  shipmentId: string,
  status: string,
  trackingNumber?: string,
): Promise<Serialized<IShipment>> {
  await connectDB()

  // 1. Start a Session for Atomicity
  // This ensures if one update fails, the whole process rolls back.
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // 2. Update the Shipment
    const shipment = (await Shipment.findByIdAndUpdate(
      shipmentId,
      { status, trackingNumber, updatedAt: new Date() },
      { new: true, session }, // Pass session here
    ).populate('order')) as (IShipment & { order: IOrder }) | null

    if (!shipment) throw new Error('Shipment not found')

    // 3. Update specific items in the Order document
    await Order.updateOne(
      { _id: shipment.order._id, 'items.shipment': shipmentId },
      { $set: { 'items.$[elem].status': status } },
      {
        arrayFilters: [{ 'elem.shipment': shipmentId }],
        session, // Pass session here
      },
    )

    // 4. Re-fetch parent order with the session to check global status
    const parentOrder = (await Order.findById(shipment.order._id).session(
      session,
    )) as IOrder | null

    if (parentOrder) {
      // Logic for multi-vendor status transitions
      const allShipped = parentOrder.items.every((i) =>
        ['shipped', 'delivered'].includes(i.status),
      )
      const allDelivered = parentOrder.items.every(
        (i) => i.status === 'delivered',
      )

      let newGlobalStatus = parentOrder.orderStatus

      if (allDelivered) {
        newGlobalStatus = 'delivered'
      } else if (allShipped) {
        newGlobalStatus = 'shipped'
      }

      // Only update if the status actually changed
      if (newGlobalStatus !== parentOrder.orderStatus) {
        await Order.findByIdAndUpdate(
          parentOrder._id,
          { orderStatus: newGlobalStatus },
          { session },
        )
      }
    }

    // Commit all changes
    await session.commitTransaction()

    // 5. Broad Revalidation
    // Ensure the customer, admin, and vendor all see the update instantly
    revalidatePath(`/vendor/orders/${shipmentId}`)
    revalidatePath(`/admin/orders/${shipment.order._id}`)
    revalidatePath('/profile/orders') // Crucial for the customer dashboard
    revalidatePath(`/orders/success`) // If they are on the tracking page

    return JSON.parse(JSON.stringify(shipment)) as Serialized<IShipment>
  } catch (error) {
    // If anything fails, abort the transaction to keep data consistent
    await session.abortTransaction()
    console.error('Shipment Update Error:', error)
    throw error
  } finally {
    session.endSession()
  }
}
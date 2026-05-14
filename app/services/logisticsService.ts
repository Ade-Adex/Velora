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

  const VENDOR_RESTRICTED_STATUSES = ['out_for_delivery', 'delivered']

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const currentShipment = await Shipment.findById(shipmentId).session(session)
    if (!currentShipment) throw new Error('Shipment record not found')

    if (currentShipment.status === 'delivered') {
      throw new Error(
        'Cannot update a shipment that has already been delivered',
      )
    }

    const shipment = (await Shipment.findByIdAndUpdate(
      shipmentId,
      {
        status,
        trackingNumber: trackingNumber || currentShipment.trackingNumber,
        updatedAt: new Date(),
        $push: {
          statusHistory: {
            status,
            timestamp: new Date(),
            description: `Status updated to ${status.replace('_', ' ')} via Marketplace Portal.`,
          },
        },
      },
      { new: true, session },
    ).populate('order')) as (IShipment & { order: IOrder }) | null

    if (!shipment) throw new Error('Update failed')

    // 5. UPDATE ORDER ITEM STATUS
    await Order.updateOne(
      { _id: shipment.order._id, 'items.shipment': shipmentId },
      {
        $set: {
          'items.$[elem].status': status,
          // Syncing vendorStatus ensures the Admin dashboard progress bars update
          'items.$[elem].vendorStatus': status,
        },
      },
      {
        arrayFilters: [{ 'elem.shipment': shipmentId }],
        session,
      },
    )

    // 6. CALCULATE GLOBAL ORDER PROGRESSION (Updated Logic)
    const parentOrder = (await Order.findById(shipment.order._id).session(
      session,
    )) as IOrder | null

    if (parentOrder) {
      const statuses = parentOrder.items.map((item) => item.status)
      let newGlobalStatus = parentOrder.orderStatus

      // If ALL items are delivered
      if (statuses.every((s) => s === 'delivered')) {
        newGlobalStatus = 'delivered'
      }
      // If ALL items are at least 'in_transit' (shipped from vendor)
      else if (
        statuses.every((s) =>
          ['in_transit', 'out_for_delivery', 'delivered'].includes(s),
        )
      ) {
        newGlobalStatus = 'shipped'
      }
      // If ANY items have moved beyond 'pending'
      else if (
        statuses.some((s) => ['in_transit', 'ready_for_pickup'].includes(s))
      ) {
        newGlobalStatus = 'processing'
      }

      if (newGlobalStatus !== parentOrder.orderStatus) {
        await Order.findByIdAndUpdate(
          parentOrder._id,
          { orderStatus: newGlobalStatus },
          { session },
        )
      }
    }

    await session.commitTransaction()

    revalidatePath(`/vendor/orders/${shipmentId}`)
    revalidatePath(`/admin/orders/${shipment.order._id}`)
    revalidatePath('/profile/orders')

    return JSON.parse(JSON.stringify(shipment)) as Serialized<IShipment>
  } catch (error) {
    await session.abortTransaction()
    console.error('Shipment Status Update Failed:', error)
    throw error
  } finally {
    session.endSession()
  }
}
/**
 * Adds a tracking log entry and updates the shipment status
 */
export async function addLogisticsUpdate(
  shipmentId: string,
  status: IShipment['status'],
  location: string,
  description: string,
) {
  await connectDB()

  // Find shipment to get parent order
  const shipment = await Shipment.findById(shipmentId)
  if (!shipment) throw new Error('Shipment not found')

  const updatedShipment = await Shipment.findByIdAndUpdate(
    shipmentId,
    {
      $set: { status },
      $push: {
        statusHistory: {
          status,
          timestamp: new Date(),
          description: `[${location}] - ${description}`,
        },
      },
    },
    { new: true },
  ).lean()

  // KEY CORRECTION: Sync back to the Order items
  // If the shipment is 'delivered' (meaning it reached the Hub),
  // we update the vendorStatus to 'shipped' in the order items.
  const mappedStatus = status === 'delivered' ? 'shipped' : 'processing'

  await Order.updateOne(
    { _id: shipment.order, 'items.shipment': shipmentId },
    { $set: { 'items.$[elem].vendorStatus': mappedStatus } },
    { arrayFilters: [{ 'elem.shipment': shipmentId }] },
  )

  revalidatePath('/admin/logistics')
  revalidatePath(`/admin/orders/${shipment.order}`) // Also revalidate the order view

  return JSON.parse(JSON.stringify(updatedShipment))
}

/**
 * Fetches a single shipment with populated details
 */
export async function getShipmentDetails(
  shipmentId: string,
): Promise<Serialized<IShipment> | null> {
  await connectDB()

  const shipment = await Shipment.findById(shipmentId)
    .populate('vendor')
    .populate('order')
    .lean()

  if (!shipment) return null

  return JSON.parse(JSON.stringify(shipment)) as Serialized<IShipment>
}
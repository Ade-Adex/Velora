// /app/services/notificationService.ts
'use server'

import connectDB from '@/app/lib/mongodb'
import { Notification } from '@/app/models/Notification'
import { User } from '@/app/models/User'
import { Types } from 'mongoose'

export interface NotificationPayload {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

// Interface representing the returned shape from Mongoose lean queries
interface LeanNotificationDoc {
  _id: Types.ObjectId
  recipient: Types.ObjectId
  recipientRole: 'customer' | 'vendor' | 'admin'
  title: string
  message: string
  associatedOrder?: Types.ObjectId | null
  read: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Core service function to persist standard notification instances into your collection.
 * Fallback handles system admin lookups to satisfy the required recipient reference.
 */
export async function saveNotificationToDb(data: {
  recipientId?: string
  recipientRole: 'customer' | 'vendor' | 'admin'
  title: string
  message: string
  associatedOrder?: string
}): Promise<{ _id: Types.ObjectId; title: string; message: string }> {
  await connectDB()

  let targetRecipientId = data.recipientId

  // If tracking an admin notification, look up a global superAdmin/admin instance to link it to
  if (data.recipientRole === 'admin' && !targetRecipientId) {
    const adminUser = await User.findOne({
      $or: [{ isSuperAdmin: true }, { role: 'admin' }],
    }).lean()

    if (adminUser) {
      targetRecipientId = (adminUser._id as Types.ObjectId).toString()
    } else {
      throw new Error(
        'Notification insertion aborted: No valid administrative recipient found.',
      )
    }
  }

  const createdNotif = await Notification.create({
    recipient: targetRecipientId,
    recipientRole: data.recipientRole,
    title: data.title,
    message: data.message,
    associatedOrder: data.associatedOrder || null,
    read: false,
  })

  return {
    _id: createdNotif._id as Types.ObjectId,
    title: createdNotif.title,
    message: createdNotif.message,
  }
}

// --- SERVER ACTIONS FOR SHELL VIEWS ---

export async function getVendorNotifications(
  vendorId: string,
): Promise<NotificationPayload[]> {
  if (!vendorId) return []
  await connectDB()

  const items = (await Notification.find({
    recipient: vendorId,
    recipientRole: 'vendor',
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean()) as unknown as LeanNotificationDoc[]

  return items.map((n: LeanNotificationDoc) => ({
    id: n._id.toString(),
    title: n.title,
    message: n.message,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  }))
}

export async function markVendorNotificationsRead(
  vendorId: string,
): Promise<boolean> {
  if (!vendorId) return false
  await connectDB()

  await Notification.updateMany(
    { recipient: vendorId, recipientRole: 'vendor', read: false },
    { $set: { read: true } },
  )
  return true
}

export async function getAdminNotifications(): Promise<NotificationPayload[]> {
  await connectDB()

  const items = (await Notification.find({ recipientRole: 'admin' })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean()) as unknown as LeanNotificationDoc[]

  return items.map((n: LeanNotificationDoc) => ({
    id: n._id.toString(),
    title: n.title,
    message: n.message,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  }))
}

export async function markAdminNotificationsRead(): Promise<boolean> {
  await connectDB()

  await Notification.updateMany(
    { recipientRole: 'admin', read: false },
    { $set: { read: true } },
  )
  return true
}

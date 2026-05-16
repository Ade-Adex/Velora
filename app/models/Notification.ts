// /app/models/Notification.ts
import { Schema, model, models } from 'mongoose'

const NotificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipientRole: {
      type: String,
      enum: ['customer', 'vendor', 'admin'],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    associatedOrder: { type: Schema.Types.ObjectId, ref: 'Order' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export const Notification =
  models.Notification || model('Notification', NotificationSchema)

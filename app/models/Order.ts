//  /app/models/Order.ts

import { Schema, model, models } from 'mongoose'

const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, unique: true, required: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        variantSku: String,
        name: String,
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totals: {
      subtotal: Number,
      shipping: Number,
      tax: Number,
      discount: { type: Number, default: 0 },
      grandTotal: Number,
    },
    shippingAddress: Object,
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'processing', 'paid', 'failed', 'refunded'],
      default: 'unpaid',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentReference: String,
    trackingNumber: String,
  },
  { timestamps: true },
)

export const Order = models.Order || model('Order', OrderSchema)
//  /app/models/Order.ts

import { Schema, model, models } from 'mongoose'

const AddressSchema = new Schema(
  {
    fullName: String,
    phone: String,
    addressLine1: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  { _id: false },
)

const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, unique: true, required: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        vendor: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Tracking the seller
        variantSku: String,
        name: String,
        image: String, // Store image snapshot
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        adminCommission: Number, // Percentage at time of sale
        fulfillmentStatus: {
          type: String,
          enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
          default: 'pending'
        }
      },
    ],
    paymentMethod: {
      type: String,
      enum: ['card', 'transfer', 'cod'],
      required: true
    },
    totals: {
      subtotal: Number,
      shipping: Number,
      tax: Number,
      discount: { type: Number, default: 0 },
      grandTotal: Number,
    },
    shippingAddress: AddressSchema,
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

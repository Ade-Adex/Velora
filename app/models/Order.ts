//  /app/models/Order.ts

import { Schema, model, models } from 'mongoose'

const AddressSchema = new Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: String,
    country: { type: String, default: 'Nigeria' },
  },
  { _id: false },
)

const OrderSchema = new Schema(
  {
    // The buyer
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    // Unique human-readable ID (e.g., VEL-2026-X942)
    orderNumber: { type: String, unique: true, required: true },

    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        vendor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: String,
        image: String,
        variantSku: String,
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true }, // Price at time of purchase

        // --- Financial Split per Item ---
        adminCommissionRate: { type: Number, required: true }, // e.g., 10%
        adminCommissionAmount: { type: Number, required: true }, // The ₦ value
        shippingFee: { type: Number, default: 0 }, // Shipping allocated to this item/vendor
        vendorNetEarning: { type: Number, required: true }, // Total the vendor gets

        // Link to a specific shipment (Multi-vendor support)
        shipment: { type: Schema.Types.ObjectId, ref: 'Shipment' },

        // Item-level status (Important if one item is cancelled but others aren't)
        status: {
          type: String,
          enum: [
            'pending',
            'processing',
            'shipped',
            'delivered',
            'cancelled',
            'returned',
          ],
          default: 'pending',
        },
      },
    ],

    paymentMethod: {
      type: String,
      enum: ['card', 'transfer', 'cod'],
      required: true,
    },

    totals: {
      subtotal: { type: Number, required: true }, // Sum of (price * qty)
      shipping: { type: Number, required: true, default: 0 }, // Total shipping paid by user
      tax: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      grandTotal: { type: Number, required: true }, // Final amount charged
    },

    shippingAddress: AddressSchema,

    paymentStatus: {
      type: String,
      enum: ['unpaid', 'processing', 'paid', 'failed', 'refunded'],
      default: 'unpaid',
      index: true,
    },

    // Overall order lifecycle
    orderStatus: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
      ],
      default: 'pending',
      index: true,
    },

    updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  statusHistory: [
    {
      status: String,
      updatedAt: { type: Date, default: Date.now },
      updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    }
  ],

    // External Integration Fields
    paymentReference: { type: String, index: true }, // Paystack/Flutterwave Ref
    notes: String,
  },
  { timestamps: true },
)

// Add a pre-save hook to ensure grandTotal is always correct if needed,
// though usually, calculations are done in the service layer before saving.

export const Order = models.Order || model('Order', OrderSchema)
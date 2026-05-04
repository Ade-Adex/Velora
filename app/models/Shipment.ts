// /app/models/Shipment.ts

import { Schema, model, models } from 'mongoose'

const ShipmentSchema = new Schema(
  {
    // Link to parent order
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },

    // The specific vendor this shipment belongs to
    vendor: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    // The specific items from the order included in this package
    orderItems: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        name: String,
      },
    ],

    // Logistics Details
    trackingNumber: { type: String, unique: true, sparse: true },
    carrier: { type: String, default: 'Velora Logistics' }, // e.g., GIG, DHL, Local Courier

    status: {
      type: String,
      enum: [
        'label_created',
        'pickup_pending',
        'in_transit',
        'out_for_delivery',
        'delivered',
        'failed_attempt',
        'returned',
      ],
      default: 'label_created',
    },

    // Timeline for tracking
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        description: String, // e.g., "Package arrived at Ogbomoso Hub"
      },
    ],

    estimatedDelivery: Date,
    actualDelivery: Date,

    shippingLabelUrl: String,
    notes: String,
  },
  { timestamps: true },
)

export const Shipment = models.Shipment || model('Shipment', ShipmentSchema)

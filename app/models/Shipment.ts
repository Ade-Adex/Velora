// /app/models/Shipment.ts
import { Schema, model, models } from 'mongoose'

const ShipmentSchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    vendor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        name: String,
      },
    ],

    trackingNumber: { type: String, unique: true, sparse: true },
    carrier: { type: String, default: 'Velora Logistics' },

    // REALIGNED STATUSES TO REFLECT THE CENTRALIZED HUB SYSTEM
    status: {
      type: String,
      enum: [
        'label_created', // Vendor packed the package
        'handed_over_to_courier', // Vendor dispatched package to logistics courier
        'in_transit_to_hub', // Logistics is transporting item to Velora Central Hub
        'received_at_hub', // Admin accepted and checked the item at the hub
        'rejected_at_hub', // Admin rejected item at the hub (damaged, wrong item, etc)
        'out_for_delivery', // Hub dispatched item directly to the buyer
        'delivered', // Received by client
        'failed_attempt',
        'returned_to_vendor',
      ],
      default: 'label_created',
    },

    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        description: String,
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
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

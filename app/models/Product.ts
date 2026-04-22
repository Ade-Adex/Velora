// /app/models/Product.ts

import { Schema, model, models } from 'mongoose'
import { IProduct } from '@/app/types'

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true },
    discountPrice: { type: Number },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    tags: [String],
    mainImage: { type: String, required: true },
    gallery: [String],
    variants: [
      {
        sku: { type: String, unique: true },
        attributes: { type: Map, of: String },
        priceOverride: Number,
        stock: { type: Number, default: 0 },
      },
    ],
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export const Product =
  models.Product || model<IProduct>('Product', ProductSchema)
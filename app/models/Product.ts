// /app/models/Product.ts

import { Schema, model, models } from 'mongoose'
import { IProduct } from '@/app/types'
import './Category'
import './User'

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true },
    brand: { type: String, required: true },
    description: { type: String, required: true },
    shortDescription: { type: String },

    // Pricing
    basePrice: { type: Number, required: true },
    discountPrice: { type: Number },

    // Organization
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    tags: [String],

    // Assets
    mainImage: { type: String, required: true },
    gallery: [String],
    videoUrl: { type: String },

    // Inventory & Variants
    stock: { type: Number, default: 0 },
    variants: [
      {
        sku: { type: String, required: true },
        name: String, // e.g., "Large / Blue"
        attributes: { type: Map, of: String },
        price: Number,
        stock: { type: Number, default: 0 },
        images: [String],
      },
    ],

    // Specs (Technical data)
    specifications: [
      {
        label: String, // e.g., "Material"
        value: String, // e.g., "100% Cotton"
      },
    ],

    reviews: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },

    // Flags
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    onSale: { type: Boolean, default: false },
    saleEndsAt: { type: Date },
  },
  { timestamps: true },
)

export const Product =
  models.Product || model<IProduct>('Product', ProductSchema)
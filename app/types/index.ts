//  /app/types/index.ts

import { Document, Types } from 'mongoose'
import { StaticImageData } from 'next/image'

// --- User Types ---
export interface IAddress {
  isDefault: boolean
  label: string // e.g., "Home", "Office"
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface IUser extends Document {
  email: string
  fullName: string
  phone?: string
  image?: string
  role: 'customer' | 'admin' | 'editor'
  magicToken?: string
  tokenExpiry?: Date
  lastLogin?: Date
  addresses: IAddress[]
  wishlist: Types.ObjectId[] // Array of Product IDs
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// --- Product & Category Types ---
export interface ICategory extends Document {
  name: string
  slug: string
  parentCategory?: Types.ObjectId | ICategory
  image?: string
  description?: string
}

export interface IVariant {
  sku: string
  attributes: Map<string, string> // Matches the 'Map' type in the model
  priceOverride?: number
  stock: number
}

export interface IProduct extends Document {
  name: string
  slug: string
  description: string
  basePrice: number
  discountPrice?: number
  category: Types.ObjectId | ICategory
  tags: string[]
  // mainImage: string
  mainImage: StaticImageData

  gallery: string[]
  variants: IVariant[]
  ratings: {
    average: number
    count: number
  }
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

// --- Order Types ---
export interface IOrderItem {
  product: Types.ObjectId | IProduct
  variantSku?: string
  name: string // Snapshot for history
  quantity: number
  price: number // Snapshot for history
}

export interface IOrder extends Document {
  user: Types.ObjectId | IUser
  orderNumber: string
  items: IOrderItem[]
  totals: {
    subtotal: number
    shipping: number
    tax: number
    discount: number
    grandTotal: number
  }
  shippingAddress: IAddress // Captured snapshot
  paymentStatus: 'unpaid' | 'processing' | 'paid' | 'failed' | 'refunded'
  orderStatus: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  paymentReference?: string
  trackingNumber?: string
  createdAt: Date
  updatedAt: Date
}

// --- Cart Types (Client Side) ---
export interface CartItem {
  _id?: string
  id: string
  name: string
  price: number
  // image: string

  image: StaticImageData
  quantity: number
  variantSku?: string
  slug: string
}

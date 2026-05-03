//  /app/types/index.ts

import { Document, Types } from 'mongoose'
import { StaticImageData } from 'next/image'

// Helper for images that could be local imports OR remote URLs
export type ImageSource = string | StaticImageData

// --- User Types ---
export interface IAddress {
  isDefault: boolean
  label: string
  city: string
  state: string
  zipCode: string
  country: string
  fullName: string 
  phone: string 
  addressLine1: string
}

export interface IVendorProfile {
  shopName: string
  isVerified: boolean
  description?: string
  logo?: string
  bankDetails?: {
    accountName: string
    accountNumber: string
    bankName: string
  };
}

export interface IUser extends Document {
  // _id: string
  email: string
  fullName: string
  phone?: string
  image?: string
  birthday?: Date
  gender: 'male' | 'female' | 'other' | 'unspecified'
  role: 'customer' | 'admin' | 'editor' | 'vendor'
  vendorProfile?: IVendorProfile
  isSuperAdmin: boolean
  magicToken?: string
  tokenExpiry?: Date
  lastLogin?: Date
  addresses: IAddress[]
  wishlist: Types.ObjectId[] | string[]
  isActive: boolean
  preferences?: {
    newsletter: boolean
    notifications: boolean
  }
  createdAt: Date
  updatedAt: Date
}

// --- Product & Category Types ---
export interface ICategory extends Document {
  name: string
  slug: string
  parentCategory?: Types.ObjectId | ICategory
  parent?: Types.ObjectId | ICategory | null
  image?: string
  description?: string
}

export interface IVariant {
  sku: string
  name?: string
  attributes: Map<string, string> | Record<string, string>
  price?: number
  stock: number
  images?: string[]
}


export interface IReview {
  user: Types.ObjectId | string | IUser 
  name: string 
  rating: number
  comment: string
  createdAt: Date
}

export interface IApprovalLog {
  status: 'pending' | 'approved' | 'rejected'
  comment?: string
  adminId: Types.ObjectId | string
  createdAt: Date
}


export interface IProduct extends Document {
  name: string
  brand: string // Added for professional branding
  slug: string
  description: string
  shortDescription?: string // Added for snippets/grid
  basePrice: number
  discountPrice?: number
  category: Types.ObjectId | ICategory
  tags: string[]
  mainImage: ImageSource // Flexible type
  gallery: string[]
  videoUrl?: string
  stock: number // Global stock fallback
  variants: IVariant[]
  specifications: { label: string; value: string }[] // Technical details
  reviews: IReview[]
  ratings: {
    average: number
    count: number
  }
  seo: {
    title?: string
    description?: string
    keywords?: string[]
  }
  vendor: Types.ObjectId | IUser
  approvalStatus: 'pending' | 'approved' | 'rejected'
  approvalLogs: IApprovalLog[]
  commissionRate: number
  isPublished: boolean
  isFeatured: boolean // For homepage highlights
  onSale: boolean
  saleEndsAt?: Date
  updatedBy?: Types.ObjectId | IUser // Track who made changes
  createdAt: Date
  updatedAt: Date
}

// --- Order Types ---
export interface IOrderItem {
  product: Types.ObjectId | string
  vendor: Types.ObjectId | string // Reference to the seller
  variantSku?: string
  name: string
  image: string
  quantity: number
  price: number
  adminCommission?: number
  fulfillmentStatus:
    | 'pending'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
  vendorNetEarning?: number
}

export interface IOrder extends Document {
  user: Types.ObjectId | string
  orderNumber: string
  items: IOrderItem[]
  totals: {
    subtotal: number
    shipping: number
    tax: number
    discount: number
    grandTotal: number
  }
  shippingAddress: IAddress
  paymentStatus: 'unpaid' | 'processing' | 'paid' | 'failed' | 'refunded'
  orderStatus: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  paymentMethod: 'card' | 'transfer' | 'cod'
  paymentReference?: string
  vendorNetEarnings?: number
  trackingNumber?: string
  createdAt: Date
  updatedAt: Date
}

// --- Cart Types (Client Side Store) ---
export interface CartItem {
  id: string // Consistently use 'id' to match Zustand store
  name: string
  price: number
  image: ImageSource
  quantity: number
  variantSku?: string
  slug: string
  brand?: string
  stock?: number // To prevent adding more than available
}

export interface StatItem {
  title: string;
  value: string | number;
  diff: number;
  icon: string; // Keep this as a string
  color: string;
}

// export type Serialized<T> = {
//   [K in keyof T]: T[K] extends Types.ObjectId | Types.ObjectId[] | Date | undefined
//     ? string
//     : T[K] extends object
//     ? Serialized<T[K]>
//     : T[K];
// } & { _id: string };


export type Serialized<T> = {
  [K in keyof T]: T[K] extends Types.ObjectId | Types.ObjectId[] | Date | undefined
    ? string
    : T[K] extends object
    ? Serialized<T[K]>
    : T[K];
} & { _id: string; id?: string }; 

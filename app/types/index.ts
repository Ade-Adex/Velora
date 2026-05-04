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
  rating: number
  reviewsCount: number
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

export interface CategoryOption {
  label: string;
  value: string;
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


// --- Product Data Interface (Pure Data for Forms/UI) ---
// This interface has NO Mongoose methods, making it safe for useForm
export interface IProductData {
  name: string
  brand: string
  slug: string
  description: string
  shortDescription?: string
  basePrice: number
  discountPrice?: number
  category: string // Form Selects use strings. DB handles the conversion.
  tags: string[]
  mainImage: ImageSource
  gallery: string[]
  videoUrl?: string
  stock: number
  variants: IVariant[]
  specifications: { label: string; value: string }[]
  seo: {
    title?: string
    description?: string
    keywords?: string[]
  }
  commissionRate: number
  isPublished: boolean
  isFeatured: boolean
  onSale: boolean
  saleEndsAt?: Date
}

// --- Product Document Interface (For Backend/Database Logic) ---
// We omit 'category' from IProductData so we can redefine it as an ObjectId/ICategory
export interface IProduct extends Document, Omit<IProductData, 'category'> {
  category: Types.ObjectId | ICategory 
  vendor: Types.ObjectId | IUser
  approvalStatus: 'pending' | 'approved' | 'rejected'
  approvalLogs: IApprovalLog[]
  ratings: {
    average: number
    count: number
  }
  reviews: IReview[]
  updatedBy?: Types.ObjectId | IUser
  createdAt: Date
  updatedAt: Date
}


// --- Shipment Types ---
export interface IShipment extends Document {
  order: Types.ObjectId | string | IOrder
  vendor: Types.ObjectId | string | IUser
  orderItems: {
    productId: Types.ObjectId | string
    quantity: number
    name: string
  }[]
  trackingNumber?: string
  carrier: string
  status: 
    | 'label_created'
    | 'pickup_pending'
    | 'in_transit'
    | 'out_for_delivery'
    | 'delivered'
    | 'failed_attempt'
    | 'returned'
  statusHistory: {
    status: string
    timestamp: Date
    description?: string
  }[]
  estimatedDelivery?: Date
  actualDelivery?: Date
  shippingLabelUrl?: string
  createdAt: Date
  updatedAt: Date
}

// --- Modified Order Item (To match professional structure) ---
export interface IOrderItem {
  product: Types.ObjectId | string
  vendor: Types.ObjectId | string
  variantSku?: string
  name: string
  image: string
  quantity: number
  price: number
  // Financials
  adminCommissionRate: number
  adminCommissionAmount: number
  vendorNetEarning: number
  shippingFee: number
  // Logistics link
  shipment?: Types.ObjectId | string | IShipment
  status: 
    | 'pending'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'returned'
}

// --- Modified Order ---
export interface IOrder extends Document {
  user: Types.ObjectId | string | IUser
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
  orderStatus:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
  paymentMethod: 'card' | 'transfer' | 'cod'
  trackingNumber?: string // High-level tracking for the master order
  shippedAt?: Date // Global timestamp for when fulfillment started
  deliveredAt?: Date
  updatedBy?: Types.ObjectId | IUser
  statusHistory: {
    status: string
    updatedAt: Date
    updatedBy: Types.ObjectId | IUser
  }[]
  paymentReference?: string
  notes?: string
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

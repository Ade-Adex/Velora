// /app/models/User.ts

import { Schema, model, models } from 'mongoose'
import { IUser } from '@/app/types'

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: { type: String, required: true },
    image: { type: String },
    phone: { type: String },
    birthday: { type: Date },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'unspecified'],
      default: 'unspecified',
    },
    role: {
      type: String,
      enum: ['customer', 'admin', 'editor', 'vendor'], // Added 'vendor'
      default: 'customer',
    },
    vendorProfile: {
      shopName: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
      },
      isVerified: { type: Boolean, default: false },
      description: { type: String, trim: true },

      // Branding Assets
      logo: { type: String }, // URL to image
      banner: { type: String }, // URL to cover image

      // External Links
      website: { type: String, trim: true },

      // Support Contacts
      supportEmail: { type: String, trim: true, lowercase: true },
      supportPhone: { type: String, trim: true },

      // Social Media Links (Nested Object)
      socialLinks: {
        facebook: { type: String, trim: true },
        instagram: { type: String, trim: true },
        twitter: { type: String, trim: true },
      },

      // Metrics
      rating: { type: Number, default: 0 },
      reviewsCount: { type: Number, default: 0 },

      // Payout Information
      bankDetails: {
        accountName: { type: String, trim: true },
        accountNumber: { type: String, trim: true },
        bankName: { type: String, trim: true },
      },
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
      index: true,
    },
    magicToken: { type: String, index: true },
    tokenExpiry: { type: Date },
    lastLogin: { type: Date },
    addresses: [
      {
        isDefault: { type: Boolean, default: false },
        label: String,
        fullName: String,
        phone: String,
        addressLine1: String,
        city: String,
        state: String,
        zipCode: String,
        country: { type: String, default: 'Nigeria' },
      },
    ],
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export const User = models.User || model<IUser>('User', UserSchema)

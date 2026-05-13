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
      businessType: {
        type: String,
        enum: ['Individual', 'Registered Business'],
        default: 'Individual',
      },

      address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        country: { type: String, trim: true, default: 'Nigeria' },
        zipCode: { type: String, trim: true },
      },
      isVerified: { type: Boolean, default: false },
      description: { type: String, trim: true },

      logo: { type: String },
      banner: { type: String },

      website: { type: String, trim: true },

      supportEmail: { type: String, trim: true, lowercase: true },
      supportPhone: { type: String, trim: true },

      socialLinks: {
        facebook: { type: String, trim: true },
        instagram: { type: String, trim: true },
        twitter: { type: String, trim: true },
      },

      rating: { type: Number, default: 0 },
      reviewsCount: { type: Number, default: 0 },

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

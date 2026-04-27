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
    phone: { type: String },
    birthday: { type: Date }, 
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'unspecified'],
      default: 'unspecified',
    }, 
    role: {
      type: String,
      enum: ['customer', 'admin', 'editor'],
      default: 'customer',
    },
    magicToken: { type: String, index: true },
    tokenExpiry: { type: Date },
    lastLogin: { type: Date },
    addresses: [
      {
        isDefault: { type: Boolean, default: false },
        label: String,
        street: String,
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
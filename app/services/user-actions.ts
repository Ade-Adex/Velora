// /app/services/user-actions.ts
'use server'

import connectDB from '@/app/lib/mongodb'
import { User } from '@/app/models/User'
import { IUser } from '@/app/types'
import { v2 as cloudinary } from 'cloudinary'
import { Order } from '@/app/models/Order'
import { getSessionUser } from '@/app/lib/auth-utils'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function updateUserProfile(payload: Partial<IUser>) {
  try {
    const user = await getSessionUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { role, email, _id, ...updateData } = payload

    await connectDB()

    // LOGIC: Handle Default Address resetting
    if (updateData.addresses && Array.isArray(updateData.addresses)) {
      const hasNewDefault = updateData.addresses.some((addr) => addr.isDefault)

      if (hasNewDefault) {
        // Find the index of the last item marked as default (usually the one just added/updated)
        const defaultIndex = updateData.addresses.findLastIndex(
          (addr) => addr.isDefault,
        )

        // Ensure only that one is true, others are false
        updateData.addresses = updateData.addresses.map((addr, idx) => ({
          ...addr,
          isDefault: idx === defaultIndex,
        }))
      }
    }

    // Handle Cloudinary Upload if image is a base64 string
    if (updateData.image && updateData.image.startsWith('data:image')) {
      const uploadRes = await cloudinary.uploader.upload(updateData.image, {
        folder: 'user_profiles',
        transformation: [{ width: 400, height: 400, crop: 'fill' }],
      })
      updateData.image = uploadRes.secure_url // Save the Cloudinary URL to DB
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: updateData },
      { returnDocument: 'after', runValidators: true },
    )
      .select('-magicToken -tokenExpiry')
      .lean()

    if (!updatedUser) return { success: false, error: 'User not found' }

    return {
      success: true,
      user: JSON.parse(JSON.stringify(updatedUser)),
    }
  } catch (error) {
    console.error('Update Profile Error:', error)
    return { success: false, error: 'Internal Server Error' }
  }
}

// Add this to your existing user-actions.ts
export async function getUserOrdersAction() {
  try {
    const user = await getSessionUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    await connectDB()
    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .lean()

    return { success: true, orders: JSON.parse(JSON.stringify(orders)) }
  } catch (error) {
    return { success: false, error: 'Failed to fetch orders' }
  }
}

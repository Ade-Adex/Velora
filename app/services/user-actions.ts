// /app/services/user-actions.ts
'use server'

import { cookies } from 'next/headers'
import jwt, { JwtPayload } from 'jsonwebtoken'
import connectDB from '@/app/lib/mongodb'
import { User } from '@/app/models/User'
import { IUser } from '@/app/types'
import { v2 as cloudinary } from 'cloudinary'
import { Order } from '@/app/models/Order'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

interface UserPayload extends JwtPayload {
  id: string
  email: string
  role: string
}

export async function updateUserProfile(payload: Partial<IUser>) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    if (!token) return { success: false, error: 'Unauthorized' }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as UserPayload
    const { role, email, _id, ...updateData } = payload

    await connectDB()

    // Handle Cloudinary Upload if image is a base64 string
    if (updateData.image && updateData.image.startsWith('data:image')) {
      const uploadRes = await cloudinary.uploader.upload(updateData.image, {
        folder: 'user_profiles',
        transformation: [{ width: 400, height: 400, crop: 'fill' }],
      })
      updateData.image = uploadRes.secure_url // Save the Cloudinary URL to DB
    }

    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      { $set: updateData },
      { new: true, runValidators: true },
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
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return { success: false, error: 'Unauthorized' };

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as UserPayload;
    
    await connectDB();
    const orders = await Order.find({ user: decoded.id }).sort({ createdAt: -1 }).lean();
    
    return { success: true, orders: JSON.parse(JSON.stringify(orders)) };
  } catch (error) {
    return { success: false, error: 'Failed to fetch orders' };
  }
}
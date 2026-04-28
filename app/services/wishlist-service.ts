// /app/services/wishlist-service.ts
'use server'

import connectDB from '@/app/lib/mongodb'
import { User } from '@/app/models/User'
import { revalidatePath } from 'next/cache'

export async function syncWishlistAction(userId: string, productIds: string[]) {
  try {
    await connectDB()

    // Update the user's wishlist array with the new list of product IDs
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { wishlist: productIds },
      { new: true },
    ).lean()

    if (!updatedUser) throw new Error('User not found')

    // Optional: clear cache for wishlist page to show fresh data
    revalidatePath('/wishlist')

    return { success: true }
  } catch (error) {
    console.error('Action Error syncing wishlist:', error)
    return { success: false, error: 'Failed to sync wishlist' }
  }
}

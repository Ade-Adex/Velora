// /app/services/wishlist-service.ts
'use server'

import connectDB from '@/app/lib/mongodb'
import { User } from '@/app/models/User'
import { revalidatePath } from 'next/cache'



export async function getUserWishlistAction(userId: string) {
  try {
    await connectDB()
    const user = await User.findById(userId)
      .populate('wishlist')
      .lean()

    if (!user) return { success: false, data: [] }
    
    // Serialize for Client Component
    return { 
      success: true, 
      data: JSON.parse(JSON.stringify(user.wishlist)) 
    }
  } catch (error) {
    console.error('Fetch Wishlist Error:', error)
    return { success: false, data: [] }
  }
}




export async function syncWishlistAction(userId: string, productIds: string[]) {
  try {
    await connectDB()
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { wishlist: productIds },
      { new: true },
    )

    if (!updatedUser) throw new Error('User not found')

    // This ensures that if the wishlist is rendered on the server elsewhere,
    // it gets fresh data.
    revalidatePath('/wishlist')
    return { success: true }

  } catch (error) {
    console.error('Action Error syncing wishlist:', error)
    return { success: false, error: 'Failed to sync wishlist' }
  }
}

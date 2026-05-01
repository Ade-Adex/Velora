// /app/services/auth-service.ts

import crypto from 'crypto'
import { User } from '@/app/models/User'
import connectDB from '@/app/lib/mongodb'
import { getSessionUser } from '@/app/lib/auth-utils'
import { IUser } from '@/app/types'
import { UpdateQuery } from 'mongoose'

/**
 * Generates a magic link token and prepares the user record.
 * @param email The user's email address.
 * @param requestedRole The role intended if the user is being created for the first time.
 */
export async function generateMagicToken(email: string, requestedRole: string = 'customer') {
  await connectDB()

  // 1. Check if the database is empty to assign the first Admin
  const userCount = await User.countDocuments()
  const isFirstUser = userCount === 0

  // 2. Generate security token
  const token = crypto.randomBytes(32).toString('hex')
  const expiry = new Date(Date.now() + 15 * 60 * 1000) // 15 Minute Expiry

  // 3. Create a friendly display name from the email
  const defaultName = email
    .split('@')[0]
    .replace(/[._-]/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  /**
   * 4. Update or Insert (Upsert) the User
   * - $set: Updates these fields every time a link is requested.
   * - $setOnInsert: Only sets these fields if the user is BRAND NEW.
   */
  const update: UpdateQuery<IUser> = {
    $set: {
      magicToken: token,
      tokenExpiry: expiry,
    },
    $setOnInsert: {
      fullName: defaultName,
      // Priority: First User -> admin | Vendor Intent -> vendor | Default -> customer
      role: isFirstUser ? 'admin' : (requestedRole === 'vendor' ? 'vendor' : 'customer'),
      isSuperAdmin: isFirstUser,
      isActive: true,
      createdAt: new Date(),
    },
  }

  await User.findOneAndUpdate(
    { email: email.toLowerCase().trim() }, 
    update, 
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  )

  return token
}

/**
 * Verifies the token and cleans up after use.
 */

export async function verifyMagicToken(token: string) {
  await connectDB()

  const user = await User.findOne({
    magicToken: token,
    tokenExpiry: { $gt: new Date() },
  })

  if (!user) return null

  // Clear token after successful use
  user.magicToken = undefined
  user.tokenExpiry = undefined
  user.lastLogin = new Date()
  await user.save()

  return user
}


export async function getCurrentUser() {
  try {
    const authUser = await getSessionUser();
    
    // authUser now contains _id because of our standardization
    if (!authUser || !authUser._id) return null; 

    await connectDB();
    
    // CHANGE THIS LINE: Use _id instead of id
    const user = await User.findById(authUser._id).select('-magicToken -tokenExpiry');

    return user ? JSON.parse(JSON.stringify(user)) : null;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null; 
  }
}

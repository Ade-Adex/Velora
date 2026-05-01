// /app/services/auth-service.ts

import crypto from 'crypto'
import { User } from '@/app/models/User'
import connectDB from '@/app/lib/mongodb'
import { getSessionUser } from '@/app/lib/auth-utils'
import { IUser } from '@/app/types'
import { UpdateQuery } from 'mongoose'

export async function generateMagicToken(email: string) {
  await connectDB()

  // 1. Check for system initialization
  const userCount = await User.countDocuments()
  const isFirstUser = userCount === 0

  const token = crypto.randomBytes(32).toString('hex')
  const expiry = new Date(Date.now() + 15 * 60 * 1000)

  const defaultName = email
    .split('@')[0]
    .replace(/[._-]/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  
  const update: UpdateQuery<IUser> = {
    $set: {
      magicToken: token,
      tokenExpiry: expiry,
    },
    $setOnInsert: {
      fullName: defaultName,
      ...(isFirstUser
        ? {
            role: 'admin',
            isSuperAdmin: true,
          }
        : {}),
    },
  }

  await User.findOneAndUpdate({ email: email.toLowerCase() }, update, {
    upsert: true,
    new: true,
  })

  return token
}

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
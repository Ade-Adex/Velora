// /app/services/auth-service.ts

import crypto from 'crypto'
import { User } from '@/app/models/User'
import connectDB from '@/app/lib/mongodb'
import { cookies } from 'next/headers'
import jwt, { JwtPayload } from 'jsonwebtoken'

export async function generateMagicToken(email: string) {
  await connectDB()
  const token = crypto.randomBytes(32).toString('hex')
  const expiry = new Date(Date.now() + 15 * 60 * 1000) 

  const defaultName = email.split('@')[0]
    .replace(/[._-]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      magicToken: token,
      tokenExpiry: expiry,
      $setOnInsert: { fullName: defaultName } 
    },
    { upsert: true, new: true }
  )

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



interface UserPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) return null

    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET as string
    ) as UserPayload

    await connectDB()
    const user = await User.findById(decoded.id).select('-magicToken -tokenExpiry')
    
    // Convert Mongoose document to plain object for Server Component serialization
    return user ? JSON.parse(JSON.stringify(user)) : null
  } catch (error) {
    return null
  }
}
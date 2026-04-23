//  /app/api/auth/me/route.ts

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import jwt, { JwtPayload } from 'jsonwebtoken'
import connectDB from '@/app/lib/mongodb'
import { User } from '@/app/models/User'

// Define the shape of your JWT payload
interface UserPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    // Verify and cast to our custom interface
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET as string
    ) as UserPayload

    await connectDB()
    
    // Now decoded.id is strictly typed as a string
    const user = await User.findById(decoded.id).select(
      '-magicToken -tokenExpiry',
    )

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    // If token is invalid or expired, jwt.verify throws; we catch it and return null
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
//  /app/api/auth/me/route.ts

import { NextResponse } from 'next/server'
import jwt, { JwtPayload } from 'jsonwebtoken'
import connectDB from '@/app/lib/mongodb'
import { User } from '@/app/models/User'
import { getSessionUser } from '@/app/lib/auth-utils'


export async function GET() {
  // try {
  //   // 1. Centralized Auth Check
  //   const authUser = await getSessionUser()

  //   if (!authUser) {
  //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  //   }

  //   await connectDB()

  //   // Now authUser.id is strictly typed as a string
  //   const user = await User.findById(authUser.id).select(
  //     '-magicToken -tokenExpiry',
  //   )

  //   if (!user) {
  //     return NextResponse.json({ user: null }, { status: 200 })
  //   }

  //   return NextResponse.json({ user })
  // } catch (error) {
  //   // If token is invalid or expired, jwt.verify throws; we catch it and return null
  //   return NextResponse.json({ user: null }, { status: 200 })
  // }
}

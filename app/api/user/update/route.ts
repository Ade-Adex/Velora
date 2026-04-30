// /app/api/user/update/route.ts

import { NextResponse } from 'next/server'
import jwt, { JwtPayload } from 'jsonwebtoken'
import connectDB from '@/app/lib/mongodb'
import { User } from '@/app/models/User'
import { getSessionUser } from '@/app/lib/auth-utils'


export async function PUT(req: Request) {
  // try {
  //   // 1. Centralized Auth Check
  //   const user = await getSessionUser()

  //   if (!user) {
  //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  //   }

  //   const body = await req.json()

  //   const { role, email, _id, ...updateData } = body

  //   await connectDB()
  //   const updatedUser = await User.findByIdAndUpdate(
  //     user.id,
  //     { $set: updateData },
  //     { new: true, runValidators: true },
  //   ).select('-magicToken -tokenExpiry')

  //   if (!updatedUser) {
  //     return NextResponse.json({ error: 'User not found' }, { status: 404 })
  //   }

  //   return NextResponse.json({ success: true, user: updatedUser })
  // } catch (error) {
  //   console.error('Update Profile Error:', error)
  //   return NextResponse.json(
  //     { error: 'Internal Server Error' },
  //     { status: 500 },
  //   )
  // }
}

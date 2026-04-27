// /app/api/user/update/route.ts

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import jwt, { JwtPayload } from 'jsonwebtoken'
import connectDB from '@/app/lib/mongodb'
import { User } from '@/app/models/User'

interface UserPayload extends JwtPayload {
  id: string
  email: string
  role: string
}

export async function PUT(req: Request) {
  // try {
  //   const cookieStore = await cookies()
  //   const token = cookieStore.get('session')?.value

  //   if (!token) {
  //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  //   }

  //   const decoded = jwt.verify(
  //     token,
  //     process.env.JWT_SECRET as string,
  //   ) as UserPayload

  //   const body = await req.json()

  //   const { role, email, _id, ...updateData } = body

  //   await connectDB()
  //   const updatedUser = await User.findByIdAndUpdate(
  //     decoded.id,
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
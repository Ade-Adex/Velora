//  /app/api/admin/create-staff/route.ts

import { NextResponse } from 'next/server'
import connectDB from '@/app/lib/mongodb'
import { User } from '@/app/models/User'
import { getSessionUser } from '@/app/lib/auth-utils'

export async function POST(req: Request) {
  try {
    // 1. Guard: Only existing admins can create other admins
    const currentUser = await getSessionUser()
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admins only' },
        { status: 403 },
      )
    }

    const { email, fullName } = await req.json()

    if (!email || !fullName) {
      return NextResponse.json(
        { error: 'Email and Full Name are required' },
        { status: 400 },
      )
    }

    await connectDB()

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })

    if (existingUser) {
      // If they exist, we just upgrade their role
      existingUser.role = 'admin'
      existingUser.fullName = fullName
      await existingUser.save()
      return NextResponse.json({
        success: true,
        message: 'Existing user promoted to Admin',
      })
    }

    // 3. Create a new Admin account
    await User.create({
      email: email.toLowerCase(),
      fullName,
      role: 'admin',
    })

    return NextResponse.json({
      success: true,
      message: 'New Admin account created',
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
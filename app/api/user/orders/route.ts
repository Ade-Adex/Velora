// /app/api/user/orders/route.ts

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/app/lib/mongodb'
import { Order } from '@/app/models/Order'

export async function GET() {
  try {
    await connectDB()
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string
    }

    // Fetch orders for this specific user, sorted by newest first
    const orders = await Order.find({ user: decoded.id }).sort({
      createdAt: -1,
    })

    return NextResponse.json({ success: true, orders })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
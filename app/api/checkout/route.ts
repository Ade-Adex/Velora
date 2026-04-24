//  /api/checkout/route.ts

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import jwt, { JwtPayload } from 'jsonwebtoken'
import connectDB from '@/app/lib/mongodb'
import { Order } from '@/app/models/Order'

interface UserPayload extends JwtPayload {
  id: string
  email: string
  role: string
}

export async function POST(req: Request) {
  try {
    // 1. Auth Check (Matching your /user/update logic)
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as UserPayload

    const body = await req.json()
    const { items, totals, shippingAddress, paymentMethod } = body

    await connectDB()

    // 2. Generate Order Number
    const orderNumber = `CBC-${Math.random().toString(36).toUpperCase().substring(2, 10)}`

    // 3. Create Order using your model
    const newOrder = await Order.create({
      user: decoded.id,
      orderNumber,
      items,
      totals,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'transfer' ? 'unpaid' : 'processing',
      orderStatus: 'pending',
    })

    // 4. Return response matching your frontend expectation
    return NextResponse.json({
      success: true,
      order: newOrder,
      // For transfer, we go straight to success. For card, you'd integrate your gateway here.
      redirectUrl:
        paymentMethod === 'transfer'
          ? `/orders/success?id=${newOrder._id}&method=transfer`
          : `/checkout/paystack?id=${newOrder._id}`,
    })
  } catch (error) {
    console.error('Checkout API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
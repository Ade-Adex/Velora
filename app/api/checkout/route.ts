//  /api/checkout/route.ts

import { NextResponse } from 'next/server'
import connectDB from '@/app/lib/mongodb'
import { Order } from '@/app/models/Order'
import mongoose from 'mongoose'
import { IOrderItem, IAddress } from '@/app/types'
import { getSessionUser } from '@/app/lib/auth-utils'

interface CheckoutRequestBody {
  items: (Omit<IOrderItem, 'product' | 'image'> & {
    product: string
    image: string | { src: string }
  })[]
  totals: {
    subtotal: number
    shipping: number
    tax: number
    discount: number
    grandTotal: number
  }
  shippingAddress: IAddress
  paymentMethod: 'card' | 'transfer'
}


export async function POST(req: Request) {
  try {
    await connectDB()

    // 1. Centralized Auth Check
    const user = await getSessionUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CheckoutRequestBody = await req.json()
    const { items, totals, shippingAddress, paymentMethod } = body

    // 2. Sanitize Items to match IOrderItem exactly
    const sanitizedItems = items.map((item) => ({
      product: new mongoose.Types.ObjectId(item.product),
      name: item.name,
      variantSku: item.variantSku || '',
      // Ensure image is a string (if your frontend passes the ImageSource object)
      image: typeof item.image === 'string' ? item.image : item.image.src,
      quantity: item.quantity,
      price: item.price,
    }))

    // 3. Generate Professional Order Number
    const orderNumber = `Velora-${Math.random().toString(36).toUpperCase().substring(2, 10)}`

    // 4. Create Order
    try {
      const newOrder = await Order.create({
        user: new mongoose.Types.ObjectId(user._id),
        orderNumber,
        items: sanitizedItems,
        totals,
        shippingAddress, // Matches IAddress now
        paymentMethod,
        paymentStatus: paymentMethod === 'transfer' ? 'unpaid' : 'processing',
        orderStatus: 'pending',
      })

      return NextResponse.json({
        success: true,
        orderId: newOrder._id,
        redirectUrl:
          paymentMethod === 'transfer'
            ? `/orders/success?id=${newOrder._id}&method=transfer`
            : `/checkout/paystack?id=${newOrder._id}`,
      })
    } catch (dbError) {
      if (dbError instanceof mongoose.Error.ValidationError) {
        console.error('Validation Error Details:', dbError.errors)
        return NextResponse.json(
          { error: 'Order validation failed', details: dbError.message },
          { status: 400 },
        )
      }
      throw dbError
    }
  } catch (error: unknown) {
    console.error('Checkout API Full Error:', error)

   if (typeof error === 'object' && error !== null && 'code' in error) {
     // Create a temporary reference with a specific structure to satisfy TS
     const errorWithCode = error as { code: string }

     if (
       errorWithCode.code === 'ERR_JWT_EXPIRED' ||
       errorWithCode.code === 'ERR_JWS_INVALID'
     ) {
       return NextResponse.json(
         { error: 'Invalid or expired session' },
         { status: 401 },
       )
     }
   }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal Server Error', message: errorMessage },
      { status: 500 },
    )
  }
}
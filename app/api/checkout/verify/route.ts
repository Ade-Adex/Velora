// /app/api/checkout/verify/route.ts

import { NextResponse } from 'next/server'
import connectDB from '@/app/lib/mongodb'
import { Order } from '@/app/models/Order'
import { Product } from '@/app/models/Product'
import { IOrderItem } from '@/app/types'

interface PaystackVerifyResponse {
  status: boolean
  message: string
  data: {
    status: string
    reference: string
    amount: number
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const reference = searchParams.get('reference')
  const orderId = searchParams.get('orderId')

  if (!reference || !orderId) {
    return NextResponse.redirect(new URL('/cart?error=missing_params', req.url))
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    return NextResponse.redirect(new URL('/cart?error=config_error', req.url))
  }

  try {
    // 1. Verify payment with Paystack first
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      },
    )

    const data: PaystackVerifyResponse = await response.json()

    if (data.status && data.data.status === 'success') {
      await connectDB()

      // 2. Fetch the order
      const existingOrder = await Order.findById(orderId)

      if (!existingOrder) {
        return NextResponse.redirect(
          new URL('/cart?error=order_not_found', req.url),
        )
      }

      // If already processed, just redirect to success
      if (existingOrder.paymentStatus === 'paid') {
        return NextResponse.redirect(
          new URL(`/orders/success?id=${orderId}&method=card`, req.url),
        )
      }

      // 3. ATOMIC STOCK CHECK & REDUCTION
      // We try to find the product AND ensure it has enough stock in one go.
      try {
        const stockUpdateResults = await Promise.all(
          existingOrder.items.map(async (item: IOrderItem) => {
            return await Product.findOneAndUpdate(
              {
                _id: item.product,
                stock: { $gte: item.quantity }, // ONLY update if stock >= requested
              },
              { $inc: { stock: -item.quantity } },
              { new: true },
            )
          }),
        )

        // If any result is null, it means that specific product ran out of stock
        if (stockUpdateResults.includes(null)) {
          console.error(`Stock conflict for Order: ${orderId}`)
          // Note: Payment was successful, but stock is gone.
          // You should flag this for a manual refund in your admin dashboard.
          return NextResponse.redirect(
            new URL(
              `/orders/failed?id=${orderId}&error=out_of_stock_after_payment`,
              req.url,
            ),
          )
        }
      } catch (stockError) {
        console.error('Database error during stock update:', stockError)
        throw stockError
      }

      // 4. Update Order Status
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'paid',
        paymentReference: reference,
        orderStatus: 'confirmed',
      })

      return NextResponse.redirect(
        new URL(`/orders/success?id=${orderId}&method=card`, req.url),
      )
    } else {
      // Payment was not successful
      return NextResponse.redirect(
        new URL(`/orders/failed?id=${orderId}`, req.url),
      )
    }
  } catch (error) {
    console.error('Verification Error:', error)
    return NextResponse.redirect(
      new URL('/cart?error=verification_failed', req.url),
    )
  }
}
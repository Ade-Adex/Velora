// /app/api/checkout/verify/route.ts
import { NextResponse } from 'next/server'
import connectDB from '@/app/lib/mongodb'
import { Order } from '@/app/models/Order'
import { Product } from '@/app/models/Product'
import { IOrder, IOrderItem, IProduct } from '@/app/types'
import { initializeShipments } from '@/app/services/shipment-service'

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
  if (!secretKey)
    return NextResponse.redirect(new URL('/cart?error=config_error', req.url))

  try {
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

      const existingOrder = (await Order.findById(orderId)) as IOrder | null
      if (!existingOrder) {
        return NextResponse.redirect(
          new URL('/cart?error=order_not_found', req.url),
        )
      }

      if (existingOrder.paymentStatus === 'paid') {
        return NextResponse.redirect(
          new URL(`/orders/success?id=${orderId}&method=card`, req.url),
        )
      }

      // --- ATOMIC STOCK REDUCTION ---
      const stockUpdateResults = await Promise.all(
        existingOrder.items.map(async (item: IOrderItem) => {
          return (await Product.findOneAndUpdate(
            {
              _id: item.product,
              stock: { $gte: item.quantity },
            },
            { $inc: { stock: -item.quantity } },
            { new: true },
          )) as IProduct | null
        }),
      )

      if (stockUpdateResults.includes(null)) {
        return NextResponse.redirect(
          new URL(`/orders/failed?id=${orderId}&error=stock_conflict`, req.url),
        )
      }

      // --- UPDATE ORDER & INITIALIZE LOGISTICS ---
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'paid',
        paymentReference: reference,
        orderStatus: 'confirmed',
      })

      // THIS IS THE KEY: Create shipment documents so the vendor table
      // can find targetShipmentId
      await initializeShipments(orderId)

      return NextResponse.redirect(
        new URL(`/orders/success?id=${orderId}&method=card`, req.url),
      )
    } else {
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

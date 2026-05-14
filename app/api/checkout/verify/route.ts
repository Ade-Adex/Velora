// /app/api/checkout/verify/route.ts
// import { NextResponse } from 'next/server'
// import connectDB from '@/app/lib/mongodb'
// import { Order } from '@/app/models/Order'
// import { Product } from '@/app/models/Product'
// import { IOrder, IOrderItem, IProduct } from '@/app/types'
// import { initializeShipments } from '@/app/services/shipment-service'

// interface PaystackVerifyResponse {
//   status: boolean
//   message: string
//   data: {
//     status: string
//     reference: string
//     amount: number
//   }
// }

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url)
//   const reference = searchParams.get('reference')
//   const orderId = searchParams.get('orderId')

//   if (!reference || !orderId) {
//     return NextResponse.redirect(new URL('/cart?error=missing_params', req.url))
//   }

//   const secretKey = process.env.PAYSTACK_SECRET_KEY
//   if (!secretKey)
//     return NextResponse.redirect(new URL('/cart?error=config_error', req.url))

//   try {
//     const response = await fetch(
//       `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
//       {
//         method: 'GET',
//         headers: {
//           Authorization: `Bearer ${secretKey}`,
//           'Content-Type': 'application/json',
//         },
//       },
//     )

//     const data: PaystackVerifyResponse = await response.json()

//     if (data.status && data.data.status === 'success') {
//       await connectDB()

//       const existingOrder = (await Order.findById(orderId)) as IOrder | null
//       if (!existingOrder) {
//         return NextResponse.redirect(
//           new URL('/cart?error=order_not_found', req.url),
//         )
//       }

//       if (existingOrder.paymentStatus === 'paid') {
//         return NextResponse.redirect(
//           new URL(`/orders/success?id=${orderId}&method=card`, req.url),
//         )
//       }

//       // --- ATOMIC STOCK REDUCTION ---
//       const stockUpdateResults = await Promise.all(
//         existingOrder.items.map(async (item: IOrderItem) => {
//           return (await Product.findOneAndUpdate(
//             {
//               _id: item.product,
//               stock: { $gte: item.quantity },
//             },
//             { $inc: { stock: -item.quantity } },
//             { new: true },
//           )) as IProduct | null
//         }),
//       )

//       if (stockUpdateResults.includes(null)) {
//         return NextResponse.redirect(
//           new URL(`/orders/failed?id=${orderId}&error=stock_conflict`, req.url),
//         )
//       }

//       // --- UPDATE ORDER & INITIALIZE LOGISTICS ---
//       await Order.findByIdAndUpdate(orderId, {
//         paymentStatus: 'paid',
//         paymentReference: reference,
//         orderStatus: 'confirmed',
//       })

//       // THIS IS THE KEY: Create shipment documents so the vendor table
//       // can find targetShipmentId
//       await initializeShipments(orderId)

//       return NextResponse.redirect(
//         new URL(`/orders/success?id=${orderId}&method=card`, req.url),
//       )
//     } else {
//       return NextResponse.redirect(
//         new URL(`/orders/failed?id=${orderId}`, req.url),
//       )
//     }
//   } catch (error) {
//     console.error('Verification Error:', error)
//     return NextResponse.redirect(
//       new URL('/cart?error=verification_failed', req.url),
//     )
//   }
// }

import { NextResponse } from 'next/server'
import mongoose, { ClientSession } from 'mongoose'
import connectDB from '@/app/lib/mongodb'
import { Order } from '@/app/models/Order'
import { Product } from '@/app/models/Product'
import { IOrder, IProduct } from '@/app/types'
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

// Define a specific error type for our flow
class VerificationError extends Error {
  constructor(
    public code: string,
    message?: string,
  ) {
    super(message)
    this.name = 'VerificationError'
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

    if (!data.status || data.data.status !== 'success') {
      return NextResponse.redirect(
        new URL(`/orders/failed?id=${orderId}`, req.url),
      )
    }

    await connectDB()

    // START TRANSACTION SESSION
    const session: ClientSession = await mongoose.startSession()
    session.startTransaction()

    try {
      // 1. Fetch order within session
      const existingOrder = (await Order.findById(orderId).session(
        session,
      )) as IOrder | null

      if (!existingOrder) {
        throw new VerificationError('order_not_found')
      }

      // Idempotency check: prevent double processing
      if (existingOrder.paymentStatus === 'paid') {
        await session.abortTransaction()
        session.endSession()
        return NextResponse.redirect(
          new URL(`/orders/success?id=${orderId}&method=card`, req.url),
        )
      }

      // 2. ATOMIC STOCK REDUCTION (Sequential inside transaction)
      for (const item of existingOrder.items) {
        const updatedProduct = (await Product.findOneAndUpdate(
          {
            _id: item.product,
            stock: { $gte: item.quantity },
          },
          { $inc: { stock: -item.quantity } },
          { session, new: true },
        )) as IProduct | null

        if (!updatedProduct) {
          throw new VerificationError(
            'stock_conflict',
            `Insufficient stock for ${item.name}`,
          )
        }
      }

      // 3. UPDATE ORDER STATUS
      await Order.findByIdAndUpdate(
        orderId,
        {
          paymentStatus: 'paid',
          paymentReference: reference,
          orderStatus: 'confirmed',
        },
        { session },
      )

      // 4. INITIALIZE LOGISTICS (Ensure this function accepts session)
      await initializeShipments(orderId, session)

      // COMMIT ALL CHANGES
      await session.commitTransaction()
      session.endSession()

      return NextResponse.redirect(
        new URL(`/orders/success?id=${orderId}&method=card`, req.url),
      )
    } catch (innerError) {
      await session.abortTransaction()
      session.endSession()

      const errorCode =
        innerError instanceof VerificationError
          ? innerError.code
          : 'process_failed'
      console.error('Inner Verification Error:', innerError)

      return NextResponse.redirect(
        new URL(`/orders/failed?id=${orderId}&error=${errorCode}`, req.url),
      )
    }
  } catch (error) {
    console.error('Network/System Error:', error)
    return NextResponse.redirect(
      new URL('/cart?error=verification_failed', req.url),
    )
  }
}
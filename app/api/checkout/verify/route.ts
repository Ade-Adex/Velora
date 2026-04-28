// // /app/api/checkout/verify/route.ts

// import { NextResponse } from 'next/server'
// import connectDB from '@/app/lib/mongodb'
// import { Order } from '@/app/models/Order'
// import { Product } from '@/app/models/Product'
// import { IOrderItem } from '@/app/types'

// // --- STRICT INTERFACES ---
// interface PaystackVerifyResponse {
//   status: boolean
//   message: string
//   data: {
//     status: string
//     reference: string
//     amount: number
//     // Add other fields you might need
//   }
// }

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url)
//   const reference = searchParams.get('reference')
//   const orderId = searchParams.get('orderId')

//   // 1. Validate Input
//   if (!reference || !orderId) {
//     return NextResponse.redirect(new URL('/cart?error=missing_params', req.url))
//   }

//   const secretKey = process.env.PAYSTACK_SECRET_KEY

//   if (!secretKey) {
//     console.error('PAYSTACK_SECRET_KEY is not defined in environment variables')
//     return NextResponse.redirect(new URL('/cart?error=config_error', req.url))
//   }

//   try {
//     // 2. Verify with Paystack Server
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

//     if (!response.ok) {
//       throw new Error(`Paystack API responded with status: ${response.status}`)
//     }

//     const data: PaystackVerifyResponse = await response.json()

//     // 3. Check Success Status
//     if (data.status && data.data.status === 'success') {
//       await connectDB()

//       // Update Order Status
//       const updatedOrder = await Order.findByIdAndUpdate(
//         orderId,
//         {
//           paymentStatus: 'paid',
//           paymentReference: reference,
//           orderStatus: 'confirmed',
//         },
//         { new: true }, // Returns the updated document
//       )

//       if (!updatedOrder) {
//         console.error(`Order ${orderId} not found during verification update`)
//         return NextResponse.redirect(
//           new URL('/cart?error=order_not_found', req.url),
//         )
//       }

//       try {
//         const stockUpdates = updatedOrder.items.map((item: IOrderItem) => {
//           return Product.findByIdAndUpdate(item.product, {
//             $inc: { stock: -item.quantity },
//           })
//         })

//         await Promise.all(stockUpdates)
//       } catch (stockError) {
//         // We log this but don't stop the redirect, as the user has already paid
//         console.error('Failed to update stock levels:', stockError)
//       }

//       // 4. Redirect to Success Page
//       return NextResponse.redirect(
//         new URL(`/orders/success?id=${orderId}&method=card`, req.url),
//       )
//     } else {
//       // Payment was not successful according to Paystack
//       console.warn(
//         `Payment verification failed for ref: ${reference}. Status: ${data.data.status}`,
//       )
//       return NextResponse.redirect(
//         new URL(`/orders/failed?id=${orderId}`, req.url),
//       )
//     }
//   } catch (error) {
//     console.error(
//       'Verification Error:',
//       error instanceof Error ? error.message : error,
//     )
//     // Avoid infinite redirect loops by ensuring the URL is correct
//     return NextResponse.redirect(
//       new URL('/cart?error=verification_failed', req.url),
//     )
//   }
// }



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

      const existingOrder = await Order.findById(orderId)

      if (!existingOrder) {
        return NextResponse.redirect(
          new URL('/cart?error=order_not_found', req.url),
        )
      }

      if (existingOrder.paymentStatus !== 'paid') {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'paid',
          paymentReference: reference,
          orderStatus: 'confirmed',
        })

        // 2. Reduce Stock Levels
        try {
          const stockUpdates = existingOrder.items.map((item: IOrderItem) => {
            return Product.findByIdAndUpdate(
              item.product,
              { $inc: { stock: -item.quantity } },
              { runValidators: true },
            )
          })

          await Promise.all(stockUpdates)
        } catch (stockError) {
          console.error('Stock Update Error:', stockError)
          // We don't stop the user here because they have already paid
        }
      }

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

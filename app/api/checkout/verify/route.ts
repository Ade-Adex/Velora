// // /app/api/checkout/verify/route.ts
// import { NextResponse } from 'next/server'
// import mongoose, { ClientSession } from 'mongoose'
// import { revalidatePath } from 'next/cache' // Import the Next.js revalidation utility
// import connectDB from '@/app/lib/mongodb'
// import { Order } from '@/app/models/Order'
// import { Product } from '@/app/models/Product'
// import { IOrder, IProduct } from '@/app/types'
// import { initializeShipments } from '@/app/services/shipment-service'
// import { pusherServer } from '@/app/lib/pusher'

// interface PaystackVerifyResponse {
//   status: boolean
//   message: string
//   data: {
//     status: string
//     reference: string
//     amount: number
//   }
// }

// class VerificationError extends Error {
//   constructor(
//     public code: string,
//     message?: string,
//   ) {
//     super(message)
//     this.name = 'VerificationError'
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
//   if (!secretKey) {
//     return NextResponse.redirect(new URL('/cart?error=config_error', req.url))
//   }

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

//     if (!data.status || data.data.status !== 'success') {
//       return NextResponse.redirect(
//         new URL(`/orders/failed?id=${orderId}`, req.url),
//       )
//     }

//     await connectDB()

//     // START TRANSACTION SESSION
//     const session: ClientSession = await mongoose.startSession()
//     session.startTransaction()

//     try {
//       // 1. Fetch order within session
//       const existingOrder = (await Order.findById(orderId).session(
//         session,
//       )) as IOrder | null

//       if (!existingOrder) {
//         throw new VerificationError('order_not_found')
//       }

//       // Idempotency check: prevent double processing
//       if (existingOrder.paymentStatus === 'paid') {
//         await session.abortTransaction()
//         session.endSession()
//         return NextResponse.redirect(
//           new URL(`/orders/success?id=${orderId}&method=card`, req.url),
//         )
//       }

//       // 2. ATOMIC STOCK REDUCTION (Sequential inside transaction)
//       for (const item of existingOrder.items) {
//         const updatedProduct = (await Product.findOneAndUpdate(
//           {
//             _id: item.product,
//             stock: { $gte: item.quantity },
//           },
//           { $inc: { stock: -item.quantity } },
//           { session, new: true },
//         )) as IProduct | null

//         if (!updatedProduct) {
//           throw new VerificationError(
//             'stock_conflict',
//             `Insufficient stock for ${item.name}`,
//           )
//         }
//       }

//       // 3. UPDATE ORDER STATUS
//       await Order.findByIdAndUpdate(
//         orderId,
//         {
//           paymentStatus: 'paid',
//           paymentReference: reference,
//           orderStatus: 'confirmed',
//         },
//         { session },
//       )

//       // 4. INITIALIZE LOGISTICS
//       await initializeShipments(orderId, session)

//       // COMMIT ALL CHANGES TO DATABASE
//       await session.commitTransaction()
//       session.endSession()

//       // --- BROADCAST REAL-TIME NOTIFICATION EVENT ---
//       // We broadcast the event to push updates instantly into active client dashboards
//       try {
//         await Promise.all([
//           pusherServer.trigger('admin-orders-channel', 'new-order', {
//             orderId,
//             message: 'A new order has been paid and confirmed!',
//           }),
//           pusherServer.trigger('vendor-orders-channel', 'vendor-update', {
//             orderId,
//             message: 'New inventory allocation ready for dispatch.',
//           }),
//         ])
//       } catch (pusherError) {
//         // Prevent real-time delivery issues from blowing up an already successful financial checkout
//         console.error('Realtime broadcast delay or failure:', pusherError)
//       }

//       // --- PURGE NEXT.JS SERVER SIDE CACHE ---
//       revalidatePath('/admin/orders')
//       revalidatePath('/vendor/orders')

//       return NextResponse.redirect(
//         new URL(`/orders/success?id=${orderId}&method=card`, req.url),
//       )
//     } catch (innerError) {
//       await session.abortTransaction()
//       session.endSession()

//       const errorCode =
//         innerError instanceof VerificationError
//           ? innerError.code
//           : 'process_failed'
//       console.error('Inner Verification Error:', innerError)

//       return NextResponse.redirect(
//         new URL(`/orders/failed?id=${orderId}&error=${errorCode}`, req.url),
//       )
//     }
//   } catch (error) {
//     console.error('Network/System Error:', error)
//     return NextResponse.redirect(
//       new URL('/cart?error=verification_failed', req.url),
//     )
//   }
// }












// /app/api/checkout/verify/route.ts

import connectDB from '@/app/lib/mongodb'
import { pusherServer } from '@/app/lib/pusherServer'
import { Order } from '@/app/models/Order'
import { Product } from '@/app/models/Product'
import { initializeShipments } from '@/app/services/logisticsService' 
import { saveNotificationToDb } from '@/app/services/notificationService' // Added Service Import
import { IOrder, IProduct } from '@/app/types'
import mongoose, { ClientSession } from 'mongoose'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

interface PaystackVerifyResponse {
  status: boolean
  message: string
  data: {
    status: string
    reference: string
    amount: number
  }
}

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
        new URL(`/orders/failed?id=${orderId}&error=payment_unsuccessful`, req.url),
      )
    }

    await connectDB()

    const session: ClientSession = await mongoose.startSession()
    session.startTransaction()

    try {
      const existingOrder = (await Order.findById(orderId).session(
        session,
      )) as IOrder | null

      if (!existingOrder) {
        throw new VerificationError('order_not_found')
      }

      if (existingOrder.paymentStatus === 'paid') {
        await session.abortTransaction()
        session.endSession()
        return NextResponse.redirect(
          new URL(`/orders/success?id=${orderId}&method=card`, req.url),
        )
      }

      // Atomic stock reduction pass
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

      // Update Order Status and fully populate products to read vendor identifiers
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          paymentStatus: 'paid',
          paymentReference: reference,
          orderStatus: 'confirmed',
        },
        { session, new: true },
      ).populate({
        path: 'items.product',
        model: Product,
      })

      // Execute shipment registration
      await initializeShipments(orderId, session)

      await session.commitTransaction()
      session.endSession()

      // --- TARGETED REALTIME & DB DISPATCH BLOCK ---
      try {
        const timestamp = new Date().toISOString()
        const pusherPromises: Promise<unknown>[] = []

        // 1. Persist and Dispatch System Alert to Admin Shell
        const adminDoc = await saveNotificationToDb({
          recipientRole: 'admin',
          title: 'New Paid Order',
          message: `Order #${updatedOrder?.orderNumber || orderId} has been successfully verified via Paystack.`,
          associatedOrder: orderId,
        })

        pusherPromises.push(
          pusherServer.trigger(
            'private-admin-system-channel',
            'admin-notification',
            {
              id: adminDoc._id.toString(),
              title: adminDoc.title,
              message: adminDoc.message,
              read: false,
              createdAt: timestamp,
            },
          ),
        )

        // 2. Identify unique vendors from line items, persist to DB, and dispatch alerts
        if (updatedOrder?.items) {
          const uniqueVendorIds = new Set<string>()

          for (const item of updatedOrder.items) {
            if (item.vendor) {
              uniqueVendorIds.add(item.vendor.toString())
            }
          }

          // Trigger notifications for each unique vendor found
          for (const vendorId of uniqueVendorIds) {
            const vendorDoc = await saveNotificationToDb({
              recipientId: vendorId,
              recipientRole: 'vendor',
              title: 'New Order Received!',
              message: `You have new item allocations ready for dispatch under order #${updatedOrder.orderNumber || orderId}.`,
              associatedOrder: orderId,
            })

            pusherPromises.push(
              pusherServer.trigger(
                `private-user-${vendorId}`,
                'new-notification',
                {
                  id: vendorDoc._id.toString(),
                  title: vendorDoc.title,
                  message: vendorDoc.message,
                  read: false,
                  createdAt: timestamp,
                },
              ),
            )
          }
        }

        // Execute all real-time events concurrently outside the core database transaction lock
        await Promise.all(pusherPromises)
      } catch (pusherError) {
        console.error(
          'Notification handling layer failed safely:',
          pusherError,
        )
      }

      // Clear route caches so dashboard views update seamlessly
      revalidatePath('/admin/orders')
      revalidatePath('/vendor/orders')

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
          
      console.error('Transaction Aborted. Verification Error Context:', innerError)

      return NextResponse.redirect(
        new URL(`/orders/failed?id=${orderId}&error=${errorCode}`, req.url),
      )
    }
  } catch (error) {
    console.error('Network/System Outage Error:', error)
    return NextResponse.redirect(
      new URL(`/cart?error=verification_failed&id=${orderId}`, req.url),
    )
  }
}
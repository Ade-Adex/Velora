// /app/api/orders/update-status/route.ts

import { NextResponse } from 'next/server'
import { updateOrderStatus } from '@/app/services/order-service'
import { getSessionUser } from '@/app/lib/auth-utils'
import { IUser } from '@/app/types'

export async function PATCH(req: Request) {
  try {
    const adminUser = await getSessionUser()

    // Ensure only admins can perform this action
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 },
      )
    }

    const { orderId, status, trackingNumber } = await req.json()

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      )
    }

    // Pass the adminUser.id to the service for accountability
    const updatedOrder = await updateOrderStatus(
      orderId,
      status,
      adminUser._id,
      trackingNumber,
    )

    // Type Guard: Check if 'user' is the populated object, not just an ID string
    const customer = updatedOrder.user as unknown as IUser

    if (status === 'shipped' && customer?.email) {
      console.log(
        `Professional Trigger: Sending shipping email to ${customer.email}`,
      )
      // Call your Resend service here:
      // await sendShippingNotification(customer.email, trackingNumber);
    }

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
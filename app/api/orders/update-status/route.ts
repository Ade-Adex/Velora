// /app/api/orders/update-status/route.ts

import { NextResponse } from 'next/server'
import { updateOrderStatus } from '@/app/services/order-service'
import { getSessionUser } from '@/app/lib/auth-utils'

export async function PATCH(req: Request) {
  try {
    const user = await getSessionUser()

    if (!user || user.role !== 'admin') {
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

    const updatedOrder = await updateOrderStatus(
      orderId,
      status,
      trackingNumber,
    )

    if (status === 'shipped') {
      console.log(
        `Professional Trigger: Sending shipping email to ${updatedOrder.user.email}`,
      )
      // Here you would call your Resend service function
    }

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

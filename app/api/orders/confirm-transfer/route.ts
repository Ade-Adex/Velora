// /app/api/orders/confirm-transfer/route.ts

import { NextResponse } from 'next/server'
import { confirmBankTransfer } from '@/app/services/order-service'

export async function POST(req: Request) {
  try {
    const { orderId, notes } = await req.json()

    const confirmedOrder = await confirmBankTransfer(orderId, notes)

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed and stock allocated.',
      order: confirmedOrder,
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

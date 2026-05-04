//  /api/checkout/route.ts

import { NextResponse } from 'next/server'
import connectDB from '@/app/lib/mongodb'
import { Order } from '@/app/models/Order'
import { Product } from '@/app/models/Product'
import mongoose, { Types } from 'mongoose'
import { getSessionUser } from '@/app/lib/auth-utils'
import { IAddress, IOrderItem, IProduct, ImageSource } from '@/app/types'
import { SHIPPING_CONFIG } from '@/app/lib/constants'

interface CheckoutRequestItem {
  product: string
  quantity: number
  variantSku?: string
  image: ImageSource
}

interface CheckoutRequestBody {
  items: CheckoutRequestItem[]
  shippingAddress: IAddress
  paymentMethod: 'card' | 'transfer'
}

export async function POST(req: Request) {
  try {
    await connectDB()
    const user = await getSessionUser()

    if (!user || !user._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CheckoutRequestBody = await req.json()
    const { items, shippingAddress, paymentMethod } = body

    const productIds = items.map((item) => item.product)
    const dbProducts: IProduct[] = await Product.find({
      _id: { $in: productIds },
    })

    // Calculate subtotal first to determine total shipping
    const calculatedSubtotal = items.reduce((acc, cartItem) => {
      const product = dbProducts.find(
        (p) => (p._id as Types.ObjectId).toString() === cartItem.product,
      )
      if (!product) return acc
      return (
        acc + (product.discountPrice || product.basePrice) * cartItem.quantity
      )
    }, 0)

    const totalShipping =
      calculatedSubtotal >= SHIPPING_CONFIG.FREE_THRESHOLD
        ? 0
        : SHIPPING_CONFIG.FLAT_RATE

    // Map to the IOrderItem interface strictly
    const sanitizedItems: IOrderItem[] = items.map((cartItem) => {
      const product = dbProducts.find(
        (p) => (p._id as Types.ObjectId).toString() === cartItem.product,
      )

      if (!product) {
        throw new Error(`Product ${cartItem.product} not found`)
      }

      const itemPrice = product.discountPrice || product.basePrice
      const lineTotal = itemPrice * cartItem.quantity
      const commissionRate = product.commissionRate || 10
      const adminCommissionAmount = (lineTotal * commissionRate) / 100

      // Proportional shipping per item
      const itemShippingPortion =
        totalShipping > 0 ? totalShipping / items.length : 0

      return {
        product: product._id as Types.ObjectId,
        vendor: product.vendor as Types.ObjectId,
        name: product.name,
        image:
          typeof cartItem.image === 'string'
            ? cartItem.image
            : cartItem.image.src,
        variantSku: cartItem.variantSku || '',
        quantity: cartItem.quantity,
        price: itemPrice,
        adminCommissionRate: commissionRate,
        adminCommissionAmount,
        vendorNetEarning: lineTotal - adminCommissionAmount,
        shippingFee: itemShippingPortion,
        status: 'pending' as const, // Uses the literal type from interface
      }
    })

    const grandTotal = calculatedSubtotal + totalShipping
    const orderNumber = `VEL-${Math.random().toString(36).toUpperCase().substring(2, 10)}`

    const newOrder = await Order.create({
      user: new mongoose.Types.ObjectId(user._id as string),
      orderNumber,
      items: sanitizedItems,
      totals: {
        subtotal: calculatedSubtotal,
        shipping: totalShipping,
        tax: 0,
        discount: 0,
        grandTotal,
      },
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'transfer' ? 'unpaid' : 'processing',
      orderStatus: 'pending',
    })

    return NextResponse.json({
      success: true,
      orderId: (newOrder._id as Types.ObjectId).toString(),
      redirectUrl:
        paymentMethod === 'transfer'
          ? `/orders/success?id=${newOrder._id}&method=transfer`
          : `/checkout/paystack?id=${newOrder._id}`,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
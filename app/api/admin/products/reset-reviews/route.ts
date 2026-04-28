// /app/api/admin/products/reset-reviews/route.ts


import { NextResponse } from 'next/server'
import connectDB from '@/app/lib/mongodb'
import { Product } from '@/app/models/Product'

export async function POST(request: Request) {
  try {
    await connectDB()
    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 },
      )
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      {
        $set: {
          reviews: [],
          'ratings.average': 0,
          'ratings.count': 0,
        },
      },
      { new: true },
    )

    return NextResponse.json({
      message: 'Product reviews reset successfully',
      productName: product?.name,
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

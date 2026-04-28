// /app/api/admin/products/reset-all-reviews/route.ts


import { NextResponse } from 'next/server'
import connectDB from '@/app/lib/mongodb'
import { Product } from '@/app/models/Product'

export async function POST(request: Request) {
  try {
    await connectDB()

    // Optional: Simple security check for Postman
    // To use this, add a header in Postman: x-admin-secret: your_secret_key
    const adminSecret = request.headers.get('x-admin-secret')
    if (
      process.env.NODE_ENV === 'production' &&
      adminSecret !== process.env.ADMIN_SECRET
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await Product.updateMany(
      {}, // Empty filter selects all documents
      {
        $set: {
          reviews: [],
          'ratings.average': 0,
          'ratings.count': 0,
        },
      },
    )

    return NextResponse.json({
      message: 'All product reviews and ratings have been wiped.',
      modifiedCount: result.modifiedCount,
    })
  } catch (error: unknown) {
    console.error('Global Reset Error:', (error as Error).message)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

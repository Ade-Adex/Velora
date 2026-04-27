// /app/api/admin/products/categories/route.ts


import { NextResponse } from 'next/server'
import connectDB from '@/app/lib/mongodb'
import { Category } from '@/app/models/Category'

export async function POST(req: Request) {
  try {
    await connectDB()
    const body = await req.json()

    // Ensure slug is created if not provided
    if (body.name && !body.slug) {
      body.slug = body.name.toLowerCase().replace(/ /g, '-')
    }

    const category = await Category.create(body)

    return NextResponse.json(
      { message: 'Category created', category },
      { status: 201 },
    )
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

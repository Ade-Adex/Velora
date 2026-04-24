// /app/api/admin/products/route.ts
import { NextResponse } from 'next/server'
import {
  createProduct,
  CreateProductInput,
} from '@/app/services/product-service'

export async function POST(req: Request) {
  try {
    const body: CreateProductInput = await req.json()

    // 1. Validation Logic
    const requiredFields: (keyof CreateProductInput)[] = [
      'name',
      'brand',
      'basePrice',
      'category',
      'mainImage',
    ]

    for (const field of requiredFields) {
      const value = body[field]
      if (value === undefined || value === null || value === '') {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        )
      }
    }

    // 2. Database Operation
    // No more TS error here!
    const product = await createProduct(body)

    return NextResponse.json(
      { message: 'Product created successfully', product },
      { status: 201 },
    )
  } catch (error: unknown) {
    console.error('CREATE_PRODUCT_ERROR:', error)

    if (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { error: 'A product with this name or slug already exists' },
        { status: 409 },
      )
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

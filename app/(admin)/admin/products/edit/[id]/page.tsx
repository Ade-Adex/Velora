//  /app/admin/products/edit/[id]/page.tsx

import connectDB from '@/app/lib/mongodb'
import { Product } from '@/app/models/Product'
import { Category } from '@/app/models/Category'
import { notFound } from 'next/navigation'
import ProductEditForm from '@/app/(admin)/admin/products/edit/[id]/ProductEditForm'

// 1. Update the type definition to wrap params in a Promise
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // 2. Await the params to get the id
  const { id } = await params

  await connectDB()

  const [product, categories] = await Promise.all([
    // 3. Use the unwrapped id here
    Product.findById(id).lean(),
    Category.find().select('name _id').sort({ name: 1 }).lean(),
  ])

  if (!product) notFound()

  return (
    <ProductEditForm
      product={JSON.parse(JSON.stringify(product))}
      categories={JSON.parse(JSON.stringify(categories))}
    />
  )
}
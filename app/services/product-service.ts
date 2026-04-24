// /app/services/product-service.ts
import connectDB from '@/app/lib/mongodb'
import { Product } from '@/app/models/Product'
import { IProduct } from '@/app/types'

// Define the input type here or import it from your types file
export type CreateProductInput = Omit<
  IProduct,
  '_id' | 'createdAt' | 'updatedAt' | 'category'
> & {
  category: string
}

export async function createProduct(data: CreateProductInput) {
  await connectDB()

  // Prepare the object for Mongoose
  // We spread the data; Mongoose will automatically cast the category string to an ObjectId
  const productData = { ...data }

  // Auto-generate slug if not provided
  if (productData.name && !productData.slug) {
    productData.slug =
      productData.name
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-') +
      '-' +
      Math.random().toString(36).substring(2, 7)
  }

  const product = new Product(productData)
  return await product.save()
}

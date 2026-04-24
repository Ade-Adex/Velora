// /app/services/product-service.ts

import connectDB from '@/app/lib/mongodb'
import { Product } from '@/app/models/Product'
import { IProduct } from '@/app/types'
import { Category } from '@/app/models/Category'  
import '../models/Category'

export type CreateProductInput = Omit<
  IProduct,
  '_id' | 'createdAt' | 'updatedAt' | 'category'
> & {
  category: string
}

export async function getProducts(limit: number) {
  await connectDB()
  return await Product.find({ isPublished: true })
    .populate('category', 'name slug') 
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
}

// Add this for your dynamic [slug] pages
export async function getProductBySlug(slug: string) {
  await connectDB()
  
  return await Product.findOne({ slug, isPublished: true })
    .populate('category')
    .lean()
}

export async function createProduct(data: CreateProductInput) {
  await connectDB()

  const productData = { ...data }

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
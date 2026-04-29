// /app/services/product-service.ts

'use server'

import connectDB from '@/app/lib/mongodb'
import { Product } from '@/app/models/Product'
import { IProduct, IReview } from '@/app/types'
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
  const products = await Product.find({ isPublished: true })
    .populate({
      path: 'category',
      model: Category, 
      select: 'name slug',
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()

  return products
}

export async function getProductBySlug(slug: string) {
  await connectDB()

  return await Product.findOne({ slug, isPublished: true })
    .populate({
      path: 'category',
      populate: {
        path: 'parent',
        populate: {
          path: 'parent',
          populate: { path: 'parent' }, // Allows up to 4-5 levels of breadcrumbs
        },
      },
    })
    .lean()
}

export async function getFeaturedCategories() {
  await connectDB()
  return await Category.find({ isFeatured: true }).limit(7).lean()
}

export async function getProductsByCategory(categorySlug: string) {
  await connectDB()

  // 1. Find the category by slug first
  const category = await Category.findOne({ slug: categorySlug }).lean()

  if (!category) return { products: [], category: null }

  // 2. Find products belonging to that category ID
  const products = await Product.find({
    category: category._id,
    isPublished: true,
  })
    .populate('category')
    .sort({ createdAt: -1 })
    .lean()

  return {
    products: JSON.parse(JSON.stringify(products)),
    category: JSON.parse(JSON.stringify(category)),
  }
}

export async function getAllCategories() {
  await connectDB()

  // Using aggregation to join Category with Product and count matches
  const categoriesWithCount = await Category.aggregate([
    {
      $lookup: {
        from: 'products', // must match your MongoDB collection name (usually plural)
        localField: '_id',
        foreignField: 'category',
        as: 'productCount',
      },
    },
    {
      $project: {
        name: 1,
        slug: 1,
        image: 1,
        description: 1,
        totalProducts: { $size: '$productCount' }, // Count the array size
      },
    },
    { $sort: { name: 1 } },
  ])

  return JSON.parse(JSON.stringify(categoriesWithCount))
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

export async function addProductReview(
  productId: string,
  reviewData: { userId: string; name: string; rating: number; comment: string },
) {
  await connectDB()

  const product = await Product.findById(productId)
  if (!product) throw new Error('Product not found')

  const newReview = {
    user: reviewData.userId,
    name: reviewData.name,
    rating: Number(reviewData.rating),
    comment: reviewData.comment,
    createdAt: new Date(),
  }

  product.reviews.push(newReview)

 const reviewCount = product.reviews.length
 product.ratings.count = reviewCount

 // FIX: Calculate the raw average then round to 2 decimal places
 const rawAverage =
   product.reviews.reduce((acc: number, item: IReview) => item.rating + acc, 0) /
   reviewCount

 // Math.round(val * 100) / 100 gives you two decimal places (e.g., 3.33)
 product.ratings.average = Math.round(rawAverage * 100) / 100

 await product.save()

 return JSON.parse(JSON.stringify(product))
}
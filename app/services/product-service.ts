// /app/services/product-service.ts

'use server'

import connectDB from '@/app/lib/mongodb'
import { Product } from '@/app/models/Product'
import { ICategory, IProduct, IReview } from '@/app/types'
import { Category } from '@/app/models/Category'
import '../models/Category'
import { Types } from 'mongoose'

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
  return await Category.find({ isFeatured: true }).sort({ name: 1 }).lean()
}

export async function getProductsByCategory(categorySlug: string) {
  await connectDB()

  // 1. Find the target category (typed as ICategory or null)
  const category = (await Category.findOne({
    slug: categorySlug,
  }).lean()) as ICategory | null

  if (!category) return { products: [], category: null }

  // 2. Helper function with strict Types.ObjectId typing
  async function getChildCategoryIds(
    parentId: Types.ObjectId,
  ): Promise<Types.ObjectId[]> {
    // We only need the _id field
    const children = (await Category.find({ parent: parentId })
      .select('_id')
      .lean()) as { _id: Types.ObjectId }[]

    let ids = children.map((child) => child._id)

    for (const childId of ids) {
      const grandChildren = await getChildCategoryIds(childId)
      ids = ids.concat(grandChildren)
    }
    return ids
  }

  // 3. Get all IDs (Target + Children)
  // category._id is already a Types.ObjectId from the lean() result
  const allRelatedCategoryIds: Types.ObjectId[] = [
    category._id as Types.ObjectId,
    ...(await getChildCategoryIds(category._id as Types.ObjectId)),
  ]

  // 4. Find products using the array of ObjectIds
  const products = await Product.find({
    category: { $in: allRelatedCategoryIds },
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

  const categoriesWithCount = await Category.aggregate([
    {
      $lookup: {
        from: 'products',
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
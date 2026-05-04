// /app/services/product-service.ts

'use server'

import connectDB from '@/app/lib/mongodb'
import { Category } from '@/app/models/Category'
import { Product } from '@/app/models/Product'
import { ICategory, IProduct, IReview } from '@/app/types'
import { SortOrder, Types } from 'mongoose'
import '../models/Category'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/app/services/auth-service'

// import slugify from 'slugify'

export type CreateProductInput = Omit<
  IProduct,
  '_id' | 'createdAt' | 'updatedAt' | 'category'
> & {
  category: string
}

type ProductInput = Omit<Partial<IProduct>, 'category'> & { category?: string }

export async function getProducts(limit: number) {
  await connectDB()
  const products = await Product.find({
    isPublished: true,
    // approvalStatus: 'approved',
  })
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

  return await Product.findOne({ slug, isPublished: true, approvalStatus: 'approved' })
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
    approvalStatus: 'approved',
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

export async function getProductsByCollection(type: string) {
  await connectDB()

  /**
   * We use a flexible Record type for the query.
   * This avoids the Mongoose 'FilterQuery' import error entirely
   * while still allowing us to add properties dynamically.
   */
  const query: Record<string, unknown> = { isPublished: true }

  // Use Record<string, SortOrder> to allow nested keys like 'ratings.average'
  let sort: Record<string, SortOrder> = { createdAt: -1 }

  if (type === 'flash-sales') {
    query.onSale = true
  } else if (type === 'best-sellers') {
    sort = { 'ratings.average': -1, 'ratings.count': -1 }
  } else if (type === 'new-arrivals') {
    sort = { createdAt: -1 }
  }

  const products = await Product.find(query)
    .populate({
      path: 'category',
      model: Category,
      select: 'name slug',
    })
    .sort(sort)
    .limit(20)
    .lean()

  return JSON.parse(JSON.stringify(products))
}

/**
 * Enhanced native slug generator
 */
function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, '') // Trim - from end
    .concat('-', Math.random().toString(36).substring(2, 6)) // Unique suffix
}

/**
 * Professional Product Creation Service
 */
export async function createProduct(data: ProductInput) {
  try {
    await connectDB()

    // 1. Authentication & Security
    const user = await getCurrentUser()
    if (!user || !user._id) {
      return {
        success: false,
        error: 'Unauthorized: Please log in to list products.',
      }
    }

    if (!data.name) {
      return { success: false, error: 'Product name is required' }
    }

    // 2. Data Preparation
    const slug = generateSlug(data.name)

    const productData = {
      ...data,
      slug,
      vendor: user._id, // Securely set vendor ID from session
      approvalStatus: 'pending',
      isPublished: data.isPublished || false,
      commissionRate: 10,
      ratings: {
        average: 0,
        count: 0,
      },
      seo: {
        title: data.seo?.title || data.name,
        description: data.seo?.description || data.shortDescription || '',
        keywords: data.tags || [],
      },
    }

    // 3. Database Operation
    const newProduct = await Product.create(productData)

    // 4. Cache Invalidation
    revalidatePath('/vendor/products')
    revalidatePath('/admin/products')
    revalidatePath('/')

    return {
      success: true,
      id: (newProduct._id as Types.ObjectId).toString(),
    }
  } catch (error: unknown) {
    console.error('[PRODUCT_SERVICE_ERROR]:', error)

    // Extract specific Mongoose validation messages (like the Category ID error)
    let errorMessage = 'An unexpected error occurred while saving the product'

    if (error instanceof Error) {
      // This will capture things like "Cast to ObjectId failed for value 'Electronics'"
      errorMessage = error.message
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
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
    product.reviews.reduce(
      (acc: number, item: IReview) => item.rating + acc,
      0,
    ) / reviewCount

  // Math.round(val * 100) / 100 gives you two decimal places (e.g., 3.33)
  product.ratings.average = Math.round(rawAverage * 100) / 100

  await product.save()

  return JSON.parse(JSON.stringify(product))
}

/**
 * Fetches all categories and formats them for the Mantine Select component
 */

export async function getCategoryOptions() {
  try {
    await connectDB()

    // We fetch only the name and ID to keep the payload small
    const categories = await Category.find({})
      .select('name _id')
      .sort({ name: 1 })
      .lean()

    return categories.map((cat) => ({
      // We explicitly convert _id to string for the Select "value"
      value: (cat._id as Types.ObjectId).toString(),
      label: cat.name as string,
    }))
  } catch (error) {
    console.error('Failed to fetch category options:', error)
    return []
  }
}

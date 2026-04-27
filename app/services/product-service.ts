// /app/services/product-service.ts

import connectDB from '@/app/lib/mongodb'
import { Product } from '@/app/models/Product'
import { ICategory, IProduct, Serialized } from '@/app/types'
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
      model: Category, // Explicitly tell Mongoose which model to use
      select: 'name slug',
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()

  return products
}

// Add this for your dynamic [slug] pages
export async function getProductBySlug(slug: string) {
  await connectDB()
  
  return await Product.findOne({ slug, isPublished: true })
    .populate('category')
    .lean()
}


export async function getFeaturedCategories() {
  await connectDB()
  return await Category.find({ isFeatured: true })
    .limit(7)
    .lean()
}

export async function getProductsByCategory(categorySlug: string) {
  await connectDB()
  
  // 1. Find the category by slug first
  const category = await Category.findOne({ slug: categorySlug }).lean()
  
  if (!category) return { products: [], category: null }

  // 2. Find products belonging to that category ID
  const products = await Product.find({ 
      category: category._id, 
      isPublished: true 
    })
    .populate('category')
    .sort({ createdAt: -1 })
    .lean()

  return {
    products: JSON.parse(JSON.stringify(products)),
    category: JSON.parse(JSON.stringify(category))
  }
}

// /app/services/product-service.ts

export async function getAllCategories() {
  await connectDB();

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
  ]);

  return JSON.parse(JSON.stringify(categoriesWithCount));
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
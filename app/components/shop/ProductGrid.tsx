// /app/components/shop/ProductGrid.tsx


import { Star, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { IProduct } from '@/app/types'

interface ProductGridProps {
  products: IProduct[]
  variant?: 'deal' | 'standard'
}

export default function ProductGrid({
  products,
  variant = 'standard',
}: ProductGridProps) {
  return (
    <div
      className={`grid gap-6 ${
        variant === 'deal'
          ? 'grid-cols-2 md:grid-cols-5'
          : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
      }`}
    >
      {products.map((product) => {
        const currentPrice = product.discountPrice || product.basePrice
        const hasDiscount =
          !!product.discountPrice && product.discountPrice < product.basePrice

        const discountPercentage = hasDiscount
          ? Math.round(
              ((product.basePrice - product.discountPrice!) /
                product.basePrice) *
                100,
            )
          : null

        return (
          <Link
            key={product.slug}
            href={`/product/${product.slug}`}
            className="group relative bg-white rounded-3xl p-2 md:p-3 flex flex-col transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-2 border border-transparent hover:border-gray-100"
          >
            {/* 1. IMAGE CONTAINER - Removed p-2, changed to object-cover */}
            <div className="relative aspect-square bg-[#F3F4F6] rounded-2xl mb-4 overflow-hidden shadow-inner">
              <Image
                src={
                  typeof product.mainImage === 'string'
                    ? product.mainImage
                    : '/placeholder.jpg'
                }
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
              />

              {/* SALE BADGE - Refined for a cleaner look */}
              {discountPercentage && (
                <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                  -{discountPercentage}%
                </div>
              )}

              {/* STOCK BADGE */}
              {product.stock <= 0 && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center z-20">
                  <span className="text-gray-900 font-black text-[10px]! uppercase tracking-[0.2em] border-2 border-gray-900 px-3 py-1">
                    Sold Out
                  </span>
                </div>
              )}

              {/* HOVER OVERLAY - Professional blur effect */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <div className="bg-white/90 backdrop-blur-md px-3 py-2 rounded-full shadow-2xl flex items-center gap-2 transform translate-y-8 group-hover:translate-y-0 transition-all duration-500">
                  <span className="text-[10px]! font-bold text-gray-900">
                    Quick View
                  </span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>

            {/* 2. PRODUCT CONTENT */}
            <div className="px-1 flex flex-col grow">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px]! font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wide">
                  {product.brand}
                </span>
                <div className="flex items-center gap-1">
                  <Star size={12} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-xs! font-bold text-gray-500">
                    {product.ratings?.average
                      ? Number(product.ratings.average).toFixed(1)
                      : '0.0'}
                  </span>
                </div>
              </div>

              <h4 className="font-bold text-sm! text-gray-800 line-clamp-2 leading-snug mb-3 min-h-10 group-hover:text-blue-700 transition-colors">
                {product.name}
              </h4>

              {/* PRICE SECTION - Moved to bottom */}
              <div className="mt-auto flex items-end gap-2">
                <span className="text-gray-950 font-black text-base md:text-lg tracking-tighter">
                  ${currentPrice.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-gray-400 line-through text-xs! font-medium mb-1">
                    ${product.basePrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
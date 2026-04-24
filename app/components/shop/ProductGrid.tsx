// // /app/components/shop/ProductGrid.tsx

// 'use client'
// import { useCartStore } from '@/app/store/useCartStore'
// import { ShoppingCart, Star, Eye } from 'lucide-react'
// import { CartItem } from '@/app/types'
// import Image from 'next/image'
// import Link from 'next/link'
// import { products } from '@/app/data/products'

// interface ProductGridProps {
//   limit: number
//   variant?: 'deal' | 'standard'
// }

// export default function ProductGrid({
//   limit,
//   variant = 'standard',
// }: ProductGridProps) {
//   const addToCart = useCartStore((state) => state.addToCart)

//   return (
//     <div
//       className={`grid gap-4 ${
//         variant === 'deal'
//           ? 'grid-cols-2 md:grid-cols-5'
//           : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
//       }`}
//     >
//       {products.slice(0, limit).map((product) => {
//         // Calculate discount percentage if applicable
//         const discount =
//           product.basePrice > product.price
//             ? Math.round(
//                 ((product.basePrice - product.price) / product.basePrice) * 100,
//               )
//             : null

//         return (
//           <div
//             key={product.id}
//             className="group relative bg-white rounded-2xl p-3 border border-gray-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50/40 transition-all duration-300 flex flex-col"
//           >
//             {/* 1. SALE BADGE */}
//             {discount && (
//               <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
//                 -{discount}%
//               </div>
//             )}

//             {/* 2. IMAGE CONTAINER WITH LINK */}
//             <Link
//               href={`/product/${product.slug}`}
//               className="relative aspect-square bg-[#F8F9FA] rounded-xl mb-3 overflow-hidden flex items-center justify-center p-4"
//             >
//               <Image
//                 src={product.image}
//                 alt={product.name}
//                 className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500"
//               />

//               {/* Overlay on Hover */}
//               <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
//                 <div className="bg-white p-2 rounded-full shadow-md text-blue-600">
//                   <Eye size={18} />
//                 </div>
//               </div>
//             </Link>

//             {/* 3. BRAND & NAME */}
//             <div className="flex-1">
//               <p className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter mb-0.5">
//                 {product.brand}
//               </p>
//               <Link href={`/product/${product.slug}`}>
//                 <h4 className="font-semibold text-sm text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors mb-1">
//                   {product.name}
//                 </h4>
//               </Link>

//               {/* RATINGS */}
//               <div className="flex items-center gap-1 mb-2">
//                 <div className="flex">
//                   {[...Array(5)].map((_, i) => (
//                     <Star
//                       key={i}
//                       size={10}
//                       className={`${i < product.rating ? 'fill-[#FFC107] text-[#FFC107]' : 'text-gray-200'}`}
//                     />
//                   ))}
//                 </div>
//                 <span className="text-[10px] text-gray-400 font-medium">
//                   ({product.reviews.toLocaleString()})
//                 </span>
//               </div>

//               {/* PRICE SECTION */}
//               <div className="flex items-center gap-2">
//                 <span className="text-[#FF8A00] font-bold text-base">
//                   ${product.price.toLocaleString()}
//                 </span>
//                 {product.basePrice > product.price && (
//                   <span className="text-gray-400 line-through text-[11px]">
//                     ${product.basePrice.toLocaleString()}
//                   </span>
//                 )}
//               </div>
//             </div>

//             {/* 4. SMART BUTTON (Handle Out of Stock) */}
//             <button
//               disabled={product.stock <= 0}
//               onClick={() =>
//                 addToCart({
//                   id: product.id,
//                   name: product.name,
//                   price: product.price,
//                   image: product.image,
//                   quantity: 1,
//                   slug: product.slug,
//                 } as CartItem)
//               }
//               className={`w-full mt-3 py-3 rounded-xl text-xs! font-bold transition-all flex items-center justify-center gap-2
//                 ${
//                   product.stock > 0
//                     ? 'bg-blue-50 text-[#0052CC] hover:bg-[#0052CC] hover:text-white'
//                     : 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                 }`}
//             >
//               <ShoppingCart size={14} />
//               <span>{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
//             </button>
//           </div>
//         )
//       })}
//     </div>
//   )
// }

'use client'
import { Star, Eye, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { products } from '@/app/data/products'

interface ProductGridProps {
  limit: number
  variant?: 'deal' | 'standard'
}

export default function ProductGrid({
  limit,
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
      {products.slice(0, limit).map((product) => {
        const discount =
          product.basePrice > product.price
            ? Math.round(
                ((product.basePrice - product.price) / product.basePrice) * 100,
              )
            : null

        return (
          <Link
            key={product.id}
            href={`/product/${product.slug}`}
            className="group relative bg-white rounded-2xl p-2 flex flex-col transition-all duration-300 hover:-translate-y-1"
          >
            {/* 1. IMAGE CONTAINER */}
            <div className="relative aspect-[4/5] bg-[#F3F4F6] rounded-2xl mb-3 overflow-hidden flex items-center justify-center p-6">
              <Image
                src={product.image}
                alt={product.name}
                className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-700"
              />

              {/* SALE BADGE */}
              {discount && (
                <div className="absolute top-3 left-3 z-10 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                  {discount}% OFF
                </div>
              )}

              {/* STOCK BADGE */}
              {product.stock <= 0 && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="text-gray-900 font-bold text-xs uppercase tracking-widest">
                    Out of Stock
                  </span>
                </div>
              )}

              {/* HOVER OVERLAY: "View Details" */}
              <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                  <span className="text-xs font-bold text-blue-600">
                    View Product
                  </span>
                  <ArrowRight size={14} className="text-blue-600" />
                </div>
              </div>
            </div>

            {/* 2. PRODUCT CONTENT */}
            <div className="px-2 pb-2">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {product.brand}
                </span>
                <div className="flex items-center gap-0.5">
                  <Star size={10} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-[10px] font-bold text-gray-600">
                    {product.rating}
                  </span>
                </div>
              </div>

              <h4 className="font-bold text-sm text-gray-900 line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors">
                {product.name}
              </h4>

              {/* PRICE SECTION */}
              <div className="flex items-center gap-2">
                <span className="text-gray-900 font-black text-base">
                  ${product.price.toLocaleString()}
                </span>
                {product.basePrice > product.price && (
                  <span className="text-gray-400 line-through text-xs">
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

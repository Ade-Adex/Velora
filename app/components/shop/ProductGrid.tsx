// /app/components/shop/ProductGrid.tsx

'use client'
import { useCartStore } from '@/app/store/useCartStore'
import { ShoppingCart, Star } from 'lucide-react'
import { CartItem } from '@/app/types'
import Image from 'next/image'
import proImage from '@/public/Images/product1.webp'

interface ProductGridProps {
  limit: number
  variant?: 'deal' | 'standard'
}

export default function ProductGrid({
  limit,
  variant = 'standard',
}: ProductGridProps) {
  const addToCart = useCartStore((state) => state.addToCart)

  const products = [
    {
      id: '1',
      name: 'Smart TV 55" UHD',
      price: 199,
      basePrice: 249,
      image: proImage,
      slug: 'smart-tv',
      rating: 4,
      reviews: 6299,
    },
    {
      id: '2',
      name: 'Smartphone Pro',
      price: 199,
      basePrice: 282,
      image: proImage,
      slug: 'iphone-15',
      rating: 5,
      reviews: 8299,
    },
    {
      id: '3',
      name: 'Wireless Headphones',
      price: 199,
      basePrice: 229,
      image: proImage,
      slug: 'headphones',
      rating: 4,
      reviews: 5299,
    },
    {
      id: '4',
      name: 'Sport Sneakers',
      price: 99,
      basePrice: 152,
      image: proImage,
      slug: 'sneakers',
      rating: 5,
      reviews: 5299,
    },
    {
      id: '5',
      name: 'Luxury Watch',
      price: 189,
      basePrice: 252,
      image: proImage,
      slug: 'watch',
      rating: 4,
      reviews: 5299,
    },
    {
      id: '6',
      name: 'Gaming Laptop',
      price: 850,
      basePrice: 950,
      image: proImage,
      slug: 'laptop',
      rating: 5,
      reviews: 1200,
    },
    {
      id: '7',
      name: 'Designer Handbag',
      price: 75,
      basePrice: 95,
      image: proImage,
      slug: 'bag',
      rating: 4,
      reviews: 340,
    },
    {
      id: '8',
      name: 'Espresso Maker',
      price: 120,
      basePrice: 145,
      image: proImage,
      slug: 'coffee',
      rating: 5,
      reviews: 890,
    },
    {
      id: '9',
      name: 'Mechanical Keyboard',
      price: 35,
      basePrice: 50,
      image: proImage,
      slug: 'keyboard',
      rating: 4,
      reviews: 2100,
    },
    {
      id: '10',
      name: 'Table Lamp',
      price: 15,
      basePrice: 25,
      image: proImage,
      slug: 'lamp',
      rating: 5,
      reviews: 450,
    },
  ].map((p) => ({
    ...p,
    quantity: 1,
  }))

  return (
    <div
      className={`grid gap-4 ${
        variant === 'deal'
          ? 'grid-cols-2 md:grid-cols-5'
          : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
      }`}
    >
      {products.slice(0, limit).map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-2xl p-3 border border-gray-100 group transition-all"
        >
          {/* Image Container - Matching reference layout */}
          <div className="aspect-square bg-[#F8F9FA] rounded-xl mb-3 relative overflow-hidden flex items-center justify-center p-4">
            <Image
              src={product.image}
              alt={product.name}
              className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
            />

            {/* Corner Icon Indicator (Orange badge from image) */}
            <div className="absolute top-2 right-2 bg-[#FF8A00] w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white text-[8px] font-bold">⚡</span>
            </div>
          </div>

          {/* Product Info */}
          <h4 className="font-medium text-sm text-gray-800 truncate mb-1">
            {product.name}
          </h4>

          {/* Ratings (Stars from image) */}
          <div className="flex items-center gap-0.5 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={`${i < product.rating ? 'fill-[#FFC107] text-[#FFC107]' : 'text-gray-300'}`}
              />
            ))}
          </div>

          {/* Price & Metadata Row (Matches image font sizing) */}
          <div className="flex items-baseline gap-2">
            <span className="text-[#FF8A00] font-bold text-sm">
              ${product.price}
            </span>
            <span className="text-[11px] text-gray-400">{product.reviews}</span>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={() => addToCart(product as CartItem)}
            className="w-full mt-3 py-2 bg-blue-50 text-[#0052CC] text-xs font-bold rounded-lg hover:bg-[#0052CC] hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart size={14} />
            <span className="hidden xs:inline">Add to Cart</span>{' '}
            {/* Hides text on tiny screens */}
          </button>
        </div>
      ))}
    </div>
  )
}
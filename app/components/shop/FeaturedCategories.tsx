// /app/components/shop/FeaturedCategories.tsx

import Image from 'next/image'
import electronicImage from '@/public/Images/electronic.jpg'
import womenImage from '@/public/Images/women.avif'
import menImage from '@/public/Images/men.avif'
import homeImage from '@/public/Images/homekitchen.webp'
import beautyImage from '@/public/Images/bandh.avif'

const categories = [
  { name: 'Electronics', color: 'bg-[#0052CC]', image: electronicImage },
  { name: "Women's Fashion", color: 'bg-[#FF8A00]', image: womenImage },
  { name: "Men's Fashion", color: 'bg-[#0052CC]', image: menImage },
  { name: 'Home & Kitchen', color: 'bg-[#FF8A00]', image: homeImage },
  { name: 'Beauty & Health', color: 'bg-[#0052CC]', image: beautyImage },
]

export default function FeaturedCategories() {
  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">
        Featured Categories
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 lg:gap-6">
        {categories.map((cat, i) => (
          <div
            key={i}
            className={`relative aspect-[3/4] rounded-[2rem] ${cat.color} overflow-hidden group cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300`}
          >
            {/* 1. The Circular Image Container */}
            <div className="absolute inset-0 flex flex-col items-center pt-8">
              <div className="w-24 h-24 md:w-48 md:h-48 rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-white/20 shadow-inner">
                {/* Image Component with fallback pulse */}
                <div className="relative w-full h-full bg-gray-100 flex items-center justify-center">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. The Text Label (Inside the card bottom) */}
            <div className="absolute bottom-0 w-full p-4 lg:p-6 text-center">
              <h3 className="text-white font-bold text-sm md:text-base leading-tight drop-shadow-sm">
                {cat.name}
              </h3>
            </div>

            {/* Subtle Overlay for better text readability */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>
        ))}
      </div>
    </section>
  )
}
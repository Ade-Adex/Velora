// /app/components/shop/FeaturedCategories.tsx
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react' // Added for the "See All" icon

interface CategoryData {
  _id: string
  name: string
  slug: string
  image: string
}

export default function FeaturedCategories({
  categories,
}: {
  categories: CategoryData[]
}) {
  const colors = ['bg-[#0052CC]', 'bg-[#FF8A00]']

  // Decide if we show the "See All" card
  const displayCategories = categories.slice(0, 6)
  // console.log('Featured Categories:', categories) 
  const hasMore = categories.length > 6

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-xs md:text-xl font-bold text-gray-800">
          Featured Categories
        </h2>
        {hasMore && (
          <Link
            href="/categories"
            className="text-[#0052CC] font-bold text-xs md:text-sm hover:underline flex items-center gap-1"
          >
            View All <span className='hidden md:inline'>Categories</span> <ArrowRight size={16} />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 lg:gap-6">
        {displayCategories.map((cat, i) => {
          const bgColor = colors[i % colors.length]

          // If it's the 5th item and there are more than 5 total, show the "View More" card
          if (i === 5 && hasMore) {
            return (
              <Link
                key="view-all-card"
                href="/categories"
                className="relative aspect-3/4 rounded-4xl bg-gray-900 overflow-hidden group cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 block"
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ArrowRight className="text-white" size={32} />
                  </div>
                  <h3 className="text-white font-bold text-lg leading-tight">
                    +{categories.length - 5} More <br /> Categories
                  </h3>
                  <p className="text-gray-400 text-xs mt-2 font-medium uppercase tracking-wider">
                    Browse All
                  </p>
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={cat._id}
              href={`/category/${cat.slug}`}
              className={`relative aspect-3/4 rounded-4xl ${bgColor} overflow-hidden group cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 block`}
            >
              <div className="absolute inset-0 flex flex-col items-center pt-6">
                <div className="w-24 h-24 md:w-40 md:h-40 rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-white/20 shadow-inner">
                  <div className="relative w-full h-full bg-gray-100 flex items-center justify-center">
                    <Image
                      src={cat.image || '/Images/placeholder.png'}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 768px) 100px, 200px"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 w-full p-4 lg:p-6 text-center">
                <h3 className="text-white font-bold text-xs md:text-sm leading-tight drop-shadow-sm">
                  {cat.name}
                </h3>
              </div>

              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />
            </Link>
          )
        })}
      </div>
    </section>
  )
}

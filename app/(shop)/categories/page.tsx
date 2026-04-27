// /app/(shop)/categories/page.tsx

import Image from 'next/image'
import Link from 'next/link'
import { getAllCategories } from '@/app/services/product-service'
import { LayoutGrid, ShoppingBag } from 'lucide-react'
import { ICategory, Serialized } from '@/app/types'

// Extending the type locally to include the new count from aggregation
type CategoryWithCount = Serialized<ICategory> & { totalProducts: number };

export default async function CategoriesPage() {
  const categories: CategoryWithCount[] = await getAllCategories()

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-50 text-[#0052CC] rounded-2xl shadow-sm">
              <LayoutGrid size={28} />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Our Collections
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto text-lg leading-relaxed">
            Discover premium quality across all our specialized departments.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <section className="container mx-auto px-4 -mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/category/${cat.slug}`}
              className="group bg-white rounded-[2rem] p-6 shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-50 flex flex-col items-center"
            >
              {/* Refined Image Container - Smaller & Focused */}
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-gray-50 mb-6 border-4 border-gray-50 group-hover:border-blue-50 transition-colors duration-500 shadow-inner">
                <Image
                  src={cat.image || '/Images/placeholder.png'}
                  alt={cat.name}
                  fill
                  sizes="160px"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>

              {/* Product Count Badge */}
              <div className="mb-3 px-3 py-1 bg-gray-100 group-hover:bg-blue-600 rounded-full transition-colors duration-300">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-white flex items-center gap-1.5">
                  <ShoppingBag size={10} />
                  {cat.totalProducts} {cat.totalProducts === 1 ? 'Item' : 'Items'}
                </span>
              </div>

              {/* Text Info */}
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#0052CC] transition-colors leading-tight">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-sm text-gray-400 line-clamp-2 px-2 leading-relaxed">
                    {cat.description}
                  </p>
                )}
              </div>

              {/* Subtle Arrow Action */}
              <div className="mt-6 pt-4 border-t border-gray-50 w-full flex justify-center">
                <span className="text-xs font-bold text-gray-300 group-hover:text-blue-600 transition-all transform group-hover:translate-x-1">
                  VIEW COLLECTION →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
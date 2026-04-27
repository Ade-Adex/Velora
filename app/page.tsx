// /app/page.tsx

// /app/page.tsx
import Hero from '@/app/components/shop/Hero'
import FeaturedCategories from '@/app/components/shop/FeaturedCategories'
import ProductGrid from '@/app/components/shop/ProductGrid'
import PromotionalBanner from '@/app/components/shop/PromotionalBanner'
import QuickNav from '@/app/components/shop/QuickNav'
import {
  getProducts,
  getFeaturedCategories,
} from '@/app/services/product-service'
import ProductHydrator from '@/app/components/shop/ProductHydrator'

export default async function Home() {
  const allProducts = await getProducts(15)
  const featuredCategories = await getFeaturedCategories()

  // Serialize for client components
  const serializedProducts = JSON.parse(JSON.stringify(allProducts))
  const serializedCategories = JSON.parse(JSON.stringify(featuredCategories))

  return (
    <main className="flex flex-col w-full min-h-screen bg-[#F4F7FA]">
      <ProductHydrator products={serializedProducts} />

      <Hero />

      <div className="container mx-auto px-4 relative z-20">
        <QuickNav />
      </div>

      <FeaturedCategories categories={serializedCategories} />

      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Today&apos;s Deals
          </h2>
          <button className="text-blue-600 font-semibold hover:underline">
            See All
          </button>
        </div>
        {/* Pass the products prop here! */}
        <ProductGrid products={serializedProducts.slice(0, 5)} variant="deal" />
      </section>

      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Top Categories
        </h2>
        {/* Pass the products prop here! */}
        <ProductGrid
          products={serializedProducts.slice(0, 10)}
          variant="standard"
        />
      </section>

      <PromotionalBanner />
    </main>
  )
}

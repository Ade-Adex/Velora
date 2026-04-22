// /app/page.tsx

import Hero from '@/app/components/shop/Hero'
import FeaturedCategories from '@/app/components/shop/FeaturedCategories'
import ProductGrid from '@/app/components/shop/ProductGrid'
import PromotionalBanner from '@/app/components/shop/PromotionalBanner'
import TrustSignals from '@/app/components/shop/TrustSignals'
import QuickNav from '@/app/components/shop/QuickNav'

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-[#F4F7FA]">
      {/* 1. Dynamic Blue Hero with White/Orange accents */}
      <Hero />

      <div className="container mx-auto px-4 -mt-8 relative z-20">
        {/* 2. Quick Info Bar (Flash Sales, New Arrivals, Best Sellers) */}
        <QuickNav />
      </div>

      {/* 3. Rounded Bubble Categories */}
      <FeaturedCategories />

      {/* 4. Today's Deals Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Today&apos;s Deals
          </h2>
          <button className="text-blue-600 font-semibold hover:underline">
            See All
          </button>
        </div>
        <ProductGrid limit={5} variant="deal" />
      </section>

      {/* 5. Top Categories / Recommended Section */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Top Categories
        </h2>
        <ProductGrid limit={10} variant="standard" />
      </section>

      <PromotionalBanner />
    </main>
  )
}
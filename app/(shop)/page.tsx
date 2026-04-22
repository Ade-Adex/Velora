import Hero from '@/app/components/shop/Hero'
import FeaturedCategories from '@/app/components/shop/FeaturedCategories'
import ProductGrid from '@/app/components/shop/ProductGrid'
import PromotionalBanner from '@/app/components/shop/PromotionalBanner'
import TrustSignals from '@/app/components/shop/TrustSignals'

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <Hero />
      <TrustSignals />
      <FeaturedCategories />
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">New Arrivals</h2>
            <p className="text-muted-foreground">
              The latest pieces from our 2026 collection.
            </p>
          </div>
          <button className="text-sm font-medium underline underline-offset-4">
            View All
          </button>
        </div>
        <ProductGrid limit={8} />
      </section>
      <PromotionalBanner />
    </main>
  )
}

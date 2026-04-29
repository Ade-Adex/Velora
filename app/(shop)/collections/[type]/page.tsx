import { getProductsByCollection } from '@/app/services/product-service'
import ProductGrid from '@/app/components/shop/ProductGrid'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutGrid,
  LucideIcon,
  Flame,
  Clock,
  Star,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'

interface Props {
  params: Promise<{ type: string }>
}

interface CollectionMeta {
  title: string
  subTitle: string
  desc: string
  icon: LucideIcon
  color: string
  gradient: string
}

export default async function CollectionPage({ params }: Props) {
  const { type } = await params

  const meta: Record<string, CollectionMeta> = {
    'flash-sales': {
      title: 'Flash Sales',
      subTitle: 'Limited Time',
      desc: 'Grab these premium deals before the timer runs out. High quality, lower prices.',
      icon: Flame,
      color: 'text-orange-500',
      gradient: 'from-orange-50 to-transparent',
    },
    'new-arrivals': {
      title: 'New Arrivals',
      subTitle: 'Just In',
      desc: 'Explore the latest additions to our shop. Fresh styles and new technology arrived this week.',
      icon: Clock,
      color: 'text-blue-500',
      gradient: 'from-blue-50 to-transparent',
    },
    'best-sellers': {
      title: 'Best Sellers',
      subTitle: 'Community Favorites',
      desc: 'The most popular items as voted by our customers. Proven quality and timeless style.',
      icon: Star,
      color: 'text-yellow-500',
      gradient: 'from-yellow-50 to-transparent',
    },
  }

  const currentMeta = meta[type]
  if (!currentMeta) notFound()

  const products = await getProductsByCollection(type)

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* 1. Hero Header Section */}
      <div
        className={`relative overflow-hidden bg-white border-b border-gray-100 bg-linear-to-b ${currentMeta.gradient}`}
      >
        <div className="container mx-auto p-4 relative z-10">
          {/* Breadcrumbs & Back Link */}
          <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-800 transition-colors">
              Home
            </Link>
            <ChevronRight size={14} />
            <span className="text-gray-400 font-normal">Collections</span>
            <ChevronRight size={14} />
            <span className={`${currentMeta.color}`}>{currentMeta.title}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 rounded-lg bg-white shadow-xs ${currentMeta.color}`}
                >
                  <currentMeta.icon size={24} strokeWidth={2.5} />
                </div>
                <span
                  className={`text-xs font-bold uppercase tracking-widest ${currentMeta.color}`}
                >
                  {currentMeta.subTitle}
                </span>
              </div>

              <h1 className="text-xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
                {currentMeta.title}
              </h1>
              <p className="text-gray-600 text-xs md:text-sm max-w-xl leading-relaxed">
                {currentMeta.desc}
              </p>
            </div>

            <div className="hidden md:block">
              <div className="bg-white/50 backdrop-blur-md border border-white p-4 rounded-2xl shadow-xs">
                <p className="text-xs md:text-sm font-bold text-gray-800">
                  {products.length} Products Found
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Abstract Background Element for "Pop" */}
        <div
          className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20 ${currentMeta.color.replace('text', 'bg')}`}
        />
      </div>

      {/* 2. Content Section */}
      <section className="container mx-auto px-4 py-12">
        {products.length > 0 ? (
          <div className="space-y-8">
            {/* Grid Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <h2 className="font-bold text-gray-500 text-sm uppercase tracking-wider flex items-center gap-2">
                <LayoutGrid size={18} /> Showing Collection
              </h2>
            </div>

            <ProductGrid products={products} variant="standard" />
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[3rem] border border-gray-100 shadow-xs">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <LayoutGrid className="text-gray-200" size={48} strokeWidth={1} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Collection is Empty
            </h3>
            <p className="text-gray-500 max-w-xs mx-auto mb-8">
              We&apos;re currently restocking this collection. Check back soon
              for amazing items!
            </p>
            <Link
              href="/"
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-800 transition-all active:scale-95"
            >
              <ArrowLeft size={18} /> Return to Shop
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}

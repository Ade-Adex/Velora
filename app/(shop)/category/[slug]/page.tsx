// /app/(shop)/category/[slug]/page.tsx


import { getProductsByCategory } from '@/app/services/product-service'
import ProductGrid from '@/app/components/shop/ProductGrid'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const { category } = await getProductsByCategory(slug)

  if (!category) {
    return {
      title: 'Category Not Found',
    }
  }

  return {
    title: `${category.name} | Velora`,
    description:
      category.description ||
      `Browse our latest collection of ${category.name}`,
    openGraph: {
      title: category.name,
      description: category.description,
      images: [category.image || '/Images/og-default.png'],
    },
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const resolvedParams = await params
  const slug = resolvedParams.slug

  const { products, category } = await getProductsByCategory(slug)

  // console.log('CATEGORY PAGE DATA:', { slug, category, products })

  if (!category) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-[#F4F7FA] pb-20">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 capitalize">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-gray-600 max-w-2xl text-lg">
              {category.description}
            </p>
          )}
          <div className="mt-6 text-sm text-gray-500">
            Showing {products.length} products
          </div>
        </div>
      </div>

      <section className="container mx-auto px-4 py-12">
        {products.length > 0 ? (
          <ProductGrid products={products} variant="standard" />
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800">
              No products found
            </h3>
            <p className="text-gray-500 mt-2">
              We couldn&apos;t find any products in this category yet.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}

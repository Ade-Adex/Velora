// /app/components/shop/PromotionalBanner.tsx

import Link from 'next/link'

export default function PromotionalBanner() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="relative overflow-hidden rounded-3xl bg-[#171717] text-white py-20 px-8 md:px-16">
        {/* Abstract Background Design Element */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            Join the Vantage Club <br /> & Get 15% Off
          </h2>
          <p className="text-gray-400 mt-6 text-lg">
            Be the first to know about new collection drops, exclusive events,
            and the latest in digital-first fashion.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-white/10 border border-white/20 rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow text-white"
            />
            <button className="bg-white text-black font-bold px-8 py-4 rounded-full hover:bg-gray-200 transition-colors">
              Subscribe Now
            </button>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            By subscribing, you agree to our Terms of Service and Privacy
            Policy.
          </p>
        </div>
      </div>
    </section>
  )
}
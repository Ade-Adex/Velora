// /app/components/shop/Hero.tsx

import Link from 'next/link'
import { MoveRight } from 'lucide-react'
import Image from 'next/image'
import HeroImage from '@/public/Images/hero2.png'

export default function Hero() {
  return (
    <section className="bg-[#F4F7FA] pt-6 pb-12 relative">
      <div className="container mx-auto px-4 relative">
        {/* Main Hero Container - Flex layout for precise width control */}
        <div className="relative overflow-hidden rounded-[2rem] bg-[#0052CC] flex flex-col lg:flex-row items-stretch h-auto lg:h-[500px]">
          {/* Orange Accent Background - Occupies the remaining 33% */}
          <div className="hidden lg:block absolute inset-y-0 right-0 w-[33%] bg-[#FF8A00] rounded-r-[2rem]" />

          {/* Left Text Content - Expanded to 67% */}
          <div className="z-10 p-12 lg:p-20 flex flex-col justify-center space-y-7 lg:w-[67%]">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-white tracking-tighter">
              BIG SALE EVENT!
            </h1>
            <p className="text-lg text-white font-medium max-w-[500px] leading-relaxed">
              Up to 50% OFF | Shop top brands in
              <br />
              Fashion & Electronics.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2.5 px-9 py-4 bg-white text-[#171717] rounded-full font-bold hover:bg-white/90 transition-all shadow-lg active:scale-95"
              >
                Shop Now <MoveRight size={18} strokeWidth={2.5} />
              </Link>
            </div>

            {/* Carousel Dot Indicators */}
            <div className="flex gap-2.5 pt-8">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full ${i === 2 ? 'bg-white' : 'bg-white/40'}`}
                />
              ))}
            </div>
          </div>

          {/* Right Media Panel - Occupies the orange 33% section */}
          <div className="z-10 relative flex-1 flex items-end justify-center min-h-[350px] lg:min-h-full">
            <div className="relative w-full h-full flex justify-center items-end px-6 lg:px-12">
              <Image
                src={HeroImage}
                alt="Model shopping event"
                fill
                style={{
                  objectFit: 'contain',
                  objectPosition: 'bottom center',
                }}
                priority
                className="transition-opacity duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
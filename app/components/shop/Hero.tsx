'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Carousel } from '@mantine/carousel'
import Autoplay from 'embla-carousel-autoplay'
import { MoveRight } from 'lucide-react'
import { rem, Badge } from '@mantine/core'

// IMPORTANT: This handles the horizontal layout and sliding logic
import '@mantine/carousel/styles.css'

import HeroImg1 from '@/public/Images/hero2.png'
import HeroImg2 from '@/public/Images/hero2.jpg'
import HeroImg3 from '@/public/Images/hero1.webp'
import HeroImg4 from '@/public/Images/hero3.png'
import HeroImg5 from '@/public/Images/hero4.jpg'
import HeroImg6 from '@/public/Images/product1.webp'

const SLIDE_DATA = [
  {
    label: 'Limited Time',
    title: 'BIG SALE EVENT!',
    desc: 'Up to 50% OFF | Shop top brands in Fashion & Electronics.',
    image: HeroImg1,
    bgColor: '#0052CC',
    accentColor: '#FF8A00',
    link: '/products',
  },
  {
    label: 'New Season',
    title: 'SUMMER FASHION',
    desc: 'Stay cool with our new seasonal collection. Fresh styles inside.',
    image: HeroImg2,
    bgColor: '#7048E8',
    accentColor: '#FF8A00',
    link: '/products?category=fashion',
  },
  {
    label: 'Next Gen',
    title: 'SMART TECH HUB',
    desc: 'Revolutionize your workspace with high-performance gadgets.',
    image: HeroImg3,
    bgColor: '#1A1B1E',
    accentColor: '#0052CC',
    link: '/products?category=electronics',
  },
  {
    label: 'Style Guide',
    title: 'MODERN ACCESSORIES',
    desc: 'The final touch to every outfit. Shop premium watches and bags.',
    image: HeroImg4,
    bgColor: '#C92A2A',
    accentColor: '#171717',
    link: '/products?category=accessories',
  },
  {
    label: 'Comfort First',
    title: 'HOME ESSENTIALS',
    desc: 'Turn your house into a home with our curated interior decor.',
    image: HeroImg5,
    bgColor: '#099268',
    accentColor: '#FF8A00',
    link: '/products?category=home',
  },
  {
    label: 'Flash Deal',
    title: 'WEEKEND SPECIALS',
    desc: "Exclusive 24-hour offers. Grab your favorites before they're gone.",
    image: HeroImg6,
    bgColor: '#E67700',
    accentColor: '#0052CC',
    link: '/products?category=deals',
  },
]

export default function Hero() {
  const autoplay = useMemo(
    () => Autoplay({ delay: 5000, stopOnInteraction: false }),
    [],
  )

  return (
    <section className="bg-[#F4F7FA] pt-6 pb-12">
      <div className="container mx-auto px-4">
        <Carousel
          withIndicators
          withControls={false}
          plugins={[autoplay]}
          // loop
          // dragFree={false}
          // speed={10}
          styles={{
            root: { borderRadius: '2rem', overflow: 'hidden' },
            indicators: {
              bottom: rem(40),
              left: '10%',
              justifyContent: 'flex-start',
              gap: rem(8),
            },
            indicator: {
              width: rem(8),
              height: rem(8),
              transition: 'width 250ms ease, background-color 250ms ease',
              '&[data-active]': { width: rem(32), backgroundColor: '#fff' },
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
            },
          }}
        >
          {SLIDE_DATA.map((slide, index) => (
            <Carousel.Slide key={index}>
              <div
                className="relative flex flex-col lg:flex-row items-stretch min-h-112.5 lg:h-112.5"
                style={{ backgroundColor: slide.bgColor }}
              >
                <div
                  className="hidden lg:block absolute inset-y-0 right-0 w-[35%] rounded-r-4xl"
                  style={{ backgroundColor: slide.accentColor }}
                />

                <div className="z-10 p-10 lg:p-15 flex flex-col justify-center space-y-6 lg:w-[65%]">
                  <Badge
                    variant="white"
                    color="dark"
                    size="lg"
                    radius="sm"
                    className="w-fit"
                  >
                    {slide.label}
                  </Badge>

                  <h1 className="text-5xl lg:text-6xl font-black leading-[1.1] text-white tracking-tight">
                    {slide.title}
                  </h1>

                  <p className="text-lg lg:text-xl text-white/90 font-medium max-w-125">
                    {slide.desc}
                  </p>

                  <div className="pt-4">
                    <Link
                      href={slide.link}
                      className="inline-flex items-center gap-3 px-10 py-3 bg-white text-[#171717] rounded-full font-bold hover:scale-105 transition-all shadow-xl"
                    >
                      Shop Now <MoveRight size={20} />
                    </Link>
                  </div>
                </div>

                <div className="z-10 relative flex-1 flex items-end justify-center">
                  <div className="relative w-full h-75 lg:h-full flex justify-center items-end px-6 lg:px-12">
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      style={{
                        objectFit: 'cover',
                        objectPosition: 'bottom center',
                      }}
                      priority={index === 0}
                    />
                  </div>
                </div>
              </div>
            </Carousel.Slide>
          ))}
        </Carousel>
      </div>
    </section>
  )
}

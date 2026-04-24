'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Carousel } from '@mantine/carousel'
import Autoplay from 'embla-carousel-autoplay'
import { MoveRight } from 'lucide-react'
import { rem, Badge } from '@mantine/core'

import '@mantine/carousel/styles.css'
import { SLIDE_DATA } from '@/app/data/hero'

export default function Hero() {
  const autoplay = useMemo(
    () => Autoplay({ delay: 5000, stopOnInteraction: false }),
    [],
  )

  return (
    <section className="w-full  py-4 lg:py-8 overflow-hidden">
      <Carousel
        withIndicators
        withControls={false}
        plugins={[autoplay]}
        // loop
        styles={{
          root: { width: '100%', overflow: 'hidden', isolation: 'isolate' },
          indicators: {
            bottom: rem(20),
            left: '20%',
            transform: 'translateX(-50%)',
            [` @media (minWidth: 1024px)`]: {
              bottom: rem(40),
              left: '8%',
              transform: 'none',
              justifyContent: 'flex-start',
            },
            gap: rem(8),
          },
          indicator: {
            width: rem(8),
            height: rem(8),
            transition: 'width 250ms ease, background-color 250ms ease',
            '&[data-active]': { width: rem(24), backgroundColor: '#fff' },
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
          },
        }}
      >
        {SLIDE_DATA.map((slide, index) => (
          <Carousel.Slide key={index}>
            <div
              className="relative flex flex-col lg:flex-row w-full  min-h-100 lg:h-10 overflow-hidden"
              style={{ backgroundColor: slide.bgColor }}
            >
              {/* Desktop Accent Shape */}
              <div
                className="hidden lg:block absolute inset-0 lg:inset-y-0 lg:right-0 lg:left-auto lg:w-[45%] opacity-100 transition-all duration-700"
                style={{
                  backgroundColor: slide.accentColor,
                  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 20% 100%)',
                }}
              />

              {/* Mobile Background: Simple solid color or very subtle top glow */}
              <div
                className="lg:hidden absolute inset-0 opacity-30"
                style={{
                  background: `linear-gradient(to bottom, ${slide.accentColor}, transparent)`,
                }}
              />

              {/* Content Container: Compact for Mobile */}
              <div className="relative z-30 flex flex-col justify-center px-6 pt-10 pb-4 lg:p-16 lg:w-[55%] text-center lg:text-left items-center lg:items-start">
                <Badge
                  variant="white"
                  size="sm" // Smaller badge for mobile
                  radius="md"
                  className="mb-2 shadow-sm"
                  style={{ color: slide.bgColor }}
                >
                  {slide.label}
                </Badge>

                <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black leading-tight text-white tracking-tight mb-2">
                  {slide.title}
                </h1>

                <p className="text-sm lg:text-xl text-white/90 font-mediummax-w-70 sm:max-w-md lg:max-w-xl mb-6">
                  {slide.desc}
                </p>

                <Link
                  href={slide.link}
                  className="group inline-flex items-center gap-2 px-7 py-2.5 bg-white text-[#171717] rounded-full text-sm font-bold hover:bg-[#F4F7FA] transition-all shadow-xl active:scale-95"
                >
                  Shop Now
                  <MoveRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </div>

              {/* Image Container: Cleanly integrated without taking much vertical space */}
              <div className="relative z-20 flex-1 flex items-end justify-center lg:justify-end overflow-hidden">
                <div className="relative w-[70%] sm:w-[50%] lg:w-[85%] h-45 sm:h-55 lg:h-[90%] mb-8 lg:mb-0">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    style={{
                      objectFit: 'contain',
                      objectPosition: 'bottom center',
                    }}
                    className="drop-shadow-[0_15px_30px_rgba(0,0,0,0.3)] lg:drop-shadow-[0_35px_60px_rgba(0,0,0,0.4)]"
                    priority={index === 0}
                  />
                </div>
              </div>
            </div>
          </Carousel.Slide>
        ))}
      </Carousel>
    </section>
  )
}
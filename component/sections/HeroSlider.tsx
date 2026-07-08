"use client";

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export interface HeroSlideItem {
  id: string;
  title: string | null;
  subtitle: string | null;
  image: string;
  buttonText: string | null;
  buttonLink: string | null;
}

interface HeroSliderProps {
  slides?: HeroSlideItem[];
}

export default function HeroSlider({ slides: propSlides }: HeroSliderProps) {
  const slides = propSlides ?? [];
  const [current, setCurrent] = useState(0);

  if (slides.length === 0) {
    return null;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goTo = (index: number) => setCurrent(index);
  const next = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  const activeSlide = slides[current];

  return (
    <section id="hero" className="bg-white py-4 md:py-6">
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative overflow-hidden rounded-[28px] bg-[#f6e8f0] shadow-[0_24px_80px_rgba(109,39,84,0.16)] ring-1 ring-[#e6cad8]">
          <div className="relative aspect-[16/8] min-h-[240px] md:min-h-[420px] lg:min-h-[520px]">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  index === current ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
              >
                <Image
                  src={slide.image}
                  alt={slide.title || 'شريحة'}
                  fill
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="object-cover"
                  priority={index === current}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#20111b]/20 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#120b11]/20 via-transparent to-transparent" />
              </div>
            ))}

            {(activeSlide.title || activeSlide.subtitle || activeSlide.buttonText) && (
              <div className="absolute bottom-4 right-4 left-4 md:bottom-8 md:right-8 md:left-auto md:max-w-[440px]">
                <div className="rounded-[24px] border border-white/35 bg-white/18 p-4 text-right text-white shadow-[0_18px_48px_rgba(20,12,19,0.24)] backdrop-blur-md md:p-6">
                  {activeSlide.subtitle && (
                    <span className="mb-2 block text-xs font-medium tracking-[0.22em] text-white/85 md:text-sm">
                      {activeSlide.subtitle}
                    </span>
                  )}
                  {activeSlide.title && (
                    <h2 className="text-2xl font-extrabold leading-tight md:text-4xl lg:text-5xl">
                      {activeSlide.title}
                    </h2>
                  )}
                  {activeSlide.buttonText && (
                    <div className="mt-4 md:mt-6">
                      {activeSlide.buttonLink ? (
                        <Link
                          href={activeSlide.buttonLink}
                          className="inline-flex items-center rounded-full bg-[#7f305d] px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-[#69264d] hover:shadow-lg md:px-7"
                        >
                          {activeSlide.buttonText}
                        </Link>
                      ) : (
                        <button className="inline-flex items-center rounded-full bg-[#7f305d] px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-[#69264d] hover:shadow-lg md:px-7">
                          {activeSlide.buttonText}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={prev}
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/60 bg-white/80 p-2.5 text-[#69264d] shadow-lg backdrop-blur-sm transition-all hover:bg-white md:left-5 md:p-3"
              aria-label="الشريحة السابقة"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/60 bg-white/80 p-2.5 text-[#69264d] shadow-lg backdrop-blur-sm transition-all hover:bg-white md:right-5 md:p-3"
              aria-label="الشريحة التالية"
            >
              <ChevronRight size={22} />
            </button>

            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 rounded-full bg-black/15 px-3 py-2 backdrop-blur-sm md:bottom-6">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goTo(index)}
                  aria-label={`الانتقال إلى الشريحة ${index + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    index === current
                      ? 'w-8 bg-white'
                      : 'w-2.5 bg-white/55 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

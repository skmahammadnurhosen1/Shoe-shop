import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { HERO_SLIDES } from '../data/shoes';
import { HeroSlide } from '../types';

interface HeroSectionProps {
  onShopNewArrivals: () => void;
  onExploreAllShoes: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onShopNewArrivals,
  onExploreAllShoes,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slides, setSlides] = useState<
    Array<{
      image: string;
      shoeName: string;
      titleHighlight: string;
      alt: string;
      headline?: string;
      subtitle?: string;
      badge?: string;
      ctaText?: string;
    }>
  >(HERO_SLIDES);

  useEffect(() => {
    const fetchDynamicSlides = async () => {
      try {
        const res = await fetch('/api/homepage');
        const data = await res.json();
        if (data.success && data.heroSlides && Array.isArray(data.heroSlides) && data.heroSlides.length > 0) {
          const mapped = data.heroSlides.map((s: HeroSlide) => ({
            image: s.imageUrl,
            shoeName: s.badge || 'SOLEFORM EDITION',
            titleHighlight: s.headline ? s.headline.split(' ').slice(-1)[0] : 'FOOTWEAR',
            alt: s.headline || 'Hero shoe',
            headline: s.headline,
            subtitle: s.subtitle,
            badge: s.badge,
            ctaText: s.ctaText,
          }));
          setSlides(mapped);
        }
      } catch {
        // Fall back to HERO_SLIDES
      }
    };
    fetchDynamicSlides();
  }, []);

  const slide = slides[currentSlideIndex] || slides[0] || HERO_SLIDES[0];

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* MOBILE HERO VIEW (sm:hidden)                                              */}
      {/* Matches user reference image:                                             */}
      {/* 1. Full sneaker visible with calibrated framing                           */}
      {/* 2. Pure white headline & supporting copy with optimal high readability   */}
      {/* 3. Ergonomic touch CTAs & carousel controls in natural thumb zone        */}
      {/* ========================================================================= */}
      <section className="sm:hidden relative w-full overflow-hidden bg-[#171715] min-h-[calc(100vh-4.5rem)] min-h-[calc(100svh-4.5rem)] flex flex-col justify-between">
        {/* Full Sneaker Showcase Framing: Dedicated height and focal calibration so the entire shoe is visible */}
        <div className="relative w-full h-[50svh] min-h-[290px] max-h-[380px] overflow-hidden bg-[#F5F1E8]">
          <img
            src={slide.image}
            alt={slide.alt}
            className="w-full h-full object-cover object-[92%_30%] transition-all duration-700 select-none"
          />
          {/* Smooth gradient transition into the deep dark lower content area */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#171715] via-[#171715]/70 to-transparent pointer-events-none" />
        </div>

        {/* Mobile Content Layer: Pure white text with high readability */}
        <div className="relative z-10 px-5 pb-7 pt-1 flex flex-col justify-end flex-1">
          <div className="max-w-[340px]">
            {/* Pure White Main Headline with glowing highlight */}
            <h1 className="font-display font-bold text-4xl xs:text-[2.65rem] tracking-tight uppercase leading-[0.92] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
              FIND YOUR<br />
              EVERYDAY <span className="text-[#E2E8B8]">{slide.titleHighlight}</span>
            </h1>

            {/* Pure White Supporting Copy with high readability */}
            <p className="mt-3.5 text-xs xs:text-sm text-white max-w-[290px] leading-relaxed font-normal drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
              Thoughtfully selected footwear for wherever the day takes you.
            </p>

            {/* High-Contrast Action Buttons */}
            <div className="mt-5 flex flex-wrap items-center gap-3.5">
              <button
                onClick={onShopNewArrivals}
                className="bg-white hover:bg-[#F5F1E8] text-[#171715] font-bold text-xs uppercase tracking-wider px-5.5 py-3.5 rounded-full inline-flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
              >
                <span>SHOP NEW ARRIVALS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onExploreAllShoes}
                className="text-white hover:text-[#E2E8B8] font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer underline-offset-4 hover:underline py-1.5"
              >
                <span>EXPLORE ALL SHOES</span>
              </button>
            </div>
          </div>

          {/* Mobile Footer Strip with Shoe Tag & Carousel Controls */}
          <div className="mt-6 flex items-center justify-between pt-1 border-t border-white/10">
            <span className="text-[11px] font-medium tracking-wider uppercase text-white/80">
              {slide.shoeName}
            </span>

            {/* Carousel Controls */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 shadow-xs">
              <button
                onClick={handlePrev}
                aria-label="Previous showcase shoe"
                className="w-5 h-5 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1.5 px-0.5">
                {HERO_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      currentSlideIndex === idx
                        ? 'w-3.5 bg-white'
                        : 'w-1.5 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                aria-label="Next showcase shoe"
                className="w-5 h-5 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* DESKTOP HERO VIEW (hidden sm:flex)                                        */}
      {/* EXACT 100% ORIGINAL DESKTOP IMPLEMENTATION - COMPLETELY UNTOUCHED         */}
      {/* ========================================================================= */}
      <section
        className="hidden sm:flex relative w-full overflow-hidden bg-cover bg-no-repeat transition-all duration-700 sm:min-h-[560px] lg:min-h-[640px] sm:items-center bg-[#F5F1E8] sm:bg-[position:right_center]"
        style={{
          backgroundImage: `url(${slide.image})`,
          backgroundSize: 'cover',
        }}
      >
        {/* Desktop-only subtle cream gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F5F1E8] via-[#F5F1E8]/40 via-45% to-transparent pointer-events-none" />

        {/* Desktop Main Content Layer */}
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 w-full sm:pt-20 lg:py-24 sm:pb-20 lg:pb-24 relative z-10 flex flex-col sm:justify-center">
          <div className="max-w-xl lg:max-w-2xl">
            {/* Main Headline */}
            <h1 className="font-display font-bold sm:text-7xl lg:text-[5.5rem] tracking-tight uppercase leading-[0.92] text-[#171715]">
              FIND YOUR<br />
              EVERYDAY <span className="text-[#626849]">{slide.titleHighlight}</span>
            </h1>

            {/* Supporting Copy */}
            <p className="mt-6 text-base lg:text-lg text-[#5E5A50] max-w-lg leading-relaxed font-normal">
              Thoughtfully selected footwear for wherever the day takes you.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-7">
              <button
                onClick={onShopNewArrivals}
                className="bg-[#171715] hover:bg-black text-[#F5F1E8] font-bold text-xs uppercase tracking-wider px-7 py-4 rounded-full inline-flex items-center gap-2 transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
              >
                <span>SHOP NEW ARRIVALS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onExploreAllShoes}
                className="text-[#171715] hover:text-[#626849] font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer underline-offset-4 hover:underline py-1.5"
              >
                <span>EXPLORE ALL SHOES</span>
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Navigation Controls layered over the bottom-right hero area */}
        <div className="absolute bottom-8 right-8 lg:bottom-10 lg:right-12 z-20 flex items-center gap-2.5 bg-[#F5F1E8]/85 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-[#DDD6C8] shadow-xs">
          <button
            onClick={handlePrev}
            aria-label="Previous showcase shoe"
            className="w-6 h-6 rounded-full flex items-center justify-center text-[#5E5A50] hover:text-[#171715] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-0.5">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentSlideIndex === idx
                    ? 'w-4 bg-[#171715]'
                    : 'w-1.5 bg-[#BFB9AB] hover:bg-[#8F897B]'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            aria-label="Next showcase shoe"
            className="w-6 h-6 rounded-full flex items-center justify-center text-[#5E5A50] hover:text-[#171715] transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </>
  );
};

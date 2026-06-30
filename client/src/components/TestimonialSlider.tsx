/**
 * TestimonialSlider — a slow-fading auto-carousel showing 3-4 testimonials
 * with smooth opacity transitions. Automatically cycles through quotes.
 */

import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

interface Testimonial {
  quote: string;
  author: string;
  stars: number;
}

interface TestimonialSliderProps {
  testimonials: Testimonial[];
  autoPlayInterval?: number; // milliseconds between slides (default: 6000ms = 6s)
  transitionDuration?: number; // milliseconds for fade transition (default: 1000ms = 1s)
}

export default function TestimonialSlider({
  testimonials,
  autoPlayInterval = 6000,
  transitionDuration = 1000,
}: TestimonialSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Auto-advance every `autoPlayInterval` ms
  useEffect(() => {
    if (!isAutoPlay || testimonials.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isAutoPlay, autoPlayInterval, testimonials.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index % testimonials.length);
    setIsAutoPlay(false);
    // Resume autoplay after 10 seconds of user inactivity
    const resumeTimer = setTimeout(() => setIsAutoPlay(true), 10000);
    return () => clearTimeout(resumeTimer);
  };

  const goToPrevious = () => {
    goToSlide(currentIndex - 1);
  };

  const goToNext = () => {
    goToSlide(currentIndex + 1);
  };

  if (testimonials.length === 0) return null;

  const current = testimonials[currentIndex];

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
    >
      {/* Testimonial card with fade transition */}
      <div
        className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 flex flex-col min-h-[320px] transition-opacity duration-1000 ease-in-out"
        style={{
          opacity: 1,
          transitionDuration: `${transitionDuration}ms`,
        }}
      >
        {/* Star rating */}
        <div className="flex gap-1 mb-6">
          {Array.from({ length: current.stars }).map((_, j) => (
            <Star key={j} size={18} fill="#E8A838" className="text-[#E8A838]" />
          ))}
        </div>

        {/* Quote */}
        <p className="text-[#281A39] text-lg md:text-xl leading-relaxed mb-8 italic flex-1">
          "{current.quote}"
        </p>

        {/* Author */}
        <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white bg-[#281A39] shrink-0">
            {current.author.charAt(0)}
          </div>
          <p className="text-gray-600 text-sm font-semibold">— {current.author}</p>
        </div>
      </div>

      {/* Navigation arrows (only show if more than 1 testimonial) */}
      {testimonials.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 md:left-0 top-1/2 -translate-y-1/2 md:-translate-x-16 lg:-translate-x-20 p-2 rounded-full bg-white/80 md:bg-transparent shadow-md md:shadow-none hover:bg-gray-100 transition-colors text-gray-600 hover:text-[#281A39] z-10"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 md:right-0 top-1/2 -translate-y-1/2 md:translate-x-16 lg:translate-x-20 p-2 rounded-full bg-white/80 md:bg-transparent shadow-md md:shadow-none hover:bg-gray-100 transition-colors text-gray-600 hover:text-[#281A39] z-10"
            aria-label="Next testimonial"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {testimonials.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "bg-[#E8A838] w-8"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to testimonial ${idx + 1}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  goToSlide(idx);
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Slide counter (optional) */}
      {testimonials.length > 1 && (
        <p className="text-center text-xs text-gray-400 mt-4">
          {currentIndex + 1} / {testimonials.length}
        </p>
      )}
    </div>
  );
}

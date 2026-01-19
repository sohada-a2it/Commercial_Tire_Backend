"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const ProductSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Slider data - images and text content
  const slides = [
    {
      image: "/1.webp",
    },
    {
      image: "/2.webp",
    },
    {
      image: "/3.webp",
    },
    {
      image: "/4.webp",
    },
    {
      image: "/5.webp",
    },
  ];

  // Auto-slide effect
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-t-md"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image Container */}
      <div className="relative w-full">
        {/* Only render current slide for better performance */}
        <div className="relative w-full">
          {/* Full Background Image with fade animation */}
          <Image
            key={currentSlide}
            src={slides[currentSlide].image}
            alt={`Slide ${currentSlide + 1}`}
            width={1200}
            height={600}
            priority={currentSlide === 0}
            quality={85}
            className="w-full h-auto object-contain max-h-[600px] animate-fadeIn"
          />
        </div>
      </div>

      {/* Bottom Section - Navigation Dots */}
      <div className="absolute bottom-4 left-0 right-0 z-10">
        <div className="flex justify-center space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-1 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Auto-Play Indicator - CSS animation */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden">
        <div
          key={currentSlide}
          className="h-full bg-teal-400 animate-progressBar"
        />
      </div>
    </div>
  );
};

export default ProductSlider;

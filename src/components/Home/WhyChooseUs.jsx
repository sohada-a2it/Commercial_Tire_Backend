"use client";

import Image from "next/image";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

const locations = [
  { top: "35%", left: "20%" }, // USA
  { top: "40%", left: "50%" }, // Europe
  { top: "55%", left: "70%" }, // Asia
  { top: "65%", left: "55%" }, // Africa
  { top: "75%", left: "80%" }, // Australia
];

// Animated Counter Component
function AnimatedCounter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const counterRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const duration = 2000;
          const increment = target / (duration / 16);
          
          const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
          
          return () => clearInterval(timer);
        }
      },
      { threshold: 0.3 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [target, hasAnimated]);

  return (
    <span ref={counterRef} className="text-3xl font-bold text-gray-500">
      {count}{suffix}
    </span>
  );
}

export default function GlobalPresence() {
  return (
    <section className="relative w-full py-20 bg-gray-100 text-white overflow-hidden">
      
      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 text-center z-10 relative">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-amber-600">
          Available in <span className="text-gary-600">100+ Countries</span>
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-12">
          Our global network ensures fast, reliable, and seamless service across continents.
        </p>

        {/* Map Container */}
        <div className="relative w-full h-[400px] md:h-[500px]">
          
          {/* World Map Image */}
          <Image
            src="/world-map.png"
            alt="World Map"
            fill
            className="object-contain opacity-80"
          />

          {/* Animated Dots */}
          {locations.map((loc, index) => (
            <span
              key={index}
              className={clsx(
                "absolute w-4 h-4 bg-gray-500 rounded-full animate-ping"
              )}
              style={{
                top: loc.top,
                left: loc.left,
              }}
            />
          ))}

          {/* Static dots (center glow) */}
          {locations.map((loc, index) => (
            <span
              key={`dot-${index}`}
              className="absolute w-3 h-3 bg-blue-400 rounded-full shadow-lg"
              style={{
                top: loc.top,
                left: loc.left,
              }}
            />
          ))}
        </div>

        {/* Stats with Animated Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          <div>
            <h3 className="text-3xl font-bold text-gray-500">
              <AnimatedCounter target={100} suffix="+" />
            </h3>
            <p className="text-gray-400 text-sm">Countries</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-500">
              <AnimatedCounter target={50} suffix="K+" />
            </h3>
            <p className="text-gray-400 text-sm">Clients</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-500">
              <AnimatedCounter target={24} suffix="/7" />
            </h3>
            <p className="text-gray-400 text-sm">Support</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-500">
              <AnimatedCounter target={99} suffix="%" />
            </h3>
            <p className="text-gray-400 text-sm">Delivery Success</p>
          </div>
        </div>
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_70%)] pointer-events-none" />
    </section>
  );
}
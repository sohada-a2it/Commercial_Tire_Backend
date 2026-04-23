// components/WhyChooseUsSimple.jsx
"use client";

import React, { useState, useEffect, useRef } from "react";

const WhyChooseUsSimple = () => {
  const [counts, setCounts] = useState({
    years: 0,
    clients: 0,
    countries: 0,
    satisfaction: 0
  });
  
  const counterRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  const features = [
    { id: 1, icon: "🏆", title: "Premium Quality", desc: "German engineering for maximum durability" },
    { id: 2, icon: "⚡", title: "Smart Efficiency", desc: "Optimized fuel consumption & performance" },
    { id: 3, icon: "🌍", title: "Global Trust", desc: "Trusted in 50+ countries worldwide" },
    { id: 4, icon: "🔒", title: "Certified Safe", desc: "ISO, DOT & ECE certified" }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const targets = { years: 25, clients: 1200, countries: 50, satisfaction: 99 };
          let start = 0;
          const duration = 2000;
          const step = 20;
          const steps = duration / step;
          
          const interval = setInterval(() => {
            start++;
            const progress = start / steps;
            setCounts({
              years: Math.min(Math.floor(targets.years * progress), targets.years),
              clients: Math.min(Math.floor(targets.clients * progress), targets.clients),
              countries: Math.min(Math.floor(targets.countries * progress), targets.countries),
              satisfaction: Math.min(Math.floor(targets.satisfaction * progress), targets.satisfaction)
            });
            if (start >= steps) clearInterval(interval);
          }, step);
        }
      },
      { threshold: 0.3 }
    );
    
    if (counterRef.current) observer.observe(counterRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <section className="relative w-full py-20 overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/vehicle-banner.webp')` }}
      />
      <div className="absolute inset-0 bg-black/70" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 max-w-6xl">
        
        {/* Header - Compact */}
        <div className="text-center mb-12">
          <span className="text-amber-500 text-sm font-semibold tracking-wider uppercase">Why Choose Us</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
            Premium <span className="text-amber-500">Quality</span>
          </h2>
          <div className="w-16 h-0.5 bg-amber-500 mx-auto mt-4" />
        </div>

        {/* Features - 4 Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-16">
          {features.map((item, i) => (
            <div
              key={item.id}
              className="group bg-white/5 backdrop-blur-sm rounded-xl p-5 text-center hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 border border-white/10"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">{item.title}</h3>
              <p className="text-gray-400 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats - Compact Counter */}
        <div 
          ref={counterRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/10 text-center"
        >
          <div>
            <div className="text-3xl md:text-4xl font-bold text-amber-500">{counts.years}+</div>
            <div className="text-gray-400 text-xs mt-1 tracking-wide">Years</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-amber-500">{counts.clients}+</div>
            <div className="text-gray-400 text-xs mt-1 tracking-wide">Clients</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-amber-500">{counts.countries}+</div>
            <div className="text-gray-400 text-xs mt-1 tracking-wide">Countries</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-amber-500">{counts.satisfaction}%</div>
            <div className="text-gray-400 text-xs mt-1 tracking-wide">Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSimple;
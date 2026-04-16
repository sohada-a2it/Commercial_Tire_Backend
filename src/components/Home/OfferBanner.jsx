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
    {
      id: 1,
      icon: "🛡️",
      title: "Durable Performance",
      description: "Engineered to withstand the toughest conditions with exceptional longevity."
    },
    {
      id: 2,
      icon: "⚡",
      title: "Fuel Efficiency",
      description: "Advanced technology that reduces fuel consumption while maximizing performance."
    },
    {
      id: 3,
      icon: "🌍",
      title: "Global Presence",
      description: "Trusted by customers worldwide with distribution across 50+ countries."
    },
    {
      id: 4,
      icon: "✅",
      title: "Certified Quality",
      description: "ISO certified products meeting international standards for safety."
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          
          // Counter animation
          const duration = 2000;
          const step = 20;
          const steps = duration / step;
          
          const targets = { years: 15, clients: 500, countries: 50, satisfaction: 100 };
          let currentStep = 0;
          
          const interval = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;
            
            setCounts({
              years: Math.min(Math.floor(targets.years * progress), targets.years),
              clients: Math.min(Math.floor(targets.clients * progress), targets.clients),
              countries: Math.min(Math.floor(targets.countries * progress), targets.countries),
              satisfaction: Math.min(Math.floor(targets.satisfaction * progress), targets.satisfaction)
            });
            
            if (currentStep >= steps) clearInterval(interval);
          }, step);
        }
      },
      { threshold: 0.3 }
    );
    
    if (counterRef.current) observer.observe(counterRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <section 
      className="relative py-20 bg-fixed bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/vehicle-banner.webp')`
      }}
    >
      <div className="relative z-10 container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Why Choose <span className="text-amber-500">Us</span>
          </h2>
          <div className="w-20 h-1 bg-amber-500 mx-auto rounded-full"></div>
          <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
            We combine innovation, quality, and reliability to deliver the best solutions
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="group bg-white/10 backdrop-blur-md rounded-xl p-6 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1 border border-white/20"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-300 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Counter */}
        <div ref={counterRef} className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center pt-8 border-t border-white/20">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-amber-500">{counts.years}+</div>
            <div className="text-gray-300 text-sm mt-2">Years of Excellence</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-amber-500">{counts.clients}+</div>
            <div className="text-gray-300 text-sm mt-2">Happy Clients</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-amber-500">{counts.countries}+</div>
            <div className="text-gray-300 text-sm mt-2">Countries Served</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-amber-500">{counts.satisfaction}%</div>
            <div className="text-gray-300 text-sm mt-2">Quality Guarantee</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSimple;
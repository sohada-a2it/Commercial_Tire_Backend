"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import clsx from 'clsx';

// Animated Counter Component
function AnimatedCounter({ target, suffix = "", prefix = "" }) {
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
    <span ref={counterRef} className="text-4xl md:text-5xl font-black text-amber-600">
      {prefix}{count}{suffix}
    </span>
  );
}

export default function AboutUs() {
  const [selectedImage, setSelectedImage] = useState(0);

  const factoryImages = [
    { src: "/factory-1.jpg", alt: "Factory Exterior", label: "Main Production Facility" },
    { src: "/factory-2.jpg", alt: "Production Line", label: "Automated Assembly Line" },
    { src: "/factory-3.jpg", alt: "Quality Control", label: "Quality Testing Lab" },
    { src: "/factory-4.jpg", alt: "Warehouse", label: "Finished Goods Storage" },
  ];

  const certifications = [
    { name: "ISO 9001:2024", icon: "fas fa-certificate", desc: "Quality Management" },
    { name: "DOT Certified", icon: "fas fa-shield-alt", desc: "US Department of Transportation" },
    { name: "ECE R54", icon: "fas fa-euro-sign", desc: "European Economic Community" },
    { name: "GCC Standard", icon: "fas fa-flag", desc: "Gulf Cooperation Council" },
    { name: "SONCAP", icon: "fas fa-check-double", desc: "Nigeria Standards" },
    { name: "ISO 14001", icon: "fas fa-leaf", desc: "Environmental Management" },
  ];

  return (
    <section className="relative w-full py-24 bg-white overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.06),transparent_50%)] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-600/5 rounded-full blur-[100px]" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full mb-4">
            <i className="fas fa-building text-amber-600 text-sm" />
            <span className="text-amber-600 text-sm font-semibold tracking-wide">ABOUT COMPANY</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900">
            Industry <span className="text-amber-600">Authority</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Decades of excellence in tire manufacturing, serving commercial vehicles worldwide
          </p>
        </div>

        {/* Company Overview & Production Capacity - 2 Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          
          {/* Left: Company Overview */}
          <div className="space-y-6">
            <div className="inline-block">
              <div className="w-12 h-1 bg-amber-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900">Company Overview</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Founded in <span className="text-amber-600 font-semibold">1985</span>, HeavyDuty Tires has grown to become 
              a global leader in commercial vehicle tire manufacturing. With over <span className="text-amber-600 font-semibold">3 million tires</span> 
              produced annually, we serve customers across 100+ countries.
            </p>
            <p className="text-gray-500 leading-relaxed">
              Our state-of-the-art manufacturing facility spans <span className="text-gray-900 font-semibold">500,000 sq. meters</span> and employs 
              over <span className="text-gray-900 font-semibold">2,500 skilled professionals</span>. We combine German engineering, 
              Japanese precision, and American durability to deliver tires that perform under extreme conditions.
            </p>
            
            {/* Key Highlights */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <i className="fas fa-calendar-alt text-amber-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">38+ Years</div>
                  <div className="text-gray-400 text-xs">of Excellence</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <i className="fas fa-globe text-amber-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">100+</div>
                  <div className="text-gray-400 text-xs">Countries Served</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <i className="fas fa-trophy text-amber-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">50+</div>
                  <div className="text-gray-400 text-xs">Industry Awards</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <i className="fas fa-users text-amber-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">2,500+</div>
                  <div className="text-gray-400 text-xs">Employees</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Production Capacity Stats */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="inline-block mb-6">
              <div className="w-12 h-1 bg-amber-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900">Production Capacity</h3>
            </div>
            
            <div className="space-y-8">
              {/* Annual Production */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Annual Production</span>
                  <span className="text-amber-600 font-bold">
                    <AnimatedCounter target={3} suffix="M+" />
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-amber-500 rounded-full" />
                </div>
                <p className="text-gray-400 text-xs mt-1">Tires per year</p>
              </div>

              {/* Daily Output */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Daily Output</span>
                  <span className="text-amber-600 font-bold">
                    <AnimatedCounter target={8500} suffix="+" />
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="w-[85%] h-full bg-amber-500 rounded-full" />
                </div>
                <p className="text-gray-400 text-xs mt-1">Tires per day</p>
              </div>

              {/* Global Distribution */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Global Distribution</span>
                  <span className="text-amber-600 font-bold">
                    <AnimatedCounter target={100} suffix="+" />
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="w-[95%] h-full bg-amber-500 rounded-full" />
                </div>
                <p className="text-gray-400 text-xs mt-1">Countries served</p>
              </div>

              {/* Export Ratio */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Export Ratio</span>
                  <span className="text-amber-600 font-bold">
                    <AnimatedCounter target={85} suffix="%" />
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="w-[85%] h-full bg-amber-500 rounded-full" />
                </div>
                <p className="text-gray-400 text-xs mt-1">of production exported</p>
              </div>
            </div>
          </div>
        </div>

        {/* Factory Images Gallery */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <div className="inline-block">
              <div className="w-12 h-1 bg-amber-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900">Manufacturing Excellence</h3>
              <p className="text-gray-500 mt-2">State-of-the-art production facility</p>
            </div>
          </div>

          {/* Main Featured Image */}
          <div className="relative w-full h-[400px] rounded-2xl overflow-hidden mb-4 group shadow-lg">
            <Image
              src={factoryImages[selectedImage].src}
              alt={factoryImages[selectedImage].alt}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-white font-semibold text-xl">{factoryImages[selectedImage].label}</p>
            </div>
          </div>

          {/* Thumbnail Grid */}
          <div className="grid grid-cols-4 gap-3">
            {factoryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={clsx(
                  "relative h-24 rounded-lg overflow-hidden transition-all duration-300",
                  selectedImage === idx 
                    ? "ring-2 ring-amber-600 scale-95 shadow-md" 
                    : "opacity-70 hover:opacity-100"
                )}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Certifications Section */}
        <div>
          <div className="text-center mb-10">
            <div className="inline-block">
              <div className="w-12 h-1 bg-amber-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900">Global Certifications</h3>
              <p className="text-gray-500 mt-2">Recognized worldwide for quality & safety</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {certifications.map((cert, idx) => (
              <div
                key={idx}
                className="group relative bg-white border border-gray-200 rounded-xl p-5 text-center hover:border-amber-600 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <i className={`${cert.icon} text-3xl text-amber-600 mb-3 block`} />
                <div className="font-bold text-gray-900 text-sm mb-1">{cert.name}</div>
                <div className="text-gray-400 text-xs">{cert.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badge / CTA */}
        {/* <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-amber-50 rounded-full border border-amber-200">
            <i className="fas fa-shield-alt text-amber-600" />
            <span className="text-gray-700">Trusted by leading fleet operators worldwide</span>
            <i className="fas fa-arrow-right text-amber-600 text-sm" />
          </div>
        </div> */}
      </div>
    </section>
  );
}
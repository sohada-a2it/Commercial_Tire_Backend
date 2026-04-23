"use client";

import Image from "next/image";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { 
  Globe, 
  Users, 
  Headphones, 
  CheckCircle, 
  MapPin, 
  Sparkles,
  Zap,
  Award,
  TrendingUp,
  Compass
} from "lucide-react";

const locations = [
  { top: "35%", left: "20%", name: "USA", flag: "🇺🇸", cities: "12 Cities" }, // USA
  { top: "40%", left: "50%", name: "Europe", flag: "🇪🇺", cities: "24 Cities" }, // Europe
  { top: "55%", left: "70%", name: "Asia", flag: "🌏", cities: "18 Cities" }, // Asia
  { top: "65%", left: "55%", name: "Africa", flag: "🌍", cities: "8 Cities" }, // Africa
  { top: "75%", left: "80%", name: "Australia", flag: "🇦🇺", cities: "6 Cities" }, // Australia
];

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
    <span ref={counterRef} className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
      {prefix}{count}{suffix}
    </span>
  );
}

// Animated Dot Component with Tooltip
const AnimatedDot = ({ location, index, isHovered, setIsHovered }) => {
  return (
    <div
      className="absolute group"
      style={{ top: location.top, left: location.left }}
      onMouseEnter={() => setIsHovered(index)}
      onMouseLeave={() => setIsHovered(null)}
    >
      {/* Pulsing Ring */}
      <div className="absolute inset-0 rounded-full animate-ping-slow">
        <div className="w-16 h-16 bg-amber-400 rounded-full opacity-20 blur-xl"></div>
      </div>
      
      {/* Outer Ring */}
      <div className="absolute -inset-2 rounded-full bg-amber-400/20 animate-pulse"></div>
      
      {/* Main Dot */}
      <div className="relative w-4 h-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full shadow-lg shadow-amber-500/50 cursor-pointer transition-all duration-300 group-hover:scale-150">
        <div className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-75"></div>
      </div>
      
      {/* Tooltip on Hover */}
      <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 transition-all duration-300 pointer-events-none z-20 ${
        isHovered === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}>
        <div className="bg-white/95 backdrop-blur-md rounded-xl px-4 py-2 shadow-xl border border-amber-200 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="text-xl">{location.flag}</span>
            <div>
              <p className="font-bold text-gray-800 text-sm">{location.name}</p>
              <p className="text-xs text-amber-600">{location.cities}</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-white/95 border-r border-b border-amber-200"></div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, value, label, suffix = "", prefix = "", color }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${color} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl`}></div>
      <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-amber-200 transform hover:-translate-y-1">
        <div className="flex flex-col items-center text-center">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <AnimatedCounter target={value} suffix={suffix} prefix={prefix} />
          <p className="text-gray-600 text-sm font-medium mt-2">{label}</p>
        </div>
      </div>
    </div>
  );
};

export default function GlobalPresence() {
  const [hoveredDot, setHoveredDot] = useState(null);
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
      
      {/* Premium Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute top-20 -left-20 w-96 h-96 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delayed"></div>
        
        {/* Dot Pattern */}
        <div className="absolute inset-0">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="premium-dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1.5" fill="#f59e0b" opacity="0.1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#premium-dots)" />
          </svg>
        </div>

        {/* Diagonal Lines */}
        <div className="absolute inset-0">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="premium-lines" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="60" stroke="#f59e0b" strokeWidth="0.5" opacity="0.05" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#premium-lines)" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 relative">
        {/* Premium Badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-amber-50 px-4 py-2 rounded-full mb-6 shadow-sm">
          <Compass className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Global Network</span>
        </div>

        {/* Headline */}
        <h2 className="text-4xl md:text-6xl font-bold mb-4">
          <span className="text-gray-900">Available in </span>
          <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
            100+ Countries
          </span>
        </h2>
        
        <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
          Our global network ensures fast, reliable, and seamless service across continents.
        </p>

        {/* Map Container */}
        <div className="relative w-full h-[450px] md:h-[550px] lg:h-[600px] mt-8">
          {/* Glow Behind Map */}
          <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 via-transparent to-transparent rounded-3xl"></div>
          
          {/* World Map Image */}
          <div className="relative w-full h-full">
            <Image
              src="/world-map.png"
              alt="World Map"
              fill
              className="object-contain opacity-90 drop-shadow-2xl"
              priority
            />
          </div>

          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            {locations.map((loc, idx) => (
              <g key={`line-${idx}`}>
                <line
                  x1={`calc(${loc.left} - 2%)`}
                  y1={`calc(${loc.top} - 2%)`}
                  x2={`calc(50% + ${Math.sin(idx) * 10}%)`}
                  y2={`calc(50% + ${Math.cos(idx) * 10}%)`}
                  stroke="url(#lineGradient)"
                  strokeWidth="1.5"
                  strokeDasharray="6,6"
                  className="animate-dash"
                />
              </g>
            ))}
          </svg>

          {/* Animated Dots */}
          {locations.map((location, index) => (
            <AnimatedDot
              key={index}
              location={location}
              index={index}
              isHovered={hoveredDot}
              setIsHovered={setHoveredDot}
            />
          ))}
        </div>

        {/* Stats with Premium Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          <StatCard 
            icon={Globe}
            value={100}
            suffix="+"
            label="Countries Worldwide"
            color="from-amber-400 to-amber-600"
          />
          <StatCard 
            icon={Users}
            value={50}
            suffix="K+"
            label="Happy Clients"
            color="from-orange-400 to-amber-500"
          />
          <StatCard 
            icon={Headphones}
            value={24}
            suffix="/7"
            label="Premium Support"
            color="from-amber-500 to-amber-600"
          />
          <StatCard 
            icon={CheckCircle}
            value={99}
            suffix="%"
            label="Delivery Success"
            color="from-amber-400 to-orange-500"
          />
        </div>

        {/* Trust Badges */}
        <div className="mt-12 pt-8 border-t border-gray-200/50">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-gray-600">Lightning Fast Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-gray-600">Certified Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-gray-600">Growing Network</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-gray-600">Premium Service</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Glow Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-500/5 to-transparent pointer-events-none" />
    </section>
  );
}

// Add these custom animations to your global CSS or tailwind.config.js
// You can add these classes to your globals.css file:

/* 
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes float-delayed {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(20px); }
}

@keyframes ping-slow {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}

@keyframes dash {
  to { stroke-dashoffset: -24; }
}

.animate-float {
  animation: float 8s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 10s ease-in-out infinite;
}

.animate-ping-slow {
  animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.animate-dash {
  animation: dash 20s linear infinite;
}
*/
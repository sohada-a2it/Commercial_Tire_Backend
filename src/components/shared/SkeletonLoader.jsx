"use client";

import React from "react";

// Base Skeleton component
export const Skeleton = ({ className = "", variant = "rectangular", animation = "pulse" }) => {
  const baseClasses = "bg-gray-200";
  
  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-shimmer",
    none: ""
  };

  const variantClasses = {
    rectangular: "rounded",
    circular: "rounded-full",
    text: "rounded h-4",
  };

  return (
    <div
      className={`${baseClasses} ${animationClasses[animation]} ${variantClasses[variant]} ${className}`}
    />
  );
};

// Banner Skeleton
export const BannerSkeleton = () => {
  return (
    <div className="relative w-full min-h-[450px] sm:max-h-[600px] md:max-h-[650px] lg:max-h-[650px] overflow-hidden bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 flex items-center justify-center h-full px-4 py-20">
          <div className="max-w-4xl p-8 w-full space-y-6">
            {/* Title skeleton */}
            <div className="text-center space-y-3">
              <Skeleton className="h-10 w-3/4 mx-auto" />
              <Skeleton className="h-1 w-24 mx-auto" />
            </div>
            
            {/* Text box skeleton */}
            <div className="p-6 bg-white/80 rounded-xl space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Buttons skeleton */}
            <div className="flex flex-row justify-center gap-4">
              <Skeleton className="h-12 w-48" />
              <Skeleton className="h-12 w-48" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Product Slider Skeleton
export const ProductSliderSkeleton = () => {
  return (
    <div className="relative w-full overflow-hidden rounded-t-md bg-gray-100">
      <Skeleton className="w-full h-[400px] md:h-[500px] lg:h-[600px]" animation="wave" />
      
      {/* Dots skeleton */}
      <div className="absolute bottom-4 left-0 right-0 z-10">
        <div className="flex justify-center space-x-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" className="w-3 h-1" />
          ))}
        </div>
      </div>
    </div>
  );
};

// Product Card Skeleton
export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden p-4 space-y-4">
      <Skeleton className="w-full h-48" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
};

// Product List Skeleton
export const ProductListSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

// Category Card Skeleton
export const CategoryCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Skeleton className="w-full h-32" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4 mx-auto" />
        <Skeleton className="h-3 w-1/2 mx-auto" />
      </div>
    </div>
  );
};

// Text Skeleton (for paragraphs)
export const TextSkeleton = ({ lines = 3 }) => {
  return (
    <div className="space-y-2">
      {[...Array(lines)].map((_, i) => (
        <Skeleton 
          key={i} 
          variant="text" 
          className={i === lines - 1 ? "w-3/4" : "w-full"} 
        />
      ))}
    </div>
  );
};

// Image Skeleton
export const ImageSkeleton = ({ className = "" }) => {
  return <Skeleton className={`w-full h-full ${className}`} animation="wave" />;
};

// Table Skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {[...Array(columns)].map((_, i) => (
          <Skeleton key={i} className="h-8" />
        ))}
      </div>
      
      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {[...Array(columns)].map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-6" />
          ))}
        </div>
      ))}
    </div>
  );
};

// Page Skeleton (full page loader)
export const PageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-6">
      <Skeleton className="h-12 w-64" />
      <TextSkeleton lines={5} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    </div>
  );
};

// Form Skeleton
export const FormSkeleton = () => {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-12 w-32" />
    </div>
  );
};

export default Skeleton;

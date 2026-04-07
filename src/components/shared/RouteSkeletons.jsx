"use client";

import React from "react";
import { ProductSliderSkeleton, ProductListSkeleton, Skeleton } from "@/components/shared/SkeletonLoader";

export const CatalogPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <ProductSliderSkeleton />
        <div className="max-w-3xl mx-auto my-8">
          <Skeleton className="h-12 rounded-full" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-4 space-y-3">
              <Skeleton className="w-full aspect-square rounded-lg" />
              <Skeleton className="h-5 w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SubcategoryPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-full" />
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Skeleton className="h-9 w-64" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
        <ProductListSkeleton count={8} />
      </div>
    </div>
  );
};

export const ProductDetailsPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Skeleton className="h-[420px] w-full rounded-xl" />
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-44 w-full rounded-xl" />
            <div className="flex gap-3">
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-12 w-40" />
            </div>
          </div>
        </div>
        <ProductListSkeleton count={4} />
      </div>
    </div>
  );
};

export const SearchPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <Skeleton className="h-12 w-full rounded-full" />
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-5 w-72" />
          <ProductListSkeleton count={8} />
        </div>
      </div>
    </div>
  );
};

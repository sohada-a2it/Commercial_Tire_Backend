// Migration utilities for converting React Router to Next.js
// This file provides compatibility wrappers to ease the transition

"use client";

import { useRouter as useNextRouter, usePathname, useSearchParams as useNextSearchParams, useParams as useNextParams } from 'next/navigation';
import NextLink from 'next/link';
import { Suspense } from 'react';

// Wrapper for useNavigate
export function useNavigate() {
  const router = useNextRouter();
  
  return (to, options = {}) => {
    if (typeof to === 'number') {
      // Handle back/forward navigation
      if (to === -1) {
        router.back();
      } else if (to === 1) {
        router.forward();
      }
    } else {
      // Handle route navigation
      if (options.replace) {
        router.replace(to);
      } else {
        router.push(to);
      }
    }
  };
}

// Safe wrapper for useSearchParams
export function useSearchParams() {
  try {
    return useNextSearchParams();
  } catch (error) {
    // Return empty URLSearchParams for static generation
    if (typeof window === 'undefined') {
      return new URLSearchParams();
    }
    throw error;
  }
}

// Wrapper for useParams (for dynamic route segments)
export function useParams() {
  try {
    return useNextParams();
  } catch (error) {
    // Return empty params for static generation
    if (typeof window === 'undefined') {
      return {};
    }
    throw error;
  }
}

// Wrapper for useLocation
export function useLocation() {
  const pathname = usePathname();
  let searchParams;
  
  try {
    searchParams = useNextSearchParams();
  } catch (error) {
    // Return empty search params for static generation
    if (typeof window === 'undefined') {
      searchParams = new URLSearchParams();
    } else {
      throw error;
    }
  }
  
  return {
    pathname,
    search: searchParams.toString() ? `?${searchParams.toString()}` : '',
    state: {},
    hash: typeof window !== 'undefined' ? window.location.hash : '',
  };
}

// Wrapper for Link component
export function Link({ to, children, ...props }) {
  return (
    <NextLink href={to} {...props}>
      {children}
    </NextLink>
  );
}

// Export useRouter for other needs
export { useNextRouter as useRouter, usePathname };
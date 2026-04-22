// contexts/FilterContext.jsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const FilterContext = createContext();

export function FilterProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Filter states
  const [selectedTireType, setSelectedTireType] = useState('');
  const [selectedVehicleType, setSelectedVehicleType] = useState('');
  const [selectedApplication, setSelectedApplication] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedPattern, setSelectedPattern] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [hasFilters, setHasFilters] = useState(false);
  
  // Check if any filter is active
  useEffect(() => {
    const hasActiveFilters = !!(selectedTireType || selectedVehicleType || selectedApplication || 
      selectedBrand || selectedSize || selectedPattern || searchQuery);
    setHasFilters(hasActiveFilters);
  }, [selectedTireType, selectedVehicleType, selectedApplication, selectedBrand, selectedSize, selectedPattern, searchQuery]);
  
  // Apply filters and navigate to products page
  const applyFilters = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedTireType) params.set('tireType', selectedTireType);
    if (selectedVehicleType) params.set('vehicleType', selectedVehicleType);
    if (selectedApplication) params.set('application', selectedApplication);
    if (selectedBrand) params.set('brand', selectedBrand);
    if (selectedSize) params.set('tireSize', selectedSize);
    if (selectedPattern) params.set('pattern', selectedPattern);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    
    const queryString = params.toString();
    const url = queryString ? `/products?${queryString}` : '/products';
    router.push(url);
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    setSelectedTireType('');
    setSelectedVehicleType('');
    setSelectedApplication('');
    setSelectedBrand('');
    setSelectedSize('');
    setSelectedPattern('');
    setSearchQuery('');
    setSortBy('newest');
    
    // If on products page, refresh with no filters
    if (pathname === '/products') {
      router.push('/products');
    }
  };
  
  // Update a single filter
  const updateFilter = (key, value) => {
    switch(key) {
      case 'tireType': setSelectedTireType(value); break;
      case 'vehicleType': setSelectedVehicleType(value); break;
      case 'application': setSelectedApplication(value); break;
      case 'brand': setSelectedBrand(value); break;
      case 'size': setSelectedSize(value); break;
      case 'pattern': setSelectedPattern(value); break;
      case 'search': setSearchQuery(value); break;
      case 'sort': setSortBy(value); break;
      default: break;
    }
  };
  
  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedTireType) count++;
    if (selectedVehicleType) count++;
    if (selectedApplication) count++;
    if (selectedBrand) count++;
    if (selectedSize) count++;
    if (selectedPattern) count++;
    if (searchQuery) count++;
    return count;
  };
  
  return (
    <FilterContext.Provider value={{
      // State
      selectedTireType,
      selectedVehicleType,
      selectedApplication,
      selectedBrand,
      selectedSize,
      selectedPattern,
      searchQuery,
      sortBy,
      hasFilters,
      // Functions
      applyFilters,
      clearAllFilters,
      updateFilter,
      getActiveFiltersCount
    }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within FilterProvider');
  }
  return context;
}
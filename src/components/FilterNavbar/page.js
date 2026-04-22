// components/FilterNavbar.jsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Truck, Filter, X, ChevronDown, SlidersHorizontal, 
  RotateCcw, MapPin, Star, Gauge, ShoppingBag, TrendingUp
} from 'lucide-react';
import { fetchProducts } from '@/services/catalogService';

export default function FilterNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Check if we're on tires page
  const isTiresPage = pathname?.includes('/tires') || pathname?.includes('/products');
  
  // Filter states from URL
  const [selectedTireType, setSelectedTireType] = useState(searchParams.get('tireType') || '');
  const [selectedVehicleType, setSelectedVehicleType] = useState(searchParams.get('vehicleType') || '');
  const [selectedApplication, setSelectedApplication] = useState(searchParams.get('application') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [selectedSize, setSelectedSize] = useState(searchParams.get('tireSize') || '');
  const [selectedPattern, setSelectedPattern] = useState(searchParams.get('pattern') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  
  // Available filters
  const [availableFilters, setAvailableFilters] = useState({
    brands: [],
    patterns: [],
    tireTypes: [],
    vehicleTypesLists: [],
    applicationsLists: [],
    tireSizes: []
  });
  
  const [loading, setLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Fetch available filters from API
  useEffect(() => {
    const fetchFilters = async () => {
      setLoading(true);
      try {
        const result = await fetchProducts({ limit: 100 });
        if (result.success && result.products) {
          const products = result.products;
          
          // Extract unique values from products
          const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
          const tireTypes = [...new Set(products.map(p => p.tireType).filter(Boolean))];
          const vehicleTypesLists = [...new Set(products.flatMap(p => p.vehicleTypesLists || []).filter(Boolean))];
          const applicationsLists = [...new Set(products.flatMap(p => p.applicationsList || []).filter(Boolean))];
          const tireSizes = [...new Set(products.map(p => p.tireSpecs?.size).filter(Boolean))];
          const patterns = [...new Set(products.map(p => p.pattern).filter(Boolean))];
          
          setAvailableFilters({
            brands: brands.sort(),
            tireTypes: tireTypes.sort(),
            vehicleTypesLists: vehicleTypesLists.sort(),
            applicationsLists: applicationsLists.sort(),
            tireSizes: tireSizes.sort(),
            patterns: patterns.sort()
          });
        } else if (result.filters) {
          setAvailableFilters(result.filters);
        }
      } catch (error) {
        console.error('Error fetching filters:', error);
        // Set default filters
        setAvailableFilters({
          brands: ['Bridgestone', 'Michelin', 'Goodyear', 'Continental'],
          tireTypes: ['Steer', 'Drive', 'Trailer', 'All-Position'],
          vehicleTypesLists: ['Truck', 'Bus', 'Trailer', 'Van'],
          applicationsLists: ['Long Haul', 'Regional', 'Urban', 'Construction'],
          tireSizes: ['11R22.5', '12R22.5', '295/75R22.5', '11R24.5'],
          patterns: ['Pattern A', 'Pattern B', 'Pattern C']
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchFilters();
  }, []);

  // Update URL when filters change
  const updateFilters = (updates) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    // Reset to page 1 when filters change
    params.delete('page');
    
    const queryString = params.toString();
    const url = queryString ? `/tires?${queryString}` : '/tires';
    router.push(url, { scroll: false });
    
    // Update local state
    if (updates.tireType !== undefined) setSelectedTireType(updates.tireType);
    if (updates.vehicleType !== undefined) setSelectedVehicleType(updates.vehicleType);
    if (updates.application !== undefined) setSelectedApplication(updates.application);
    if (updates.brand !== undefined) setSelectedBrand(updates.brand);
    if (updates.tireSize !== undefined) setSelectedSize(updates.tireSize);
    if (updates.pattern !== undefined) setSelectedPattern(updates.pattern);
    if (updates.search !== undefined) setSearchQuery(updates.search);
    if (updates.sort !== undefined) setSortBy(updates.sort);
  };

  const clearAllFilters = () => {
    updateFilters({
      tireType: '',
      vehicleType: '',
      application: '',
      brand: '',
      tireSize: '',
      pattern: '',
      search: '',
      sort: 'newest'
    });
  };

  const removeFilter = (filterType) => {
    switch(filterType) {
      case 'tireType': updateFilters({ tireType: '' }); break;
      case 'vehicleType': updateFilters({ vehicleType: '' }); break;
      case 'application': updateFilters({ application: '' }); break;
      case 'brand': updateFilters({ brand: '' }); break;
      case 'size': updateFilters({ tireSize: '' }); break;
      case 'pattern': updateFilters({ pattern: '' }); break;
      case 'search': updateFilters({ search: '' }); break;
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

  const activeCount = getActiveFiltersCount();

  // Always show full filter UI on all pages
  return (
    <>
      {/* Sticky Filter Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          {/* Search Bar - Always Visible */}
          <div className="mb-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => updateFilters({ search: e.target.value })}
                placeholder="Search by tire model, brand, or pattern..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filter Toggle Button for Mobile */}
          <div className="flex items-center justify-between lg:hidden">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeCount > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeCount}
                </span>
              )}
            </button>
            
            {activeCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 text-sm text-red-600"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear All
              </button>
            )}
          </div>

          {/* Desktop Filters - Always Visible */}
          <div className="hidden lg:block">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters</span>
                {activeCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {activeCount}
                  </span>
                )}
              </div>
              {activeCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear All
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {/* Tire Type Filter */}
              {availableFilters.tireTypes && availableFilters.tireTypes.length > 0 && (
                <FilterDropdown
                  label="Tire Type"
                  icon={<Truck className="w-4 h-4" />}
                  value={selectedTireType}
                  options={availableFilters.tireTypes}
                  onSelect={(value) => updateFilters({ tireType: value })}
                  isOpen={activeDropdown === 'tireType'}
                  onToggle={() => setActiveDropdown(activeDropdown === 'tireType' ? null : 'tireType')}
                />
              )}

              {/* Vehicle Type Filter */}
              {availableFilters.vehicleTypesLists && availableFilters.vehicleTypesLists.length > 0 && (
                <FilterDropdown
                  label="Vehicle Type"
                  icon={<ShoppingBag className="w-4 h-4" />}
                  value={selectedVehicleType}
                  options={availableFilters.vehicleTypesLists}
                  onSelect={(value) => updateFilters({ vehicleType: value })}
                  isOpen={activeDropdown === 'vehicleType'}
                  onToggle={() => setActiveDropdown(activeDropdown === 'vehicleType' ? null : 'vehicleType')}
                />
              )}

              {/* Application Filter */}
              {availableFilters.applicationsLists && availableFilters.applicationsLists.length > 0 && (
                <FilterDropdown
                  label="Application"
                  icon={<MapPin className="w-4 h-4" />}
                  value={selectedApplication}
                  options={availableFilters.applicationsLists}
                  onSelect={(value) => updateFilters({ application: value })}
                  isOpen={activeDropdown === 'application'}
                  onToggle={() => setActiveDropdown(activeDropdown === 'application' ? null : 'application')}
                />
              )}

              {/* Brand Filter */}
              {availableFilters.brands && availableFilters.brands.length > 0 && (
                <FilterDropdown
                  label="Brand"
                  icon={<Star className="w-4 h-4" />}
                  value={selectedBrand}
                  options={availableFilters.brands}
                  onSelect={(value) => updateFilters({ brand: value })}
                  isOpen={activeDropdown === 'brand'}
                  onToggle={() => setActiveDropdown(activeDropdown === 'brand' ? null : 'brand')}
                />
              )}

              {/* Size Filter */}
              {availableFilters.tireSizes && availableFilters.tireSizes.length > 0 && (
                <FilterDropdown
                  label="Size"
                  icon={<Gauge className="w-4 h-4" />}
                  value={selectedSize}
                  options={availableFilters.tireSizes}
                  onSelect={(value) => updateFilters({ tireSize: value })}
                  isOpen={activeDropdown === 'size'}
                  onToggle={() => setActiveDropdown(activeDropdown === 'size' ? null : 'size')}
                />
              )}

              {/* Pattern Filter */}
              {availableFilters.patterns && availableFilters.patterns.length > 0 && (
                <FilterDropdown
                  label="Pattern"
                  icon={<TrendingUp className="w-4 h-4" />}
                  value={selectedPattern}
                  options={availableFilters.patterns}
                  onSelect={(value) => updateFilters({ pattern: value })}
                  isOpen={activeDropdown === 'pattern'}
                  onToggle={() => setActiveDropdown(activeDropdown === 'pattern' ? null : 'pattern')}
                />
              )}

              {/* Sort Dropdown */}
              <SortDropdown 
                sortBy={sortBy}
                onSortChange={(value) => updateFilters({ sort: value })}
                isOpen={activeDropdown === 'sort'}
                onToggle={() => setActiveDropdown(activeDropdown === 'sort' ? null : 'sort')}
              />
            </div>

            {/* Active Filters Tags */}
            {activeCount > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                {selectedTireType && (
                  <FilterTag label="Tire Type" value={selectedTireType} onRemove={() => removeFilter('tireType')} />
                )}
                {selectedVehicleType && (
                  <FilterTag label="Vehicle" value={selectedVehicleType} onRemove={() => removeFilter('vehicleType')} />
                )}
                {selectedApplication && (
                  <FilterTag label="Application" value={selectedApplication} onRemove={() => removeFilter('application')} />
                )}
                {selectedBrand && (
                  <FilterTag label="Brand" value={selectedBrand} onRemove={() => removeFilter('brand')} />
                )}
                {selectedSize && (
                  <FilterTag label="Size" value={selectedSize} onRemove={() => removeFilter('size')} />
                )}
                {selectedPattern && (
                  <FilterTag label="Pattern" value={selectedPattern} onRemove={() => removeFilter('pattern')} />
                )}
                {searchQuery && (
                  <FilterTag label="Search" value={searchQuery} onRemove={() => removeFilter('search')} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsFilterOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b sticky top-0 bg-white flex justify-between items-center">
              <h3 className="font-semibold text-lg">Filters</h3>
              <div className="flex items-center gap-2">
                {activeCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-red-600 px-3 py-1 rounded-lg"
                  >
                    Clear All
                  </button>
                )}
                <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Tire Type */}
              {availableFilters.tireTypes && availableFilters.tireTypes.length > 0 && (
                <div>
                  <label className="font-medium text-gray-700 block mb-2">Tire Type</label>
                  <select
                    value={selectedTireType}
                    onChange={(e) => updateFilters({ tireType: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">All Types</option>
                    {availableFilters.tireTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Vehicle Type */}
              {availableFilters.vehicleTypesLists && availableFilters.vehicleTypesLists.length > 0 && (
                <div>
                  <label className="font-medium text-gray-700 block mb-2">Vehicle Type</label>
                  <select
                    value={selectedVehicleType}
                    onChange={(e) => updateFilters({ vehicleType: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">All Vehicles</option>
                    {availableFilters.vehicleTypesLists.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Application */}
              {availableFilters.applicationsLists && availableFilters.applicationsLists.length > 0 && (
                <div>
                  <label className="font-medium text-gray-700 block mb-2">Application</label>
                  <select
                    value={selectedApplication}
                    onChange={(e) => updateFilters({ application: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">All Applications</option>
                    {availableFilters.applicationsLists.map(app => (
                      <option key={app} value={app}>{app}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Brand */}
              {availableFilters.brands && availableFilters.brands.length > 0 && (
                <div>
                  <label className="font-medium text-gray-700 block mb-2">Brand</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => updateFilters({ brand: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">All Brands</option>
                    {availableFilters.brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Size */}
              {availableFilters.tireSizes && availableFilters.tireSizes.length > 0 && (
                <div>
                  <label className="font-medium text-gray-700 block mb-2">Tire Size</label>
                  <select
                    value={selectedSize}
                    onChange={(e) => updateFilters({ tireSize: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">All Sizes</option>
                    {availableFilters.tireSizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Pattern */}
              {availableFilters.patterns && availableFilters.patterns.length > 0 && (
                <div>
                  <label className="font-medium text-gray-700 block mb-2">Pattern</label>
                  <select
                    value={selectedPattern}
                    onChange={(e) => updateFilters({ pattern: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">All Patterns</option>
                    {availableFilters.patterns.map(pattern => (
                      <option key={pattern} value={pattern}>{pattern}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sort */}
              <div>
                <label className="font-medium text-gray-700 block mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="newest">Newest First</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="brand-asc">Brand A-Z</option>
                  <option value="brand-desc">Brand Z-A</option>
                </select>
              </div>
            </div>

            <div className="p-4 border-t">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Helper Components
function FilterDropdown({ label, icon, value, options, onSelect, isOpen, onToggle }) {
  const displayValue = value && value.length > 20 ? value.slice(0, 17) + '...' : value;
  
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap
          ${value 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
        `}
      >
        {icon}
        {label}
        {value && (
          <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
            {displayValue}
          </span>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={onToggle} />
          <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-64 overflow-y-auto">
            <div className="p-1">
              <button
                onClick={() => {
                  onSelect('');
                  onToggle();
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg"
              >
                All {label}s
              </button>
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    onSelect(option);
                    onToggle();
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg ${
                    value === option ? 'bg-blue-50 text-blue-600 font-medium' : ''
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SortDropdown({ sortBy, onSortChange, isOpen, onToggle }) {
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'name-asc', label: 'Name A-Z' },
    { value: 'name-desc', label: 'Name Z-A' },
    { value: 'brand-asc', label: 'Brand A-Z' },
    { value: 'brand-desc', label: 'Brand Z-A' },
  ];
  
  const getCurrentLabel = () => {
    const option = sortOptions.find(opt => opt.value === sortBy);
    return option ? option.label : 'Sort';
  };
  
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all flex items-center gap-1.5 whitespace-nowrap"
      >
        <TrendingUp className="w-4 h-4" />
        Sort: {getCurrentLabel()}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={onToggle} />
          <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-1">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    onToggle();
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg ${
                    sortBy === option.value ? 'bg-blue-50 text-blue-600 font-medium' : ''
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function FilterTag({ label, value, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full border border-blue-200">
      <span className="font-medium">{label}:</span>
      <span>{value}</span>
      <button onClick={onRemove} className="ml-0.5 hover:bg-blue-100 rounded-full p-0.5">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
// app/tires/TiresClient.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Search, Filter, X, ChevronDown, Truck, Gauge, 
  ShoppingBag, Shield, Heart, Star, TrendingUp,
  Battery, MapPin, Check, SlidersHorizontal, RotateCcw
} from 'lucide-react';
import { fetchProducts } from '@/services/catalogService';

export default function TiresClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [availableFilters, setAvailableFilters] = useState({
    brands: [],
    patterns: [],
    tireTypes: [],
    vehicleTypesLists: [],
    applicationsLists: [],
    tireSizes: []
  });
  
  // Selected filters state
  const [selectedTireType, setSelectedTireType] = useState(searchParams.get('tireType') || '');
  const [selectedVehicleType, setSelectedVehicleType] = useState(searchParams.get('vehicleType') || '');
  const [selectedApplication, setSelectedApplication] = useState(searchParams.get('application') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [selectedSize, setSelectedSize] = useState(searchParams.get('tireSize') || '');
  const [selectedPattern, setSelectedPattern] = useState(searchParams.get('pattern') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  
  // UI State
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [showAllSizes, setShowAllSizes] = useState(false);

  // Fetch products
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filters = {
        page: pagination.page,
        limit: pagination.limit,
        sort: sortBy,
        search: searchQuery || undefined,
        tireType: selectedTireType || undefined,
        vehicleType: selectedVehicleType || undefined,
        application: selectedApplication || undefined,
        brand: selectedBrand || undefined,
        tireSize: selectedSize || undefined,
        pattern: selectedPattern || undefined,
        isActive: true
      };
      
      // Remove undefined values
      Object.keys(filters).forEach(key => 
        filters[key] === undefined && delete filters[key]
      );
      
      const result = await fetchProducts(filters);
      
      if (result.success) {
        setProducts(result.products);
        setPagination(result.pagination);
        setAvailableFilters(result.filters);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sortBy, searchQuery, selectedTireType, selectedVehicleType, selectedApplication, selectedBrand, selectedSize, selectedPattern]);

  // Update URL when filters change
  // useEffect(() => {
  //   const params = new URLSearchParams();
  //   if (searchQuery) params.set('search', searchQuery);
  //   if (selectedTireType) params.set('tireType', selectedTireType);
  //   if (selectedVehicleType) params.set('vehicleType', selectedVehicleType);
  //   if (selectedApplication) params.set('application', selectedApplication);
  //   if (selectedBrand) params.set('brand', selectedBrand);
  //   if (selectedSize) params.set('tireSize', selectedSize);
  //   if (selectedPattern) params.set('pattern', selectedPattern);
  //   if (sortBy !== 'newest') params.set('sort', sortBy);
  //   if (pagination.page > 1) params.set('page', pagination.page);
    
  //   const queryString = params.toString();
  //   const url = queryString ? `/product?${queryString}` : '/product';
  //   router.replace(url, { scroll: false });
  // }, [searchQuery, selectedTireType, selectedVehicleType, selectedApplication, selectedBrand, selectedSize, selectedPattern, sortBy, pagination.page, router]);

  // Load products when dependencies change
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const clearAllFilters = () => {
    setSelectedTireType('');
    setSelectedVehicleType('');
    setSelectedApplication('');
    setSelectedBrand('');
    setSelectedSize('');
    setSelectedPattern('');
    setSearchQuery('');
    setSortBy('newest');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const removeFilter = (filterType) => {
    switch(filterType) {
      case 'tireType': setSelectedTireType(''); break;
      case 'vehicleType': setSelectedVehicleType(''); break;
      case 'application': setSelectedApplication(''); break;
      case 'brand': setSelectedBrand(''); break;
      case 'size': setSelectedSize(''); break;
      case 'pattern': setSelectedPattern(''); break;
      case 'search': setSearchQuery(''); break;
      default: break;
    }
    setPagination(prev => ({ ...prev, page: 1 }));
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

  const formatPrice = (price) => {
    if (!price) return 'Contact for price';
    return `$${parseFloat(price).toLocaleString()}`;
  };

  const getTireTypeIcon = (tireType) => {
    const type = tireType?.toLowerCase() || '';
    if (type.includes('steer')) return <Truck className="w-4 h-4" />;
    if (type.includes('drive')) return <Battery className="w-4 h-4" />;
    if (type.includes('trailer')) return <ShoppingBag className="w-4 h-4" />;
    return <Shield className="w-4 h-4" />;
  };

  const getTireTypeColor = (tireType) => {
    const type = tireType?.toLowerCase() || '';
    if (type.includes('steer')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (type.includes('drive')) return 'bg-green-100 text-green-700 border-green-200';
    if (type.includes('trailer')) return 'bg-purple-100 text-purple-700 border-purple-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Filter Button Component
  const FilterButton = ({ label, value, isActive, onClick, icon: Icon }) => (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
        flex items-center gap-2 whitespace-nowrap
        ${isActive 
          ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700' 
          : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400 hover:shadow-sm'
        }
      `}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
      {value && !isActive && (
        <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
          {value}
        </span>
      )}
    </button>
  );

  // Active Filter Tag Component
  const ActiveFilterTag = ({ label, value, onRemove }) => (
    <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-sm px-3 py-1.5 rounded-full border border-blue-200">
      <span className="font-medium">{label}:</span>
      <span>{value}</span>
      <button onClick={onRemove} className="ml-1 hover:bg-blue-100 rounded-full p-0.5">
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  );

  // Product Card Component
  const ProductCard = ({ product }) => (
    <Link href={`/products/${product.slug || product._id}`} className="block group">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        {/* Image Section */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {product.image?.url ? (
            <img
              src={product.image.url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Truck className="w-16 h-16 text-gray-300" />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {product.isNewArrival && (
              <span className="bg-green-500 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-md">
                New
              </span>
            )}
            {product.isBestSeller && (
              <span className="bg-orange-500 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-md">
                Best Seller
              </span>
            )}
          </div>

          {/* Tire Type Badge */}
          {product.tireType && (
            <div className={`absolute bottom-3 left-3 ${getTireTypeColor(product.tireType)} border px-2.5 py-1 rounded-full text-xs font-medium shadow-sm`}>
              <div className="flex items-center gap-1">
                {getTireTypeIcon(product.tireType)}
                <span>{product.tireType}</span>
              </div>
            </div>
          )}

          {/* Wishlist Button */}
          <button className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100">
            <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
          </button>
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Brand & Pattern */}
          {(product.brand || product.pattern) && (
            <div className="flex items-center gap-2 mb-2">
              {product.brand && (
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {product.brand}
                </span>
              )}
              {product.pattern && product.brand && (
                <span className="text-gray-300">•</span>
              )}
              {product.pattern && (
                <span className="text-xs text-gray-500">
                  {product.pattern}
                </span>
              )}
            </div>
          )}

          {/* Product Name */}
          <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3rem] group-hover:text-blue-600 transition-colors text-base">
            {product.name}
          </h3>

          {/* Size & Specs */}
          {product.tireSpecs?.size && (
            <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
              <Gauge className="w-3.5 h-3.5" />
              <span>{product.tireSpecs.size}</span>
              {product.tireSpecs.loadIndex && (
                <>
                  <span className="text-gray-300">|</span>
                  <span>Load: {product.tireSpecs.loadIndex}</span>
                </>
              )}
            </div>
          )}

          {/* Applications */}
          {product.applicationsList && product.applicationsList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {product.applicationsList.slice(0, 2).map((app) => (
                <span key={app} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {app.replace('-', ' ')}
                </span>
              ))}
              {product.applicationsList.length > 2 && (
                <span className="text-xs text-gray-400">+{product.applicationsList.length - 2}</span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="mb-3">
            {product.offerPrice ? (
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-red-600">
                  {formatPrice(product.offerPrice)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.price)}
                </span>
              </div>
            ) : product.price ? (
              <span className="text-xl font-bold text-gray-800">
                {formatPrice(product.price)}
              </span>
            ) : (
              <span className="text-sm font-semibold text-blue-600">Request Quote</span>
            )}
          </div>

          {/* CTA Button */}
          <button className="w-full bg-gray-600 text-white py-2.5 rounded-lg hover:bg-amber-600 transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2 group-hover:bg-amber-600">
            View Details
            <TrendingUp className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
          </button>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Commercial Tires</h1>
          <p className="text-blue-100 text-lg max-w-2xl">
            Premium quality tires for trucks, trailers, and commercial vehicles. 
            Engineered for durability, safety, and maximum fuel efficiency.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              placeholder="Search by tire model, brand, or pattern..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Filter Buttons Row */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Filters</span>
              {getActiveFiltersCount() > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {getActiveFiltersCount()}
                </span>
              )}
            </div>
            {getActiveFiltersCount() > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear All
              </button>
            )}
          </div>

          {/* Filter Buttons Grid */}
          <div className="flex flex-wrap gap-3">
            {/* Tire Type Filter */}
            {availableFilters.tireTypes?.length > 0 && (
              <div className="relative group">
                <button
                  onClick={() => {
                    const nextValue = selectedTireType ? '' : availableFilters.tireTypes[0];
                    setSelectedTireType(nextValue);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2
                    ${selectedTireType 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <Truck className="w-4 h-4" />
                  Tire Type
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                
                {/* Dropdown */}
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setSelectedTireType('');
                        setPagination(prev => ({ ...prev, page: 1 }));
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg"
                    >
                      All Types
                    </button>
                    {availableFilters.tireTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setSelectedTireType(type);
                          setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg capitalize ${
                          selectedTireType === type ? 'bg-blue-50 text-blue-600 font-medium' : ''
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Vehicle Type Filter */}
            {availableFilters.vehicleTypesLists?.length > 0 && (
              <div className="relative group">
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2
                    ${selectedVehicleType 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <Truck className="w-4 h-4" />
                  Vehicle Type
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setSelectedVehicleType('');
                        setPagination(prev => ({ ...prev, page: 1 }));
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg"
                    >
                      All Vehicles
                    </button>
                    {availableFilters.vehicleTypesLists.map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setSelectedVehicleType(type);
                          setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg capitalize ${
                          selectedVehicleType === type ? 'bg-blue-50 text-blue-600 font-medium' : ''
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Application Filter */}
            {availableFilters.applicationsLists?.length > 0 && (
              <div className="relative group">
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2
                    ${selectedApplication 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <MapPin className="w-4 h-4" />
                  Application
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setSelectedApplication('');
                        setPagination(prev => ({ ...prev, page: 1 }));
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg"
                    >
                      All Applications
                    </button>
                    {availableFilters.applicationsLists.map((app) => (
                      <button
                        key={app}
                        onClick={() => {
                          setSelectedApplication(app);
                          setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg capitalize ${
                          selectedApplication === app ? 'bg-blue-50 text-blue-600 font-medium' : ''
                        }`}
                      >
                        {app.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Brand Filter */}
            {availableFilters.brands?.length > 0 && (
              <div className="relative group">
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2
                    ${selectedBrand 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <Star className="w-4 h-4" />
                  Brand
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <div className="p-2 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedBrand('');
                        setPagination(prev => ({ ...prev, page: 1 }));
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg"
                    >
                      All Brands
                    </button>
                    {availableFilters.brands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => {
                          setSelectedBrand(brand);
                          setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg ${
                          selectedBrand === brand ? 'bg-blue-50 text-blue-600 font-medium' : ''
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tire Size Filter */}
            {availableFilters.tireSizes?.length > 0 && (
              <div className="relative group">
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2
                    ${selectedSize 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <Gauge className="w-4 h-4" />
                  Size
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <div className="p-2 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedSize('');
                        setPagination(prev => ({ ...prev, page: 1 }));
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg"
                    >
                      All Sizes
                    </button>
                    {availableFilters.tireSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size);
                          setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg ${
                          selectedSize === size ? 'bg-blue-50 text-blue-600 font-medium' : ''
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sort Dropdown */}
            <div className="relative group ml-auto">
              <button className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Sort: {sortBy === 'newest' ? 'Newest' : sortBy === 'name-asc' ? 'Name A-Z' : sortBy === 'name-desc' ? 'Name Z-A' : 'Brand'}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              
              <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <div className="p-2">
                  {[
                    { value: 'newest', label: 'Newest First' },
                    { value: 'name-asc', label: 'Name A-Z' },
                    { value: 'name-desc', label: 'Name Z-A' },
                    { value: 'brand-asc', label: 'Brand A-Z' },
                    { value: 'brand-desc', label: 'Brand Z-A' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg ${
                        sortBy === option.value ? 'bg-blue-50 text-blue-600 font-medium' : ''
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters Tags */}
          {getActiveFiltersCount() > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
              {selectedTireType && (
                <ActiveFilterTag 
                  label="Tire Type" 
                  value={selectedTireType} 
                  onRemove={() => removeFilter('tireType')}
                />
              )}
              {selectedVehicleType && (
                <ActiveFilterTag 
                  label="Vehicle" 
                  value={selectedVehicleType} 
                  onRemove={() => removeFilter('vehicleType')}
                />
              )}
              {selectedApplication && (
                <ActiveFilterTag 
                  label="Application" 
                  value={selectedApplication.replace('-', ' ')} 
                  onRemove={() => removeFilter('application')}
                />
              )}
              {selectedBrand && (
                <ActiveFilterTag 
                  label="Brand" 
                  value={selectedBrand} 
                  onRemove={() => removeFilter('brand')}
                />
              )}
              {selectedSize && (
                <ActiveFilterTag 
                  label="Size" 
                  value={selectedSize} 
                  onRemove={() => removeFilter('size')}
                />
              )}
              {selectedPattern && (
                <ActiveFilterTag 
                  label="Pattern" 
                  value={selectedPattern} 
                  onRemove={() => removeFilter('pattern')}
                />
              )}
              {searchQuery && (
                <ActiveFilterTag 
                  label="Search" 
                  value={searchQuery} 
                  onRemove={() => removeFilter('search')}
                />
              )}
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{products.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{pagination.total}</span> products
          </p>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200"
          >
            <Filter className="w-4 h-4" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </button>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border p-4 animate-pulse">
                <div className="aspect-square bg-gray-100 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-2"></div>
                <div className="h-6 bg-gray-100 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-12 text-center">
            {/* <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" /> */}
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={loadProducts} className="bg-blue-600 text-white px-6 py-2 rounded-lg">
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
            <Truck className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No tires found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search criteria</p>
            <button onClick={clearAllFilters} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg">
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={!pagination.hasPrevPage}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex gap-1">
                  {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                        className={`w-10 h-10 rounded-lg transition-colors ${
                          pagination.page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile Filter Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b sticky top-0 bg-white flex justify-between items-center">
              <h3 className="font-semibold text-lg">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Mobile filter options here - simplified version */}
              <div>
                <label className="font-medium text-gray-700 block mb-2">Tire Type</label>
                <select
                  value={selectedTireType}
                  onChange={(e) => setSelectedTireType(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">All Types</option>
                  {availableFilters.tireTypes?.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              {/* Add other filter selects similarly */}
            </div>
            <div className="p-4 border-t">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
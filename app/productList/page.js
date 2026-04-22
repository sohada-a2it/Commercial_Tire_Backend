// app/tires/TiresClient.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, Filter, X, ChevronDown, Truck, Gauge, 
  ShoppingBag, Shield, Heart, Star, TrendingUp,
  Battery, MapPin, SlidersHorizontal, RotateCcw,
  GitCompare, Check, BarChart3
} from 'lucide-react';
import { fetchProducts } from '@/services/catalogService';

export default function TiresClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [compareList, setCompareList] = useState([]); // New: Compare state
  const [showCompareModal, setShowCompareModal] = useState(false); // New: Compare modal
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

  // Compare Functions
  const addToCompare = (product) => {
    const productId = getProductId(product);
    
    // Check if already in compare list
    if (compareList.some(p => getProductId(p) === productId)) {
      removeFromCompare(productId);
      return;
    }
    
    // Max 2 products
    if (compareList.length >= 2) {
      alert('You can compare up to 2 products at a time. Please remove one first.');
      return;
    }
    
    setCompareList([...compareList, product]);
  };

  const removeFromCompare = (productId) => {
    setCompareList(compareList.filter(p => getProductId(p) !== productId));
  };

  const clearCompare = () => {
    setCompareList([]);
    setShowCompareModal(false);
  };

  const openCompareModal = () => {
    if (compareList.length < 2) {
      alert('Please select 2 products to compare');
      return;
    }
    setShowCompareModal(true);
  };

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
    const numericPrice = parseFloat(String(price).replace(/[^0-9.-]/g, ''));
    if (isNaN(numericPrice)) return String(price);
    return `$${numericPrice.toLocaleString()}`;
  };

  // Safe function to get product ID
  const getProductId = (product) => {
    return product?.id || product?._id || product?.sourceId;
  };

  // Safe function to get product image
  const getProductImage = (product) => {
    if (!product) return null;
    if (product.image?.url) return product.image.url;
    if (typeof product.image === 'string') return product.image;
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === 'string') return firstImage;
      if (firstImage?.url) return firstImage.url;
    }
    return null;
  };

  // Safe function to get applications
  const getApplications = (product) => {
    return product?.applicationsList || 
           product?.application || 
           product?.applications || 
           [];
  };

  // Safe function to get tire specs
  const getTireSpecs = (product) => {
    return product?.tireSpecs || {};
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
    if (type.includes('all-position')) return 'bg-teal-100 text-teal-700 border-teal-200';
    if (type.includes('off-road')) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (type.includes('mining')) return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

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

  // Product Card Component - WITH COMPARE BUTTON
  const ProductCard = ({ product }) => {
    if (!product) return null;
    
    const productId = getProductId(product);
    if (!productId) {
      console.warn('Product without ID:', product);
      return null;
    }

    const productImage = getProductImage(product);
    const applications = getApplications(product);
    const tireSpecs = getTireSpecs(product);
    const isInCompare = compareList.some(p => getProductId(p) === productId);
    
    return (
      <div className="group relative">
        <Link href={`/product/${productId}`} className="block">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            {/* Image Section */}
            <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
              {productImage ? (
                <img
                  src={productImage}
                  alt={product.name || 'Tire product'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = '/images/placeholder-tire.jpg';
                  }}
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
                    <span className="capitalize">{product.tireType}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="absolute top-3 right-3 flex gap-2">
                {/* Compare Button */}
                <button 
                  className={`bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md transition-all ${
                    isInCompare ? 'bg-blue-500 text-white' : 'hover:bg-white'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    addToCompare(product);
                  }}
                >
                  <GitCompare className="w-4 h-4" /> 
                </button> 
              </div>
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
                {product.name || 'Product Name'}
              </h3>

              {/* Size & Specs */}
              {tireSpecs.size && (
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                  <Gauge className="w-3.5 h-3.5" />
                  <span>{tireSpecs.size}</span>
                  {tireSpecs.loadIndex && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span>Load: {tireSpecs.loadIndex}</span>
                    </>
                  )}
                  {tireSpecs.speedRating && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span>Speed: {tireSpecs.speedRating}</span>
                    </>
                  )}
                </div>
              )}

              {/* Applications */}
              {applications && applications.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {applications.slice(0, 2).map((app, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {typeof app === 'string' ? app.replace(/-/g, ' ') : app}
                    </span>
                  ))}
                  {applications.length > 2 && (
                    <span className="text-xs text-gray-400">+{applications.length - 2}</span>
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
              <div className="w-full bg-gray-800 text-white py-2.5 rounded-lg hover:bg-amber-600 transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2 group-hover:bg-amber-600">
                View Details
                <TrendingUp className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </div>
            </div>
          </div>
        </Link>

        {/* Compare Checkmark Overlay (if selected) */}
        {isInCompare && (
          <div className="absolute top-3 right-3 bg-blue-500 rounded-full p-1.5 shadow-lg">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
    );
  };

  // Compare Modal Component
  const CompareModal = () => {
    if (!showCompareModal || compareList.length !== 2) return null;

    const [product1, product2] = compareList;
    const specs1 = getTireSpecs(product1);
    const specs2 = getTireSpecs(product2);

    const compareFields = [
      { label: 'Product Name', key: 'name', getValue: (p) => p.name || 'N/A' },
      { label: 'Brand', key: 'brand', getValue: (p) => p.brand || 'N/A' },
      { label: 'Pattern', key: 'pattern', getValue: (p) => p.pattern || 'N/A' },
      { label: 'Tire Type', key: 'tireType', getValue: (p) => p.tireType || 'N/A' },
      { label: 'Size', key: 'size', getValue: (p) => specs1.size || 'N/A' },
      { label: 'Load Index', key: 'loadIndex', getValue: (p) => getTireSpecs(p).loadIndex || 'N/A' },
      { label: 'Speed Rating', key: 'speedRating', getValue: (p) => getTireSpecs(p).speedRating || 'N/A' },
      { label: 'Price', key: 'price', getValue: (p) => formatPrice(p.price) },
      { label: 'Offer Price', key: 'offerPrice', getValue: (p) => p.offerPrice ? formatPrice(p.offerPrice) : 'N/A' },
      { label: 'Applications', key: 'applications', getValue: (p) => getApplications(p).join(', ') || 'N/A' },
    ];

    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">Compare Products</h2>
            </div>
            <button
              onClick={() => setShowCompareModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Compare Table */}
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="p-4 text-left w-1/4 bg-gray-50">Feature</th>
                    <th className="p-4 text-center w-1/3 bg-gray-50">
                      <div className="relative">
                        <img
                          src={getProductImage(product1) || '/images/placeholder-tire.jpg'}
                          alt={product1.name}
                          className="w-32 h-32 object-contain mx-auto mb-3 rounded-lg"
                        />
                        <h3 className="font-bold text-gray-800">{product1.name}</h3>
                        <button
                          onClick={() => removeFromCompare(getProductId(product1))}
                          className="absolute top-0 right-0 p-1 hover:bg-gray-100 rounded-full"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </th>
                    <th className="p-4 text-center w-1/3 bg-gray-50">
                      <div className="relative">
                        <img
                          src={getProductImage(product2) || '/images/placeholder-tire.jpg'}
                          alt={product2.name}
                          className="w-32 h-32 object-contain mx-auto mb-3 rounded-lg"
                        />
                        <h3 className="font-bold text-gray-800">{product2.name}</h3>
                        <button
                          onClick={() => removeFromCompare(getProductId(product2))}
                          className="absolute top-0 right-0 p-1 hover:bg-gray-100 rounded-full"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {compareFields.map((field, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-semibold text-gray-700 bg-gray-50">
                        {field.label}
                      </td>
                      <td className="p-4 text-center text-gray-600">
                        {field.getValue(product1)}
                      </td>
                      <td className="p-4 text-center text-gray-600">
                        {field.getValue(product2)}
                      </td>
                    </tr>
                  ))}
                  
                  {/* Highlight differences */}
                  <tr className="bg-blue-50">
                    <td className="p-4 font-semibold text-blue-700">Key Difference</td>
                    <td className="p-4 text-center text-blue-600" colSpan={2}>
                      {specs1.size !== specs2.size && (
                        <span className="inline-block mr-2">📏 Different Sizes</span>
                      )}
                      {specs1.loadIndex !== specs2.loadIndex && (
                        <span className="inline-block mr-2">⚖️ Different Load Capacity</span>
                      )}
                      {product1.brand !== product2.brand && (
                        <span className="inline-block mr-2">🏭 Different Brands</span>
                      )}
                      {product1.price !== product2.price && (
                        <span className="inline-block">💰 Price Difference: {Math.abs(parseFloat(product1.price || 0) - parseFloat(product2.price || 0)).toLocaleString()}</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6 pt-6 border-t">
              <Link
                href={`/compare?ids=${getProductId(product1)},${getProductId(product2)}`}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-center"
              >
                View Detailed Comparison
              </Link>
              <button
                onClick={clearCompare}
                className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Clear Both
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compare Bar - Fixed at bottom */}
      {compareList.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-40 transform transition-transform">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-700">
                  Compare ({compareList.length}/2)
                </span>
                <div className="flex gap-3">
                  {compareList.map(product => (
                    <div key={getProductId(product)} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1">
                      <span className="text-sm text-gray-600 truncate max-w-[150px]">
                        {product.name}
                      </span>
                      <button
                        onClick={() => removeFromCompare(getProductId(product))}
                        className="hover:bg-gray-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={clearCompare}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear All
                </button>
                <button
                  onClick={openCompareModal}
                  disabled={compareList.length < 2}
                  className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                    compareList.length === 2
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Compare Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Commercial Tires</h1>
          <p className="text-amber-100 text-lg max-w-2xl">
            Premium quality tires for trucks, trailers, and commercial vehicles. 
            Engineered for durability, safety, and maximum fuel efficiency.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 pb-24">
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
              <select
                value={selectedTireType}
                onChange={(e) => {
                  setSelectedTireType(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Tire Types</option>
                {availableFilters.tireTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            )}

            {/* Vehicle Type Filter */}
            {availableFilters.vehicleTypesLists?.length > 0 && (
              <select
                value={selectedVehicleType}
                onChange={(e) => {
                  setSelectedVehicleType(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Vehicles</option>
                {availableFilters.vehicleTypesLists.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            )}

            {/* Application Filter */}
            {availableFilters.applicationsLists?.length > 0 && (
              <select
                value={selectedApplication}
                onChange={(e) => {
                  setSelectedApplication(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Applications</option>
                {availableFilters.applicationsLists.map((app) => (
                  <option key={app} value={app}>{app.replace(/-/g, ' ')}</option>
                ))}
              </select>
            )}

            {/* Brand Filter */}
            {availableFilters.brands?.length > 0 && (
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Brands</option>
                {availableFilters.brands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            )}

            {/* Tire Size Filter */}
            {availableFilters.tireSizes?.length > 0 && (
              <select
                value={selectedSize}
                onChange={(e) => {
                  setSelectedSize(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Sizes</option>
                {availableFilters.tireSizes.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            )}

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto"
            >
              <option value="newest">Newest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="brand-asc">Brand A-Z</option>
              <option value="brand-desc">Brand Z-A</option>
            </select>
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
                  value={selectedApplication.replace(/-/g, ' ')} 
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
              {products.map((product, index) => (
                <ProductCard key={product.id || product._id || index} product={product} />
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

      {/* Compare Modal */}
      <CompareModal />

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
              <div>
                <label className="font-medium text-gray-700 block mb-2">Vehicle Type</label>
                <select
                  value={selectedVehicleType}
                  onChange={(e) => setSelectedVehicleType(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">All Vehicles</option>
                  {availableFilters.vehicleTypesLists?.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-medium text-gray-700 block mb-2">Application</label>
                <select
                  value={selectedApplication}
                  onChange={(e) => setSelectedApplication(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">All Applications</option>
                  {availableFilters.applicationsLists?.map(app => (
                    <option key={app} value={app}>{app.replace(/-/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-medium text-gray-700 block mb-2">Brand</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">All Brands</option>
                  {availableFilters.brands?.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-medium text-gray-700 block mb-2">Tire Size</label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">All Sizes</option>
                  {availableFilters.tireSizes?.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
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
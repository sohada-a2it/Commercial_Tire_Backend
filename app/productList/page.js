// app/tires/TiresClient.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search, Filter, X, ChevronDown, Truck, Gauge,
  ShoppingBag, Shield, Heart, Star, TrendingUp,
  Battery, MapPin, SlidersHorizontal, RotateCcw,
  GitCompare, Check, BarChart3, Grid3x3, Eye,
  Zap, Award, Clock
} from 'lucide-react';
import { fetchProducts } from '@/services/catalogService';

export default function TiresClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Available filters from API
  const [availableFilters, setAvailableFilters] = useState({
    patterns: [],
    tireTypes: [],
    vehicleTypesLists: [],
    applicationsLists: [],
    tireSizes: [],
    categories: []
  });

  // Selected filters
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedTireType, setSelectedTireType] = useState(searchParams.get('tireType') || '');
  const [selectedVehicleType, setSelectedVehicleType] = useState(searchParams.get('vehicleType') || '');
  const [selectedApplication, setSelectedApplication] = useState(searchParams.get('application') || '');
  const [selectedSize, setSelectedSize] = useState(searchParams.get('tireSize') || '');
  const [selectedPattern, setSelectedPattern] = useState(searchParams.get('pattern') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');

  // UI State
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  // Helper functions
  const getProductId = (product) => {
    return product?.id || product?._id || product?.sourceId;
  };

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

  const getTireSpecs = (product) => {
    const specs = product?.tireSpecs;
    if (!specs) return {};
    if (Array.isArray(specs) && specs.length > 0) return specs[0];
    if (typeof specs === 'object') return specs;
    return {};
  };

  const getApplications = (product) => {
    return product?.applicationsList ||
      product?.application ||
      product?.applications ||
      [];
  };

  const formatPrice = (price) => {
    if (!price) return 'Contact';
    const numericPrice = parseFloat(String(price).replace(/[^0-9.-]/g, ''));
    if (isNaN(numericPrice)) return String(price);
    return `$${numericPrice.toLocaleString()}`;
  };

  // Compare Functions - Updated for 3 products
  const addToCompare = (product) => {
    const productId = getProductId(product);

    if (compareList.some(p => getProductId(p) === productId)) {
      removeFromCompare(productId);
      return;
    }

    // Allow up to 3 products for comparison
    if (compareList.length >= 3) {
      alert('You can compare up to 3 products at a time. Please remove one first.');
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
      alert('Please select at least 2 products to compare');
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
        category: selectedCategory || undefined,
        tireType: selectedTireType || undefined,
        vehicleType: selectedVehicleType || undefined,
        application: selectedApplication || undefined,
        tireSize: selectedSize || undefined,
        pattern: selectedPattern || undefined,
        isActive: true
      };

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
  }, [pagination.page, pagination.limit, sortBy, searchQuery, selectedCategory, selectedTireType, selectedVehicleType, selectedApplication, selectedSize, selectedPattern]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSelectedTireType('');
    setSelectedVehicleType('');
    setSelectedApplication('');
    setSelectedSize('');
    setSelectedPattern('');
    setSearchQuery('');
    setSortBy('newest');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const removeFilter = (filterType) => {
    switch (filterType) {
      case 'category': setSelectedCategory(''); break;
      case 'tireType': setSelectedTireType(''); break;
      case 'vehicleType': setSelectedVehicleType(''); break;
      case 'application': setSelectedApplication(''); break;
      case 'size': setSelectedSize(''); break;
      case 'pattern': setSelectedPattern(''); break;
      case 'search': setSearchQuery(''); break;
      default: break;
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory) count++;
    if (selectedTireType) count++;
    if (selectedVehicleType) count++;
    if (selectedApplication) count++;
    if (selectedSize) count++;
    if (selectedPattern) count++;
    if (searchQuery) count++;
    return count;
  };

  const getTireTypeIcon = (tireType) => {
    const type = tireType?.toLowerCase() || '';
    if (type.includes('steer')) return <Truck className="w-3.5 h-3.5" />;
    if (type.includes('drive')) return <Zap className="w-3.5 h-3.5" />;
    if (type.includes('trailer')) return <ShoppingBag className="w-3.5 h-3.5" />;
    return <Shield className="w-3.5 h-3.5" />;
  };

  const getTireTypeColor = (tireType) => {
    const type = tireType?.toLowerCase() || '';
    if (type.includes('steer')) return 'bg-gradient-to-r from-blue-500 to-blue-600';
    if (type.includes('drive')) return 'bg-gradient-to-r from-emerald-500 to-emerald-600';
    if (type.includes('trailer')) return 'bg-gradient-to-r from-purple-500 to-purple-600';
    if (type.includes('all-position')) return 'bg-gradient-to-r from-teal-500 to-teal-600';
    if (type.includes('off-road')) return 'bg-gradient-to-r from-amber-500 to-amber-600';
    if (type.includes('mining')) return 'bg-gradient-to-r from-rose-500 to-rose-600';
    return 'bg-gradient-to-r from-gray-500 to-gray-600';
  };

  // Active Filter Tag Component
  const ActiveFilterTag = ({ label, value, onRemove }) => (
    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-sm px-3 py-1.5 rounded-full border border-blue-200 shadow-sm">
      <span className="font-medium">{label}:</span>
      <span>{value}</span>
      <button onClick={onRemove} className="ml-1 hover:bg-blue-100 rounded-full p-0.5 transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  );

  // Compare Modal Component - Updated for 3 products with full specs
  const CompareModal = () => {
    if (!showCompareModal || compareList.length < 2) return null;

    const [product1, product2, product3] = compareList;
    const specs1 = getTireSpecs(product1);
    const specs2 = getTireSpecs(product2);
    const specs3 = getTireSpecs(product3);

    // All comparison fields - complete specification list
    const compareFields = [
      { label: 'Product Name', getValue: (p) => p?.name || 'N/A' },
      { label: 'Model Number', getValue: (p) => p?.modelNumber || 'N/A' },
      { label: 'Brand', getValue: (p) => p?.brand || 'N/A' },
      { label: 'Pattern', getValue: (p) => p?.pattern || 'N/A' },
      { label: 'Category', getValue: (p) => p?.categoryName || 'N/A' },
      { label: 'Tire Type', getValue: (p) => p?.tireType || 'N/A' },
      { label: 'Size', getValue: (p) => getTireSpecs(p).size || 'N/A' },
      { label: 'Load Range', getValue: (p) => getTireSpecs(p).loadRange || 'N/A' },
      { label: 'Ply Rating', getValue: (p) => getTireSpecs(p).plyRating || 'N/A' },
      { label: 'Load Index', getValue: (p) => getTireSpecs(p).loadIndex || 'N/A' },
      { label: 'Speed Rating', getValue: (p) => getTireSpecs(p).speedRating || getTireSpecs(p).speedSymbol || 'N/A' },
      { label: 'Overall Diameter', getValue: (p) => getTireSpecs(p).overallDiameter || 'N/A' },
      { label: 'Section Width', getValue: (p) => getTireSpecs(p).sectionWidth || 'N/A' },
      { label: 'Tread Depth', getValue: (p) => getTireSpecs(p).treadDepth || 'N/A' },
      { label: 'Standard Rim', getValue: (p) => getTireSpecs(p).stdRim || 'N/A' },
      { label: 'Single Max Load', getValue: (p) => getTireSpecs(p).singleMaxLoad || getTireSpecs(p).maxLoad || 'N/A' },
      { label: 'Single Max Pressure', getValue: (p) => getTireSpecs(p).singleMaxPressure || getTireSpecs(p).maxInflation || 'N/A' },
      { label: 'Dual Max Load', getValue: (p) => getTireSpecs(p).dualMaxLoad || 'N/A' },
      { label: 'Dual Max Pressure', getValue: (p) => getTireSpecs(p).dualMaxPressure || 'N/A' },
      { label: 'Static Load Radius', getValue: (p) => getTireSpecs(p).staticLoadRadius || 'N/A' },
      { label: 'Revs per Mile', getValue: (p) => getTireSpecs(p).revsPerMile || getTireSpecs(p).revsPerKm || 'N/A' },
      { label: 'Weight', getValue: (p) => {
        const w = getTireSpecs(p).weight;
        const u = getTireSpecs(p).weightUnit;
        return w ? `${w} ${u || 'lbs'}` : 'N/A';
      } },
      { label: 'Construction', getValue: (p) => {
        const c = getTireSpecs(p).constructionType || getTireSpecs(p).tireType;
        if (c === 'TL') return 'Tubeless';
        if (c === 'TT') return 'Tube Type';
        return c || 'N/A';
      } },
      { label: 'Price', getValue: (p) => formatPrice(p?.price) },
      { label: 'Offer Price', getValue: (p) => p?.offerPrice ? formatPrice(p.offerPrice) : 'N/A' },
      { label: 'Applications', getValue: (p) => getApplications(p).slice(0, 3).join(', ') || 'N/A' },
      { label: 'Vehicle Types', getValue: (p) => p?.vehicleTypesList?.slice(0, 3).join(', ') || p?.vehicleType?.join(', ') || 'N/A' },
    ];

    const getColumnWidth = () => {
      if (compareList.length === 3) return 'w-1/4';
      return 'w-1/3';
    };

    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">Compare Products ({compareList.length}/3)</h2>
            </div>
            <button onClick={() => setShowCompareModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="p-4 text-left w-1/4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-l-xl sticky left-0 bg-gray-50">
                    Feature
                  </th>
                  {compareList.map((product, idx) => (
                    <th key={idx} className={`p-4 text-center ${getColumnWidth()} bg-gradient-to-r from-gray-50 to-gray-100 ${idx === compareList.length - 1 ? 'rounded-r-xl' : ''}`}>
                      <div className="relative">
                        <img 
                          src={getProductImage(product)} 
                          alt={product.name} 
                          className="w-32 h-32 object-contain mx-auto mb-3 rounded-lg shadow-md" 
                        />
                        <h3 className="font-bold text-gray-800 text-sm">{product.name}</h3>
                        <button 
                          onClick={() => removeFromCompare(getProductId(product))} 
                          className="absolute top-0 right-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compareFields.map((field, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-semibold text-gray-700 bg-gray-50 sticky left-0 bg-gray-50 text-sm">
                      {field.label}
                    </td>
                    {compareList.map((product, pIdx) => (
                      <td key={pIdx} className="p-4 text-center text-gray-600 text-sm">
                        {field.getValue(product)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-b-xl">
                  <td className="p-4 font-semibold text-blue-700 rounded-bl-xl text-sm">Key Differences</td>
                  <td className="p-4 text-center text-blue-600 text-sm" colSpan={compareList.length}>
                    <div className="flex flex-wrap justify-center gap-2">
                      {(() => {
                        const differences = [];
                        const size1 = getTireSpecs(product1).size;
                        const size2 = getTireSpecs(product2).size;
                        const size3 = product3 ? getTireSpecs(product3).size : null;
                        if (size1 !== size2 || (size3 && size1 !== size3)) differences.push('📏 Different Sizes');
                        
                        const load1 = getTireSpecs(product1).loadIndex;
                        const load2 = getTireSpecs(product2).loadIndex;
                        const load3 = product3 ? getTireSpecs(product3).loadIndex : null;
                        if (load1 !== load2 || (load3 && load1 !== load3)) differences.push('⚖️ Different Load Capacity');
                        
                        const type1 = product1.tireType;
                        const type2 = product2.tireType;
                        const type3 = product3?.tireType;
                        if (type1 !== type2 || (type3 && type1 !== type3)) differences.push('🏷️ Different Tire Types');
                        
                        return differences.length ? differences.join(' • ') : 'Similar specifications across all products';
                      })()}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="flex gap-4 mt-6 pt-6 border-t">
              <Link 
                href={`/compare?ids=${compareList.map(p => getProductId(p)).join(',')}`} 
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 text-center transition-all duration-300 shadow-md"
              >
                View Detailed Comparison
              </Link>
              <button onClick={clearCompare} className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                Clear All ({compareList.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Product Card Component
  const ProductCard = ({ product }) => {
    if (!product) return null;

    const productId = getProductId(product);
    if (!productId) return null;

    const productImage = getProductImage(product);
    const applications = getApplications(product);
    const tireSpecs = getTireSpecs(product);
    const isInCompare = compareList.some(p => getProductId(p) === productId);

    return (
      <div className="group relative h-[450px]">
        <Link href={`/product?id=${productId}`} className="block h-full">
          <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 h-full flex flex-col">

            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

            {/* Image Section */}
            <div className="relative h-[200px] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden flex-shrink-0">
              {productImage ? (
                <img
                  src={productImage}
                  alt={product.name || 'Tire product'}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Truck className="w-16 h-16 text-gray-300" />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-2 left-2 flex gap-1.5">
                {product.isNewArrival && (
                  <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    NEW
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-0.5">
                    <Award className="w-2.5 h-2.5" />
                    BEST
                  </span>
                )}
              </div>

              {/* Category Badge */}
              {product.categoryName && (
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md text-gray-800 text-[10px] font-semibold px-2 py-1 rounded-full shadow-lg border border-white/20">
                  {product.categoryName}
                </div>
              )}

              {/* Tire Type Badge */}
              {product.tireType && (
                <div className={`absolute bottom-2 left-2 ${getTireTypeColor(product.tireType)} text-white px-2 py-1 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1`}>
                  {getTireTypeIcon(product.tireType)}
                  <span className="capitalize">{product.tireType}</span>
                </div>
              )}

              {/* Compare Button */}
              <button
                className={`absolute bottom-2 right-2 backdrop-blur-md rounded-full p-1.5 shadow-lg transition-all duration-300 ${
                  isInCompare
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/90 text-gray-700 hover:bg-blue-600 hover:text-white'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  addToCompare(product);
                }}
              >
                <GitCompare className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content Section */}
            <div className="p-3 flex-1 flex flex-col">
              <h3 className="font-bold text-gray-800 mb-1 line-clamp-2 text-sm leading-tight min-h-[2.5rem] group-hover:text-blue-600 transition-colors">
                {product.name || 'Product Name'}
              </h3>

              <div className="mb-2">
                {tireSpecs.size && (
                  <div className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
                    <div className="flex items-center gap-0.5 bg-gray-50 px-1.5 py-0.5 rounded">
                      <Gauge className="w-3 h-3 text-amber-600" />
                      <span className="font-semibold text-[11px]">{tireSpecs.size}</span>
                    </div>
                    {tireSpecs.loadIndex && (
                      <div className="flex items-center gap-0.5 bg-gray-50 px-1.5 py-0.5 rounded">
                        <span className="text-[10px] text-gray-500">L:</span>
                        <span className="font-semibold text-[11px]">{tireSpecs.loadIndex}</span>
                      </div>
                    )}
                    {tireSpecs.speedRating && (
                      <div className="flex items-center gap-0.5 bg-gray-50 px-1.5 py-0.5 rounded">
                        <span className="text-[10px] text-gray-500">S:</span>
                        <span className="font-semibold text-[11px]">{tireSpecs.speedRating}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Applications */}
              <div className="mb-2">
                {applications && applications.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {applications.slice(0, 2).map((app, idx) => (
                      <span key={idx} className="text-[10px] bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                        {typeof app === 'string' ? app.replace(/-/g, ' ').substring(0, 12) : app}
                      </span>
                    ))}
                    {applications.length > 2 && (
                      <span className="text-[10px] text-gray-400 font-semibold">+{applications.length - 2}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Price and CTA */}
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                <div>
                  {product.offerPrice ? (
                    <div className="flex flex-col">
                      <span className="text-base font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                        {formatPrice(product.offerPrice)}
                      </span>
                      <span className="text-[10px] text-gray-400 line-through">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  ) : product.price ? (
                    <span className="text-base font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      {formatPrice(product.price)}
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-blue-600">Request Quote</span>
                  )}
                </div>

                <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-1.5 rounded-lg hover:from-amber-600 hover:to-amber-500 transition-all duration-300 shadow-md">
                  <Eye className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        </Link>

        {isInCompare && (
          <div className="absolute top-2 right-10 bg-blue-600 rounded-full p-1 shadow-lg ring-2 ring-white">
            <Check className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Compare Bar - Updated for 3 products */}
      {compareList.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-gray-200 z-40 backdrop-blur-md bg-white/95">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-sm text-gray-700">Compare ({compareList.length}/3)</span>
                <div className="flex gap-2">
                  {compareList.map(product => (
                    <div key={getProductId(product)} className="flex items-center gap-1.5 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full px-2 py-0.5 shadow-sm">
                      <span className="text-xs text-gray-600 truncate max-w-[100px]">{product.name}</span>
                      <button onClick={() => removeFromCompare(getProductId(product))} className="hover:bg-gray-200 rounded-full p-0.5 transition-colors">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={clearCompare} className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800">Clear All</button>
                <button 
                  onClick={openCompareModal} 
                  disabled={compareList.length < 2} 
                  className={`px-4 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                    compareList.length >= 2 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Compare Now ({compareList.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 py-8 relative">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent">
            Commercial Tires
          </h1>
          <p className="text-amber-100 text-base max-w-2xl">
            Premium quality tires for trucks, trailers, and commercial vehicles.
            Engineered for durability, safety, and maximum fuel efficiency.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 pb-20">
        {/* Search Bar and Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              placeholder="Search by tire model, pattern, or size..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Buttons Row */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/40 p-3 mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-sm text-gray-700">Filters</span>
              {getActiveFiltersCount() > 0 && (
                <span className="bg-gradient-to-r from-amber-600 to-amber-700 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {getActiveFiltersCount()}
                </span>
              )}
            </div>
            {getActiveFiltersCount() > 0 && (
              <button onClick={clearAllFilters} className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 transition-colors">
                <RotateCcw className="w-3 h-3" />
                Clear All
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {availableFilters.categories?.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="px-2 py-1 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-300 hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All Categories</option>
                {availableFilters.categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}

            {availableFilters.tireTypes?.length > 0 && (
              <select
                value={selectedTireType}
                onChange={(e) => {
                  setSelectedTireType(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="px-2 py-1 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-300 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Tire Types</option>
                {availableFilters.tireTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            )}

            {availableFilters.vehicleTypesLists?.length > 0 && (
              <select
                value={selectedVehicleType}
                onChange={(e) => {
                  setSelectedVehicleType(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="px-2 py-1 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-300 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Vehicles</option>
                {availableFilters.vehicleTypesLists.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            )}

            {availableFilters.applicationsLists?.length > 0 && (
              <select
                value={selectedApplication}
                onChange={(e) => {
                  setSelectedApplication(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="px-2 py-1 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-300 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Applications</option>
                {availableFilters.applicationsLists.map((app) => (
                  <option key={app} value={app}>{app.replace(/-/g, ' ')}</option>
                ))}
              </select>
            )}

            {availableFilters.tireSizes?.length > 0 && (
              <select
                value={selectedSize}
                onChange={(e) => {
                  setSelectedSize(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="px-2 py-1 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-300 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Sizes</option>
                {availableFilters.tireSizes.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            )}

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 py-1 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-300 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto"
            >
              <option value="newest">Newest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
            </select>
          </div>

          {/* Active Filters Tags */}
          {getActiveFiltersCount() > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-gray-100">
              {selectedCategory && <ActiveFilterTag label="Category" value={selectedCategory} onRemove={() => removeFilter('category')} />}
              {selectedTireType && <ActiveFilterTag label="Tire Type" value={selectedTireType} onRemove={() => removeFilter('tireType')} />}
              {selectedVehicleType && <ActiveFilterTag label="Vehicle" value={selectedVehicleType} onRemove={() => removeFilter('vehicleType')} />}
              {selectedApplication && <ActiveFilterTag label="Application" value={selectedApplication.replace(/-/g, ' ')} onRemove={() => removeFilter('application')} />}
              {selectedSize && <ActiveFilterTag label="Size" value={selectedSize} onRemove={() => removeFilter('size')} />}
              {searchQuery && <ActiveFilterTag label="Search" value={searchQuery} onRemove={() => removeFilter('search')} />}
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-600 text-xs">
            Showing <span className="font-semibold text-gray-900">{products.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{pagination.total}</span> products
          </p>
          <button onClick={() => setMobileFiltersOpen(true)} className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs shadow-sm">
            <Filter className="w-3.5 h-3.5" />
            Filters
          </button>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 animate-pulse h-[450px]">
                <div className="h-[200px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3"></div>
                <div className="h-3 bg-gray-100 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <p className="text-red-600 mb-3 text-sm">{error}</p>
            <button onClick={loadProducts} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-1.5 rounded-full text-sm shadow-md">
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
            <Truck className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No products found</h3>
            <p className="text-gray-500 text-sm mb-4">Try adjusting your filters or search criteria</p>
            <button onClick={clearAllFilters} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2 rounded-full text-sm shadow-md">
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className={`grid gap-4 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}>
              {products.map((product, index) => (
                <ProductCard key={product.id || product._id || index} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-1.5 mt-8">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-full disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) pageNum = i + 1;
                    else if (pagination.page <= 3) pageNum = i + 1;
                    else if (pagination.page >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
                    else pageNum = pagination.page - 2 + i;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                        className={`w-8 h-8 text-sm rounded-full transition-all duration-300 ${
                          pagination.page === pageNum
                            ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md'
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
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-full disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <CompareModal />

      {/* Mobile Filter Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="p-3 border-b sticky top-0 bg-white flex justify-between items-center">
              <h3 className="font-semibold text-base">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 space-y-3">
              {availableFilters.categories?.length > 0 && (
                <div>
                  <label className="font-medium text-gray-700 block mb-1 text-sm">Category</label>
                  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full p-2 text-sm border rounded-lg">
                    <option value="">All Categories</option>
                    {availableFilters.categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              )}
              {availableFilters.tireTypes?.length > 0 && (
                <div>
                  <label className="font-medium text-gray-700 block mb-1 text-sm">Tire Type</label>
                  <select value={selectedTireType} onChange={(e) => setSelectedTireType(e.target.value)} className="w-full p-2 text-sm border rounded-lg">
                    <option value="">All Types</option>
                    {availableFilters.tireTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
              )}
              {availableFilters.vehicleTypesLists?.length > 0 && (
                <div>
                  <label className="font-medium text-gray-700 block mb-1 text-sm">Vehicle Type</label>
                  <select value={selectedVehicleType} onChange={(e) => setSelectedVehicleType(e.target.value)} className="w-full p-2 text-sm border rounded-lg">
                    <option value="">All Vehicles</option>
                    {availableFilters.vehicleTypesLists.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
              )}
              {availableFilters.applicationsLists?.length > 0 && (
                <div>
                  <label className="font-medium text-gray-700 block mb-1 text-sm">Application</label>
                  <select value={selectedApplication} onChange={(e) => setSelectedApplication(e.target.value)} className="w-full p-2 text-sm border rounded-lg">
                    <option value="">All Applications</option>
                    {availableFilters.applicationsLists.map(app => <option key={app} value={app}>{app.replace(/-/g, ' ')}</option>)}
                  </select>
                </div>
              )}
              {availableFilters.tireSizes?.length > 0 && (
                <div>
                  <label className="font-medium text-gray-700 block mb-1 text-sm">Tire Size</label>
                  <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} className="w-full p-2 text-sm border rounded-lg">
                    <option value="">All Sizes</option>
                    {availableFilters.tireSizes.map(size => <option key={size} value={size}>{size}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="p-3 border-t">
              <button onClick={() => setMobileFiltersOpen(false)} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-full text-sm font-medium shadow-md">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
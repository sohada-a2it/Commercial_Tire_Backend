// app/compare/page.jsx
'use client';
import React from 'react'
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  X, Truck, Gauge, Battery, Shield, TrendingUp, 
  ShoppingBag, AlertCircle, ChevronLeft, GitCompare,
  Check, XCircle, ArrowLeft, Ruler, Weight,
  Gauge as SpeedGauge, Zap, HardDrive, Wind
} from 'lucide-react';
import { fetchProduct, compareTires } from '@/services/catalogService';

export default function ComparePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idsParam = searchParams.get('ids');
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);

  // Fetch products
  useEffect(() => {
    if (!idsParam) {
      setError('No products selected for comparison');
      setLoading(false);
      return;
    }

    const productIds = idsParam.split(',');
    if (productIds.length < 2) {
      setError('Please select at least 2 products to compare');
      setLoading(false);
      return;
    }

    if (productIds.length > 4) {
      setError('Maximum 4 products can be compared at once');
      setLoading(false);
      return;
    }

    const fetchProductsForComparison = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const productPromises = productIds.map(id => fetchProduct(id));
        const results = await Promise.all(productPromises);
        
        const validProducts = results.filter(result => result.success && result.product);
        
        if (validProducts.length !== productIds.length) {
          setError(`Could not fetch all products. Found ${validProducts.length} of ${productIds.length}.`);
          setLoading(false);
          return;
        }
        
        const fetchedProducts = validProducts.map(result => result.product);
        setProducts(fetchedProducts);
        
        // Use compareTires API if available
        try {
          const compareResult = await compareTires(productIds);
          if (compareResult.success) {
            setComparisonData(compareResult.comparison);
          }
        } catch (err) {
          console.log('Compare API not available, using local comparison');
        }
        
      } catch (err) {
        console.error('Error fetching products for comparison:', err);
        setError(err.message || 'Failed to load products for comparison');
      } finally {
        setLoading(false);
      }
    };

    fetchProductsForComparison();
  }, [idsParam]);

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

  const getProductId = (product) => {
    return product?.id || product?._id || product?.sourceId;
  };

  // Get tire specifications (handles both array and object)
  const getTireSpec = (product) => {
    const specs = product?.tireSpecs;
    if (!specs) return {};
    if (Array.isArray(specs) && specs.length > 0) return specs[0];
    if (typeof specs === 'object') return specs;
    return {};
  };

  const getTireTypeIcon = (tireType) => {
    const type = tireType?.toLowerCase() || '';
    if (type.includes('steer')) return <Truck className="w-5 h-5" />;
    if (type.includes('drive')) return <Zap className="w-5 h-5" />;
    if (type.includes('trailer')) return <ShoppingBag className="w-5 h-5" />;
    return <Shield className="w-5 h-5" />;
  };

  const getTireTypeColor = (tireType) => {
    const type = tireType?.toLowerCase() || '';
    if (type.includes('steer')) return 'bg-amber-100 text-amber-700';
    if (type.includes('drive')) return 'bg-amber-100 text-amber-700';
    if (type.includes('trailer')) return 'bg-amber-100 text-amber-700';
    if (type.includes('all-position')) return 'bg-teal-100 text-teal-700';
    if (type.includes('off-road')) return 'bg-amber-100 text-amber-700';
    if (type.includes('mining')) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  const formatPrice = (price) => {
    if (!price) return 'Contact';
    const numericPrice = parseFloat(String(price).replace(/[^0-9.-]/g, ''));
    if (isNaN(numericPrice)) return String(price);
    return `$${numericPrice.toLocaleString()}`;
  };

  // Get value by key from product
  const getProductValue = (product, key) => {
    const spec = getTireSpec(product);
    
    const valueMap = {
      'name': product?.name || 'N/A',
      'brand': product?.brand || 'N/A',
      'pattern': product?.pattern || 'N/A',
      'modelNumber': product?.modelNumber || 'N/A',
      'category': product?.categoryName || 'N/A',
      'tireType': product?.tireType || 'N/A',
      'price': formatPrice(product?.price),
      'offerPrice': product?.offerPrice ? formatPrice(product.offerPrice) : 'N/A',
      
      // Tire specifications
      'size': spec?.size || 'N/A',
      'loadRange': spec?.loadRange || 'N/A',
      'plyRating': spec?.plyRating || 'N/A',
      'loadIndex': spec?.loadIndex || 'N/A',
      'speedRating': spec?.speedRating || spec?.speedSymbol || 'N/A',
      'overallDiameter': spec?.overallDiameter || 'N/A',
      'sectionWidth': spec?.sectionWidth || 'N/A',
      'treadDepth': spec?.treadDepth || 'N/A',
      'stdRim': spec?.stdRim || 'N/A',
      'singleMaxLoad': spec?.singleMaxLoad || spec?.maxLoad || 'N/A',
      'singleMaxPressure': spec?.singleMaxPressure || spec?.maxInflation || 'N/A',
      'dualMaxLoad': spec?.dualMaxLoad || 'N/A',
      'dualMaxPressure': spec?.dualMaxPressure || 'N/A',
      'staticLoadRadius': spec?.staticLoadRadius || 'N/A',
      'revsPerKm': spec?.revsPerKm || spec?.revsPerMile || 'N/A',
      'weight': spec?.weight ? `${spec.weight} ${spec.weightUnit || 'lbs'}` : 'N/A',
      'construction': spec?.constructionType === 'TL' ? 'Tubeless' : 
                       spec?.constructionType === 'TT' ? 'Tube Type' : 
                       spec?.constructionType || 'N/A',
      
      // Lists
      'applications': product?.applicationsList?.join(', ') || 
                      product?.application?.join(', ') || 
                      'N/A',
      'vehicleTypes': product?.vehicleTypesList?.join(', ') || 
                      product?.vehicleType?.join(', ') || 
                      'N/A',
    };
    
    return valueMap[key] || 'N/A';
  };

  const isDifferent = (idx, key) => {
    if (products.length < 2) return false;
    const firstValue = getProductValue(products[0], key);
    const currentValue = getProductValue(products[idx], key);
    return firstValue !== currentValue;
  };

  // Get a product's display class based on index
  const getProductClass = (idx) => {
    const classes = ['border-amber-200', 'border-amber-200', 'border-amber-200', 'border-amber-200'];
    return classes[idx % classes.length];
  };

  // Define all comparison sections with complete fields
  const comparisonSections = [
    {
      title: 'Basic Information',
      icon: <Shield className="w-5 h-5" />,
      fields: [
        { label: 'Product Name', key: 'name' },
        { label: 'Brand', key: 'brand' },
        { label: 'Pattern', key: 'pattern' },
        { label: 'Model Number', key: 'modelNumber' },
        { label: 'Category', key: 'category' },
        { label: 'Tire Type', key: 'tireType' },
      ]
    },
    {
      title: 'Dimensions & Physical',
      icon: <Ruler className="w-5 h-5" />,
      fields: [
        { label: 'Tire Size', key: 'size' },
        { label: 'Overall Diameter', key: 'overallDiameter', unit: 'inch' },
        { label: 'Section Width', key: 'sectionWidth', unit: 'inch' },
        { label: 'Standard Rim', key: 'stdRim' },
        { label: 'Static Load Radius', key: 'staticLoadRadius', unit: 'inch' },
        { label: 'Weight', key: 'weight' },
      ]
    },
    {
      title: 'Performance Ratings',
      icon: <SpeedGauge className="w-5 h-5" />,
      fields: [
        { label: 'Load Range', key: 'loadRange' },
        { label: 'Ply Rating', key: 'plyRating' },
        { label: 'Load Index', key: 'loadIndex' },
        { label: 'Speed Rating', key: 'speedRating' },
        { label: 'Tread Depth', key: 'treadDepth', unit: '32nds' },
        { label: 'Revs per km', key: 'revsPerKm' },
      ]
    },
    {
      title: 'Load & Pressure',
      icon: <Weight className="w-5 h-5" />,
      fields: [
        { label: 'Single Max Load', key: 'singleMaxLoad' },
        { label: 'Single Max Pressure', key: 'singleMaxPressure', unit: 'psi' },
        { label: 'Dual Max Load', key: 'dualMaxLoad' },
        { label: 'Dual Max Pressure', key: 'dualMaxPressure', unit: 'psi' },
      ]
    },
    {
      title: 'Applications & Usage',
      icon: <Truck className="w-5 h-5" />,
      fields: [
        { label: 'Applications', key: 'applications' },
        { label: 'Vehicle Types', key: 'vehicleTypes' },
        { label: 'Construction', key: 'construction' },
      ]
    },
    {
      title: 'Pricing',
      icon: <ShoppingBag className="w-5 h-5" />,
      fields: [
        { label: 'Regular Price', key: 'price' },
        { label: 'Offer Price', key: 'offerPrice' },
      ]
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading comparison data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Go Back
            </button>
            <Link
              href="/tires"
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              Browse Tires
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (products.length < 2) {
    return null;
  }

  // Calculate column width based on number of products
  const getColumnWidth = () => {
    const count = products.length;
    if (count === 2) return 'w-1/3';
    if (count === 3) return 'w-1/4';
    return 'w-1/5';
  };

  // Get color for product card
  const getProductCardColor = (idx) => {
    const colors = ['from-amber-500 to-amber-600', 'from-amber-500 to-amber-600', 'from-amber-500 to-amber-600', 'from-amber-500 to-amber-600'];
    return colors[idx % colors.length];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-amber-500 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <GitCompare className="w-6 h-6" />
                <h1 className="text-xl md:text-2xl font-bold">
                  Compare Products ({products.length}/{products.length === 2 ? '2' : products.length === 3 ? '3' : '4'})
                </h1>
              </div>
            </div>
            <Link
              href="/tires"
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm font-medium"
            >
              Browse More Tires
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Product Summary Cards */}
        <div className={`grid gap-6 mb-8 ${
          products.length === 2 ? 'md:grid-cols-2' : 
          products.length === 3 ? 'md:grid-cols-3' : 
          'md:grid-cols-2 lg:grid-cols-4'
        }`}>
          {products.map((product, idx) => {
            const spec = getTireSpec(product);
            return (
              <div key={idx} className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 ${getProductClass(idx)}`}>
                <div className={`relative h-56 bg-gradient-to-br ${getProductCardColor(idx)}/10`}>
                  <img
                    src={getProductImage(product) || 'https://via.placeholder.com/400x400?text=No+Image'}
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                  />
                  {product.tireType && (
                    <div className={`absolute top-4 left-4 ${getTireTypeColor(product.tireType)} px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 shadow-md`}>
                      {getTireTypeIcon(product.tireType)}
                      <span className="capitalize">{product.tireType}</span>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      const newIds = products.filter((_, i) => i !== idx).map(p => getProductId(p));
                      router.push(`/compare?ids=${newIds.join(',')}`);
                    }}
                    className="absolute top-4 right-4 p-1.5 bg-white/90 rounded-full hover:bg-red-100 transition-colors shadow-md"
                  >
                    <X className="w-4 h-4 text-gray-600 hover:text-red-600" />
                  </button>
                </div>
                <div className="p-5">
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {product.brand && (
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {product.brand}
                        </span>
                      )}
                      {product.pattern && product.brand && (
                        <span className="text-gray-300">•</span>
                      )}
                      {product.pattern && (
                        <span className="text-xs text-gray-500">{product.pattern}</span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                      {product.name}
                    </h2>
                    {spec.size && (
                      <div className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                        <Gauge className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-sm font-semibold text-gray-700">{spec.size}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    {product.offerPrice ? (
                      <>
                        <span className="text-2xl font-bold text-red-600">
                          {formatPrice(product.offerPrice)}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(product.price)}
                        </span>
                      </>
                    ) : product.price ? (
                      <span className="text-2xl font-bold text-gray-800">
                        {formatPrice(product.price)}
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-amber-600">Request Quote</span>
                    )}
                  </div>
                  <Link
                    href={`/product/${getProductId(product)}`}
                    className="block w-full bg-amber-600 text-white text-center py-2.5 rounded-xl font-semibold hover:bg-amber-700 transition-colors text-sm"
                  >
                    View Full Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Comparison Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-amber-600" />
              Detailed Specifications Comparison
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Comparing {products.length} products side by side
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <tbody>
                {comparisonSections.map((section, sectionIdx) => (
                  <>
                    {/* Section Header */}
                    <tr key={`section-${sectionIdx}`} className="bg-gray-100">
                      <td className="px-6 py-4 font-bold text-gray-800 sticky left-0 bg-gray-100 min-w-[200px]">
                        <div className="flex items-center gap-2">
                          {section.icon}
                          {section.title}
                        </div>
                      </td>
                      {products.map((_, idx) => (
                        <td key={`section-header-${idx}`} className="px-6 py-4 font-semibold text-gray-600 text-center">
                          Product {idx + 1}
                        </td>
                      ))}
                    </tr>
                    
                    {/* Section Fields */}
                    {section.fields.map((field, fieldIdx) => {
                      const isAnyDifferent = products.some((_, idx) => isDifferent(idx, field.key));
                      return (
                        <tr key={`field-${sectionIdx}-${fieldIdx}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-700 sticky left-0 bg-white min-w-[200px]">
                            {field.label}
                          </td>
                          {products.map((product, idx) => {
                            const different = isDifferent(idx, field.key);
                            const value = getProductValue(product, field.key);
                            return (
                              <td 
                                key={`value-${idx}`} 
                                className={`px-6 py-4 text-center ${different && isAnyDifferent ? 'bg-yellow-50' : ''}`}
                              >
                                <div className="flex items-center justify-center gap-2">
                                  {different && isAnyDifferent && (
                                    <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                                  )}
                                  <span className={`${different && isAnyDifferent ? 'font-semibold text-gray-900' : 'text-gray-600'} text-sm`}>
                                    {value}
                                  </span>
                                </div>
                               </td>
                            );
                          })}
                         </tr>
                      );
                    })}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommendation & Summary Section */}
        <div className="mt-8 bg-gradient-to-r from-amber-50 to-indigo-50 rounded-2xl p-6 border border-amber-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            Comparison Summary
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Key Differences */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Key Differences
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                {products.length >= 2 && (
                  <>
                    {products.some((p, i) => i > 0 && getTireSpec(p).size !== getTireSpec(products[0]).size) && (
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500">•</span>
                        <span><strong>Different tire sizes:</strong> {products.map((p, i) => `${getTireSpec(p).size || 'N/A'}`).join(' vs ')}</span>
                      </li>
                    )}
                    {products.some((p, i) => i > 0 && p.brand !== products[0].brand) && (
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500">•</span>
                        <span><strong>Different brands:</strong> {products.map(p => p.brand || 'N/A').join(' vs ')}</span>
                      </li>
                    )}
                    {products.some((p, i) => i > 0 && getTireSpec(p).loadIndex !== getTireSpec(products[0]).loadIndex) && (
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500">•</span>
                        <span><strong>Different load capacity:</strong> {products.map(p => getTireSpec(p).loadIndex || 'N/A').join(' vs ')}</span>
                      </li>
                    )}
                    {products.some((p, i) => i > 0 && getTireSpec(p).speedRating !== getTireSpec(products[0]).speedRating) && (
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500">•</span>
                        <span><strong>Different speed ratings:</strong> {products.map(p => getTireSpec(p).speedRating || 'N/A').join(' vs ')}</span>
                      </li>
                    )}
                    {products.some((p, i) => i > 0 && p.tireType !== products[0].tireType) && (
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500">•</span>
                        <span><strong>Different tire types:</strong> {products.map(p => p.tireType || 'N/A').join(' vs ')}</span>
                      </li>
                    )}
                  </>
                )}
                {!products.some((p, i) => i > 0 && getTireSpec(p).size !== getTireSpec(products[0]).size) && 
                 !products.some((p, i) => i > 0 && p.brand !== products[0].brand) && 
                 !products.some((p, i) => i > 0 && getTireSpec(p).loadIndex !== getTireSpec(products[0]).loadIndex) && (
                  <li className="text-gray-500">No major differences found. Products have similar specifications.</li>
                )}
              </ul>
            </div>
            
            {/* Recommendation */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                Recommendation
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Based on your comparison:
              </p>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>For <strong>heavy loads</strong>, choose the tire with higher load index</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>For <strong>highway driving</strong>, consider speed rating and fuel efficiency</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>For <strong>off-road use</strong>, look at tread depth and construction type</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>For <strong>budget-conscious</strong>, compare offer prices and volume discounts</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Share Comparison Link */}
          <div className="mt-6 pt-4 border-t border-amber-200 flex justify-between items-center flex-wrap gap-3">
            <p className="text-xs text-gray-500">
              Share this comparison with your team
            </p>
            <button
              onClick={() => {
                const url = `${window.location.origin}/compare?ids=${idsParam}`;
                navigator.clipboard.writeText(url);
                alert('Comparison link copied to clipboard!');
              }}
              className="px-4 py-2 bg-white text-amber-600 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors border border-amber-200"
            >
              Copy Comparison Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
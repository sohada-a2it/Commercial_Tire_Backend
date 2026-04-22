// app/compare/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  X, Truck, Gauge, Battery, Shield, TrendingUp, 
  ShoppingBag, AlertCircle, ChevronLeft, GitCompare,
  Check, XCircle, ArrowLeft
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

  // Fetch products using existing catalogService
  useEffect(() => {
    if (!idsParam) {
      setError('No products selected for comparison');
      setLoading(false);
      return;
    }

    const productIds = idsParam.split(',');
    if (productIds.length !== 2) {
      setError('Please select exactly 2 products to compare');
      setLoading(false);
      return;
    }

    const fetchProductsForComparison = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch both products using your existing fetchProduct function
        const productPromises = productIds.map(id => fetchProduct(id));
        const results = await Promise.all(productPromises);
        
        const validProducts = results.filter(result => result.success && result.product);
        
        if (validProducts.length !== 2) {
          setError(`Could not fetch both products. Found ${validProducts.length} of 2.`);
          setLoading(false);
          return;
        }
        
        const fetchedProducts = validProducts.map(result => result.product);
        setProducts(fetchedProducts);
        
        // Optional: Use your compareTires API for enhanced comparison
        const compareResult = await compareTires(productIds);
        if (compareResult.success) {
          setComparisonData(compareResult.comparison);
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

  const getTireTypeIcon = (tireType) => {
    const type = tireType?.toLowerCase() || '';
    if (type.includes('steer')) return <Truck className="w-5 h-5" />;
    if (type.includes('drive')) return <Battery className="w-5 h-5" />;
    if (type.includes('trailer')) return <ShoppingBag className="w-5 h-5" />;
    return <Shield className="w-5 h-5" />;
  };

  const getTireTypeColor = (tireType) => {
    const type = tireType?.toLowerCase() || '';
    if (type.includes('steer')) return 'bg-blue-100 text-blue-700';
    if (type.includes('drive')) return 'bg-green-100 text-green-700';
    if (type.includes('trailer')) return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-700';
  };

  const formatPrice = (price) => {
    if (!price) return 'Contact for price';
    const numericPrice = parseFloat(String(price).replace(/[^0-9.-]/g, ''));
    if (isNaN(numericPrice)) return String(price);
    return `$${numericPrice.toLocaleString()}`;
  };

  const getValueByKey = (product, key) => {
    switch(key) {
      case 'price':
        return formatPrice(product.price);
      case 'offerPrice':
        return product.offerPrice ? formatPrice(product.offerPrice) : 'N/A';
      case 'tireSize':
        return product.tireSpecs?.size || 'N/A';
      case 'loadIndex':
        return product.tireSpecs?.loadIndex || 'N/A';
      case 'speedRating':
        return product.tireSpecs?.speedRating || 'N/A';
      case 'treadDepth':
        return product.tireSpecs?.treadDepth || 'N/A';
      case 'applications': {
        const apps = product.applicationsList || product.application || [];
        return Array.isArray(apps) ? apps.join(', ') : 'N/A';
      }
      default:
        return product[key] || 'N/A';
    }
  };

  const isDifferent = (product1, product2, key) => {
    if (!product1 || !product2) return false;
    return getValueByKey(product1, key) !== getValueByKey(product2, key);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Tires
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (products.length !== 2) {
    return null;
  }

  const [product1, product2] = products;

  // Define comparison fields
  const basicFields = [
    { label: 'Brand', key: 'brand' },
    { label: 'Pattern', key: 'pattern' },
    { label: 'Model Number', key: 'modelNumber' },
    { label: 'Tire Type', key: 'tireType' },
  ];

  const technicalFields = [
    { label: 'Tire Size', key: 'tireSize' },
    { label: 'Load Index', key: 'loadIndex' },
    { label: 'Speed Rating', key: 'speedRating' },
    { label: 'Tread Depth', key: 'treadDepth' },
    { label: 'Applications', key: 'applications' },
    { label: 'Price', key: 'price' },
    { label: 'Offer Price', key: 'offerPrice' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <GitCompare className="w-6 h-6" />
                <h1 className="text-xl md:text-2xl font-bold">Compare Products</h1>
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
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Product 1 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100">
              <img
                src={getProductImage(product1) || 'https://via.placeholder.com/400x400?text=No+Image'}
                alt={product1.name}
                className="w-full h-full object-contain p-4"
              />
              {product1.tireType && (
                <div className={`absolute top-4 left-4 ${getTireTypeColor(product1.tireType)} px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2`}>
                  {getTireTypeIcon(product1.tireType)}
                  <span className="capitalize">{product1.tireType}</span>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {product1.brand && (
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {product1.brand}
                    </span>
                  )}
                  {product1.pattern && product1.brand && (
                    <span className="text-gray-300">•</span>
                  )}
                  {product1.pattern && (
                    <span className="text-xs text-gray-500">{product1.pattern}</span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{product1.name}</h2>
                <div className="flex items-baseline gap-2">
                  {product1.offerPrice ? (
                    <>
                      <span className="text-3xl font-bold text-red-600">
                        {formatPrice(product1.offerPrice)}
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        {formatPrice(product1.price)}
                      </span>
                    </>
                  ) : product1.price ? (
                    <span className="text-3xl font-bold text-gray-800">
                      {formatPrice(product1.price)}
                    </span>
                  ) : (
                    <span className="text-lg font-semibold text-blue-600">Request Quote</span>
                  )}
                </div>
              </div>
              <Link
                href={`/product/${getProductId(product1)}`}
                className="block w-full bg-blue-600 text-white text-center py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                View Full Details
              </Link>
            </div>
          </div>

          {/* Product 2 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100">
              <img
                src={getProductImage(product2) || 'https://via.placeholder.com/400x400?text=No+Image'}
                alt={product2.name}
                className="w-full h-full object-contain p-4"
              />
              {product2.tireType && (
                <div className={`absolute top-4 left-4 ${getTireTypeColor(product2.tireType)} px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2`}>
                  {getTireTypeIcon(product2.tireType)}
                  <span className="capitalize">{product2.tireType}</span>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {product2.brand && (
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {product2.brand}
                    </span>
                  )}
                  {product2.pattern && product2.brand && (
                    <span className="text-gray-300">•</span>
                  )}
                  {product2.pattern && (
                    <span className="text-xs text-gray-500">{product2.pattern}</span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{product2.name}</h2>
                <div className="flex items-baseline gap-2">
                  {product2.offerPrice ? (
                    <>
                      <span className="text-3xl font-bold text-red-600">
                        {formatPrice(product2.offerPrice)}
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        {formatPrice(product2.price)}
                      </span>
                    </>
                  ) : product2.price ? (
                    <span className="text-3xl font-bold text-gray-800">
                      {formatPrice(product2.price)}
                    </span>
                  ) : (
                    <span className="text-lg font-semibold text-blue-600">Request Quote</span>
                  )}
                </div>
              </div>
              <Link
                href={`/product/${getProductId(product2)}`}
                className="block w-full bg-blue-600 text-white text-center py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                View Full Details
              </Link>
            </div>
          </div>
        </div>

        {/* Detailed Comparison Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-blue-600" />
              Detailed Specifications Comparison
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {/* Basic Information Section */}
                <tr className="bg-gray-50">
                  <td colSpan={3} className="px-6 py-4">
                    <h4 className="font-bold text-gray-800 text-lg">Basic Information</h4>
                  </td>
                </tr>
                
                {basicFields.map((field) => {
                  const different = isDifferent(product1, product2, field.key);
                  const value1 = getValueByKey(product1, field.key);
                  const value2 = getValueByKey(product2, field.key);
                  
                  return (
                    <tr key={field.key} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-700 w-1/4 bg-gray-50/50">
                        {field.label}
                      </td>
                      <td className={`px-6 py-4 w-[37.5%] ${different ? 'bg-yellow-50' : ''}`}>
                        <div className="flex items-center gap-2">
                          {different && <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                          <span className={different ? 'font-semibold text-gray-900' : 'text-gray-600'}>
                            {value1}
                          </span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 w-[37.5%] ${different ? 'bg-yellow-50' : ''}`}>
                        <div className="flex items-center gap-2">
                          {different && <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                          <span className={different ? 'font-semibold text-gray-900' : 'text-gray-600'}>
                            {value2}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* Technical Specifications Section */}
                <tr className="bg-gray-50">
                  <td colSpan={3} className="px-6 py-4">
                    <h4 className="font-bold text-gray-800 text-lg">Technical Specifications</h4>
                  </td>
                </tr>
                
                {technicalFields.map((field) => {
                  const different = isDifferent(product1, product2, field.key);
                  const value1 = getValueByKey(product1, field.key);
                  const value2 = getValueByKey(product2, field.key);
                  
                  return (
                    <tr key={field.key} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-700 w-1/4 bg-gray-50/50">
                        {field.label}
                      </td>
                      <td className={`px-6 py-4 w-[37.5%] ${different ? 'bg-yellow-50' : ''}`}>
                        <div className="flex items-center gap-2">
                          {different && <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                          <span className={different ? 'font-semibold text-gray-900' : 'text-gray-600'}>
                            {value1}
                          </span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 w-[37.5%] ${different ? 'bg-yellow-50' : ''}`}>
                        <div className="flex items-center gap-2">
                          {different && <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                          <span className={different ? 'font-semibold text-gray-900' : 'text-gray-600'}>
                            {value2}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommendation Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Comparison Summary
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4">
              <div className="font-semibold text-gray-800 mb-2">Key Differences:</div>
              <ul className="space-y-2 text-sm text-gray-600">
                {product1.tireSpecs?.size !== product2.tireSpecs?.size && (
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Different tire sizes: <strong>{product1.tireSpecs?.size || 'N/A'}</strong> vs <strong>{product2.tireSpecs?.size || 'N/A'}</strong></span>
                  </li>
                )}
                {product1.brand !== product2.brand && (
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Different brands: <strong>{product1.brand || 'N/A'}</strong> vs <strong>{product2.brand || 'N/A'}</strong></span>
                  </li>
                )}
                {product1.tireSpecs?.loadIndex !== product2.tireSpecs?.loadIndex && (
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Different load capacity: <strong>{product1.tireSpecs?.loadIndex || 'N/A'}</strong> vs <strong>{product2.tireSpecs?.loadIndex || 'N/A'}</strong></span>
                  </li>
                )}
                {product1.tireSpecs?.speedRating !== product2.tireSpecs?.speedRating && (
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Different speed ratings: <strong>{product1.tireSpecs?.speedRating || 'N/A'}</strong> vs <strong>{product2.tireSpecs?.speedRating || 'N/A'}</strong></span>
                  </li>
                )}
              </ul>
            </div>
            <div className="bg-white rounded-xl p-4">
              <div className="font-semibold text-gray-800 mb-2">Recommendation:</div>
              <p className="text-sm text-gray-600">
                Based on your comparison, choose the tire that best fits your specific needs. 
                Consider factors like load requirements, road conditions, and budget.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
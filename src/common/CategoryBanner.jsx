// components/CategoryBanner.jsx
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const CategoryBanner = ({ category, products }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Get banner info based on category
  const getBannerInfo = () => {
    const bannerData = {
      'Vehicle Parts and Accessories': {
        bgColor: 'from-blue-100 to-blue-50',
        image: '/assets/category_banner/vehicle-banner.png'
      },
      'Frozen Fish': {
        title: 'Fresh from the Ocean',
        subtitle: 'Premium quality frozen seafood delivered to your doorstep.',
        bgColor: 'from-cyan-100 to-cyan-50',
        image: '/assets/category_banner/fish-banner.png'
      },
      'Metals and Metal Products': {
        title: 'Industrial Grade Quality',
        subtitle: 'High-purity metals for all your industrial needs.',
        bgColor: 'from-gray-100 to-gray-50',
        image: '/assets/category_banner/metal-banner.png'
      },
      'Dry Food': {
        title: 'Nature\'s Best Selection',
        subtitle: 'Premium quality dry foods from farm to table.',
        bgColor: 'from-amber-100 to-amber-50',
        image: '/assets/category_banner/food-banner.png'
      },
      'Agriculture': {
        title: 'Farm Fresh Produce',
        subtitle: 'Organic and fresh agricultural products delivered daily.',
        bgColor: 'from-green-100 to-green-50',
        image: '/assets/category_banner/agriculture-banner.png'
      }
    };
    return bannerData[category] || bannerData['Vehicle Parts and Accessories'];
  };

  const bannerInfo = getBannerInfo();
  
  // Select products from different brands to ensure variety
  const selectDiverseProducts = (products) => {
    if (!products || products.length === 0) return [];
    
    const brands = ['Bridgestone', 'Michelin', 'Firestone', 'Goodyear', 'Double Coin'];
    const selectedProducts = [];
    const usedBrands = new Set();
    
    // First pass: Try to get one product from each brand
    for (const brand of brands) {
      const productFromBrand = products.find(
        p => p.keyAttributes?.Brand === brand && !usedBrands.has(brand)
      );
      if (productFromBrand) {
        selectedProducts.push(productFromBrand);
        usedBrands.add(brand);
      }
    }
    
    // If we need more products, add remaining ones
    if (selectedProducts.length < 5) {
      const remainingProducts = products.filter(p => !selectedProducts.includes(p));
      selectedProducts.push(...remainingProducts.slice(0, 5 - selectedProducts.length));
    }
    
    return selectedProducts.slice(0, 5);
  };
  
  const displayProducts = selectDiverseProducts(products);

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      handleNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayProducts.length);
  };

  const getVisibleProducts = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % displayProducts.length;
      visible.push({ ...displayProducts[index], position: i });
    }
    return visible;
  };

  const getCardScale = (position) => {
    if (position === 0) return 'scale-110 z-20'; // Big
    return 'scale-90 z-10'; // Small
  };

  const getCardOpacity = (position) => {
    if (position === 0) return 'opacity-100';
    return 'opacity-70';
  };

  return (
    <div className="relative w-full h-[500px] lg:h-[550px] overflow-hidden rounded-lg max-w-7xl mx-auto">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bannerInfo.image}
          alt={category}
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50"></div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-between py-8">
        {/* Top Section - Text Content */}
        <div className="space-y-4 text-white max-w-2xl">
          <h1 className="text-4xl lg:text-5xl font-bold drop-shadow-lg">
            {bannerInfo.title}
          </h1>
          <p className="text-lg lg:text-xl drop-shadow-md">
            {bannerInfo.subtitle}
          </p>
        </div>

        {/* Bottom Section - Product Slider */}
        <div className="relative w-full">
          <div className="flex items-end justify-center">
            {/* Product Cards Container */}
            <div className="relative flex items-end justify-center w-full">
              <div className="flex items-end justify-center gap-4 lg:gap-6">
                {getVisibleProducts().map((product, idx) => (
                  <div
                    key={`${product.id}-${idx}`}
                    className={`
                      transition-all duration-500 ease-in-out
                      ${getCardScale(product.position)}
                      ${getCardOpacity(product.position)}
                    `}
                  >
                    <ProductCard product={product} isMain={product.position === 0} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6 pb-2">
            {displayProducts.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentIndex(idx);
                }}
                className={`
                  w-2 h-2 rounded-full transition-all duration-300
                  ${currentIndex === idx ? 'bg-white w-8' : 'bg-white/60'}
                `}
                aria-label={`Go to product ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Product Card with half-in, half-out image (like the reference image)
const ProductCard = ({ product, isMain }) => {
  const getAverageRating = () => {
    if (!product.userReviews || product.userReviews.length === 0) return 0;
    const sum = product.userReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / product.userReviews.length).toFixed(1);
  };

  const rating = getAverageRating();
  const reviewCount = product.userReviews?.length || 0;

  return (
    <div className={`relative ${isMain ? 'h-[240px] w-[380px]' : 'h-[220px] w-[340px]'}`}>
      {/* Product Card Container */}
      <div className="bg-white rounded-[16px] shadow-lg h-full overflow-visible flex relative">

        {/* Left Side - Large Image that's half in, half out */}
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 ${isMain ? 'w-52 h-52 -translate-x-20' : 'w-44 h-44 -translate-x-16'}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>

        {/* Right Side - Product Info */}
        <div className={`ml-auto ${isMain ? 'w-[240px] px-2 py-4' : 'w-[210px] px-4 py-3'} flex flex-col justify-between`}>
          {/* Top Info */}
          <div>
            {/* Brand Name */}
            <h3 className={`font-bold text-gray-900 ${isMain ? 'text-lg' : 'text-base'} leading-none mb-0.5`}>
              {product.keyAttributes?.Brand || 'Premium'}
            </h3>
            
            {/* Product Name/Model */}
            <p className={`${isMain ? 'text-sm' : 'text-xs'} text-gray-600 leading-tight`}>
              {product.keyAttributes?.Model || product.name}
            </p>
          </div>

          {/* Bottom Info */}
          <div>
            {/* Price */}
            <div className="mb-1.5">
              <div className="flex items-baseline gap-1">
                <span className={`font-bold text-gray-900 ${isMain ? 'text-3xl' : 'text-2xl'} leading-none`}>
                  {product.offerPrice || product.price}
                </span>
                <span className={`${isMain ? 'text-xs' : 'text-[11px]'} text-gray-500`}>per each</span>
              </div>
              {product.offerPrice && (
                <div className={`${isMain ? 'text-sm' : 'text-xs'} text-gray-400 line-through leading-none mt-0.5`}>
                  {product.price}
                </div>
              )}
            </div>

            {/* Rating */}
            {reviewCount > 0 && (
              <div className="flex items-center gap-1.5 mb-2.5">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`${isMain ? 'w-4 h-4' : 'w-3.5 h-3.5'} ${
                        i < Math.floor(rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className={`${isMain ? 'text-xs' : 'text-[11px]'} text-gray-600 font-medium`}>
                  {reviewCount} opinions
                </span>
              </div>
            )}

            {/* Buy Now Button */}
            <button className={`w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold ${isMain ? 'py-2.5 text-sm' : 'py-2 text-xs'} rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2`}>
              <span>🛒</span> Buy now
            </button>
          </div>
        </div>

        {/* Sale Badge */}
        {product.offerPrice && (
          <div className={`absolute ${isMain ? 'top-3 right-3 px-3 py-1.5 text-xs' : 'top-2.5 right-2.5 px-2.5 py-1 text-[10px]'} bg-red-500 text-white font-bold rounded-lg shadow-lg z-20`}>
            SALE
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryBanner;
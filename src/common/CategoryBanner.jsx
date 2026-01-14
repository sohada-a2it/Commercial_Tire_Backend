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
        title: 'Premium Automotive Parts',
        subtitle: 'High-quality parts and accessories for all vehicle types.',
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
  const displayProducts = products.slice(0, 5); // Only show 5 products

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

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displayProducts.length) % displayProducts.length);
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50"></div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => {
          setIsAutoPlaying(false);
          handlePrev();
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all hover:scale-110"
        aria-label="Previous product"
      >
        <ChevronLeft size={24} />
      </button>
      
      <button
        onClick={() => {
          setIsAutoPlaying(false);
          handleNext();
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all hover:scale-110"
        aria-label="Next product"
      >
        <ChevronRight size={24} />
      </button>

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
              <div className="flex items-end justify-center gap-8 lg:gap-12">
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
    <div className={`relative ${isMain ? 'h-64 w-[450px]' : 'h-60 w-[400px]'}`}>
      {/* Product Card Container */}
      <div className="bg-white rounded-xl shadow-2xl h-full overflow-hidden flex">
        {/* Left Side - Image that's half in, half out */}
        <div className="relative w-1/2">
          {/* This creates the half-out effect */}
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-32 h-32">
            <div className="relative w-full h-full">
              {/* Transparent container for image (no background) */}
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Right Side - Product Info */}
        <div className="w-1/2 p-5 flex flex-col justify-between">
          {/* Top Info */}
          <div className="space-y-2">
            {/* Product Name */}
            <h3 className={`font-bold text-gray-900 ${isMain ? 'text-lg' : 'text-base'} leading-tight`}>
              {product.name}
            </h3>
            
            {/* Location/Brand */}
            <div className={`${isMain ? 'text-sm' : 'text-xs'} text-gray-600 font-medium`}>
              {product.keyAttributes?.Brand || product.keyAttributes?.Location || 'Premium'}
            </div>

            {/* Model/Type */}
            <div className={`${isMain ? 'text-xs' : 'text-xs'} text-gray-500 uppercase tracking-wide`}>
              {product.keyAttributes?.Model || product.keyAttributes?.Type || 'Standard'}
            </div>
          </div>

          {/* Bottom Info */}
          <div className="space-y-3">
            {/* Price */}
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-1.5">
                <span className={`font-bold text-gray-900 ${isMain ? 'text-2xl' : 'text-xl'}`}>
                  {product.offerPrice || product.price}
                </span>
                <span className={`text-${isMain ? 'sm' : 'xs'} text-gray-500`}>per each</span>
              </div>
              {product.offerPrice && (
                <div className={`text-${isMain ? 'sm' : 'xs'} text-gray-500 line-through`}>
                  {product.price}
                </div>
              )}
            </div>

            {/* Rating */}
            {reviewCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`${isMain ? 'w-4 h-4' : 'w-3 h-3'} ${
                        i < Math.floor(rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-${isMain ? 'sm' : 'xs'} text-gray-600`}>
                  {reviewCount} opinions
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Sale Badge */}
        {product.offerPrice && (
          <div className={`absolute top-3 right-3 bg-red-500 text-white ${isMain ? 'px-3 py-1 text-sm' : 'px-2 py-1 text-xs'} font-bold rounded-lg`}>
            SALE
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryBanner;
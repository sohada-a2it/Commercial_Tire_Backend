// components/CategoryBanner.jsx
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Star, ShoppingCart } from 'lucide-react';

const CategoryBanner = ({ category, products }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Get banner info based on category
  const getBannerInfo = () => {
    const bannerData = {
      'Vehicle Parts and Accessories': {
        title: 'Best possible choice for you',
        subtitle: 'The pieces stand out for their contemporary enough lines and imposing presence.',
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
        title:  'Nature\'s Best Selection',
        subtitle: 'Premium quality dry foods from farm to table.',
        bgColor: 'from-amber-100 to-amber-50',
        image: '/assets/category_banner/food-banner.png'
      },
      'Agriculture': {
        title: 'Farm Fresh Produce',
        subtitle:  'Organic and fresh agricultural products delivered daily.',
        bgColor: 'from-green-100 to-green-50',
        image:  '/assets/category_banner/agriculture-banner.png'
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
    <div className="relative w-full h-[500px] lg:h-[550px] overflow-hidden rounded-lg">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bannerInfo.image}
          alt={category}
          fill
          className="object-cover"
          priority
        />
        {/* Overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 via-blue-800/50 to-blue-900/80"></div>
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
          <div className="flex items-end justify-center gap-4">
            
            {/* Product Cards Container */}
            <div className="flex-1 relative flex items-end justify-center overflow-hidden max-w-5xl">
              <div className="flex items-end justify-center gap-4 lg:gap-6">
                {getVisibleProducts().map((product, idx) => (
                  <div
                    key={`${product.id}-${idx}`}
                    className={`
                      transition-all duration-500 ease-in-out
                      ${getCardScale(product.position)}
                      ${getCardOpacity(product.position)}
                      ${product.position === 0 ? 'w-64' : 'w-56'}
                    `}
                  >
                    <ProductCard product={product} isMain={product.position === 0} />
                  </div>
                ))}
              </div>
            </div>

            
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-4 pb-2">
            {displayProducts.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentIndex(idx);
                }}
                className={`
                  w-2 h-2 rounded-full transition-all duration-300
                  ${currentIndex === idx ? 'bg-red-500 w-8' : 'bg-white/60'}
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

// Product Card Component
const ProductCard = ({ product, isMain }) => {
  const getAverageRating = () => {
    if (!product.userReviews || product.userReviews.length === 0) return 0;
    const sum = product.userReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / product.userReviews.length).toFixed(1);
  };

  const rating = getAverageRating();
  const reviewCount = product.userReviews?.length || 0;

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden aspect-square flex">
      {/* Left Side - Product Image (50%) */}
      <div className="relative w-1/2 bg-white p-4 flex items-center justify-center">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain"
        />
        {product.offerPrice && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
            SALE
          </div>
        )}
      </div>

      {/* Right Side - Product Info (50%) */}
      <div className="w-1/2 p-4 flex flex-col justify-center space-y-2 bg-white">
        {/* Category Badge */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-blue-600 font-medium uppercase tracking-wide">
            {product.keyAttributes?.Brand || 'Premium'}
          </span>
        </div>

        {/* Product Name */}
        <h3 className={`font-bold text-gray-900 line-clamp-2 leading-tight ${isMain ? 'text-lg' : 'text-base'}`}>
          {product.name}
        </h3>

        {/* Price */}
        <div className="space-y-0.5">
          <div className="flex items-baseline gap-1.5">
            <span className={`font-bold text-gray-900 ${isMain ? 'text-2xl' : 'text-xl'}`}>
              {product.offerPrice || product.price}
            </span>
            <span className="text-xs text-gray-500">per each</span>
          </div>
          {product.offerPrice && (
            <div className="text-xs text-gray-500 line-through">
              {product.price}
            </div>
          )}
        </div>

        {/* Rating */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">
              {reviewCount} opinions
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryBanner;
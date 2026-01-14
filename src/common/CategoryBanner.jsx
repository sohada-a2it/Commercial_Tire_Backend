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
    <div className={`relative w-full bg-gradient-to-r ${bannerInfo.bgColor} overflow-hidden`}>
      <div className="container mx-auto px-4 py-12">
        {/* Banner Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-12">
          {/* Left Side - Text Content */}
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
              {bannerInfo.title}
            </h1>
            <p className="text-lg text-gray-700">
              {bannerInfo.subtitle}
            </p>
          </div>

          {/* Right Side - Banner Image */}
          <div className="relative h-[300px] lg:h-[400px]">
            <Image
              src={bannerInfo.image}
              alt={category}
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Product Slider Section */}
        <div className="relative">
          <div className="flex items-center justify-center gap-8">
            {/* Previous Button */}
            <button
              onClick={() => {
                setIsAutoPlaying(false);
                handlePrev();
              }}
              className="p-3 bg-white rounded-full shadow-lg hover: bg-gray-100 transition-all z-30"
              aria-label="Previous products"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>

            {/* Product Cards Container */}
            <div className="flex-1 relative h-[420px] flex items-center justify-center">
              <div className="flex items-center justify-center gap-6 relative">
                {getVisibleProducts().map((product, idx) => (
                  <div
                    key={`${product.id}-${idx}`}
                    className={`
                      transition-all duration-500 ease-in-out
                      ${getCardScale(product.position)}
                      ${getCardOpacity(product.position)}
                      ${product.position === 0 ? 'w-80' : 'w-64'}
                    `}
                  >
                    <ProductCard product={product} isMain={product.position === 0} />
                  </div>
                ))}
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={() => {
                setIsAutoPlaying(false);
                handleNext();
              }}
              className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-all z-30"
              aria-label="Next products"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {displayProducts.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentIndex(idx);
                }}
                className={`
                  w-2 h-2 rounded-full transition-all duration-300
                  ${currentIndex === idx ? 'bg-red-500 w-8' : 'bg-gray-300'}
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
    if (! product.userReviews || product.userReviews.length === 0) return 0;
    const sum = product.userReviews. reduce((acc, review) => acc + review.rating, 0);
    return (sum / product.userReviews.length).toFixed(1);
  };

  const rating = getAverageRating();
  const reviewCount = product.userReviews?.length || 0;

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-full">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-4"
        />
        {product.offerPrice && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            SALE
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6 space-y-4">
        {/* Category Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {product. keyAttributes?.Brand || 'Premium'}
          </span>
        </div>

        {/* Product Name */}
        <h3 className={`font-bold text-gray-900 line-clamp-2 ${isMain ? 'text-xl' : 'text-lg'}`}>
          {product.name}
        </h3>

        {/* Rating */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {rating} ({reviewCount} opinions)
            </span>
          </div>
        )}

        {/* Price */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className={`font-bold text-gray-900 ${isMain ? 'text-3xl' : 'text-2xl'}`}>
              {product.offerPrice || product.price}
            </span>
            <span className="text-sm text-gray-500">
              {product.keyAttributes?.MOQ ?  `per ${product.keyAttributes.MOQ}` : 'per unit'}
            </span>
          </div>
          {product.offerPrice && (
            <div className="text-sm text-gray-500 line-through">
              {product.price}
            </div>
          )}
        </div>

        {/* Buy Button */}
        <button className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Buy now
        </button>
      </div>
    </div>
  );
};

export default CategoryBanner;
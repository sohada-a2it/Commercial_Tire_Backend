// components/CategoryBanner.jsx
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CategoryBanner = ({ category, products }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { addToCart } = useCart();

  // Get banner info based on category
  const getBannerInfo = () => {
    const bannerData = {
      'Vehicle Parts and Accessories': {
        bgColor: 'from-blue-100 to-blue-50',
        image: '/assets/category_banner/vehicle-banner.png'
      },
      'Frozen Fish': {
        bgColor: 'from-cyan-100 to-cyan-50',
        image: '/assets/category_banner/fish-banner.jpg'
      },
      'Metals and Metal Products': {
        bgColor: 'from-gray-100 to-gray-50',
        image: '/assets/category_banner/metal-banner.png'
      },
      'Dry Food': {
        bgColor: 'from-amber-100 to-amber-50',
        image: '/assets/category_banner/food-banner.png'
      },
      'Agriculture': {
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
    
    const brands = ['Roadlux', 'Michelin', 'Firestone', 'Goodyear', 'Double Coin'];
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
    <div className="relative w-full h-[400px] lg:h-[450px] overflow-hidden rounded-lg max-w-7xl mx-auto">
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/10"></div>
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
        <div className="relative w-full pb-4">
          <div className="flex items-end justify-center">
            {/* Product Cards Container */}
            <div className="relative flex items-end justify-center w-full -mr-10">
              <div className="flex items-end justify-center gap-2 lg:gap-20">
                {getVisibleProducts().map((product, idx) => (
                  <div
                    key={`${product.id}-${idx}`}
                    className={`
                      transition-all duration-500 ease-in-out
                      ${getCardScale(product.position)}
                      ${getCardOpacity(product.position)}
                    `}
                  >
                    <ProductCard product={product} isMain={product.position === 0} addToCart={addToCart} />
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Product Card with half-in, half-out image (like the reference image)
const ProductCard = ({ product, isMain, addToCart }) => {
  const getAverageRating = () => {
    if (!product.userReviews || product.userReviews.length === 0) return 0;
    const sum = product.userReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / product.userReviews.length).toFixed(1);
  };

  const rating = getAverageRating();
  const reviewCount = product.userReviews?.length || 0;
  
  // Check if product is a truck
  const isTruck = product.category?.toLowerCase().includes('truck') || 
                  product.subcategory?.toLowerCase().includes('truck') ||
                  product.name?.toLowerCase().includes('truck');

  return (
    <div className={`relative ${isMain ? 'h-[200px] w-[310px]' : 'h-[180px] w-[260px]'}`}>
      {/* Product Card Container */}
      <div className="bg-white rounded-[16px] shadow-lg h-full overflow-visible relative">
        {/* Season/Category Badge */}
        <div className={`absolute top-3 left-3 ${isMain ? 'text-[11px]' : 'text-[10px]'} text-blue-600 font-semibold flex items-center gap-6 z-20`}>
        </div>

        {/* Large Image that's half in, half out - ABSOLUTE positioned */}
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 ${isMain ? (isTruck ? 'w-44 h-80 -translate-x-24' : 'w-44 h-130 -translate-x-24') : 'w-48 h-130 -translate-x-24'}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>

        {/* Right Side - Product Info - Now takes full width */}
        <div className={`absolute right-0 top-0 bottom-0 ${isMain ? 'w-[240px] px-4 py-4' : 'w-[210px] px-3.5 py-3'} flex flex-col`}>
          {/* Brand Name */}
          <h3 className={`font-bold text-gray-900 ${isMain ? 'text-lg' : 'text-base'} leading-none`}>
            {product.keyAttributes?.Brand || 'Premium'}
          </h3>
          
          {/* Product Name/Model */}
          <p className={`${isMain ? 'text-sm mb-2' : 'text-xs mb-1.5'} text-gray-600 leading-tight`}>
            {product.keyAttributes?.Model || product.name}
          </p>

          {/* Price */}
          <div>
            <div className="flex items-baseline gap-1">
              <span className={`font-bold text-gray-900 ${isMain ? 'text-3xl' : 'text-2xl'} leading-none`}>
                {product.offerPrice || product.price}
              </span>
              <span className={`${isMain ? 'text-xs' : 'text-[11px]'} text-gray-500`}>per each</span>
            </div>
            {product.offerPrice && (
              <div className={`${isMain ? 'text-sm' : 'text-xs'} text-gray-400 line-through leading-none`}>
                {product.price}
              </div>
            )}
          </div>

          {/* Rating */}
          {reviewCount > 0 && (
            <div className="flex items-center gap-1.5 mt-1">
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

          {/* Buy Now Button - Pushed to bottom */}
          <button 
            onClick={() => addToCart(product)}
            className={`w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold ${isMain ? 'py-2.5 text-sm' : 'py-2 text-xs'} rounded-md shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-auto`}
          >
            <ShoppingCart className="w-5 h-5 hover:scale-50" /> Add To Cart
          </button>
        </div>        {/* Sale Badge */}
        {product.offerPrice && (
          <div className={`absolute ${isMain ? 'top-1 right-3 px-3 py-0.5 text-xs' : 'top-2.5 right-2.5 px-2.5 py-1 text-[8px]'} bg-red-500 text-white font-semibold rounded-md shadow-md z-20`}>
            SALE
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryBanner;
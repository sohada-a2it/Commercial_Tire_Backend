// components/ProductCard.jsx
import { Star } from 'lucide-react';

const ProductCard = ({ product, isMain }) => {
  const getAverageRating = () => {
    if (!product.userReviews || product.userReviews.length === 0) return 0;
    const sum = product.userReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / product.userReviews.length).toFixed(1);
  };

  const rating = getAverageRating();
  const reviewCount = product.userReviews?.length || 0;

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden h-64 w-80 relative">
      {/* Left Side - Product Image (50% outside, 50% inside) */}
      <div className="absolute left-0 top-0 bottom-0 w-1/2">
        <div className="relative w-full h-full bg-white">
          <div className="absolute right-0 w-1/2 h-full">
            <div className="relative w-full h-full">
              {/* This creates the effect of image going outside the card */}
              <div className="absolute inset-0 bg-gradient-to-l from-white/50 to-transparent z-10"></div>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain p-4"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Product Info (50% inside card) */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 p-4 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Product Name */}
          <h3 className="font-bold text-gray-900 text-lg leading-tight">
            {product.name}
          </h3>
          
          {/* Location/Brand */}
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-600 font-medium">
              {product.keyAttributes?.Brand || product.keyAttributes?.Location || 'Premium'}
            </span>
          </div>

          {/* Model/Type */}
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            {product.keyAttributes?.Model || product.keyAttributes?.Type || ''}
          </div>
        </div>

        <div className="space-y-3">
          {/* Price */}
          <div className="space-y-0.5">
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-gray-900 text-2xl">
                {product.offerPrice || product.price}
              </span>
              <span className="text-sm text-gray-500">per each</span>
            </div>
            {product.offerPrice && (
              <div className="text-sm text-gray-500 line-through">
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
                    className={`w-4 h-4 ${
                      i < Math.floor(rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {reviewCount} opinions
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Sale Badge (if applicable) */}
      {product.offerPrice && (
        <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold z-20">
          SALE
        </div>
      )}
    </div>
  );
};

export default ProductCard;
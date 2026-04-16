// components/Product/ProductCard.jsx
import React from 'react';

const ProductCard = ({ product, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-gray-100"
    >
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-amber-50 to-gray-100">
        <img
          src={product.image || '/assets/placeholder.png'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-800 group-hover:text-amber-600 transition-colors duration-300 mb-2">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-amber-600">
            ${product.price}
          </span>
          <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all duration-300 text-sm">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
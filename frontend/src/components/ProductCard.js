import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaShoppingCart, FaEye } from 'react-icons/fa';

const ProductCard = ({ product, onLike, onQuickView, user, showOrderButton = true, horizontal = false }) => {
  const productImages = product.images && product.images.length > 0 ? product.images : [];
  const firstImage = productImages[0];

  if (horizontal) {
    // Horizontal layout for store details page
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition flex">
        {/* Image Section */}
        <div 
          className="w-1/3 h-32 bg-gray-200 flex-shrink-0 cursor-pointer relative group"
          onClick={() => onQuickView && onQuickView(product)}
        >
          {firstImage ? (
            <>
              <img src={firstImage} alt={product.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center">
                <FaEye className="text-white text-2xl opacity-0 group-hover:opacity-100 transition" />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-4xl">📦</span>
            </div>
          )}
          {productImages.length > 1 && (
            <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
              +{productImages.length - 1}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <h3 
              className="font-bold text-base mb-1 hover:text-blue-600 transition cursor-pointer line-clamp-1"
              onClick={() => onQuickView && onQuickView(product)}
            >
              {product.name}
            </h3>
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="text-blue-600 font-bold text-lg">{product.price} ر.س</p>
              <button 
                onClick={() => onLike && onLike(product.id)}
                className="text-red-500 hover:scale-110 transition flex items-center gap-1"
              >
                <FaHeart className="text-sm" />
                <span className="text-xs">{product.likes || 0}</span>
              </button>
            </div>

            {showOrderButton && (
              <button
                onClick={() => onQuickView && onQuickView(product)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-semibold transition flex items-center gap-1"
              >
                <FaShoppingCart className="text-xs" />
                اطلب
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Vertical layout (default)
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
      {/* Image */}
      <div 
        className="h-48 bg-gray-200 cursor-pointer relative group"
        onClick={() => onQuickView && onQuickView(product)}
      >
        {firstImage ? (
          <>
            <img src={firstImage} alt={product.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center">
              <FaEye className="text-white text-3xl opacity-0 group-hover:opacity-100 transition" />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-6xl">📦</span>
          </div>
        )}
        {productImages.length > 1 && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
            +{productImages.length - 1} صورة
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 
          className="font-bold text-lg mb-2 hover:text-blue-600 transition cursor-pointer line-clamp-1"
          onClick={() => onQuickView && onQuickView(product)}
        >
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between mb-3">
          <p className="text-blue-600 font-bold text-xl">{product.price} ر.س</p>
          <button 
            onClick={() => onLike && onLike(product.id)}
            className="text-red-500 hover:scale-110 transition flex items-center gap-1"
          >
            <FaHeart className="text-xl" />
            <span className="text-sm font-semibold">{product.likes || 0}</span>
          </button>
        </div>

        {showOrderButton && (
          <button
            onClick={() => onQuickView && onQuickView(product)}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <FaShoppingCart />
            اطلب الآن
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;

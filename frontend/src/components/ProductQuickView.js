import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTimes, FaHeart, FaShoppingCart, FaStore, FaMapMarkerAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const ProductQuickView = ({ product, store, onClose, onLike, user }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const productImages = product?.images && product.images.length > 0 ? product.images : [];

  if (!product) return null;

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Images Section */}
          <div>
            <div className="relative mb-4">
              <button
                onClick={onClose}
                className="absolute top-2 left-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition z-10"
              >
                <FaTimes className="text-gray-600" />
              </button>

              {productImages.length > 0 ? (
                <div className="relative">
                  <div className="h-96 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={productImages[selectedImageIndex]}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {productImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition"
                      >
                        <FaChevronRight className="text-gray-800" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition"
                      >
                        <FaChevronLeft className="text-gray-800" />
                      </button>

                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                        {productImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition ${
                              index === selectedImageIndex ? 'bg-white' : 'bg-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-8xl">📦</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {productImages.slice(0, 4).map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`h-20 rounded-lg overflow-hidden border-2 transition ${
                      index === selectedImageIndex ? 'border-blue-600' : 'border-gray-300'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h2>

            {/* Price & Like */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <div>
                <p className="text-3xl font-bold text-blue-600">{product.price} ر.س</p>
                <p className="text-gray-600 text-sm mt-1">المخزون: {product.stock}</p>
              </div>
              <button
                onClick={() => onLike && onLike(product.id)}
                className="flex items-center gap-2 text-red-500 hover:scale-110 transition"
              >
                <FaHeart className="text-2xl" />
                <span className="font-semibold">{product.likes || 0}</span>
              </button>
            </div>

            {/* Description */}
            <div className="mb-4 flex-1">
              <h3 className="font-bold text-lg mb-2">الوصف</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Category */}
            <div className="mb-4">
              <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
                {product.category}
              </span>
            </div>

            {/* Store Info */}
            {store && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaStore className="text-blue-600" />
                  <h4 className="font-bold">{store.name}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">{store.description}</p>
                <Link
                  to={`/stores/${store.id}`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                >
                  زيارة المتجر ←
                </Link>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <Link
                to={user ? `/messages?receiver=${store?.owner_id}&product=${product.id}` : '/auth'}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold text-lg transition w-full"
              >
                <FaShoppingCart />
                اطلب الآن
              </Link>

              <Link
                to={`/products/${product.id}`}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition w-full"
              >
                عرض التفاصيل الكاملة
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickView;

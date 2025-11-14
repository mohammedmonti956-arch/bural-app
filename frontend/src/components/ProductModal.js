import React from 'react';
import { Link } from 'react-router-dom';
import { FaTimes, FaHeart, FaShoppingCart, FaMapMarkerAlt } from 'react-icons/fa';

const ProductModal = ({ product, store, isOpen, onClose, onLike, user }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} dir="rtl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          {/* الصورة الكبيرة */}
          {product.image && (
            <div className="mb-6">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
          )}

          {/* معلومات المنتج */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">الوصف</h3>
              <p className="text-gray-700 leading-relaxed mb-4">{product.description}</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">السعر:</span>
                  <span className="text-2xl font-bold text-blue-600">{product.price} ر.س</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">المخزون:</span>
                  <span className={`font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `${product.stock} متوفر` : 'نفذت الكمية'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">الفئة:</span>
                  <span className="font-semibold text-gray-900">{product.category}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-gray-600">الإعجابات:</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onLike && onLike(product.id)}
                      className="text-red-500 hover:scale-110 transition"
                    >
                      <FaHeart className="text-xl" />
                    </button>
                    <span className="font-bold text-gray-900">{product.likes || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* معلومات المتجر وأزرار الإجراء */}
            <div>
              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-6 mb-4">
                <h4 className="text-lg font-bold text-gray-900 mb-3">معلومات المتجر</h4>
                <p className="text-gray-700 mb-2"><strong>اسم المتجر:</strong> {store.name}</p>
                <p className="text-gray-700 mb-2"><strong>العنوان:</strong> {store.address}</p>
                {store.phone && (
                  <p className="text-gray-700 mb-2">
                    <strong>الهاتف:</strong> 
                    <a href={`tel:${store.phone}`} className="text-blue-600 hover:text-blue-700 mr-2">
                      {store.phone}
                    </a>
                  </p>
                )}
              </div>

              {/* الأزرار */}
              <div className="space-y-3">
                <Link
                  to={user ? `/messages/${store.owner_id}?product=${product.id}` : '/login'}
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-bold text-lg transition"
                >
                  <FaShoppingCart />
                  اطلب الآن
                </Link>

                <a
                  href={`https://www.google.com/maps?q=${store.latitude},${store.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  <FaMapMarkerAlt />
                  موقع المتجر على الخريطة
                </a>

                <Link
                  to={`/stores/${store.id}`}
                  onClick={onClose}
                  className="w-full block text-center border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-semibold transition"
                >
                  عرض جميع منتجات المتجر
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;

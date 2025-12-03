import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { FaStar, FaMapMarkerAlt, FaHeart, FaRegHeart, FaShoppingCart, FaStore, FaArrowRight } from 'react-icons/fa';

const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchProductData();
  }, [id]);

  const fetchProductData = async () => {
    try {
      // Get all stores to find the product
      const storesRes = await axiosInstance.get('/stores');
      let foundProduct = null;
      let foundStore = null;

      for (const s of storesRes.data) {
        const productsRes = await axiosInstance.get(`/stores/${s.id}/products`);
        foundProduct = productsRes.data.find(p => p.id === id);
        if (foundProduct) {
          foundStore = s;
          break;
        }
      }

      if (foundProduct && foundStore) {
        setProduct(foundProduct);
        setStore(foundStore);
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert('يجب تسجيل الدخول للإعجاب بالمنتج');
      return;
    }
    try {
      await axiosInstance.post(`/products/${id}/like`);
      fetchProductData();
    } catch (error) {
      console.error('Error liking product:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!product || !store) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">المنتج غير موجود</p>
        </div>
      </div>
    );
  }

  const productImages = product.images && product.images.length > 0 ? product.images : [];

  return (
    <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/stores/${store.id}`)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <FaArrowRight />
          <span>العودة إلى المتجر</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Images Section */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {productImages.length > 0 ? (
              <>
                {/* Main Image */}
                <div className="h-96 bg-gray-200">
                  <img
                    src={productImages[selectedImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Image Thumbnails */}
                {productImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50">
                    {productImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`h-24 rounded-lg overflow-hidden border-2 transition ${
                          index === selectedImageIndex
                            ? 'border-blue-600'
                            : 'border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="h-96 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-6xl">📦</span>
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

              {/* Price & Like */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                <div>
                  <p className="text-4xl font-bold text-blue-600">{product.price} ر.س</p>
                  <p className="text-gray-600 mt-1">المخزون: {product.stock}</p>
                </div>
                <button
                  onClick={handleLike}
                  className="flex items-center gap-2 text-red-500 hover:scale-110 transition"
                >
                  <FaHeart className="text-3xl" />
                  <span className="font-semibold text-xl">{product.likes || 0}</span>
                </button>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-2">الوصف</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Category */}
              <div className="mb-6">
                <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
                  {product.category}
                </span>
              </div>

              {/* Order Button */}
              {user ? (
                <Link
                  to={`/messages?receiver=${store.owner_id}&product=${product.id}`}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-semibold text-lg transition w-full mb-4"
                >
                  <FaShoppingCart className="text-xl" />
                  اطلب الآن
                </Link>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-semibold text-lg transition w-full mb-4"
                >
                  <FaShoppingCart className="text-xl" />
                  سجل دخولك للطلب
                </Link>
              )}
            </div>

            {/* Store Info Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaStore className="text-blue-600 text-2xl" />
                <h3 className="font-bold text-xl">معلومات المتجر</h3>
              </div>

              <Link to={`/stores/${store.id}`} className="block hover:bg-gray-50 rounded-lg p-3 transition">
                <h4 className="font-bold text-lg text-blue-600 mb-2">{store.name}</h4>
                <p className="text-gray-600 text-sm mb-3">{store.description}</p>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-500" />
                    <span className="font-semibold">{store.rating.toFixed(1)}</span>
                  </div>

                  <div className="flex items-center gap-1 text-gray-600">
                    <FaMapMarkerAlt />
                    <span>{store.address}</span>
                  </div>
                </div>
              </Link>

              <a
                href={`https://www.google.com/maps?q=${store.latitude},${store.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 mt-4 text-blue-600 hover:text-blue-700 border border-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition"
              >
                <FaMapMarkerAlt />
                موقع المتجر على الخريطة
              </a>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ProductDetails;

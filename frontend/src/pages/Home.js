import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import { FaStore, FaMapMarkedAlt, FaSearch, FaStar } from 'react-icons/fa';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import StoreCard from '../components/StoreCard';
import ProductCard from '../components/ProductCard';
import ProductQuickView from '../components/ProductQuickView';

const Home = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [topStores, setTopStores] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [storesRes, topStoresRes, productsRes] = await Promise.all([
        axiosInstance.get('/stores'),
        axiosInstance.get('/analytics/top-rated-stores?limit=6'),
        axiosInstance.get('/analytics/popular-products?limit=6')
      ]);
      
      // Fetch product images for each store
      const storesWithProducts = await Promise.all(
        topStoresRes.data.map(async (store) => {
          try {
            const productsRes = await axiosInstance.get(`/stores/${store.id}/products`);
            const products = productsRes.data;
            // Get first product image if available
            if (products.length > 0 && products[0].images && products[0].images.length > 0) {
              store.product_image = products[0].images[0];
            }
          } catch (error) {
            console.error('Error fetching products for store:', store.id);
          }
          return store;
        })
      );
      
      setStores(storesRes.data.slice(0, 6));
      setTopStores(storesWithProducts);
      setPopularProducts(productsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">مرحباً بك في بورال</h1>
          <p className="text-xl mb-8 text-gray-300">اكتشف أفضل المتاجر والخدمات القريبة منك</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/stores"
              data-testid="browse-stores-btn"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition flex items-center gap-2"
            >
              <FaStore /> تصفح المتاجر
            </Link>
            <Link
              to="/map"
              data-testid="explore-map-btn"
              className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition flex items-center gap-2"
            >
              <FaMapMarkedAlt /> استكشف الخريطة
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-gray-50 rounded-lg" data-testid="feature-stores">
            <div className="text-4xl mb-4 text-blue-600"><FaStore className="mx-auto" /></div>
            <h3 className="text-xl font-bold mb-2">متاجر متنوعة</h3>
            <p className="text-gray-600">اكتشف مجموعة واسعة من المتاجر في منطقتك</p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-lg" data-testid="feature-map">
            <div className="text-4xl mb-4 text-blue-600"><FaMapMarkedAlt className="mx-auto" /></div>
            <h3 className="text-xl font-bold mb-2">خرائط تفاعلية</h3>
            <p className="text-gray-600">تصفح المتاجر على الخريطة بسهولة</p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-lg" data-testid="feature-reviews">
            <div className="text-4xl mb-4 text-blue-600"><FaStar className="mx-auto" /></div>
            <h3 className="text-xl font-bold mb-2">تقييمات موثوقة</h3>
            <p className="text-gray-600">اقرأ تقييمات المستخدمين الحقيقية</p>
          </div>
        </div>
      </div>

      {/* Top Rated Stores */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">المتاجر الأعلى تقييماً ⭐</h2>
          <Link to="/stores" className="text-blue-600 hover:text-blue-700 font-semibold">عرض الكل ←</Link>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : topStores.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topStores.map((store) => (
              <StoreCard key={store.id} store={store} showProductImage={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FaStore className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">لا توجد متاجر حالياً</p>
          </div>
        )}
      </div>

      {/* Popular Products */}
      {popularProducts.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-8 bg-gray-100">
          <h2 className="text-3xl font-bold mb-6">المنتجات الأكثر إعجاباً 🔥</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition">
                {product.image && (
                  <div className="h-48 bg-gray-200">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-bold text-xl">{product.price} ر.س</span>
                    <div className="flex items-center gap-1 text-red-500">
                      <FaStar />
                      <span className="font-bold">{product.likes || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
};

export default Home;
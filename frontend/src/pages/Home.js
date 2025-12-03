import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import StoreCard from '../components/StoreCard';
import ProductCard from '../components/ProductCard';
import ProductQuickView from '../components/ProductQuickView';
import { FaStore, FaBox, FaMapMarkedAlt, FaArrowLeft } from 'react-icons/fa';

const Home = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const storesRes = await axiosInstance.get('/stores');
      const storesData = storesRes.data.slice(0, 6);
      
      // Fetch products from all stores
      const allProducts = [];
      const allServices = [];
      
      for (const store of storesData) {
        try {
          const [productsRes, servicesRes] = await Promise.all([
            axiosInstance.get(`/stores/${store.id}/products`),
            axiosInstance.get(`/stores/${store.id}/services`)
          ]);
          
          // Add store info to products and services
          productsRes.data.forEach(p => allProducts.push({ ...p, store }));
          servicesRes.data.forEach(s => allServices.push({ ...s, store }));
        } catch (err) {
          console.error('Error fetching store data:', err);
        }
      }
      
      setStores(storesData);
      setProducts(allProducts.slice(0, 6));
      setServices(allServices.slice(0, 6));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">مرحباً بك في Boral</h1>
          <p className="text-xl mb-8 text-blue-100">اكتشف أفضل المتاجر والخدمات المحلية</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/stores"
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition"
            >
              تصفح المتاجر
            </Link>
            <Link
              to="/map"
              className="bg-blue-500 hover:bg-blue-400 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              عرض الخريطة
            </Link>
          </div>
        </div>
      </div>

      {/* Main 3 Components Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* 1. Products Component */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaBox className="text-2xl" />
                <h2 className="text-xl font-bold">المنتجات</h2>
              </div>
              <Link to="/search" className="text-sm hover:underline">
                عرض الكل <FaArrowLeft className="inline" />
              </Link>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {products.length > 0 ? (
                products.map((product) => (
                  <div
                    key={product.id}
                    className="flex gap-3 border-b border-gray-100 pb-3 cursor-pointer hover:bg-gray-50 rounded p-2 transition"
                    onClick={() => {
                      setSelectedProduct(product);
                      setSelectedStore(product.store);
                    }}
                  >
                    <div className="w-20 h-20 bg-gray-200 rounded flex-shrink-0">
                      {product.images && product.images[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">📦</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
                      <p className="text-xs text-gray-600 line-clamp-1">{product.store?.name}</p>
                      <p className="text-blue-600 font-bold mt-1">{product.price} ر.س</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FaBox className="text-4xl mx-auto mb-2" />
                  <p>لا توجد منتجات</p>
                </div>
              )}
            </div>
          </div>

          {/* 2. Services Component */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaStore className="text-2xl" />
                <h2 className="text-xl font-bold">الخدمات</h2>
              </div>
              <Link to="/services" className="text-sm hover:underline">
                عرض الكل <FaArrowLeft className="inline" />
              </Link>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {services.length > 0 ? (
                services.map((service) => (
                  <Link
                    key={service.id}
                    to={service.store ? `/stores/${service.store.id}` : '/services'}
                    className="flex gap-3 border-b border-gray-100 pb-3 hover:bg-gray-50 rounded p-2 transition block"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded flex-shrink-0 flex items-center justify-center text-white text-3xl">
                      ⚙️
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-1">{service.name}</h3>
                      <p className="text-xs text-gray-600 line-clamp-1">{service.store?.name}</p>
                      <p className="text-purple-600 font-bold mt-1">{service.price} ر.س</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FaStore className="text-4xl mx-auto mb-2" />
                  <p>لا توجد خدمات</p>
                </div>
              )}
            </div>
          </div>

          {/* 3. Map Component */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaMapMarkedAlt className="text-2xl" />
                <h2 className="text-xl font-bold">الخريطة</h2>
              </div>
              <Link to="/map" className="text-sm hover:underline">
                عرض كامل <FaArrowLeft className="inline" />
              </Link>
            </div>
            <div className="p-4">
              <Link
                to="/map"
                className="block relative h-80 bg-gray-100 rounded overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500 opacity-20"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <FaMapMarkedAlt className="text-6xl text-green-600 mb-4 group-hover:scale-110 transition" />
                  <p className="text-xl font-bold text-gray-700">اكتشف المتاجر</p>
                  <p className="text-gray-600 mt-2">على الخريطة</p>
                  <div className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg font-semibold group-hover:bg-green-700 transition">
                    فتح الخريطة
                  </div>
                </div>
                {stores.length > 0 && (
                  <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-90 rounded-lg p-3">
                    <p className="text-sm font-semibold text-gray-700">
                      📍 {stores.length} متجر متاح
                    </p>
                  </div>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stores Section */}
      {stores.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-8 bg-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">المتاجر المميزة</h2>
            <Link to="/stores" className="text-blue-600 hover:text-blue-700 font-semibold">
              عرض الكل <FaArrowLeft className="inline" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} showOwnerAvatar={true} />
            ))}
          </div>
        </div>
      )}

      {/* Product Quick View Modal */}
      {selectedProduct && (
        <ProductQuickView
          product={selectedProduct}
          store={selectedStore}
          onClose={() => {
            setSelectedProduct(null);
            setSelectedStore(null);
          }}
          user={user}
        />
      )}

      <BottomNavigation />
    </div>
  );
};

export default Home;
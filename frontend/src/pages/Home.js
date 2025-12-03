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
    <div className="min-h-screen bg-white pb-20" dir="rtl">
      <Header />

      {/* Hero Section */}
      <div className="bg-white py-12 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">مرحباً بك في Boral</h1>
            <p className="text-xl text-gray-600">اكتشف أفضل المتاجر والخدمات المحلية</p>
          </div>

          {/* Three Main Icons */}
          <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
            {/* Products Icon */}
            <Link
              to="/search"
              className="flex flex-col items-center gap-4 p-8 bg-white border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-lg transition group"
            >
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-500 transition">
                <FaBox className="text-4xl text-blue-500 group-hover:text-white transition" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg text-gray-900">المنتجات</h3>
                <p className="text-sm text-gray-600 mt-1">{products.length} منتج</p>
              </div>
            </Link>

            {/* Services Icon */}
            <Link
              to="/services"
              className="flex flex-col items-center gap-4 p-8 bg-white border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-lg transition group"
            >
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-500 transition">
                <FaStore className="text-4xl text-blue-500 group-hover:text-white transition" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg text-gray-900">الخدمات</h3>
                <p className="text-sm text-gray-600 mt-1">{services.length} خدمة</p>
              </div>
            </Link>

            {/* Map Icon */}
            <Link
              to="/map"
              className="flex flex-col items-center gap-4 p-8 bg-white border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-lg transition group"
            >
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-500 transition">
                <FaMapMarkedAlt className="text-4xl text-blue-500 group-hover:text-white transition" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg text-gray-900">الخريطة</h3>
                <p className="text-sm text-gray-600 mt-1">{stores.length} متجر</p>
              </div>
            </Link>
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
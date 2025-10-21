import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axios';
import Header from '../components/Header';
import { FaChartLine, FaDollarSign, FaBox, FaShoppingCart, FaHeart } from 'react-icons/fa';

const StoreAnalytics = () => {
  const { id: storeId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [storeId]);

  const fetchAnalytics = async () => {
    try {
      const response = await axiosInstance.get(`/stores/${storeId}/analytics`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <FaChartLine className="text-blue-600" />
          تحليلات المتجر
        </h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <FaShoppingCart className="text-3xl text-blue-600" />
              <div>
                <p className="text-gray-600 text-sm">إجمالي الطلبات</p>
                <p className="text-3xl font-bold">{analytics.total_orders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <FaDollarSign className="text-3xl text-green-600" />
              <div>
                <p className="text-gray-600 text-sm">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold">{analytics.total_revenue.toFixed(2)} ر.س</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <FaBox className="text-3xl text-purple-600" />
              <div>
                <p className="text-gray-600 text-sm">عدد المنتجات</p>
                <p className="text-3xl font-bold">{analytics.products_count}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <FaDollarSign className="text-3xl text-orange-600" />
              <div>
                <p className="text-gray-600 text-sm">متوسط قيمة الطلب</p>
                <p className="text-2xl font-bold">{analytics.average_order_value.toFixed(2)} ر.س</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">المنتجات الأكثر شعبية</h2>
          {analytics.top_products.length > 0 ? (
            <div className="space-y-4">
              {analytics.top_products.map((product, index) => (
                <div key={product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">#{index + 1}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{product.name}</h3>
                    <p className="text-gray-600 text-sm">{product.description}</p>
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2 text-red-500 mb-1">
                      <FaHeart />
                      <span className="font-bold">{product.likes || 0}</span>
                    </div>
                    <p className="text-blue-600 font-bold">{product.price} ر.س</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">لا توجد بيانات</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreAnalytics;

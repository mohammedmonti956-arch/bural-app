import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { FaClock, FaDollarSign } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axiosInstance.get('/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">جميع الخدمات</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : services.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full mb-2">
                  {service.category}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                <div className="flex items-center gap-2 text-gray-700 mb-4">
                  <FaDollarSign className="text-blue-600" />
                  <span className="font-bold text-lg">{service.price} ر.س</span>
                </div>
                <Link
                  to={`/stores/${service.store_id}`}
                  className="block text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  عرض المتجر
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 text-lg">لا توجد خدمات حالياً</p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Services;

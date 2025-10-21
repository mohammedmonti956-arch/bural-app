import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { FaBox, FaCheck, FaClock, FaTimes } from 'react-icons/fa';

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get('/orders/my-orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'confirmed':
        return <FaCheck className="text-blue-500" />;
      case 'completed':
        return <FaCheck className="text-green-500" />;
      case 'cancelled':
        return <FaTimes className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'confirmed':
        return 'مؤكد';
      case 'completed':
        return 'مكتمل';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <FaBox className="text-blue-600" />
          طلباتي
        </h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(order.status)}
                      <span className="font-bold text-lg">{getStatusText(order.status)}</span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {new Date(order.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-blue-600">{order.total} ر.س</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-bold mb-2">المنتجات:</h3>
                  <ul className="space-y-2">
                    {order.items.map((item, index) => (
                      <li key={index} className="flex justify-between text-sm">
                        <span>{item.name} × {item.quantity}</span>
                        <span className="font-semibold">{item.price * item.quantity} ر.س</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {order.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700"><strong>ملاحظات:</strong> {order.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <FaBox className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">لا توجد طلبات بعد</p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default MyOrders;

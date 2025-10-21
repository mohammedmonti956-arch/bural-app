import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { FaStore, FaEnvelope, FaPhone, FaSignOutAlt, FaPlusCircle } from 'react-icons/fa';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">الملف الشخصي</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.username}</h2>
              <p className="text-gray-600">{user.full_name}</p>
              {user.is_store_owner && (
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mt-2">
                  صاحب متجر
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3 text-gray-700">
              <FaEnvelope className="text-blue-600" />
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3 text-gray-700">
                <FaPhone className="text-blue-600" />
                <span>{user.phone}</span>
              </div>
            )}
          </div>
        </div>

        {!user.is_store_owner && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 text-center">
            <FaStore className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">ليس لديك متجر بعد؟</h3>
            <p className="text-gray-600 mb-6">انشئ متجرك الآن وابدأ بعرض منتجاتك وخدماتك</p>
            <Link
              to="/profile/create-store"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              <FaPlusCircle /> إنشاء متجر جديد
            </Link>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            <FaSignOutAlt /> تسجيل الخروج
          </button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Profile;

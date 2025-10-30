import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import LoginPrompt from '../components/LoginPrompt';
import axiosInstance from '../api/axios';
import { FaStore, FaEnvelope, FaPhone, FaSignOutAlt, FaPlusCircle, FaTrashAlt, FaExclamationTriangle } from 'react-icons/fa';

const Profile = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteAllStores = async () => {
    const confirmed = window.confirm(
      'هل أنت متأكد من حذف جميع متاجرك؟ هذا الإجراء لا يمكن التراجع عنه!'
    );
    
    if (!confirmed) return;
    
    const doubleConfirm = window.confirm(
      'تأكيد نهائي: سيتم حذف جميع المتاجر والمنتجات والخدمات المرتبطة بها. هل تريد المتابعة؟'
    );
    
    if (!doubleConfirm) return;
    
    setDeleting(true);
    try {
      const response = await axiosInstance.delete('/stores/owner/delete-all');
      alert(response.data.message);
      window.location.reload();
    } catch (error) {
      console.error('Error deleting stores:', error);
      alert('فشل حذف المتاجر');
    } finally {
      setDeleting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">الملف الشخصي</h1>
          <LoginPrompt 
            message="سجل دخولك لعرض ملفك الشخصي"
            action="يجب تسجيل الدخول للوصول إلى الملف الشخصي وإدارة متاجرك"
          />
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">الملف الشخصي</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                user.username[0].toUpperCase()
              )}
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

        {/* My Orders */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">طلباتي</h3>
          <Link
            to="/my-orders"
            className="block text-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            عرض طلباتي
          </Link>
        </div>

        {/* صورة الملف الشخصي */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">صورة الملف الشخصي</h3>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                user.username[0].toUpperCase()
              )}
            </div>
            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition">
              <span>تغيير الصورة</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  
                  const formData = new FormData();
                  formData.append('file', file);
                  
                  try {
                    await axiosInstance.post('/auth/upload-avatar', formData, {
                      headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    alert('تم تحديث الصورة الشخصية بنجاح!');
                    window.location.reload();
                  } catch (error) {
                    console.error('Error uploading avatar:', error);
                    alert('فشل رفع الصورة');
                  }
                }}
              />
            </label>
          </div>
        </div>

        {!user.is_store_owner && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 text-center">
            <FaStore className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">ليس لديك متجر بعد؟</h3>
            <p className="text-gray-600 mb-6">أنشئ متجرك الآن وابدأ بعرض منتجاتك وخدماتك</p>
            <Link
              to="/profile/create-store"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              <FaPlusCircle /> إنشاء متجر جديد
            </Link>
          </div>
        )}

        {/* Delete All Stores - Only for store owners */}
        {user.is_store_owner && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-red-200">
            <div className="flex items-start gap-3 mb-4">
              <FaExclamationTriangle className="text-red-600 text-2xl mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">منطقة خطرة</h3>
                <p className="text-gray-600 text-sm">
                  احذف جميع متاجرك ومنتجاتك وخدماتك بشكل دائم. هذا الإجراء لا يمكن التراجع عنه!
                </p>
              </div>
            </div>
            <button
              onClick={handleDeleteAllStores}
              disabled={deleting}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              <FaTrashAlt /> {deleting ? 'جاري الحذف...' : 'حذف جميع المتاجر'}
            </button>
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

import React, { useState } from 'react';
import { FaUserPlus, FaSignInAlt } from 'react-icons/fa';
import QuickLoginModal from './QuickLoginModal';
import { useNavigate } from 'react-router-dom';

const LoginPrompt = ({ message, action }) => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-8 text-center" dir="rtl">
      <div className="text-6xl mb-4">🔐</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        {message || 'سجل دخولك للمتابعة'}
      </h3>
      <p className="text-gray-600 mb-6">
        {action || 'يجب تسجيل الدخول للوصول إلى هذه الميزة'}
      </p>
      
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          <FaSignInAlt />
          تسجيل الدخول
        </button>
        
        <button
          onClick={() => navigate('/signup')}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-semibold transition"
        >
          <FaUserPlus />
          إنشاء حساب
        </button>
      </div>

      <QuickLoginModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default LoginPrompt;

import React from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { FaComments } from 'react-icons/fa';

const Messages = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">الرسائل</h1>

        <div className="text-center py-12 bg-white rounded-lg">
          <FaComments className="mx-auto text-6xl text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">لا توجد رسائل بعد</p>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Messages;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaStore, FaMapMarkedAlt, FaUser, FaComments } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const BottomNavigation = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { path: '/', icon: FaHome, label: 'الرئيسية', testId: 'bottom-nav-home' },
    { path: '/stores', icon: FaStore, label: 'المتاجر', testId: 'bottom-nav-stores' },
    { path: '/map', icon: FaMapMarkedAlt, label: 'الخريطة', testId: 'bottom-nav-map' },
    { path: '/messages', icon: FaComments, label: 'الرسائل', testId: 'bottom-nav-messages', requireAuth: true },
    { path: '/profile', icon: FaUser, label: 'حسابي', testId: 'bottom-nav-profile', requireAuth: true },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50" data-testid="bottom-navigation" dir="rtl">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          if (item.requireAuth && !isAuthenticated) return null;
          
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              data-testid={item.testId}
              className={`flex flex-col items-center gap-1 px-4 py-2 transition ${
                isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Icon className="text-xl" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
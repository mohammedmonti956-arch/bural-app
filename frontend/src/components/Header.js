import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaStore, FaUser, FaSignOutAlt, FaSearch, FaSignInAlt, FaDownload } from 'react-icons/fa';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showInstall, setShowInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstall(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50" data-testid="header">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between" dir="rtl">
          <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
            <FaStore className="text-3xl text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">بورال</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/stores" className="text-gray-700 hover:text-blue-600 font-medium transition" data-testid="nav-stores">
              المتاجر
            </Link>
            <Link to="/services" className="text-gray-700 hover:text-blue-600 font-medium transition" data-testid="nav-services">
              الخدمات
            </Link>
            <Link to="/map" className="text-gray-700 hover:text-blue-600 font-medium transition" data-testid="nav-map">
              الخريطة
            </Link>
            <Link to="/search" className="text-gray-700 hover:text-blue-600 font-medium transition" data-testid="nav-search">
              <FaSearch />
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {showInstall && (
              <button
                onClick={handleInstall}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition animate-pulse"
                title="ثبت التطبيق"
              >
                <FaDownload />
                <span className="hidden md:inline">تثبيت التطبيق</span>
              </button>
            )}
            
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="flex items-center gap-2 text-gray-700 hover:text-blue-600" data-testid="profile-link">
                  <FaUser />
                  <span className="hidden md:inline">{user?.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  data-testid="logout-btn"
                  className="flex items-center gap-2 text-gray-700 hover:text-red-600"
                >
                  <FaSignOutAlt />
                  <span className="hidden md:inline">خروج</span>
                </button>
              </>
            ) : (
              <Link to="/auth" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition" data-testid="login-link">
                <FaSignInAlt />
                <span>تسجيل الدخول</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaTimes, FaEnvelope, FaLock } from 'react-icons/fa';

const QuickLoginModal = ({ isOpen, onClose, redirectTo = '/' }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      onClose();
      if (redirectTo) {
        navigate(redirectTo);
      }
    } catch (err) {
      console.error('Login error:', err.response?.data);
      if (err.response?.status === 401) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else {
        setError('حدث خطأ في تسجيل الدخول');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose} dir="rtl">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
        >
          <FaTimes className="text-xl" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">تسجيل الدخول</h2>
          <p className="text-gray-600 mb-6">سجل دخولك للوصول إلى جميع الميزات</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <FaEnvelope className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="example@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">كلمة المرور</label>
              <div className="relative">
                <FaLock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-600 text-sm">
              ليس لديك حساب؟{' '}
              <button
                onClick={() => {
                  onClose();
                  navigate('/signup');
                }}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                إنشاء حساب جديد
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickLoginModal;

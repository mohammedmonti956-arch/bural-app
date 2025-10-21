import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import StoreCard from '../components/StoreCard';
import { FaFilter, FaSearch } from 'react-icons/fa';

const Stores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['كل الفئات', 'مطاعم', 'متاجر', 'خدمات', 'صحة', 'تعليم', 'أخرى'];

  useEffect(() => {
    fetchStores();
  }, [category, searchTerm]);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category && category !== 'كل الفئات') params.category = category;
      if (searchTerm) params.search = searchTerm;

      const response = await axiosInstance.get('/stores', { params });
      setStores(response.data);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8" data-testid="stores-title">جميع المتاجر</h1>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                data-testid="stores-search-input"
                placeholder="ابحث عن متجر..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  data-testid={`category-filter-${cat}`}
                  onClick={() => setCategory(cat === 'كل الفئات' ? '' : cat)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    (cat === 'كل الفئات' && !category) || category === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stores Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : stores.length > 0 ? (
          <>
            <p className="text-gray-600 mb-4" data-testid="stores-count">تم العثور على {stores.length} متجر</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="stores-grid">
              {stores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg" data-testid="no-stores-found">
            <p className="text-gray-500 text-lg">لم يتم العثور على متاجر</p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Stores;
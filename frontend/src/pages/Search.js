import React, { useState } from 'react';
import axiosInstance from '../api/axios';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import StoreCard from '../components/StoreCard';
import { FaSearch } from 'react-icons/fa';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ stores: [], services: [], products: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const response = await axiosInstance.get('/search', {
        params: { q: query, scope: 'all' }
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">البحث</h1>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن متاجر أو خدمات..."
                className="w-full pr-12 pl-4 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-lg font-semibold transition"
            >
              {loading ? 'جاري البحث...' : 'بحث'}
            </button>
          </div>
        </form>

        {searched && !loading && (
          <div>
            {results.stores.length === 0 && results.services.length === 0 && results.products.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <FaSearch className="mx-auto text-6xl text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">مرحباً بك في بورال — لم نجد نتائج مطابقة، جرّب كلمات أخرى.</p>
              </div>
            ) : (
              <>
                {results.stores.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">المتاجر ({results.stores.length})</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {results.stores.map((store) => (
                        <StoreCard key={store.id} store={store} />
                      ))}
                    </div>
                  </div>
                )}

                {results.products.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">المنتجات ({results.products.length})</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {results.products.map((product) => (
                        <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                          {product.image && (
                            <div className="h-48 bg-gray-200">
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="p-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                            <p className="text-blue-600 font-bold text-lg">{product.price} ر.س</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.services.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">الخدمات ({results.services.length})</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {results.services.map((service) => (
                        <div key={service.id} className="bg-white border border-gray-200 rounded-lg p-6">
                          <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full mb-2">
                            {service.category}
                          </span>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                          <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                          <p className="text-blue-600 font-bold text-lg">{service.price} ر.س</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Search;

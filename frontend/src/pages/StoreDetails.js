import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import ProductCard from '../components/ProductCard';
import ProductQuickView from '../components/ProductQuickView';
import { FaStar, FaMapMarkerAlt, FaPhone, FaEnvelope, FaArrowLeft, FaEdit, FaBox, FaCog, FaHeart, FaRegHeart, FaShare, FaChartLine } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix marker icon issue with Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const StoreDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchStoreData();
  }, [id]);

  const fetchStoreData = async () => {
    try {
      const [storeRes, productsRes, servicesRes, reviewsRes] = await Promise.all([
        axiosInstance.get(`/stores/${id}`),
        axiosInstance.get(`/stores/${id}/products`),
        axiosInstance.get(`/stores/${id}/services`),
        axiosInstance.get(`/stores/${id}/reviews`)
      ]);

      setStore(storeRes.data);
      setProducts(productsRes.data);
      setServices(servicesRes.data);
      setReviews(reviewsRes.data);
    } catch (error) {
      console.error('Error fetching store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (productId) => {
    if (!user) {
      alert('يجب تسجيل الدخول للإعجاب بالمنتج');
      return;
    }
    try {
      await axiosInstance.post(`/products/${productId}/like`);
      fetchStoreData();
    } catch (error) {
      console.error('Error liking product:', error);
    }
  };

  const isOwner = user && store && user.id === store.owner_id;

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/stores/${store.id}`;
    if (navigator.share) {
      navigator.share({
        title: store.name,
        text: store.description,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('تم نسخ الرابط!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">المتجر غير موجود</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      <Header />

      {/* Cover Image */}
      <div className="h-64 bg-gray-300 relative">
        {store.cover_image ? (
          <img src={store.cover_image} alt={store.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <FaMapMarkerAlt className="text-6xl" />
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="store-detail-name">{store.name}</h1>
              <p className="text-gray-600 mb-4" data-testid="store-detail-description">{store.description}</p>
              
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold" data-testid="store-detail-category">
                  {store.category}
                </span>
                <span className="inline-flex items-center gap-1 text-gray-700" data-testid="store-detail-rating">
                  <FaStar className="text-yellow-500" />
                  {store.rating.toFixed(1)} ({store.reviews_count} تقييم)
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition"
              >
                <FaShare /> مشاركة
              </button>
              {isOwner && (
                <>
                  <Link
                    to={`/profile/stores/${store.id}/analytics`}
                    className="flex items-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg transition"
                  >
                    <FaChartLine /> التحليلات
                  </Link>
                  <Link
                    to={`/profile/stores/${store.id}/edit`}
                    data-testid="edit-store-btn"
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition"
                  >
                    <FaEdit /> تعديل
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            {store.address && (
              <div className="flex items-center gap-2 text-gray-600" data-testid="store-detail-address">
                <FaMapMarkerAlt className="text-blue-600" />
                <span>{store.address}</span>
              </div>
            )}
            {store.phone && (
              <div className="flex items-center gap-2 text-gray-600" data-testid="store-detail-phone">
                <FaPhone className="text-blue-600" />
                <a href={`tel:${store.phone}`} className="hover:text-blue-600">{store.phone}</a>
              </div>
            )}
            {store.email && (
              <div className="flex items-center gap-2 text-gray-600" data-testid="store-detail-email">
                <FaEnvelope className="text-blue-600" />
                <a href={`mailto:${store.email}`} className="hover:text-blue-600">{store.email}</a>
              </div>
            )}
          </div>

          {/* Store Location Map */}
          {store.latitude && store.longitude && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <FaMapMarkerAlt className="text-blue-600" />
                موقع المتجر
              </h3>
              <div className="h-64 rounded-lg overflow-hidden">
                <MapContainer 
                  center={[store.latitude, store.longitude]} 
                  zoom={15} 
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <Marker position={[store.latitude, store.longitude]}>
                    <Popup>{store.name}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          )}

          {isOwner && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
              <Link
                to={`/profile/stores/${store.id}/products`}
                data-testid="manage-products-btn"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                <FaBox /> إدارة المنتجات
              </Link>
              <Link
                to={`/profile/stores/${store.id}/services`}
                data-testid="manage-services-btn"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                <FaCog /> إدارة الخدمات
              </Link>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200" data-testid="store-tabs">
            <button
              data-testid="tab-products"
              onClick={() => setActiveTab('products')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'products'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              المنتجات ({products.length})
            </button>
            <button
              data-testid="tab-services"
              onClick={() => setActiveTab('services')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'services'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              الخدمات ({services.length})
            </button>
            <button
              data-testid="tab-reviews"
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'reviews'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              التقييمات ({reviews.length})
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'products' && (
              <div data-testid="products-section">
                {products.length > 0 ? (
                  <div className="space-y-4">
                    {products.map((product) => (
                      <ProductCard 
                        key={product.id}
                        product={product}
                        store={store}
                        user={user}
                        onLike={handleLike}
                        onQuickView={setSelectedProduct}
                        horizontal={true}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8" data-testid="no-products">لا توجد منتجات</p>
                )}
              </div>
            )}

            {activeTab === 'services' && (
              <div data-testid="services-section">
                {services.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((service) => (
                      <div key={service.id} className="border border-gray-200 rounded-lg p-4" data-testid={`service-${service.id}`}>
                        <h3 className="font-bold text-lg mb-2">{service.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                        <p className="text-blue-600 font-bold text-xl">{service.price} ر.س</p>
                        {service.duration && <p className="text-gray-500 text-sm">المدة: {service.duration}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8" data-testid="no-services">لا توجد خدمات</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div data-testid="reviews-section">
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border border-gray-200 rounded-lg p-4" data-testid={`review-${review.id}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold">{review.user_name}</span>
                          <div className="flex items-center gap-1">
                            <FaStar className="text-yellow-500" />
                            <span>{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8" data-testid="no-reviews">لا توجد تقييمات</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            data-testid="back-btn"
          >
            <FaArrowLeft /> رجوع
          </button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default StoreDetails;
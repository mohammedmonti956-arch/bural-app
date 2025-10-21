import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axios';
import Header from '../components/Header';
import { FaCog, FaPlus, FaEdit, FaTrash, FaImage } from 'react-icons/fa';

const ManageServices = () => {
  const { id: storeId } = useParams();
  const [store, setStore] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration: '',
    category: 'خدمات',
    image: ''
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [storeId]);

  const fetchData = async () => {
    try {
      const [storeRes, servicesRes] = await Promise.all([
        axiosInstance.get(`/stores/${storeId}`),
        axiosInstance.get(`/stores/${storeId}/services`)
      ]);
      setStore(storeRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formDataImg = new FormData();
    formDataImg.append('file', file);

    try {
      const response = await axiosInstance.post('/upload-image', formDataImg, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({ ...formData, image: response.data.image_url });
    } catch (error) {
      console.error('Error:', error);
      alert('فشل رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await axiosInstance.put(`/services/${editingService.id}`, formData);
      } else {
        await axiosInstance.post(`/stores/${storeId}/services`, formData);
      }
      setShowForm(false);
      setEditingService(null);
      setFormData({ name: '', description: '', price: 0, duration: '', category: 'خدمات', image: '' });
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration || '',
      category: service.category,
      image: service.image || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('هل أنت متأكد؟')) return;
    try {
      await axiosInstance.delete(`/services/${serviceId}`);
      fetchData();
    } catch (error) {
      console.error('Error:', error);
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <FaCog className="text-green-600" />
              إدارة الخدمات
            </h1>
            <p className="text-gray-600 mt-2">{store?.name}</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingService(null);
              setFormData({ name: '', description: '', price: 0, duration: '', category: 'خدمات', image: '' });
            }}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            <FaPlus /> إضافة خدمة
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">{editingService ? 'تعديل الخدمة' : 'خدمة جديدة'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">اسم الخدمة *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">الفئة</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الوصف *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="3"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">السعر (ر.س) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">المدة (مثال: 30 دقيقة)</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">صورة الخدمة</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg cursor-pointer transition">
                    <FaImage />
                    <span>{uploading ? 'جاري الرفع...' : 'اختر صورة'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                  {formData.image && (
                    <img src={formData.image} alt="Preview" className="h-20 w-20 object-cover rounded-lg" />
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  {editingService ? 'تحديث' : 'إضافة'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingService(null);
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {services.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                <div className="h-48 bg-gray-200">
                  {service.image ? (
                    <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FaCog className="text-6xl" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{service.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{service.description}</p>
                  <span className="text-green-600 font-bold text-xl">{service.price} ر.س</span>
                  {service.duration && <p className="text-gray-500 text-sm mt-2">المدة: {service.duration}</p>}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(service)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition"
                    >
                      <FaEdit /> تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <FaCog className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">لا توجد خدمات بعد</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageServices;

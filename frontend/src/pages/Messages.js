import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import LoginPrompt from '../components/LoginPrompt';
import { FaComments, FaPaperPlane, FaStore, FaBox, FaArrowRight } from 'react-icons/fa';

const Messages = () => {
  const { isAuthenticated, user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const receiverId = searchParams.get('receiver');
  const productId = searchParams.get('product');
  
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [storeInfo, setStoreInfo] = useState(null);
  const [productInfo, setProductInfo] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      if (receiverId) {
        // Start new conversation with store owner
        startConversation(receiverId, productId);
      } else {
        // Load existing conversations
        fetchConversations();
      }
    }
  }, [isAuthenticated, receiverId, productId]);

  const startConversation = async (ownerId, prodId) => {
    try {
      // Fetch store info
      const storesRes = await axiosInstance.get('/stores');
      const store = storesRes.data.find(s => s.owner_id === ownerId);
      
      if (store) {
        setStoreInfo(store);
      }

      // Fetch product info if provided
      if (prodId) {
        const productsRes = await axiosInstance.get(`/stores/${store?.id}/products`);
        const product = productsRes.data.find(p => p.id === prodId);
        if (product) {
          setProductInfo(product);
          setNewMessage(`مرحباً، أنا مهتم بالمنتج: ${product.name}`);
        }
      }

      setCurrentConversation({ receiver_id: ownerId, store });
      setLoading(false);
    } catch (error) {
      console.error('Error starting conversation:', error);
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await axiosInstance.get('/messages/conversations');
      setConversations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentConversation) return;

    setSending(true);
    try {
      await axiosInstance.post('/messages', {
        receiver_id: currentConversation.receiver_id,
        content: newMessage
      });
      
      setNewMessage('');
      alert('تم إرسال الرسالة بنجاح! سيتم تطوير صندوق الوارد قريباً.');
      
      // Navigate back to home or store details
      if (storeInfo) {
        navigate(`/stores/${storeInfo.id}`);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('فشل إرسال الرسالة');
    } finally {
      setSending(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">الرسائل</h1>
          <LoginPrompt 
            message="سجل دخولك لإرسال رسائل"
            action="يجب تسجيل الدخول للوصول إلى الرسائل والمحادثات"
          />
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
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
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          {storeInfo && (
            <button
              onClick={() => navigate(`/stores/${storeInfo.id}`)}
              className="text-blue-600 hover:text-blue-700"
            >
              <FaArrowRight className="text-2xl" />
            </button>
          )}
          <h1 className="text-4xl font-bold text-gray-900">
            {currentConversation ? 'إرسال رسالة' : 'الرسائل'}
          </h1>
        </div>

        {currentConversation ? (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Store & Product Info */}
            {storeInfo && (
              <div className="bg-blue-50 border-b border-blue-100 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <FaStore className="text-blue-600 text-2xl" />
                  <div>
                    <h3 className="font-bold text-lg">{storeInfo.name}</h3>
                    <p className="text-sm text-gray-600">{storeInfo.description}</p>
                  </div>
                </div>
                
                {productInfo && (
                  <div className="flex items-center gap-3 bg-white rounded-lg p-3 mt-2">
                    <FaBox className="text-green-600 text-xl" />
                    <div className="flex-1">
                      <p className="font-semibold">{productInfo.name}</p>
                      <p className="text-blue-600 font-bold">{productInfo.price} ر.س</p>
                    </div>
                    {productInfo.images && productInfo.images.length > 0 && (
                      <img 
                        src={productInfo.images[0]} 
                        alt={productInfo.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Message Form */}
            <form onSubmit={sendMessage} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  رسالتك إلى صاحب المتجر
                </label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-32"
                  placeholder="اكتب رسالتك هنا..."
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700">
                  <strong>ملاحظة:</strong> سيتم إرسال رسالتك إلى صاحب المتجر. 
                  نظام الرسائل الكامل قيد التطوير حالياً.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  <FaPaperPlane />
                  {sending ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                </button>
                <button
                  type="button"
                  onClick={() => storeInfo ? navigate(`/stores/${storeInfo.id}`) : navigate('/')}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        ) : conversations.length > 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">المحادثات</h2>
            <div className="space-y-3">
              {conversations.map((conv, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                >
                  <p className="font-semibold">{conv.user_name || 'مستخدم'}</p>
                  <p className="text-sm text-gray-600">
                    {typeof conv.last_message === 'string' ? conv.last_message : 'رسالة جديدة'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <FaComments className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-2">لا توجد رسائل بعد</p>
            <p className="text-gray-400 text-sm">استخدم زر "اطلب الآن" في أي منتج لبدء محادثة</p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Messages;

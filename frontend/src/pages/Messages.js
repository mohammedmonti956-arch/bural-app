import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import LoginPrompt from '../components/LoginPrompt';
import { FaComments, FaPaperPlane, FaStore, FaBox, FaArrowRight, FaSearch, FaCircle } from 'react-icons/fa';

const Messages = () => {
  const { isAuthenticated, user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const receiverId = searchParams.get('receiver');
  const productId = searchParams.get('product');
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
      
      // Auto-select conversation if receiver is provided
      if (receiverId) {
        initializeConversationWithReceiver(receiverId, productId);
      }
    }
  }, [isAuthenticated, receiverId, productId]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.user.id);
      // Auto-refresh messages every 5 seconds
      const interval = setInterval(() => {
        fetchMessages(selectedConversation.user.id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeConversationWithReceiver = async (ownerId, prodId) => {
    try {
      // Get store and owner info
      const storesRes = await axiosInstance.get('/stores');
      const store = storesRes.data.find(s => s.owner_id === ownerId);
      
      if (store) {
        const ownerRes = await axiosInstance.get(`/users/${ownerId}`);
        
        let product = null;
        if (prodId) {
          const productsRes = await axiosInstance.get(`/stores/${store.id}/products`);
          product = productsRes.data.find(p => p.id === prodId);
          
          if (product) {
            setNewMessage(`مرحباً، أنا مهتم بالمنتج: ${product.name}`);
          }
        }
        
        setSelectedConversation({
          user: ownerRes.data,
          store,
          product,
          last_message: null
        });
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
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

  const fetchMessages = async (userId) => {
    try {
      const response = await axiosInstance.get(`/messages/${userId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      await axiosInstance.post('/messages', {
        receiver_id: selectedConversation.user.id,
        content: newMessage
      });
      
      setNewMessage('');
      await fetchMessages(selectedConversation.user.id);
      await fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('فشل إرسال الرسالة');
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
          <div className="grid grid-cols-12 h-full">
            {/* Conversations List */}
            <div className="col-span-12 md:col-span-4 border-l border-gray-200 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-bold text-gray-900 mb-3">المحادثات</h2>
                <div className="relative">
                  <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="بحث..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((conv, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedConversation(conv)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                        selectedConversation?.user.id === conv.user.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
                          {conv.user.avatar ? (
                            <img src={conv.user.avatar} alt={conv.user.username} className="w-full h-full object-cover" />
                          ) : (
                            conv.user.username[0].toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-gray-900 truncate">{conv.user.username}</h3>
                            {conv.last_message && (
                              <span className="text-xs text-gray-500">
                                {new Date(conv.last_message.created_at).toLocaleTimeString('ar-SA', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {conv.last_message?.content || 'ابدأ محادثة'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <FaComments className="text-6xl mb-4" />
                    <p>لا توجد محادثات</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="col-span-12 md:col-span-8 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (selectedConversation.store) {
                          navigate(`/stores/${selectedConversation.store.id}`);
                        } else {
                          setSelectedConversation(null);
                        }
                      }}
                      className="text-blue-600 hover:text-blue-700 md:hidden"
                    >
                      <FaArrowRight className="text-xl" />
                    </button>
                    
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                      {selectedConversation.user.avatar ? (
                        <img src={selectedConversation.user.avatar} alt={selectedConversation.user.username} className="w-full h-full object-cover" />
                      ) : (
                        selectedConversation.user.username[0].toUpperCase()
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{selectedConversation.user.username}</h3>
                      {selectedConversation.store && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <FaStore className="text-xs" />
                          {selectedConversation.store.name}
                        </p>
                      )}
                    </div>

                    <FaCircle className="text-green-500 text-xs" />
                  </div>

                  {/* Product Info (if any) */}
                  {selectedConversation.product && (
                    <div className="p-3 bg-blue-50 border-b border-blue-100">
                      <div className="flex items-center gap-3">
                        <FaBox className="text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{selectedConversation.product.name}</p>
                          <p className="text-sm text-blue-600 font-bold">{selectedConversation.product.price} ر.س</p>
                        </div>
                        {selectedConversation.product.images?.[0] && (
                          <img 
                            src={selectedConversation.product.images[0]} 
                            alt={selectedConversation.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {messages.length > 0 ? (
                      <div className="space-y-4">
                        {messages.map((msg) => {
                          const isMyMessage = msg.sender_id === user.id;
                          return (
                            <div
                              key={msg.id}
                              className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                  isMyMessage
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-900 rounded-bl-none shadow'
                                }`}
                              >
                                <p className="break-words">{msg.content}</p>
                                <p
                                  className={`text-xs mt-1 ${
                                    isMyMessage ? 'text-blue-100' : 'text-gray-500'
                                  }`}
                                >
                                  {new Date(msg.created_at).toLocaleTimeString('ar-SA', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <div className="text-center">
                          <FaComments className="text-6xl mx-auto mb-4" />
                          <p>ابدأ المحادثة بإرسال رسالة</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="اكتب رسالتك..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-3 rounded-full transition flex items-center justify-center w-12 h-12"
                      >
                        <FaPaperPlane />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <FaComments className="text-8xl mb-4" />
                  <p className="text-xl">اختر محادثة لبدء المراسلة</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Messages;

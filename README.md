# منصة بورال - Boral Platform

منصة شاملة لعرض المتاجر والخدمات مع خرائط تفاعلية

## 🚀 الميزات الرئيسية

### 🗺️ الخرائط التفاعلية
- **Leaflet + OpenStreetMap** - خرائط مجانية بجودة عالية
- عرض جميع المتاجر على الخريطة
- Markers مخصصة لكل متجر
- Popups تفاعلية مع معلومات المتجر
- تحديد موقع المستخدم الحالي
- شوارع وأماكن واضحة

### 🏪 نظام المتاجر
- عرض جميع المتاجر
- البحث والتصفية حسب الفئة
- تفاصيل المتجر الكاملة
- المنتجات والخدمات
- التقييمات والمراجعات

### 🔐 نظام المصادقة
- تسجيل دخول وإنشاء حساب
- JWT Authentication
- حماية المسارات

### 📱 تصميم عصري
- تصميم عربي RTL كامل
- أبيض وأسود مع لمسات زرقاء جذابة
- Responsive على جميع الأجهزة
- Navigation سهل ومريح

## 🛠️ التقنيات المستخدمة

### Backend
- **FastAPI** - Python web framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication
- **Motor** - Async MongoDB driver

### Frontend
- **React 19** - UI library
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Leaflet** - Maps
- **React Leaflet** - React integration for Leaflet
- **Axios** - HTTP client
- **React Icons** - Icons

## 📦 التثبيت والتشغيل

### المتطلبات
- Python 3.8+
- Node.js 16+
- MongoDB

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend
```bash
cd frontend
yarn install
yarn start
```

## 🧪 بيانات تجريبية

تم إضافة 3 متاجر تجريبية:
1. مطعم البيت الشامي
2. صيدلية النهدي
3. مكتبة جرير

### بيانات تسجيل الدخول التجريبية
```
البريد الإلكتروني: owner@test.com
كلمة المرور: test123
```

## 📁 هيكل المشروع

```
/app
├── backend/
│   ├── server.py          # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── pages/        # React pages
│   │   ├── components/   # React components
│   │   ├── context/      # Auth context
│   │   ├── api/          # API utilities
│   │   └── App.js        # Main app
│   ├── package.json
│   └── .env
│
└── README.md
```

## 🌐 APIs المتوفرة

### Authentication
- `POST /api/auth/register` - إنشاء حساب
- `POST /api/auth/login` - تسجيل دخول
- `GET /api/auth/me` - الملف الشخصي

### Stores
- `GET /api/stores` - جميع المتاجر
- `GET /api/stores/{id}` - تفاصيل متجر
- `POST /api/stores` - إنشاء متجر
- `PUT /api/stores/{id}` - تعديل متجر
- `DELETE /api/stores/{id}` - حذف متجر

### Products
- `GET /api/stores/{store_id}/products` - منتجات متجر
- `POST /api/stores/{store_id}/products` - إضافة منتج
- `PUT /api/products/{id}` - تعديل منتج
- `DELETE /api/products/{id}` - حذف منتج

### Services
- `GET /api/services` - جميع الخدمات
- `GET /api/stores/{store_id}/services` - خدمات متجر
- `POST /api/stores/{store_id}/services` - إضافة خدمة

### Search
- `GET /api/search?q={query}&type={all|stores|services}` - بحث

### Reviews
- `GET /api/stores/{store_id}/reviews` - تقييمات متجر
- `POST /api/stores/{store_id}/reviews` - إضافة تقييم

### Messages
- `GET /api/messages/conversations` - المحادثات
- `GET /api/messages/{user_id}` - رسائل مع مستخدم
- `POST /api/messages` - إرسال رسالة

## 🎨 التصميم

- **الألوان الأساسية:**
  - أبيض: `#FFFFFF`
  - أسود: `#000000`
  - رمادي: `#6B7280`
  - أزرق (Primary): `#3B82F6`

- **الخطوط:** نظام الخطوط الافتراضي للمتصفح
- **الاتجاه:** RTL (من اليمين لليسار)

## 🚦 الحالة

✅ Backend: يعمل
✅ Frontend: يعمل
✅ Database: يعمل
✅ Maps: يعمل (Leaflet + OpenStreetMap)

## 📝 ملاحظات

- الخرائط تستخدم **Leaflet + OpenStreetMap** - مجاني 100%
- يمكن التبديل لـ Mapbox لاحقاً بإضافة Access Token
- جميع المسارات الحساسة محمية بـ JWT
- التطبيق جاهز للإنتاج بعد إضافة المتغيرات البيئية المناسبة

## 🔮 تحسينات مستقبلية

- إضافة تحميل الصور الصور والمنتجات
- نظام الإشعارات الفورية
- تحسين نظام المراسلة
- إضافة نظام الحجوزات
- تقارير وإحصائيات للمتاجر
- نظام الدفع الإلكتروني

---

Built with ❤️ using Emergent.sh

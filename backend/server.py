from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get("SECRET_KEY", "your-secret-key-change-in-production-boral-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ==========================
# MODELS
# ==========================

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    avatar: Optional[str] = None
    is_store_owner: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class StoreBase(BaseModel):
    name: str
    description: str
    category: str
    address: str
    latitude: float
    longitude: float
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    logo: Optional[str] = None
    cover_image: Optional[str] = None

class StoreCreate(StoreBase):
    pass

class Store(StoreBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    owner_id: str
    rating: float = 0.0
    reviews_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    images: List[str] = []  # Changed from single image to multiple images
    stock: int = 0
    category: str

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    images: Optional[List[str]] = None
    stock: Optional[int] = None
    category: Optional[str] = None

class Product(ProductBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    store_id: str
    likes: int = 0
    liked_by: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ServiceBase(BaseModel):
    name: str
    description: str
    price: float
    duration: Optional[str] = None
    category: str
    image: Optional[str] = None

class ServiceCreate(ServiceBase):
    pass

class Service(ServiceBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    store_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MessageBase(BaseModel):
    receiver_id: str
    content: str

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sender_id: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewBase(BaseModel):
    rating: float
    comment: str

class ReviewCreate(ReviewBase):
    pass

class Review(ReviewBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    store_id: str
    user_id: str
    user_name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderItemBase(BaseModel):
    product_id: Optional[str] = None
    service_id: Optional[str] = None
    quantity: int = 1
    price: float
    name: str

class OrderBase(BaseModel):
    store_id: str
    items: List[OrderItemBase]
    total: float
    notes: Optional[str] = None

class OrderCreate(OrderBase):
    pass

class Order(OrderBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    status: str = "pending"  # pending, confirmed, completed, cancelled
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==========================
# AUTH UTILITIES
# ==========================

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user_doc is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

# ==========================
# AUTH ROUTES
# ==========================

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="البريد الإلكتروني مسجل بالفعل")
    
    existing_username = await db.users.find_one({"username": user_data.username})
    if existing_username:
        raise HTTPException(status_code=400, detail="اسم المستخدم مستخدم بالفعل")
    
    user_dict = user_data.model_dump(exclude={"password"})
    user_obj = User(**user_dict)
    
    hashed_password = get_password_hash(user_data.password)
    
    doc = user_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['password_hash'] = hashed_password
    
    await db.users.insert_one(doc)
    
    access_token = create_access_token(data={"sub": user_obj.id})
    
    return Token(access_token=access_token, token_type="bearer", user=user_obj)

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="البريد الإلكتروني أو كلمة المرور غير صحيحة")
    
    if not verify_password(credentials.password, user_doc['password_hash']):
        raise HTTPException(status_code=401, detail="البريد الإلكتروني أو كلمة المرور غير صحيحة")
    
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user_obj = User(**{k: v for k, v in user_doc.items() if k != 'password_hash'})
    
    access_token = create_access_token(data={"sub": user_obj.id})
    
    return Token(access_token=access_token, token_type="bearer", user=user_obj)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.put("/auth/profile", response_model=User)
async def update_profile(user_data: UserBase, current_user: User = Depends(get_current_user)):
    update_data = user_data.model_dump()
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": update_data}
    )
    
    updated_user = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    if isinstance(updated_user.get('created_at'), str):
        updated_user['created_at'] = datetime.fromisoformat(updated_user['created_at'])
    
    return User(**{k: v for k, v in updated_user.items() if k != 'password_hash'})

@api_router.post("/auth/upload-avatar")
async def upload_avatar(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    """Upload profile picture/avatar for current user"""
    try:
        contents = await file.read()
        image_data = base64.b64encode(contents).decode('utf-8')
        image_url = f"data:{file.content_type};base64,{image_data}"
        
        # Update user's avatar
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": {"avatar": image_url}}
        )
        
        return {"avatar": image_url, "message": "تم تحميل الصورة الشخصية بنجاح"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في تحميل الصورة: {str(e)}")

# ==========================
# STORE ROUTES
# ==========================

@api_router.get("/stores", response_model=List[Store])
async def get_stores(category: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if category:
        query['category'] = category
    if search:
        query['$or'] = [
            {'name': {'$regex': search, '$options': 'i'}},
            {'description': {'$regex': search, '$options': 'i'}}
        ]
    
    stores = await db.stores.find(query, {"_id": 0}).to_list(1000)
    
    for store in stores:
        if isinstance(store.get('created_at'), str):
            store['created_at'] = datetime.fromisoformat(store['created_at'])
        if isinstance(store.get('updated_at'), str):
            store['updated_at'] = datetime.fromisoformat(store['updated_at'])
    
    return stores

@api_router.get("/stores/{store_id}", response_model=Store)
async def get_store(store_id: str):
    store = await db.stores.find_one({"id": store_id}, {"_id": 0})
    if not store:
        raise HTTPException(status_code=404, detail="المتجر غير موجود")
    
    if isinstance(store.get('created_at'), str):
        store['created_at'] = datetime.fromisoformat(store['created_at'])
    if isinstance(store.get('updated_at'), str):
        store['updated_at'] = datetime.fromisoformat(store['updated_at'])
    
    return Store(**store)

@api_router.post("/stores", response_model=Store)
async def create_store(store_data: StoreCreate, current_user: User = Depends(get_current_user)):
    store_dict = store_data.model_dump()
    store_dict['owner_id'] = current_user.id
    store_obj = Store(**store_dict)
    
    doc = store_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.stores.insert_one(doc)
    
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"is_store_owner": True}}
    )
    
    return store_obj

@api_router.put("/stores/{store_id}", response_model=Store)
async def update_store(store_id: str, store_data: StoreCreate, current_user: User = Depends(get_current_user)):
    store = await db.stores.find_one({"id": store_id})
    if not store:
        raise HTTPException(status_code=404, detail="المتجر غير موجود")
    
    if store['owner_id'] != current_user.id:
        raise HTTPException(status_code=403, detail="غير مصرح لك بتعديل هذا المتجر")
    
    update_data = store_data.model_dump()
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.stores.update_one(
        {"id": store_id},
        {"$set": update_data}
    )
    
    updated_store = await db.stores.find_one({"id": store_id}, {"_id": 0})
    if isinstance(updated_store.get('created_at'), str):
        updated_store['created_at'] = datetime.fromisoformat(updated_store['created_at'])
    if isinstance(updated_store.get('updated_at'), str):
        updated_store['updated_at'] = datetime.fromisoformat(updated_store['updated_at'])
    
    return Store(**updated_store)

@api_router.delete("/stores/{store_id}")
async def delete_store(store_id: str, current_user: User = Depends(get_current_user)):
    store = await db.stores.find_one({"id": store_id})
    if not store:
        raise HTTPException(status_code=404, detail="المتجر غير موجود")
    
    if store['owner_id'] != current_user.id:
        raise HTTPException(status_code=403, detail="غير مصرح لك بحذف هذا المتجر")
    
    await db.stores.delete_one({"id": store_id})
    await db.products.delete_many({"store_id": store_id})
    await db.services.delete_many({"store_id": store_id})
    
    return {"message": "تم حذف المتجر بنجاح"}

@api_router.get("/stores/owner/my-stores", response_model=List[Store])
async def get_my_stores(current_user: User = Depends(get_current_user)):
    stores = await db.stores.find({"owner_id": current_user.id}, {"_id": 0}).to_list(100)
    
    for store in stores:
        if isinstance(store.get('created_at'), str):
            store['created_at'] = datetime.fromisoformat(store['created_at'])
        if isinstance(store.get('updated_at'), str):
            store['updated_at'] = datetime.fromisoformat(store['updated_at'])
    
    return stores

# ==========================
# PRODUCT ROUTES
# ==========================

@api_router.get("/stores/{store_id}/products", response_model=List[Product])
async def get_store_products(store_id: str):
    products = await db.products.find({"store_id": store_id}, {"_id": 0}).to_list(1000)
    
    for product in products:
        if isinstance(product.get('created_at'), str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
    
    return products

@api_router.post("/stores/{store_id}/products", response_model=Product)
async def create_product(store_id: str, product_data: ProductCreate, current_user: User = Depends(get_current_user)):
    store = await db.stores.find_one({"id": store_id})
    if not store:
        raise HTTPException(status_code=404, detail="المتجر غير موجود")
    
    if store['owner_id'] != current_user.id:
        raise HTTPException(status_code=403, detail="غير مصرح لك بإضافة منتجات لهذا المتجر")
    
    product_dict = product_data.model_dump()
    product_dict['store_id'] = store_id
    product_obj = Product(**product_dict)
    
    doc = product_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.products.insert_one(doc)
    
    return product_obj

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: ProductUpdate, current_user: User = Depends(get_current_user)):
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="المنتج غير موجود")
    
    store = await db.stores.find_one({"id": product['store_id']})
    if store['owner_id'] != current_user.id:
        raise HTTPException(status_code=403, detail="غير مصرح لك بتعديل هذا المنتج")
    
    # Only update fields that are provided (not None)
    update_data = {k: v for k, v in product_data.model_dump(exclude_unset=True).items() if v is not None}
    if update_data:
        update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
        await db.products.update_one(
            {"id": product_id},
            {"$set": update_data}
        )
    
    updated_product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if isinstance(updated_product.get('created_at'), str):
        updated_product['created_at'] = datetime.fromisoformat(updated_product['created_at'])
    if isinstance(updated_product.get('updated_at'), str):
        updated_product['updated_at'] = datetime.fromisoformat(updated_product['updated_at'])
    
    return Product(**updated_product)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, current_user: User = Depends(get_current_user)):
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="المنتج غير موجود")
    
    store = await db.stores.find_one({"id": product['store_id']})
    if store['owner_id'] != current_user.id:
        raise HTTPException(status_code=403, detail="غير مصرح لك بحذف هذا المنتج")
    
    await db.products.delete_one({"id": product_id})
    
    return {"message": "تم حذف المنتج بنجاح"}

@api_router.post("/products/{product_id}/like")
async def like_product(product_id: str, current_user: User = Depends(get_current_user)):
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="المنتج غير موجود")
    
    liked_by = product.get('liked_by', [])
    if current_user.id in liked_by:
        raise HTTPException(status_code=400, detail="لقد أعجبت بهذا المنتج بالفعل")
    
    await db.products.update_one(
        {"id": product_id},
        {
            "$inc": {"likes": 1},
            "$push": {"liked_by": current_user.id}
        }
    )
    
    return {"message": "تم الإعجاب بالمنتج", "likes": product.get('likes', 0) + 1}

@api_router.delete("/products/{product_id}/like")
async def unlike_product(product_id: str, current_user: User = Depends(get_current_user)):
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="المنتج غير موجود")
    
    liked_by = product.get('liked_by', [])
    if current_user.id not in liked_by:
        raise HTTPException(status_code=400, detail="لم تعجب بهذا المنتج")
    
    await db.products.update_one(
        {"id": product_id},
        {
            "$inc": {"likes": -1},
            "$pull": {"liked_by": current_user.id}
        }
    )
    
    return {"message": "تم إلغاء الإعجاب", "likes": max(0, product.get('likes', 0) - 1)}

# ==========================
# SERVICE ROUTES
# ==========================

@api_router.get("/services", response_model=List[Service])
async def get_all_services(category: Optional[str] = None):
    query = {}
    if category:
        query['category'] = category
    
    services = await db.services.find(query, {"_id": 0}).to_list(1000)
    
    for service in services:
        if isinstance(service.get('created_at'), str):
            service['created_at'] = datetime.fromisoformat(service['created_at'])
    
    return services

@api_router.get("/stores/{store_id}/services", response_model=List[Service])
async def get_store_services(store_id: str):
    services = await db.services.find({"store_id": store_id}, {"_id": 0}).to_list(1000)
    
    for service in services:
        if isinstance(service.get('created_at'), str):
            service['created_at'] = datetime.fromisoformat(service['created_at'])
    
    return services

@api_router.post("/stores/{store_id}/services", response_model=Service)
async def create_service(store_id: str, service_data: ServiceCreate, current_user: User = Depends(get_current_user)):
    store = await db.stores.find_one({"id": store_id})
    if not store:
        raise HTTPException(status_code=404, detail="المتجر غير موجود")
    
    if store['owner_id'] != current_user.id:
        raise HTTPException(status_code=403, detail="غير مصرح لك بإضافة خدمات لهذا المتجر")
    
    service_dict = service_data.model_dump()
    service_dict['store_id'] = store_id
    service_obj = Service(**service_dict)
    
    doc = service_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.services.insert_one(doc)
    
    return service_obj

@api_router.put("/services/{service_id}", response_model=Service)
async def update_service(service_id: str, service_data: ServiceCreate, current_user: User = Depends(get_current_user)):
    service = await db.services.find_one({"id": service_id})
    if not service:
        raise HTTPException(status_code=404, detail="الخدمة غير موجودة")
    
    store = await db.stores.find_one({"id": service['store_id']})
    if store['owner_id'] != current_user.id:
        raise HTTPException(status_code=403, detail="غير مصرح لك بتعديل هذه الخدمة")
    
    update_data = service_data.model_dump()
    await db.services.update_one(
        {"id": service_id},
        {"$set": update_data}
    )
    
    updated_service = await db.services.find_one({"id": service_id}, {"_id": 0})
    if isinstance(updated_service.get('created_at'), str):
        updated_service['created_at'] = datetime.fromisoformat(updated_service['created_at'])
    
    return Service(**updated_service)

@api_router.delete("/services/{service_id}")
async def delete_service(service_id: str, current_user: User = Depends(get_current_user)):
    service = await db.services.find_one({"id": service_id})
    if not service:
        raise HTTPException(status_code=404, detail="الخدمة غير موجودة")
    
    store = await db.stores.find_one({"id": service['store_id']})
    if store['owner_id'] != current_user.id:
        raise HTTPException(status_code=403, detail="غير مصرح لك بحذف هذه الخدمة")
    
    await db.services.delete_one({"id": service_id})
    
    return {"message": "تم حذف الخدمة بنجاح"}

# ==========================
# MESSAGE ROUTES
# ==========================

@api_router.get("/messages/conversations", response_model=List[dict])
async def get_conversations(current_user: User = Depends(get_current_user)):
    sent = await db.messages.find({"sender_id": current_user.id}).to_list(1000)
    received = await db.messages.find({"receiver_id": current_user.id}).to_list(1000)
    
    user_ids = set()
    for msg in sent:
        user_ids.add(msg['receiver_id'])
    for msg in received:
        user_ids.add(msg['sender_id'])
    
    conversations = []
    for user_id in user_ids:
        user_doc = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
        if user_doc:
            last_msg = await db.messages.find_one(
                {"$or": [
                    {"sender_id": current_user.id, "receiver_id": user_id},
                    {"sender_id": user_id, "receiver_id": current_user.id}
                ]},
                {"_id": 0},
                sort=[("created_at", -1)]
            )
            
            conversations.append({
                "user": user_doc,
                "last_message": last_msg
            })
    
    return conversations

@api_router.get("/messages/{user_id}", response_model=List[Message])
async def get_messages_with_user(user_id: str, current_user: User = Depends(get_current_user)):
    messages = await db.messages.find({
        "$or": [
            {"sender_id": current_user.id, "receiver_id": user_id},
            {"sender_id": user_id, "receiver_id": current_user.id}
        ]
    }, {"_id": 0}).sort("created_at", 1).to_list(1000)
    
    for msg in messages:
        if isinstance(msg.get('created_at'), str):
            msg['created_at'] = datetime.fromisoformat(msg['created_at'])
    
    await db.messages.update_many(
        {"sender_id": user_id, "receiver_id": current_user.id},
        {"$set": {"is_read": True}}
    )
    
    return messages

@api_router.post("/messages", response_model=Message)
async def send_message(message_data: MessageCreate, current_user: User = Depends(get_current_user)):
    message_dict = message_data.model_dump()
    message_dict['sender_id'] = current_user.id
    message_obj = Message(**message_dict)
    
    doc = message_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.messages.insert_one(doc)
    
    return message_obj

# ==========================
# REVIEW ROUTES
# ==========================

@api_router.get("/stores/{store_id}/reviews", response_model=List[Review])
async def get_store_reviews(store_id: str):
    reviews = await db.reviews.find({"store_id": store_id}, {"_id": 0}).to_list(1000)
    
    for review in reviews:
        if isinstance(review.get('created_at'), str):
            review['created_at'] = datetime.fromisoformat(review['created_at'])
    
    return reviews

@api_router.post("/stores/{store_id}/reviews", response_model=Review)
async def create_review(store_id: str, review_data: ReviewCreate, current_user: User = Depends(get_current_user)):
    store = await db.stores.find_one({"id": store_id})
    if not store:
        raise HTTPException(status_code=404, detail="المتجر غير موجود")
    
    existing = await db.reviews.find_one({"store_id": store_id, "user_id": current_user.id})
    if existing:
        raise HTTPException(status_code=400, detail="لقد قمت بتقييم هذا المتجر بالفعل")
    
    review_dict = review_data.model_dump()
    review_dict['store_id'] = store_id
    review_dict['user_id'] = current_user.id
    review_dict['user_name'] = current_user.full_name
    review_obj = Review(**review_dict)
    
    doc = review_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.reviews.insert_one(doc)
    
    all_reviews = await db.reviews.find({"store_id": store_id}).to_list(1000)
    avg_rating = sum(r['rating'] for r in all_reviews) / len(all_reviews)
    
    await db.stores.update_one(
        {"id": store_id},
        {"$set": {"rating": round(avg_rating, 1), "reviews_count": len(all_reviews)}}
    )
    
    return review_obj

# ==========================
# SEARCH ROUTE
# ==========================

@api_router.get("/search")
async def search(q: str, scope: str = "all"):
    results = {"stores": [], "services": [], "products": []}
    
    if scope in ["all", "stores"]:
        stores = await db.stores.find({
            "$or": [
                {"name": {"$regex": q, "$options": "i"}},
                {"description": {"$regex": q, "$options": "i"}},
                {"category": {"$regex": q, "$options": "i"}},
                {"address": {"$regex": q, "$options": "i"}}
            ]
        }, {"_id": 0}).to_list(50)
        
        for store in stores:
            if isinstance(store.get('created_at'), str):
                store['created_at'] = datetime.fromisoformat(store['created_at'])
            if isinstance(store.get('updated_at'), str):
                store['updated_at'] = datetime.fromisoformat(store['updated_at'])
        
        results["stores"] = stores
    
    if scope in ["all", "services"]:
        services = await db.services.find({
            "$or": [
                {"name": {"$regex": q, "$options": "i"}},
                {"description": {"$regex": q, "$options": "i"}},
                {"category": {"$regex": q, "$options": "i"}}
            ]
        }, {"_id": 0}).to_list(50)
        
        for service in services:
            if isinstance(service.get('created_at'), str):
                service['created_at'] = datetime.fromisoformat(service['created_at'])
        
        results["services"] = services
    
    if scope in ["all", "products"]:
        products = await db.products.find({
            "$or": [
                {"name": {"$regex": q, "$options": "i"}},
                {"description": {"$regex": q, "$options": "i"}},
                {"category": {"$regex": q, "$options": "i"}}
            ]
        }, {"_id": 0}).to_list(50)
        
        for product in products:
            if isinstance(product.get('created_at'), str):
                product['created_at'] = datetime.fromisoformat(product['created_at'])
        
        results["products"] = products
    
    return results

# ==========================
# ORDER ROUTES
# ==========================

@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate, current_user: User = Depends(get_current_user)):
    order_dict = order_data.model_dump()
    order_dict['user_id'] = current_user.id
    order_obj = Order(**order_dict)
    
    doc = order_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.orders.insert_one(doc)
    
    return order_obj

@api_router.get("/orders/my-orders", response_model=List[Order])
async def get_my_orders(current_user: User = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": current_user.id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    
    return orders

@api_router.get("/stores/{store_id}/orders", response_model=List[Order])
async def get_store_orders(store_id: str, current_user: User = Depends(get_current_user)):
    store = await db.stores.find_one({"id": store_id})
    if not store or store['owner_id'] != current_user.id:
        raise HTTPException(status_code=403, detail="غير مصرح")
    
    orders = await db.orders.find({"store_id": store_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    
    return orders

@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str, current_user: User = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="الطلب غير موجود")
    
    store = await db.stores.find_one({"id": order['store_id']})
    if store['owner_id'] != current_user.id:
        raise HTTPException(status_code=403, detail="غير مصرح")
    
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status}}
    )
    
    return {"message": "تم تحديث حالة الطلب"}

# ==========================
# ANALYTICS ROUTES
# ==========================

@api_router.get("/analytics/popular-products")
async def get_popular_products(limit: int = 10):
    # Get products with most likes
    products = await db.products.find({}, {"_id": 0}).sort("likes", -1).limit(limit).to_list(limit)
    
    for product in products:
        if isinstance(product.get('created_at'), str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
    
    return products

@api_router.get("/analytics/top-rated-stores")
async def get_top_rated_stores(limit: int = 10):
    stores = await db.stores.find({}, {"_id": 0}).sort("rating", -1).limit(limit).to_list(limit)
    
    for store in stores:
        if isinstance(store.get('created_at'), str):
            store['created_at'] = datetime.fromisoformat(store['created_at'])
        if isinstance(store.get('updated_at'), str):
            store['updated_at'] = datetime.fromisoformat(store['updated_at'])
    
    return stores

@api_router.get("/stores/{store_id}/analytics")
async def get_store_analytics(store_id: str, current_user: User = Depends(get_current_user)):
    store = await db.stores.find_one({"id": store_id})
    if not store or store['owner_id'] != current_user.id:
        raise HTTPException(status_code=403, detail="غير مصرح")
    
    # Get orders count and total revenue
    orders = await db.orders.find({"store_id": store_id}).to_list(10000)
    total_orders = len(orders)
    total_revenue = sum(order.get('total', 0) for order in orders)
    
    # Get products analytics
    products = await db.products.find({"store_id": store_id}, {"_id": 0}).to_list(1000)
    
    # Sort by likes
    products_by_likes = sorted(products, key=lambda x: x.get('likes', 0), reverse=True)[:5]
    
    return {
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "products_count": len(products),
        "top_products": products_by_likes,
        "average_order_value": total_revenue / total_orders if total_orders > 0 else 0
    }

# ==========================
# IMAGE UPLOAD
# ==========================

@api_router.post("/upload-image")
async def upload_image(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    # Read file content
    contents = await file.read()
    
    # Convert to base64
    base64_image = base64.b64encode(contents).decode('utf-8')
    
    # Create data URL
    content_type = file.content_type or 'image/jpeg'
    data_url = f"data:{content_type};base64,{base64_image}"
    
    return {"image_url": data_url}

# ==========================
# ROOT ROUTE
# ==========================

@api_router.get("/")
async def root():
    return {"message": "Boral API - منصة بورال"}

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

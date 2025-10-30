#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Boral Application
Tests all new, updated, and existing endpoints as requested
"""

import requests
import json
import base64
import io
from PIL import Image
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://bordirect.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

print(f"Testing backend at: {API_BASE}")

class BoralAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.user_id = None
        self.store_id = None
        self.product_ids = []
        
    def set_auth_header(self):
        """Set authorization header for authenticated requests"""
        if self.auth_token:
            self.session.headers.update({
                'Authorization': f'Bearer {self.auth_token}'
            })
    
    def create_test_image(self, width=200, height=200):
        """Create a test image for upload testing"""
        img = Image.new('RGB', (width, height), color='red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        return img_bytes
    
    def test_user_registration_and_login(self):
        """Test user registration and login"""
        print("\n=== Testing User Registration and Login ===")
        
        # Register new user
        user_data = {
            "username": "ahmed_salem",
            "email": "ahmed.salem@example.com", 
            "full_name": "أحمد سالم",
            "phone": "+966501234567",
            "password": "SecurePass123!"
        }
        
        print("1. Testing user registration...")
        response = self.session.post(f"{API_BASE}/auth/register", json=user_data)
        
        if response.status_code == 201 or response.status_code == 200:
            data = response.json()
            self.auth_token = data['access_token']
            self.user_id = data['user']['id']
            self.set_auth_header()
            print(f"✅ Registration successful. User ID: {self.user_id}")
            return True
        elif response.status_code == 400 and "مسجل بالفعل" in response.text:
            print("User already exists, trying login...")
            
            # Try login instead
            login_data = {
                "email": user_data["email"],
                "password": user_data["password"]
            }
            
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data['access_token']
                self.user_id = data['user']['id']
                self.set_auth_header()
                print(f"✅ Login successful. User ID: {self.user_id}")
                return True
        
        print(f"❌ Registration/Login failed: {response.status_code} - {response.text}")
        return False
    
    def test_create_store(self):
        """Test store creation"""
        print("\n=== Testing Store Creation ===")
        
        store_data = {
            "name": "متجر الإلكترونيات الحديثة",
            "description": "متجر متخصص في بيع الأجهزة الإلكترونية والهواتف الذكية",
            "category": "إلكترونيات",
            "address": "شارع الملك فهد، الرياض، المملكة العربية السعودية",
            "latitude": 24.7136,
            "longitude": 46.6753,
            "phone": "+966112345678",
            "email": "info@electronics-store.com"
        }
        
        response = self.session.post(f"{API_BASE}/stores", json=store_data)
        
        if response.status_code == 200 or response.status_code == 201:
            data = response.json()
            self.store_id = data['id']
            print(f"✅ Store created successfully. Store ID: {self.store_id}")
            return True
        else:
            print(f"❌ Store creation failed: {response.status_code} - {response.text}")
            return False
    
    def test_create_products_with_multiple_images(self):
        """Test creating products with multiple images (NEW FEATURE)"""
        print("\n=== Testing Product Creation with Multiple Images ===")
        
        # First upload some test images
        print("1. Uploading test images...")
        image_urls = []
        
        for i in range(3):
            img_data = self.create_test_image()
            files = {'file': ('test_image.jpg', img_data, 'image/jpeg')}
            
            response = self.session.post(f"{API_BASE}/upload-image", files=files)
            if response.status_code == 200:
                image_url = response.json()['image_url']
                image_urls.append(image_url)
                print(f"   ✅ Image {i+1} uploaded successfully")
            else:
                print(f"   ❌ Image {i+1} upload failed: {response.status_code}")
        
        # Create products with multiple images
        products_data = [
            {
                "name": "آيفون 15 برو ماكس",
                "description": "أحدث هاتف من آبل بكاميرا متطورة وأداء عالي",
                "price": 4999.99,
                "images": image_urls,  # Multiple images
                "stock": 10,
                "category": "هواتف ذكية"
            },
            {
                "name": "سماعات AirPods Pro",
                "description": "سماعات لاسلكية بتقنية إلغاء الضوضاء",
                "price": 899.99,
                "images": image_urls[:2],  # Two images
                "stock": 25,
                "category": "إكسسوارات"
            }
        ]
        
        print("2. Creating products with multiple images...")
        for i, product_data in enumerate(products_data):
            response = self.session.post(f"{API_BASE}/stores/{self.store_id}/products", json=product_data)
            
            if response.status_code == 200 or response.status_code == 201:
                data = response.json()
                self.product_ids.append(data['id'])
                print(f"   ✅ Product {i+1} created: {data['name']} with {len(data['images'])} images")
            else:
                print(f"   ❌ Product {i+1} creation failed: {response.status_code} - {response.text}")
        
        return len(self.product_ids) > 0
    
    def test_get_store_products_backward_compatibility(self):
        """Test GET store products with backward compatibility"""
        print("\n=== Testing Store Products Retrieval (Backward Compatibility) ===")
        
        response = self.session.get(f"{API_BASE}/stores/{self.store_id}/products")
        
        if response.status_code == 200:
            products = response.json()
            print(f"✅ Retrieved {len(products)} products")
            
            # Check that all products have 'images' field (not 'image')
            for product in products:
                if 'images' in product and isinstance(product['images'], list):
                    print(f"   ✅ Product '{product['name']}' has images array: {len(product['images'])} images")
                else:
                    print(f"   ❌ Product '{product['name']}' missing images array")
            return True
        else:
            print(f"❌ Failed to retrieve products: {response.status_code} - {response.text}")
            return False
    
    def test_product_like_unlike_functionality(self):
        """Test product like/unlike functionality (USER REPORTED BUGS)"""
        print("\n=== Testing Product Like/Unlike Functionality ===")
        
        if not self.product_ids:
            print("❌ No products available for testing")
            return False
        
        product_id = self.product_ids[0]
        
        # Test liking a product
        print("1. Testing product like...")
        response = self.session.post(f"{API_BASE}/products/{product_id}/like")
        
        if response.status_code == 200:
            data = response.json()
            likes_after_like = data.get('likes', 0)
            print(f"   ✅ Product liked successfully. Likes: {likes_after_like}")
        else:
            print(f"   ❌ Product like failed: {response.status_code} - {response.text}")
            return False
        
        # Test liking the same product again (should fail)
        print("2. Testing duplicate like (should fail)...")
        response = self.session.post(f"{API_BASE}/products/{product_id}/like")
        
        if response.status_code == 400:
            print("   ✅ Duplicate like correctly rejected")
        else:
            print(f"   ❌ Duplicate like should have been rejected: {response.status_code}")
        
        # Test unliking the product
        print("3. Testing product unlike...")
        response = self.session.delete(f"{API_BASE}/products/{product_id}/like")
        
        if response.status_code == 200:
            data = response.json()
            likes_after_unlike = data.get('likes', 0)
            print(f"   ✅ Product unliked successfully. Likes: {likes_after_unlike}")
            
            # Verify likes decreased
            if likes_after_unlike < likes_after_like:
                print("   ✅ Like count correctly decremented")
            else:
                print("   ❌ Like count did not decrement properly")
        else:
            print(f"   ❌ Product unlike failed: {response.status_code} - {response.text}")
            return False
        
        # Test unliking again (should fail)
        print("4. Testing duplicate unlike (should fail)...")
        response = self.session.delete(f"{API_BASE}/products/{product_id}/like")
        
        if response.status_code == 400:
            print("   ✅ Duplicate unlike correctly rejected")
            return True
        else:
            print(f"   ❌ Duplicate unlike should have been rejected: {response.status_code}")
            return False
    
    def test_product_update_partial(self):
        """Test product partial updates (UPDATED ENDPOINT)"""
        print("\n=== Testing Product Partial Updates ===")
        
        if not self.product_ids:
            print("❌ No products available for testing")
            return False
        
        product_id = self.product_ids[0]
        
        # Test partial update - only price and stock
        print("1. Testing partial update (price and stock only)...")
        update_data = {
            "price": 4799.99,
            "stock": 15
        }
        
        response = self.session.put(f"{API_BASE}/products/{product_id}", json=update_data)
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Product updated - Price: {data['price']}, Stock: {data['stock']}")
        else:
            print(f"   ❌ Product update failed: {response.status_code} - {response.text}")
            return False
        
        # Test updating images array
        print("2. Testing images array update...")
        
        # Upload a new image
        img_data = self.create_test_image()
        files = {'file': ('new_image.jpg', img_data, 'image/jpeg')}
        response = self.session.post(f"{API_BASE}/upload-image", files=files)
        
        if response.status_code == 200:
            new_image_url = response.json()['image_url']
            
            # Update product with new images array
            update_data = {
                "images": [new_image_url]
            }
            
            response = self.session.put(f"{API_BASE}/products/{product_id}", json=update_data)
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Product images updated - {len(data['images'])} images")
                return True
            else:
                print(f"   ❌ Images update failed: {response.status_code} - {response.text}")
        
        return False
    
    def test_upload_avatar(self):
        """Test profile picture upload (NEW ENDPOINT)"""
        print("\n=== Testing Profile Picture Upload ===")
        
        # Create test avatar image
        img_data = self.create_test_image(150, 150)
        files = {'file': ('avatar.jpg', img_data, 'image/jpeg')}
        
        response = self.session.post(f"{API_BASE}/auth/upload-avatar", files=files)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Avatar uploaded successfully")
            print(f"   Avatar URL length: {len(data['avatar'])} characters")
            
            # Verify avatar is set by checking profile
            profile_response = self.session.get(f"{API_BASE}/auth/me")
            if profile_response.status_code == 200:
                profile_data = profile_response.json()
                if profile_data.get('avatar'):
                    print("   ✅ Avatar correctly set in user profile")
                    return True
                else:
                    print("   ❌ Avatar not found in user profile")
            
        else:
            print(f"❌ Avatar upload failed: {response.status_code} - {response.text}")
        
        return False
    
    def test_delete_all_stores(self):
        """Test delete all stores endpoint (NEW ENDPOINT)"""
        print("\n=== Testing Delete All Stores ===")
        
        # First, get current stores count
        response = self.session.get(f"{API_BASE}/stores/owner/my-stores")
        if response.status_code == 200:
            stores_before = response.json()
            print(f"Stores before deletion: {len(stores_before)}")
        else:
            print("Could not get current stores count")
            stores_before = []
        
        # Delete all stores
        response = self.session.delete(f"{API_BASE}/stores/owner/delete-all")
        
        if response.status_code == 200:
            data = response.json()
            deleted_count = data.get('deleted_count', 0)
            print(f"✅ Delete all stores successful - {deleted_count} stores deleted")
            
            # Verify stores are actually deleted
            response = self.session.get(f"{API_BASE}/stores/owner/my-stores")
            if response.status_code == 200:
                stores_after = response.json()
                if len(stores_after) == 0:
                    print("   ✅ All stores successfully deleted")
                    return True
                else:
                    print(f"   ❌ {len(stores_after)} stores still remain")
            
        else:
            print(f"❌ Delete all stores failed: {response.status_code} - {response.text}")
        
        return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Boral Backend API Tests")
        print("=" * 50)
        
        results = {}
        
        # Test 1: User Registration and Login
        results['auth'] = self.test_user_registration_and_login()
        
        if not results['auth']:
            print("❌ Authentication failed - cannot continue with other tests")
            return results
        
        # Test 2: Store Creation
        results['store_creation'] = self.test_create_store()
        
        if not results['store_creation']:
            print("❌ Store creation failed - some tests may not work")
        
        # Test 3: Product Creation with Multiple Images (NEW)
        results['product_creation'] = self.test_create_products_with_multiple_images()
        
        # Test 4: Store Products Retrieval (Backward Compatibility)
        results['product_retrieval'] = self.test_get_store_products_backward_compatibility()
        
        # Test 5: Product Like/Unlike (USER REPORTED BUGS)
        results['like_unlike'] = self.test_product_like_unlike_functionality()
        
        # Test 6: Product Partial Updates (UPDATED)
        results['product_update'] = self.test_product_update_partial()
        
        # Test 7: Avatar Upload (NEW)
        results['avatar_upload'] = self.test_upload_avatar()
        
        # Test 8: Delete All Stores (NEW)
        results['delete_all_stores'] = self.test_delete_all_stores()
        
        # Print summary
        print("\n" + "=" * 50)
        print("🏁 TEST RESULTS SUMMARY")
        print("=" * 50)
        
        for test_name, passed in results.items():
            status = "✅ PASS" if passed else "❌ FAIL"
            print(f"{test_name.replace('_', ' ').title()}: {status}")
        
        total_tests = len(results)
        passed_tests = sum(results.values())
        
        print(f"\nOverall: {passed_tests}/{total_tests} tests passed")
        
        if passed_tests == total_tests:
            print("🎉 All tests passed!")
        else:
            print("⚠️  Some tests failed - check logs above for details")
        
        return results

if __name__ == "__main__":
    tester = BoralAPITester()
    results = tester.run_all_tests()
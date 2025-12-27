# E-Commerce Backend - API Reference & Implementation Guide

## Table of Contents
1. [Environment Setup](#environment-setup)
2. [Quick Start](#quick-start)
3. [Complete API Endpoints](#complete-api-endpoints)
4. [Implementation Checklist](#implementation-checklist)
5. [Database Indexes](#database-indexes)
6. [Deployment Guide](#deployment-guide)

---

## Environment Setup

### 1. Prerequisites

```bash
# Required software
- Node.js 18+ (LTS version recommended)
- MongoDB 6.0+
- npm or yarn
- Git
```

### 2. Environment Variables

Create `.env` file in root directory:

```bash
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce
MONGODB_TEST_URI=mongodb://localhost:27017/ecommerce_test

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRY=7d
JWT_REFRESH_EXPIRY=30d

# CORS
CORS_ORIGIN=http://localhost:3001,http://localhost:3000

# Rate Limiting
RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=100

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,image/gif

# Email (if implementing email service)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourstore.com

# Payment (for future Stripe integration)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL
FRONTEND_URL=http://localhost:3001

# Redis (for caching - optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Logging
LOG_LEVEL=debug
```

### 3. Installation

```bash
# Clone repository
git clone <your-repo-url>
cd ecommerce-backend

# Install dependencies
npm install

# Or with yarn
yarn install
```

---

## Quick Start

### 1. Database Setup

```bash
# Start MongoDB (if using local installation)
mongod --dbpath /path/to/data

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:6.0

# Create indexes (run after first start)
npm run db:seed
```

### 2. Run Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Watch mode
npm run start:watch

# Debug mode
npm run start:debug
```

### 3. Create First Admin User

```bash
# Using MongoDB shell or Compass, insert:
db.users.insertOne({
  email: "admin@example.com",
  password: "$2b$10$hashed_password_here", // Use bcrypt to hash "admin123"
  firstName: "Admin",
  lastName: "User",
  role: "super_admin",
  isVerified: true,
  isActive: true,
  authProvider: "local",
  addresses: [],
  preferences: {
    newsletter: false,
    smsNotifications: false,
    currency: "USD",
    language: "en"
  },
  createdAt: new Date(),
  updatedAt: new Date()
});
```

---

## Complete API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints

```http
### Register New User
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}

Response: 201 Created
{
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Registration successful"
}

---

### Login
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}

Response: 200 OK
{
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

---

### Forgot Password
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response: 200 OK
{
  "message": "Password reset link sent to email"
}

---

### Reset Password
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "password": "NewPassword123!"
}
```

### User Endpoints

```http
### Get Current User Profile
GET /users/me
Authorization: Bearer {token}

Response: 200 OK
{
  "data": {
    "_id": "...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    ...
  }
}

---

### Update Profile
PUT /users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "avatar": "https://example.com/avatar.jpg"
}

---

### Add Address
POST /users/me/addresses
Authorization: Bearer {token}
Content-Type: application/json

{
  "fullName": "John Doe",
  "phone": "+1234567890",
  "addressLine1": "123 Main St",
  "addressLine2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "country": "USA",
  "isDefault": true,
  "type": "both"
}

---

### Update Address
PUT /users/me/addresses/{addressId}
Authorization: Bearer {token}

---

### Delete Address
DELETE /users/me/addresses/{addressId}
Authorization: Bearer {token}

---

### Update Preferences
PUT /users/me/preferences
Authorization: Bearer {token}
Content-Type: application/json

{
  "newsletter": true,
  "smsNotifications": false,
  "currency": "USD",
  "language": "en"
}
```

### Category Endpoints

```http
### Get All Categories
GET /categories
Query Params:
  - includeInactive: boolean (optional, admin only)

Response: 200 OK
{
  "data": [
    {
      "_id": "...",
      "name": "Electronics",
      "slug": "electronics",
      "description": "...",
      "image": "...",
      "parentCategory": null,
      "level": 0,
      "isActive": true
    }
  ]
}

---

### Get Category Tree (Hierarchical)
GET /categories/tree

Response: 200 OK
{
  "data": [
    {
      "_id": "...",
      "name": "Electronics",
      "slug": "electronics",
      "children": [
        {
          "_id": "...",
          "name": "Laptops",
          "slug": "laptops",
          "children": []
        }
      ]
    }
  ]
}

---

### Get Single Category
GET /categories/{slug}

---

### Create Category (Admin)
POST /categories
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "name": "Electronics",
  "slug": "electronics",
  "description": "Electronic devices and accessories",
  "image": "https://...",
  "parentCategory": null,
  "displayOrder": 1,
  "isActive": true,
  "isFeatured": true,
  "metaTitle": "Electronics - Shop Now",
  "metaDescription": "...",
  "attributes": [
    {
      "name": "Brand",
      "type": "select",
      "values": ["Apple", "Samsung", "Sony"],
      "isRequired": false,
      "isFilterable": true
    }
  ]
}

---

### Update Category (Admin)
PUT /categories/{id}
Authorization: Bearer {admin-token}

---

### Delete Category (Admin)
DELETE /categories/{id}
Authorization: Bearer {admin-token}
```

### Product Endpoints

```http
### Get All Products (Public)
GET /products
Query Params:
  - page: number (default: 1)
  - limit: number (default: 20, max: 100)
  - sortBy: 'name'|'price'|'createdAt'|'salesCount'|'averageRating'
  - sortOrder: 'asc'|'desc'
  - categories: string[] (category IDs)
  - minPrice: number
  - maxPrice: number
  - inStock: boolean
  - isFeatured: boolean
  - search: string
  - tags: string[]
  - brand: string

Example:
GET /products?page=1&limit=20&categories=123,456&minPrice=10&maxPrice=100&sortBy=price&sortOrder=asc

Response: 200 OK
{
  "data": {
    "products": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}

---

### Get Featured Products
GET /products/featured?limit=10

---

### Get Single Product
GET /products/{slug}

Response: 200 OK
{
  "data": {
    "_id": "...",
    "name": "Product Name",
    "slug": "product-name",
    "sku": "PROD-001",
    "shortDescription": "...",
    "description": "...",
    "basePrice": 99.99,
    "compareAtPrice": 149.99,
    "stock": 50,
    "images": [ ... ],
    "categories": [ ... ],
    "hasVariants": true,
    "variantOptions": [
      {
        "name": "Color",
        "values": ["Red", "Blue", "Green"]
      },
      {
        "name": "Size",
        "values": ["S", "M", "L", "XL"]
      }
    ],
    "averageRating": 4.5,
    "reviewCount": 120
  }
}

---

### Get Related Products
GET /products/{id}/related?limit=4

---

### Create Product (Admin)
POST /products
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "name": "Wireless Headphones",
  "slug": "wireless-headphones",
  "sku": "WH-001",
  "shortDescription": "Premium wireless headphones with noise cancellation",
  "description": "<p>Full HTML description...</p>",
  "categories": ["category_id_1", "category_id_2"],
  "primaryCategory": "category_id_1",
  "tags": ["audio", "wireless", "bluetooth"],
  "brand": "AudioTech",
  "basePrice": 199.99,
  "compareAtPrice": 299.99,
  "cost": 100.00,
  "taxable": true,
  "trackInventory": true,
  "stock": 100,
  "lowStockThreshold": 10,
  "weight": 0.5,
  "weightUnit": "kg",
  "dimensions": {
    "length": 20,
    "width": 15,
    "height": 10,
    "unit": "cm"
  },
  "images": [
    {
      "url": "https://...",
      "alt": "Main product image",
      "position": 0,
      "isPrimary": true
    }
  ],
  "secondaryImages": [
    {
      "type": "size_guide",
      "url": "https://...",
      "title": "Size Guide"
    }
  ],
  "hasVariants": true,
  "variantOptions": [
    {
      "name": "Color",
      "values": ["Black", "White", "Blue"]
    }
  ],
  "attributes": [
    {
      "name": "Connectivity",
      "value": "Bluetooth 5.0"
    }
  ],
  "metaTitle": "Wireless Headphones - AudioTech",
  "metaDescription": "...",
  "status": "active",
  "isActive": true,
  "isFeatured": true
}

---

### Update Product (Admin)
PUT /products/{id}
Authorization: Bearer {admin-token}

---

### Delete Product (Admin)
DELETE /products/{id}
Authorization: Bearer {admin-token}
```

### Product Variant Endpoints

```http
### Get Product Variants
GET /product-variants/product/{productId}

Response: 200 OK
{
  "data": [
    {
      "_id": "...",
      "productId": "...",
      "sku": "WH-001-BLK-L",
      "options": [
        { "name": "Color", "value": "Black" },
        { "name": "Size", "value": "L" }
      ],
      "price": 199.99,
      "stock": 25,
      "images": [ ... ]
    }
  ]
}

---

### Get Single Variant
GET /product-variants/{id}

---

### Create Variant (Admin)
POST /product-variants
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "productId": "product_id",
  "sku": "WH-001-BLK-L",
  "options": [
    { "name": "Color", "value": "Black" },
    { "name": "Size", "value": "L" }
  ],
  "price": 199.99,
  "stock": 25,
  "images": [
    {
      "url": "https://...",
      "alt": "Black variant",
      "isPrimary": true
    }
  ],
  "weight": 0.5,
  "isActive": true,
  "position": 1
}

---

### Update Variant (Admin)
PUT /product-variants/{id}
Authorization: Bearer {admin-token}

---

### Delete Variant (Admin)
DELETE /product-variants/{id}
Authorization: Bearer {admin-token}
```

### Discount/Coupon Endpoints

```http
### Validate Coupon Code
POST /discounts/validate
Content-Type: application/json

{
  "code": "SUMMER2024",
  "userId": "user_id_optional",
  "cartTotal": 150.00,
  "productIds": ["prod1", "prod2"]
}

Response: 200 OK
{
  "data": {
    "valid": true,
    "discount": {
      "_id": "...",
      "code": "SUMMER2024",
      "type": "percentage",
      "value": 20,
      "name": "Summer Sale"
    }
  }
}

---

### Get All Discounts (Admin)
GET /discounts
Authorization: Bearer {admin-token}
Query Params:
  - active: boolean

---

### Get Single Discount (Admin)
GET /discounts/{id}
Authorization: Bearer {admin-token}

---

### Create Discount (Admin)
POST /discounts
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "name": "Summer Sale 2024",
  "description": "20% off all summer items",
  "code": "SUMMER2024",
  "type": "percentage",
  "value": 20,
  "applicationType": "entire_order",
  "minimumPurchaseAmount": 50,
  "usageLimit": 1000,
  "usageLimitPerCustomer": 1,
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-08-31T23:59:59Z",
  "isActive": true,
  "isPublic": true
}

---

### Update Discount (Admin)
PUT /discounts/{id}
Authorization: Bearer {admin-token}

---

### Delete Discount (Admin)
DELETE /discounts/{id}
Authorization: Bearer {admin-token}
```

### Cart Endpoints

```http
### Get Cart
GET /cart
Authorization: Bearer {token} (optional for guest)

Response: 200 OK
{
  "data": {
    "_id": "...",
    "items": [
      {
        "_id": "...",
        "productId": "...",
        "productName": "Wireless Headphones",
        "productSlug": "wireless-headphones",
        "productImage": "https://...",
        "price": 199.99,
        "quantity": 2,
        "variantOptions": [
          { "name": "Color", "value": "Black" }
        ]
      }
    ],
    "subtotal": 399.98,
    "discountTotal": 40.00,
    "taxTotal": 35.99,
    "shippingTotal": 10.00,
    "total": 405.97
  }
}

---

### Add to Cart
POST /cart/items
Authorization: Bearer {token} (optional for guest)
Content-Type: application/json

{
  "productId": "product_id",
  "variantId": "variant_id_optional",
  "quantity": 1
}

Response: 201 Created
{
  "data": { ... updated cart ... }
}

---

### Update Cart Item
PUT /cart/items/{itemId}
Authorization: Bearer {token} (optional for guest)
Content-Type: application/json

{
  "quantity": 3
}

---

### Remove from Cart
DELETE /cart/items/{itemId}
Authorization: Bearer {token} (optional for guest)

Response: 204 No Content

---

### Clear Cart
DELETE /cart
Authorization: Bearer {token} (optional for guest)

---

### Apply Coupon
POST /cart/coupons
Authorization: Bearer {token} (optional for guest)
Content-Type: application/json

{
  "code": "SUMMER2024"
}

---

### Remove Coupon
DELETE /cart/coupons/{code}
Authorization: Bearer {token} (optional for guest)
```

### Order Endpoints

```http
### Create Order (Checkout)
POST /orders
Authorization: Bearer {token} (optional for guest)
Content-Type: application/json

{
  "customer": {
    "email": "customer@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  },
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "+1234567890",
    "addressLine1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA"
  },
  "billingAddress": { ... same structure ... },
  "paymentMethod": "mock",
  "shippingMethod": "standard",
  "customerNote": "Please leave at door",
  "mockPaymentDetails": {
    "cardNumber": "4242424242424242",
    "cardHolder": "John Doe",
    "expiryDate": "12/25",
    "cvv": "123"
  }
}

Response: 201 Created
{
  "data": {
    "_id": "...",
    "orderNumber": "ORD-20240101-0001",
    "customer": { ... },
    "items": [ ... ],
    "total": 405.97,
    "status": "confirmed",
    "paymentStatus": "paid"
  }
}

---

### Get User Orders
GET /orders/my-orders
Authorization: Bearer {token}
Query Params:
  - page: number
  - limit: number

---

### Get Single Order
GET /orders/my-orders/{id}
Authorization: Bearer {token}

---

### Track Order (Public)
GET /orders/track/{orderNumber}

Response: 200 OK
{
  "data": {
    "orderNumber": "ORD-20240101-0001",
    "status": "shipped",
    "trackingNumber": "1Z999AA1234567890",
    "trackingUrl": "https://...",
    "estimatedDeliveryDate": "2024-01-15T00:00:00Z",
    "shippedAt": "2024-01-10T10:00:00Z"
  }
}

---

### Cancel Order
PUT /orders/my-orders/{id}/cancel
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Changed my mind"
}

---

### Get All Orders (Admin)
GET /orders
Authorization: Bearer {admin-token}
Query Params:
  - page, limit, status, paymentStatus, startDate, endDate, email, orderNumber

---

### Get Order Stats (Admin)
GET /orders/stats
Authorization: Bearer {admin-token}

Response: 200 OK
{
  "data": [
    {
      "_id": "confirmed",
      "count": 150,
      "totalAmount": 45000.00
    }
  ]
}

---

### Update Order Status (Admin)
PUT /orders/{id}/status
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "status": "shipped",
  "trackingNumber": "1Z999AA1234567890",
  "trackingUrl": "https://...",
  "shippingCarrier": "UPS",
  "internalNote": "..."
}
```

### Review Endpoints

```http
### Get Product Reviews
GET /reviews?productId={productId}&page=1&limit=20
Query Params:
  - productId: string (required)
  - page, limit
  - rating: 1-5
  - status: 'approved'|'pending'|'rejected'
  - sortBy: 'rating'|'helpful'|'recent'

Response: 200 OK
{
  "data": {
    "reviews": [
      {
        "_id": "...",
        "userId": { ... },
        "rating": 5,
        "title": "Great product!",
        "comment": "...",
        "images": [ ... ],
        "isVerifiedPurchase": true,
        "helpfulCount": 15,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}

---

### Get Product Rating Stats
GET /reviews/product/{productId}/stats

Response: 200 OK
{
  "data": {
    "average": 4.5,
    "total": 120,
    "distribution": [
      { "_id": 5, "count": 80 },
      { "_id": 4, "count": 30 },
      { "_id": 3, "count": 8 },
      { "_id": 2, "count": 1 },
      { "_id": 1, "count": 1 }
    ]
  }
}

---

### Create Review
POST /reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "product_id",
  "rating": 5,
  "title": "Excellent product",
  "comment": "This product exceeded my expectations...",
  "images": [
    {
      "url": "https://...",
      "alt": "Product in use"
    }
  ]
}

---

### Update Review
PUT /reviews/{id}
Authorization: Bearer {token}

---

### Delete Review
DELETE /reviews/{id}
Authorization: Bearer {token}

---

### Mark Review as Helpful
POST /reviews/{id}/helpful

---

### Moderate Review (Admin)
PUT /reviews/{id}/moderate
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "status": "approved",
  "moderationNote": "..."
}

---

### Add Admin Response (Admin)
POST /reviews/{id}/response
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "text": "Thank you for your feedback..."
}
```

---

## Implementation Checklist

### Phase 1: Foundation (Week 1)
```
Backend Setup:
□ Initialize NestJS project
□ Setup MongoDB connection
□ Configure environment variables
□ Setup TypeScript strict mode
□ Install and configure Zod
□ Create folder structure
□ Setup error handling middleware
□ Implement logging
□ Configure CORS

Database:
□ Create all Mongoose schemas
□ Add indexes
□ Test database connection
□ Create seed data script

Authentication:
□ Implement JWT strategy
□ Create auth guards
□ Implement registration
□ Implement login
□ Implement password reset
□ Add rate limiting for auth endpoints
```

### Phase 2: Core Features (Week 2-3)
```
User Management:
□ User CRUD operations
□ Address management
□ User preferences
□ Profile update

Categories:
□ Category CRUD
□ Category hierarchy
□ Category tree endpoint
□ Slug generation

Products:
□ Product CRUD
□ Product filtering
□ Product search
□ Image upload
□ Stock management
□ Featured products

Product Variants:
□ Variant CRUD
□ Variant-specific pricing
□ Variant-specific images
□ Stock tracking per variant
```

### Phase 3: Shopping Features (Week 4)
```
Discounts:
□ Discount CRUD
□ Coupon validation
□ Discount calculation
□ Usage tracking

Cart:
□ Add to cart (guest & user)
□ Update cart items
□ Remove from cart
□ Apply coupons
□ Cart calculations
□ Guest cart merge on login

Orders:
□ Checkout process
□ Order creation
□ Stock deduction
□ Mock payment processing
□ Order tracking
□ Order history
□ Order status updates
```

### Phase 4: Reviews & Admin (Week 5)
```
Reviews:
□ Review CRUD
□ Review moderation
□ Rating calculations
□ Helpful voting
□ Verified purchase indicator
□ Admin responses

Admin Panel:
□ Order management
□ Product management
□ User management
□ Discount management
□ Review moderation
□ Analytics/Stats endpoints
```

### Phase 5: Testing & Optimization (Week 6)
```
Testing:
□ Unit tests for services
□ E2E tests for critical flows
□ Test coverage >80%

Performance:
□ Add caching layer
□ Optimize database queries
□ Add pagination everywhere
□ Implement lazy loading

Security:
□ Input sanitization
□ SQL injection protection (Mongoose ORM)
□ Rate limiting
□ HTTPS enforcement
□ Security headers
```

### Phase 6: Documentation & Deployment (Week 7)
```
Documentation:
□ API documentation (Swagger/Postman)
□ Setup guide
□ Environment variables guide
□ Database schema documentation

Deployment:
□ Docker setup
□ CI/CD pipeline
□ Production environment config
□ Monitoring setup
□ Backup strategy
```

---

## Database Indexes

### Critical Indexes to Create

```javascript
// Users Collection
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isActive: 1 });
db.users.createIndex({ createdAt: -1 });

// Categories Collection
db.categories.createIndex({ slug: 1 }, { unique: true });
db.categories.createIndex({ parentCategory: 1 });
db.categories.createIndex({ isActive: 1 });
db.categories.createIndex({ displayOrder: 1 });

// Products Collection
db.products.createIndex({ slug: 1 }, { unique: true });
db.products.createIndex({ sku: 1 }, { unique: true });
db.products.createIndex({ categories: 1 });
db.products.createIndex({ status: 1, isActive: 1 });
db.products.createIndex({ basePrice: 1 });
db.products.createIndex({ averageRating: -1 });
db.products.createIndex({ createdAt: -1 });
db.products.createIndex({ name: "text", description: "text", tags: "text" });

// Product Variants Collection
db.productvariants.createIndex({ sku: 1 }, { unique: true });
db.productvariants.createIndex({ productId: 1 });
db.productvariants.createIndex({ isActive: 1 });
db.productvariants.createIndex({ productId: 1, "options.name": 1, "options.value": 1 });

// Discounts Collection
db.discounts.createIndex({ code: 1 }, { unique: true, sparse: true });
db.discounts.createIndex({ isActive: 1 });
db.discounts.createIndex({ startDate: 1, endDate: 1 });

// Cart Collection
db.carts.createIndex({ userId: 1 });
db.carts.createIndex({ sessionId: 1 });
db.carts.createIndex({ status: 1 });
db.carts.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Orders Collection
db.orders.createIndex({ orderNumber: 1 }, { unique: true });
db.orders.createIndex({ "customer.userId": 1 });
db.orders.createIndex({ "customer.email": 1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ paymentStatus: 1 });
db.orders.createIndex({ createdAt: -1 });

// Reviews Collection
db.reviews.createIndex({ productId: 1 });
db.reviews.createIndex({ userId: 1 });
db.reviews.createIndex({ status: 1 });
db.reviews.createIndex({ rating: 1 });
db.reviews.createIndex({ createdAt: -1 });
db.reviews.createIndex({ productId: 1, userId: 1 }, { unique: true });
```

---

## Deployment Guide

### Using Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/ecommerce
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

volumes:
  mongo-data:
```

### Production Checklist

```
□ Set NODE_ENV=production
□ Use strong JWT secret (min 32 characters)
□ Enable HTTPS
□ Configure CORS properly
□ Set up MongoDB replica set
□ Enable MongoDB authentication
□ Configure rate limiting
□ Set up logging service (e.g., Winston, Loggly)
□ Set up monitoring (e.g., PM2, New Relic)
□ Configure automated backups
□ Set up error tracking (e.g., Sentry)
□ Enable compression
□ Set security headers
□ Run security audit (npm audit)
□ Set up CI/CD pipeline
□ Configure load balancer
□ Set up CDN for static assets
□ Configure email service
□ Test disaster recovery plan
```

---

## Next Steps

1. **Start with Phase 1**: Setup the foundation - project structure, database, and auth
2. **Implement feature by feature**: Follow the order in the implementation checklist
3. **Test as you go**: Write tests alongside feature implementation
4. **Document your API**: Update API documentation with any changes
5. **Optimize**: Add caching, optimize queries after basic functionality works
6. **Deploy**: Use Docker for easy deployment

Remember: 
- Use the provided Zod schemas for validation
- Follow the naming conventions
- Keep business logic in services
- Use repositories for database operations
- Handle errors properly
- Write tests!

Good luck with your implementation! 🚀
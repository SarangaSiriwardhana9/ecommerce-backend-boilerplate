# Universal E-Commerce Backend - Complete Implementation Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Database Schema Design](#database-schema-design)
4. [Feature-by-Feature Implementation](#feature-by-feature-implementation)
5. [API Endpoints Reference](#api-endpoints-reference)
6. [Security Considerations](#security-considerations)

---

## Project Overview

### Purpose
A universal, scalable e-commerce backend that can serve multiple store types (clothing, electronics, furniture, etc.) with a focus on:
- Guest checkout capability (no login required for purchases)
- Flexible product management with variants
- Admin-controlled content
- Easy integration with any frontend

### Key Business Rules
- **Guest Shopping**: Customers can browse, add to cart, and checkout without authentication
- **Authentication Only For**: Product comments/reviews require user account
- **Admin Control**: All content management through secure admin endpoints
- **Multi-Store Ready**: Generic naming and structure to support any product type

---

## Technology Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Validation**: Zod schemas
- **Authentication**: JWT (JSON Web Tokens)

### Frontend (SSR)
- **Framework**: Next.js 14+ (App Router)
- **State Management**: Zustand
- **UI Components**: Shadcn/ui
- **Validation**: Zod (shared schemas)

---

## Database Schema Design

### 1. User Collection

```typescript
{
  _id: ObjectId,
  email: string (unique, required),
  password: string (hashed, required for regular users),
  firstName: string,
  lastName: string,
  phone: string,
  role: enum ['customer', 'admin', 'super_admin'],
  isVerified: boolean,
  isActive: boolean,
  
  // Optional auth providers
  authProvider: enum ['local', 'google', 'facebook'],
  providerId: string,
  
  // Profile
  avatar: string (URL),
  
  // Addresses (embedded)
  addresses: [{
    _id: ObjectId,
    fullName: string,
    phone: string,
    addressLine1: string,
    addressLine2: string,
    city: string,
    state: string,
    postalCode: string,
    country: string,
    isDefault: boolean,
    type: enum ['shipping', 'billing', 'both']
  }],
  
  // Preferences
  preferences: {
    newsletter: boolean,
    smsNotifications: boolean,
    currency: string,
    language: string
  },
  
  // Metadata
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date (soft delete)
}
```

**Indexes:**
- `email` (unique)
- `role`
- `isActive`
- `createdAt`

---

### 2. Category Collection

```typescript
{
  _id: ObjectId,
  name: string (required),
  slug: string (unique, required),
  description: string,
  
  // Hierarchy support
  parentCategory: ObjectId (ref: Category, nullable),
  level: number (0 for root, 1 for sub, etc.),
  path: string (e.g., "electronics/computers/laptops"),
  
  // Media
  image: string (URL),
  icon: string (icon name or URL),
  
  // SEO
  metaTitle: string,
  metaDescription: string,
  metaKeywords: [string],
  
  // Display
  displayOrder: number,
  isActive: boolean,
  isFeatured: boolean,
  
  // Attributes specific to this category
  attributes: [{
    name: string,
    type: enum ['text', 'number', 'select', 'multiselect'],
    values: [string], // for select types
    isRequired: boolean,
    isFilterable: boolean
  }],
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `slug` (unique)
- `parentCategory`
- `isActive`
- `displayOrder`

---

### 3. Product Collection

```typescript
{
  _id: ObjectId,
  name: string (required),
  slug: string (unique, required),
  sku: string (unique, required),
  
  // Descriptions
  shortDescription: string (max 200 chars),
  description: string (rich text/HTML),
  
  // Categorization
  categories: [ObjectId] (ref: Category),
  primaryCategory: ObjectId (ref: Category),
  tags: [string],
  
  // Brand (if applicable)
  brand: string,
  manufacturer: string,
  
  // Pricing
  basePrice: number (required),
  compareAtPrice: number (original price for discount display),
  cost: number (for profit calculation),
  
  // Tax
  taxable: boolean,
  taxCode: string,
  
  // Inventory (for simple products without variants)
  trackInventory: boolean,
  stock: number,
  lowStockThreshold: number,
  allowBackorder: boolean,
  
  // Physical properties
  weight: number,
  weightUnit: enum ['kg', 'g', 'lb', 'oz'],
  dimensions: {
    length: number,
    width: number,
    height: number,
    unit: enum ['cm', 'inch']
  },
  
  // Media
  images: [{
    url: string (required),
    alt: string,
    position: number,
    isPrimary: boolean
  }],
  secondaryImages: [{
    type: enum ['size_guide', 'care_instructions', 'certificate'],
    url: string,
    title: string
  }],
  videos: [{
    url: string,
    thumbnail: string,
    title: string
  }],
  
  // Variants
  hasVariants: boolean,
  variantOptions: [{
    name: string (e.g., "Color", "Size"),
    values: [string] (e.g., ["Red", "Blue"], ["S", "M", "L"])
  }],
  
  // Product type specific attributes
  attributes: [{
    name: string,
    value: string
  }],
  
  // SEO
  metaTitle: string,
  metaDescription: string,
  metaKeywords: [string],
  
  // Status
  status: enum ['draft', 'active', 'archived', 'out_of_stock'],
  isActive: boolean,
  isFeatured: boolean,
  
  // Dates
  publishedAt: Date,
  availableFrom: Date,
  availableUntil: Date,
  
  // Stats (denormalized for performance)
  viewCount: number,
  salesCount: number,
  averageRating: number,
  reviewCount: number,
  
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date
}
```

**Indexes:**
- `slug` (unique)
- `sku` (unique)
- `categories`
- `status`
- `isActive`
- `isFeatured`
- `createdAt`
- `averageRating`
- Text index on `name`, `description`, `tags`

---

### 4. ProductVariant Collection

```typescript
{
  _id: ObjectId,
  productId: ObjectId (ref: Product, required),
  
  // Variant identification
  sku: string (unique, required),
  barcode: string,
  
  // Variant options (combination)
  options: [{
    name: string (e.g., "Color"),
    value: string (e.g., "Red")
  }],
  
  // Example: 
  // [{name: "Color", value: "Red"}, {name: "Size", value: "L"}]
  
  // Pricing (can override product base price)
  price: number,
  compareAtPrice: number,
  cost: number,
  
  // Inventory
  stock: number (required),
  lowStockThreshold: number,
  
  // Media specific to this variant
  images: [{
    url: string,
    alt: string,
    position: number,
    isPrimary: boolean
  }],
  
  // Physical properties (can override product defaults)
  weight: number,
  dimensions: {
    length: number,
    width: number,
    height: number
  },
  
  // Variant specific description (optional)
  description: string,
  
  // Status
  isActive: boolean,
  
  // Position for display ordering
  position: number,
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `sku` (unique)
- `productId`
- `isActive`
- Compound index on `productId` + `options.name` + `options.value`

---

### 5. Discount Collection

```typescript
{
  _id: ObjectId,
  
  // Basic info
  name: string (required),
  description: string,
  code: string (unique, for coupon codes),
  
  // Type
  type: enum ['percentage', 'fixed_amount', 'free_shipping'],
  value: number (required), // percentage (0-100) or fixed amount
  
  // Application scope
  applicationType: enum ['entire_order', 'specific_products', 'specific_categories', 'minimum_purchase'],
  
  // Applicable items
  applicableProducts: [ObjectId] (ref: Product),
  applicableCategories: [ObjectId] (ref: Category),
  
  // Minimum requirements
  minimumPurchaseAmount: number,
  minimumQuantity: number,
  
  // Usage limits
  usageLimit: number (null for unlimited),
  usageCount: number,
  usageLimitPerCustomer: number,
  
  // Date range
  startDate: Date (required),
  endDate: Date (required),
  
  // Status
  isActive: boolean,
  isPublic: boolean, // false for exclusive/targeted coupons
  
  // Targeting
  targetedUserEmails: [string],
  targetedUserIds: [ObjectId] (ref: User),
  
  // Restrictions
  excludeSaleItems: boolean,
  firstOrderOnly: boolean,
  
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `code` (unique, sparse)
- `isActive`
- `startDate`, `endDate`
- `applicableProducts`
- `applicableCategories`

---

### 6. Cart Collection

```typescript
{
  _id: ObjectId,
  
  // Owner (null for guest carts)
  userId: ObjectId (ref: User, nullable),
  sessionId: string (for guest carts, required if userId is null),
  
  // Cart items
  items: [{
    _id: ObjectId,
    productId: ObjectId (ref: Product, required),
    variantId: ObjectId (ref: ProductVariant, nullable),
    
    // Snapshot of product info (in case product changes)
    productName: string,
    productSlug: string,
    productImage: string,
    
    // Variant info (if applicable)
    variantOptions: [{
      name: string,
      value: string
    }],
    
    // Pricing at time of add-to-cart
    price: number (required),
    compareAtPrice: number,
    
    quantity: number (required, min: 1),
    
    // Applied discount (if any)
    discountId: ObjectId (ref: Discount),
    discountAmount: number,
    
    addedAt: Date
  }],
  
  // Applied coupons
  appliedCoupons: [{
    discountId: ObjectId (ref: Discount),
    code: string,
    discountAmount: number
  }],
  
  // Calculated totals
  subtotal: number,
  discountTotal: number,
  taxTotal: number,
  shippingTotal: number,
  total: number,
  
  // Status
  status: enum ['active', 'abandoned', 'converted', 'merged'],
  
  // Metadata
  lastActivityAt: Date,
  expiresAt: Date, // for cleanup of old carts
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `userId`
- `sessionId`
- `status`
- `lastActivityAt`
- `expiresAt` (for TTL cleanup)

---

### 7. Order Collection

```typescript
{
  _id: ObjectId,
  orderNumber: string (unique, auto-generated, e.g., "ORD-20240101-0001"),
  
  // Customer info (captured at checkout, even for guests)
  customer: {
    userId: ObjectId (ref: User, nullable),
    email: string (required),
    firstName: string (required),
    lastName: string (required),
    phone: string
  },
  
  // Addresses
  shippingAddress: {
    fullName: string,
    phone: string,
    addressLine1: string,
    addressLine2: string,
    city: string,
    state: string,
    postalCode: string,
    country: string
  },
  
  billingAddress: {
    fullName: string,
    phone: string,
    addressLine1: string,
    addressLine2: string,
    city: string,
    state: string,
    postalCode: string,
    country: string
  },
  
  // Order items (snapshot)
  items: [{
    _id: ObjectId,
    productId: ObjectId (ref: Product),
    variantId: ObjectId (ref: ProductVariant, nullable),
    
    // Snapshot of product at time of order
    productName: string,
    productSlug: string,
    productImage: string,
    sku: string,
    
    variantOptions: [{
      name: string,
      value: string
    }],
    
    quantity: number,
    price: number, // price per unit at time of order
    compareAtPrice: number,
    
    discountAmount: number, // discount per unit
    taxAmount: number,
    
    total: number // (price - discountAmount) * quantity + taxAmount
  }],
  
  // Pricing breakdown
  subtotal: number,
  discountTotal: number,
  taxTotal: number,
  shippingTotal: number,
  total: number,
  
  // Applied discounts
  appliedDiscounts: [{
    discountId: ObjectId (ref: Discount),
    code: string,
    name: string,
    type: string,
    amount: number
  }],
  
  // Payment
  paymentMethod: enum ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery', 'mock'],
  paymentStatus: enum ['pending', 'authorized', 'paid', 'failed', 'refunded', 'partially_refunded'],
  paymentDetails: {
    transactionId: string,
    paymentGateway: string,
    last4: string,
    cardBrand: string,
    paidAt: Date
  },
  
  // Shipping
  shippingMethod: string,
  shippingCarrier: string,
  trackingNumber: string,
  trackingUrl: string,
  estimatedDeliveryDate: Date,
  shippedAt: Date,
  deliveredAt: Date,
  
  // Order status
  status: enum [
    'pending_payment',
    'payment_failed',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
  ],
  
  // Fulfillment status
  fulfillmentStatus: enum ['unfulfilled', 'partially_fulfilled', 'fulfilled'],
  
  // Notes
  customerNote: string,
  internalNote: string, // admin only
  
  // Cancellation
  cancellationReason: string,
  cancelledAt: Date,
  cancelledBy: ObjectId (ref: User),
  
  // Refund
  refundAmount: number,
  refundReason: string,
  refundedAt: Date,
  
  // Communication
  orderConfirmationSentAt: Date,
  shippingNotificationSentAt: Date,
  deliveryNotificationSentAt: Date,
  
  // Metadata
  source: enum ['web', 'mobile', 'admin', 'api'],
  ipAddress: string,
  userAgent: string,
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `orderNumber` (unique)
- `customer.userId`
- `customer.email`
- `status`
- `paymentStatus`
- `fulfillmentStatus`
- `createdAt`

---

### 8. Review/Comment Collection

```typescript
{
  _id: ObjectId,
  productId: ObjectId (ref: Product, required),
  userId: ObjectId (ref: User, required), // Auth required for reviews
  orderId: ObjectId (ref: Order, nullable), // Verified purchase
  
  // Review content
  rating: number (required, 1-5),
  title: string,
  comment: string (required),
  
  // Media
  images: [{
    url: string,
    alt: string
  }],
  
  // Verification
  isVerifiedPurchase: boolean,
  
  // Moderation
  status: enum ['pending', 'approved', 'rejected', 'flagged'],
  moderatedBy: ObjectId (ref: User),
  moderatedAt: Date,
  moderationNote: string,
  
  // Helpful votes
  helpfulCount: number,
  notHelpfulCount: number,
  
  // Response from admin/seller
  response: {
    text: string,
    respondedBy: ObjectId (ref: User),
    respondedAt: Date
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `productId`
- `userId`
- `status`
- `rating`
- `isVerifiedPurchase`
- `createdAt`

---

### 9. ReviewVote Collection (for helpful voting)

```typescript
{
  _id: ObjectId,
  reviewId: ObjectId (ref: Review, required),
  userId: ObjectId (ref: User, nullable),
  sessionId: string (for guests),
  voteType: enum ['helpful', 'not_helpful'],
  createdAt: Date
}
```

**Indexes:**
- Compound index on `reviewId` + `userId`
- Compound index on `reviewId` + `sessionId`

---

### 10. AdminActivity Collection (Audit Log)

```typescript
{
  _id: ObjectId,
  adminId: ObjectId (ref: User, required),
  
  action: enum [
    'product_created', 'product_updated', 'product_deleted',
    'category_created', 'category_updated', 'category_deleted',
    'discount_created', 'discount_updated', 'discount_deleted',
    'order_updated', 'order_cancelled', 'order_refunded',
    'review_moderated',
    'user_role_changed', 'user_banned',
    'settings_updated'
  ],
  
  resourceType: string (e.g., 'Product', 'Order'),
  resourceId: ObjectId,
  
  changes: {
    before: object,
    after: object
  },
  
  metadata: {
    ipAddress: string,
    userAgent: string
  },
  
  createdAt: Date
}
```

**Indexes:**
- `adminId`
- `action`
- `resourceType`
- `resourceId`
- `createdAt`

---

### 11. Settings Collection (System-wide settings)

```typescript
{
  _id: ObjectId,
  key: string (unique, required),
  value: any,
  type: enum ['string', 'number', 'boolean', 'json', 'array'],
  
  category: enum ['general', 'shipping', 'payment', 'email', 'tax', 'appearance'],
  
  description: string,
  isPublic: boolean, // can be accessed without auth
  
  updatedBy: ObjectId (ref: User),
  updatedAt: Date
}
```

**Examples of settings:**
- `store_name`
- `store_email`
- `default_currency`
- `tax_rate`
- `free_shipping_threshold`
- `low_stock_threshold`
- `enable_guest_checkout`
- `enable_reviews`

**Indexes:**
- `key` (unique)
- `category`
- `isPublic`

---

### 12. Newsletter Collection

```typescript
{
  _id: ObjectId,
  email: string (unique, required),
  
  status: enum ['subscribed', 'unsubscribed', 'bounced'],
  
  source: string (e.g., 'footer_form', 'checkout', 'popup'),
  
  preferences: {
    frequency: enum ['daily', 'weekly', 'monthly'],
    categories: [string]
  },
  
  subscribedAt: Date,
  unsubscribedAt: Date,
  unsubscribeReason: string,
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email` (unique)
- `status`

---

### 13. Media/Asset Collection (Optional, for media management)

```typescript
{
  _id: ObjectId,
  
  fileName: string,
  originalName: string,
  mimeType: string,
  size: number (bytes),
  
  url: string (required),
  thumbnailUrl: string,
  
  type: enum ['image', 'video', 'document'],
  
  // Organization
  folder: string,
  tags: [string],
  
  // Usage tracking
  usedIn: [{
    resourceType: string,
    resourceId: ObjectId
  }],
  
  // Metadata
  alt: string,
  title: string,
  description: string,
  
  uploadedBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `type`
- `folder`
- `uploadedBy`
- `createdAt`

---

## Feature-by-Feature Implementation

### Feature 1: Authentication & Authorization

#### Files Structure
```
src/
├── modules/
│   └── auth/
│       ├── auth.module.ts
│       ├── auth.controller.ts
│       ├── auth.service.ts
│       ├── strategies/
│       │   ├── jwt.strategy.ts
│       │   └── local.strategy.ts
│       ├── guards/
│       │   ├── jwt-auth.guard.ts
│       │   ├── roles.guard.ts
│       │   └── optional-auth.guard.ts
│       ├── decorators/
│       │   ├── current-user.decorator.ts
│       │   ├── roles.decorator.ts
│       │   └── public.decorator.ts
│       ├── dto/
│       │   ├── register.dto.ts
│       │   ├── login.dto.ts
│       │   ├── forgot-password.dto.ts
│       │   └── reset-password.dto.ts
│       └── schemas/
│           └── auth.schema.ts (Zod schemas)
```

#### Implementation Steps

**Step 1: Install Dependencies**
```bash
npm install @nestjs/passport @nestjs/jwt passport passport-local passport-jwt bcrypt
npm install -D @types/passport-local @types/passport-jwt @types/bcrypt
```

**Step 2: Create Auth Module**

```typescript
// auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

**Step 3: Create Zod Schemas**

```typescript
// schemas/auth.schema.ts
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
```

**Step 4: Create DTOs with Validation**

```typescript
// dto/register.dto.ts
import { registerSchema, RegisterDto } from '../schemas/auth.schema';

export class RegisterUserDto implements RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;

  static validate(data: unknown): RegisterDto {
    return registerSchema.parse(data);
  }
}
```

**Step 5: Create Auth Service**

```typescript
// auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './schemas/auth.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      role: 'customer',
    });

    // Generate token
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Update last login
    await this.usersService.updateLastLogin(user._id);

    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  private generateToken(user: any) {
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: any) {
    const { password, ...sanitized } = user.toObject();
    return sanitized;
  }

  async forgotPassword(email: string) {
    // Implementation: Generate reset token, send email
    // Store token in user document or separate collection
  }

  async resetPassword(token: string, newPassword: string) {
    // Implementation: Validate token, update password
  }
}
```

**Step 6: Create Guards**

```typescript
// guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is marked as public
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

```typescript
// guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredRoles.some((role) => user.role === role);
  }
}
```

**Step 7: Create Decorators**

```typescript
// decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

```typescript
// decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const Public = () => SetMetadata('isPublic', true);
```

```typescript
// decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

**Step 8: Create Controller**

```typescript
// auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { RegisterUserDto } from './dto/register.dto';
import { LoginDto } from './schemas/auth.schema';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() body: unknown) {
    const dto = RegisterUserDto.validate(body);
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: unknown) {
    const dto = loginSchema.parse(body);
    return this.authService.login(dto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: unknown) {
    const dto = forgotPasswordSchema.parse(body);
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: unknown) {
    const dto = resetPasswordSchema.parse(body);
    return this.authService.resetPassword(dto.token, dto.password);
  }
}
```

#### Key Points
- JWT tokens expire in 7 days (configurable)
- Passwords are hashed with bcrypt
- Role-based access control ready
- Guest access supported (no auth required for shopping)
- Zod validation at controller level

---

### Feature 2: User Management

#### Files Structure
```
src/
├── modules/
│   └── users/
│       ├── users.module.ts
│       ├── users.controller.ts
│       ├── users.service.ts
│       ├── dto/
│       │   ├── create-user.dto.ts
│       │   ├── update-user.dto.ts
│       │   ├── add-address.dto.ts
│       │   └── update-preferences.dto.ts
│       ├── schemas/
│       │   ├── user.schema.ts (Zod)
│       │   └── user.model.ts (Mongoose)
│       └── repositories/
│           └── users.repository.ts
```

#### Implementation Steps

**Step 1: Create Mongoose Schema**

```typescript
// schemas/user.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Address {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  addressLine1: string;

  @Prop()
  addressLine2: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  postalCode: string;

  @Prop({ required: true })
  country: string;

  @Prop({ default: false })
  isDefault: boolean;

  @Prop({ enum: ['shipping', 'billing', 'both'], default: 'both' })
  type: string;
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  phone: string;

  @Prop({ enum: ['customer', 'admin', 'super_admin'], default: 'customer' })
  role: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ enum: ['local', 'google', 'facebook'], default: 'local' })
  authProvider: string;

  @Prop()
  providerId: string;

  @Prop()
  avatar: string;

  @Prop({ type: [Address] })
  addresses: Address[];

  @Prop({
    type: {
      newsletter: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      currency: { type: String, default: 'USD' },
      language: { type: String, default: 'en' },
    },
  })
  preferences: {
    newsletter: boolean;
    smsNotifications: boolean;
    currency: string;
    language: string;
  };

  @Prop()
  lastLoginAt: Date;

  @Prop()
  deletedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
```

**Step 2: Create Zod Schemas**

```typescript
// schemas/user.schema.ts
import { z } from 'zod';

export const addressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(1, 'Phone is required'),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  isDefault: z.boolean().optional(),
  type: z.enum(['shipping', 'billing', 'both']).optional(),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
});

export const updatePreferencesSchema = z.object({
  newsletter: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  currency: z.string().optional(),
  language: z.string().optional(),
});

export type AddressDto = z.infer<typeof addressSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type UpdatePreferencesDto = z.infer<typeof updatePreferencesSchema>;
```

**Step 3: Create Repository**

```typescript
// repositories/users.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.model';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = new this.userModel(userData);
    return user.save();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }

  async addAddress(userId: string, address: any): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { $push: { addresses: address } },
        { new: true },
      )
      .exec();
  }

  async updateAddress(
    userId: string,
    addressId: string,
    address: any,
  ): Promise<User | null> {
    return this.userModel
      .findOneAndUpdate(
        { _id: userId, 'addresses._id': addressId },
        { $set: { 'addresses.$': address } },
        { new: true },
      )
      .exec();
  }

  async deleteAddress(userId: string, addressId: string): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { addresses: { _id: addressId } } },
        { new: true },
      )
      .exec();
  }
}
```

**Step 4: Create Service**

```typescript
// users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { AddressDto, UpdateUserDto, UpdatePreferencesDto } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async findById(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  async create(userData: any) {
    return this.usersRepository.create(userData);
  }

  async updateProfile(userId: string, updateData: UpdateUserDto) {
    return this.usersRepository.update(userId, updateData);
  }

  async updatePreferences(userId: string, preferences: UpdatePreferencesDto) {
    return this.usersRepository.update(userId, { preferences });
  }

  async addAddress(userId: string, address: AddressDto) {
    // If this is the first address, make it default
    const user = await this.findById(userId);
    if (user.addresses.length === 0) {
      address.isDefault = true;
    }

    return this.usersRepository.addAddress(userId, address);
  }

  async updateAddress(userId: string, addressId: string, address: AddressDto) {
    return this.usersRepository.updateAddress(userId, addressId, address);
  }

  async deleteAddress(userId: string, addressId: string) {
    return this.usersRepository.deleteAddress(userId, addressId);
  }

  async updateLastLogin(userId: string) {
    return this.usersRepository.update(userId, { lastLoginAt: new Date() });
  }
}
```

**Step 5: Create Controller**

```typescript
// users.controller.ts
import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { addressSchema, updateUserSchema, updatePreferencesSchema } from './schemas/user.schema';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.findById(user.sub);
  }

  @Put('me')
  async updateProfile(@CurrentUser() user: any, @Body() body: unknown) {
    const dto = updateUserSchema.parse(body);
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Put('me/preferences')
  async updatePreferences(@CurrentUser() user: any, @Body() body: unknown) {
    const dto = updatePreferencesSchema.parse(body);
    return this.usersService.updatePreferences(user.sub, dto);
  }

  @Post('me/addresses')
  async addAddress(@CurrentUser() user: any, @Body() body: unknown) {
    const dto = addressSchema.parse(body);
    return this.usersService.addAddress(user.sub, dto);
  }

  @Put('me/addresses/:addressId')
  async updateAddress(
    @CurrentUser() user: any,
    @Param('addressId') addressId: string,
    @Body() body: unknown,
  ) {
    const dto = addressSchema.parse(body);
    return this.usersService.updateAddress(user.sub, addressId, dto);
  }

  @Delete('me/addresses/:addressId')
  async deleteAddress(
    @CurrentUser() user: any,
    @Param('addressId') addressId: string,
  ) {
    return this.usersService.deleteAddress(user.sub, addressId);
  }
}
```

---

### Feature 3: Categories

#### Files Structure
```
src/
├── modules/
│   └── categories/
│       ├── categories.module.ts
│       ├── categories.controller.ts
│       ├── categories.service.ts
│       ├── dto/
│       │   ├── create-category.dto.ts
│       │   └── update-category.dto.ts
│       ├── schemas/
│       │   ├── category.schema.ts (Zod)
│       │   └── category.model.ts (Mongoose)
│       └── repositories/
│           └── categories.repository.ts
```

#### Implementation Steps

**Step 1: Create Mongoose Schema**

```typescript
// schemas/category.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class CategoryAttribute {
  @Prop({ required: true })
  name: string;

  @Prop({ enum: ['text', 'number', 'select', 'multiselect'], required: true })
  type: string;

  @Prop({ type: [String] })
  values: string[];

  @Prop({ default: false })
  isRequired: boolean;

  @Prop({ default: false })
  isFilterable: boolean;
}

@Schema({ timestamps: true })
export class Category extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  parentCategory: Types.ObjectId;

  @Prop({ default: 0 })
  level: number;

  @Prop()
  path: string;

  @Prop()
  image: string;

  @Prop()
  icon: string;

  @Prop()
  metaTitle: string;

  @Prop()
  metaDescription: string;

  @Prop({ type: [String] })
  metaKeywords: string[];

  @Prop({ default: 0 })
  displayOrder: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ type: [CategoryAttribute] })
  attributes: CategoryAttribute[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Indexes
CategorySchema.index({ slug: 1 });
CategorySchema.index({ parentCategory: 1 });
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ displayOrder: 1 });

// Pre-save hook to generate path
CategorySchema.pre('save', async function (next) {
  if (this.isModified('parentCategory') || this.isNew) {
    if (this.parentCategory) {
      const parent = await this.model('Category').findById(this.parentCategory);
      this.level = parent.level + 1;
      this.path = `${parent.path}/${this.slug}`;
    } else {
      this.level = 0;
      this.path = this.slug;
    }
  }
  next();
});
```

**Step 2: Create Zod Schemas**

```typescript
// schemas/category.schema.ts
import { z } from 'zod';

export const categoryAttributeSchema = z.object({
  name: z.string().min(1, 'Attribute name is required'),
  type: z.enum(['text', 'number', 'select', 'multiselect']),
  values: z.array(z.string()).optional(),
  isRequired: z.boolean().optional(),
  isFilterable: z.boolean().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  parentCategory: z.string().optional(),
  image: z.string().url().optional(),
  icon: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.array(z.string()).optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  attributes: z.array(categoryAttributeSchema).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
```

**Step 3: Create Repository**

```typescript
// repositories/categories.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from '../schemas/category.model';

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async create(categoryData: Partial<Category>): Promise<Category> {
    const category = new this.categoryModel(categoryData);
    return category.save();
  }

  async findAll(filter: any = {}): Promise<Category[]> {
    return this.categoryModel
      .find(filter)
      .populate('parentCategory', 'name slug')
      .sort({ displayOrder: 1, name: 1 })
      .exec();
  }

  async findById(id: string): Promise<Category | null> {
    return this.categoryModel
      .findById(id)
      .populate('parentCategory', 'name slug')
      .exec();
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.categoryModel
      .findOne({ slug })
      .populate('parentCategory', 'name slug')
      .exec();
  }

  async findChildren(parentId: string): Promise<Category[]> {
    return this.categoryModel
      .find({ parentCategory: parentId })
      .sort({ displayOrder: 1, name: 1 })
      .exec();
  }

  async findRootCategories(): Promise<Category[]> {
    return this.categoryModel
      .find({ parentCategory: null })
      .sort({ displayOrder: 1, name: 1 })
      .exec();
  }

  async update(id: string, data: Partial<Category>): Promise<Category | null> {
    return this.categoryModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }

  async delete(id: string): Promise<void> {
    await this.categoryModel.findByIdAndDelete(id).exec();
  }

  async getCategoryTree(): Promise<Category[]> {
    const categories = await this.categoryModel
      .find({ isActive: true })
      .sort({ level: 1, displayOrder: 1 })
      .exec();

    // Build tree structure
    const categoryMap = new Map();
    const tree = [];

    categories.forEach((cat) => {
      categoryMap.set(cat._id.toString(), { ...cat.toObject(), children: [] });
    });

    categories.forEach((cat) => {
      const category = categoryMap.get(cat._id.toString());
      if (cat.parentCategory) {
        const parent = categoryMap.get(cat.parentCategory.toString());
        if (parent) {
          parent.children.push(category);
        }
      } else {
        tree.push(category);
      }
    });

    return tree;
  }
}
```

**Step 4: Create Service**

```typescript
// categories.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CategoriesRepository } from './repositories/categories.repository';
import { CreateCategoryDto, UpdateCategoryDto } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async create(createDto: CreateCategoryDto) {
    // Check if slug already exists
    const existing = await this.categoriesRepository.findBySlug(createDto.slug);
    if (existing) {
      throw new ConflictException('Category with this slug already exists');
    }

    return this.categoriesRepository.create(createDto);
  }

  async findAll(includeInactive = false) {
    const filter = includeInactive ? {} : { isActive: true };
    return this.categoriesRepository.findAll(filter);
  }

  async findById(id: string) {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.categoriesRepository.findBySlug(slug);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async getCategoryTree() {
    return this.categoriesRepository.getCategoryTree();
  }

  async update(id: string, updateDto: UpdateCategoryDto) {
    const category = await this.findById(id);

    if (updateDto.slug && updateDto.slug !== category.slug) {
      const existing = await this.categoriesRepository.findBySlug(updateDto.slug);
      if (existing) {
        throw new ConflictException('Category with this slug already exists');
      }
    }

    return this.categoriesRepository.update(id, updateDto);
  }

  async delete(id: string) {
    const category = await this.findById(id);

    // Check if category has children
    const children = await this.categoriesRepository.findChildren(id);
    if (children.length > 0) {
      throw new ConflictException('Cannot delete category with subcategories');
    }

    // Check if category has products (implement this check in products service)
    // const productCount = await this.productsService.countByCategory(id);
    // if (productCount > 0) {
    //   throw new ConflictException('Cannot delete category with products');
    // }

    await this.categoriesRepository.delete(id);
  }
}
```

**Step 5: Create Controllers**

```typescript
// categories.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { createCategorySchema, updateCategorySchema } from './schemas/category.schema';

@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  // Public endpoints
  @Public()
  @Get()
  async findAll(@Query('includeInactive') includeInactive: string) {
    return this.categoriesService.findAll(includeInactive === 'true');
  }

  @Public()
  @Get('tree')
  async getCategoryTree() {
    return this.categoriesService.getCategoryTree();
  }

  @Public()
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  // Admin endpoints
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  async create(@Body() body: unknown) {
    const dto = createCategorySchema.parse(body);
    return this.categoriesService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  async update(@Param('id') id: string, @Body() body: unknown) {
    const dto = updateCategorySchema.parse(body);
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  async delete(@Param('id') id: string) {
    return this.categoriesService.delete(id);
  }
}
```

---

### Feature 4: Products (Core)

Due to the complexity of products, I'll continue in the next file...
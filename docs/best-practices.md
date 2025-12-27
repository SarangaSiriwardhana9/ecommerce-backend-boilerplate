# E-Commerce Backend - Best Practices & Code Standards

## Table of Contents
1. [Project Structure](#project-structure)
2. [Naming Conventions](#naming-conventions)
3. [TypeScript Best Practices](#typescript-best-practices)
4. [Zod Validation](#zod-validation)
5. [Error Handling](#error-handling)
6. [Database & Mongoose](#database--mongoose)
7. [API Design](#api-design)
8. [Security](#security)
9. [Testing](#testing)
10. [Performance](#performance)

---

## Project Structure

### Complete Folder Structure

```
ecommerce-backend/
├── src/
│   ├── main.ts                          # Application entry point
│   ├── app.module.ts                    # Root module
│   │
│   ├── config/                          # Configuration files
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   ├── app.config.ts
│   │   └── index.ts
│   │
│   ├── common/                          # Shared utilities
│   │   ├── constants/
│   │   │   ├── order-status.constant.ts
│   │   │   ├── user-roles.constant.ts
│   │   │   ├── payment-methods.constant.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── types/
│   │   │   ├── pagination.type.ts
│   │   │   ├── api-response.type.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── interfaces/
│   │   │   ├── query-options.interface.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── decorators/
│   │   │   ├── api-paginated-response.decorator.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── pipes/
│   │   │   ├── zod-validation.pipe.ts
│   │   │   ├── parse-objectid.pipe.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
│   │   │   ├── all-exceptions.filter.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── interceptors/
│   │   │   ├── transform.interceptor.ts
│   │   │   ├── logging.interceptor.ts
│   │   │   └── index.ts
│   │   │
│   │   └── utils/
│   │       ├── slug.util.ts
│   │       ├── password.util.ts
│   │       ├── pagination.util.ts
│   │       └── index.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── local.strategy.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   ├── roles.guard.ts
│   │   │   │   └── optional-auth.guard.ts
│   │   │   ├── decorators/
│   │   │   │   ├── current-user.decorator.ts
│   │   │   │   ├── roles.decorator.ts
│   │   │   │   └── public.decorator.ts
│   │   │   ├── dto/
│   │   │   │   ├── register.dto.ts
│   │   │   │   ├── login.dto.ts
│   │   │   │   └── forgot-password.dto.ts
│   │   │   └── schemas/
│   │   │       └── auth.schema.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── dto/
│   │   │   ├── schemas/
│   │   │   │   ├── user.schema.ts      # Zod schemas
│   │   │   │   └── user.model.ts       # Mongoose schema
│   │   │   └── repositories/
│   │   │       └── users.repository.ts
│   │   │
│   │   ├── categories/
│   │   │   ├── categories.module.ts
│   │   │   ├── categories.controller.ts
│   │   │   ├── categories.service.ts
│   │   │   ├── dto/
│   │   │   ├── schemas/
│   │   │   └── repositories/
│   │   │
│   │   ├── products/
│   │   │   ├── products.module.ts
│   │   │   ├── products.controller.ts
│   │   │   ├── products.service.ts
│   │   │   ├── dto/
│   │   │   ├── schemas/
│   │   │   └── repositories/
│   │   │
│   │   ├── product-variants/
│   │   ├── discounts/
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── reviews/
│   │   ├── media/
│   │   └── settings/
│   │
│   └── database/
│       ├── database.module.ts
│       └── database.service.ts
│
├── test/                                # E2E tests
│   ├── auth.e2e-spec.ts
│   ├── products.e2e-spec.ts
│   └── ...
│
├── .env                                 # Environment variables
├── .env.example                         # Example env file
├── .gitignore
├── nest-cli.json
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── README.md
```

---

## Naming Conventions

### 1. Files and Directories

```typescript
// ✅ GOOD
user.controller.ts
user.service.ts
user.model.ts          // Mongoose schema
user.schema.ts         // Zod validation schema
users.repository.ts    // Plural for repository
create-user.dto.ts
user-roles.constant.ts

// ❌ BAD
UserController.ts
user_controller.ts
userController.ts
```

### 2. Classes

```typescript
// ✅ GOOD - PascalCase
export class UserController {}
export class AuthService {}
export class CreateUserDto {}

// ❌ BAD
export class userController {}
export class auth_service {}
```

### 3. Interfaces and Types

```typescript
// ✅ GOOD
export interface PaginationOptions {
  page: number;
  limit: number;
}

export type ApiResponse<T> = {
  data: T;
  message: string;
};

// ❌ BAD
export interface IPaginationOptions {}  // Avoid 'I' prefix
export type apiResponse<T> = {};
```

### 4. Constants

```typescript
// ✅ GOOD - UPPER_SNAKE_CASE for true constants
export const MAX_FILE_SIZE = 5242880; // 5MB
export const DEFAULT_PAGE_SIZE = 20;
export const JWT_EXPIRY = '7d';

// ✅ GOOD - camelCase for config objects
export const orderStatus = {
  PENDING: 'pending_payment',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
} as const;

// ❌ BAD
export const maxFileSize = 5242880;
export const ORDER_STATUS = { ... };
```

### 5. Enums

```typescript
// ✅ GOOD
export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
}

// ❌ BAD
export enum userRole {}
export enum ORDER_STATUS {}
```

### 6. Functions and Methods

```typescript
// ✅ GOOD - camelCase, descriptive verb-noun
async createUser(dto: CreateUserDto) {}
async findUserById(id: string) {}
async updateProductStock(productId: string, quantity: number) {}
private calculateDiscountAmount(price: number, discount: number) {}

// ❌ BAD
async Create(dto: CreateUserDto) {}
async getuser(id: string) {}
async update_product_stock() {}
```

### 7. Variables

```typescript
// ✅ GOOD - camelCase
const userData = await this.findUser();
let totalAmount = 0;
const hasPermission = user.role === 'admin';

// ❌ BAD
const UserData = await this.findUser();
let total_amount = 0;
const has_permission = user.role === 'admin';
```

---

## TypeScript Best Practices

### 1. Always Use Explicit Types

```typescript
// ✅ GOOD
async findById(id: string): Promise<User | null> {
  return this.userModel.findById(id).exec();
}

interface UserData {
  email: string;
  firstName: string;
  lastName: string;
}

const createUser = async (data: UserData): Promise<User> => {
  // implementation
};

// ❌ BAD
async findById(id) {
  return this.userModel.findById(id).exec();
}

const createUser = async (data: any) => {
  // implementation
};
```

### 2. Avoid 'any' Type

```typescript
// ✅ GOOD
type UnknownObject = Record<string, unknown>;

const processData = (data: UnknownObject): void => {
  // Use type guards
  if ('id' in data && typeof data.id === 'string') {
    // Safe to use data.id
  }
};

// Use generic constraints
function mapArray<T extends { id: string }>(items: T[]): string[] {
  return items.map(item => item.id);
}

// ❌ BAD
const processData = (data: any): void => {
  // Unsafe
};
```

### 3. Use Interfaces for Object Shapes

```typescript
// ✅ GOOD
export interface CreateProductDto {
  name: string;
  price: number;
  description?: string;
  categoryIds: string[];
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ❌ BAD
export type CreateProductDto = {
  name: string;
  price: number;
  // Using type when interface is more appropriate
};
```

### 4. Use Type Unions and Intersections

```typescript
// ✅ GOOD
type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal';

type BaseProduct = {
  id: string;
  name: string;
  price: number;
};

type ProductWithImages = BaseProduct & {
  images: string[];
};

type ProductWithVariants = BaseProduct & {
  variants: Variant[];
};

// ❌ BAD
type PaymentMethod = string; // Too loose
```

### 5. Use Optional Chaining and Nullish Coalescing

```typescript
// ✅ GOOD
const userName = user?.profile?.firstName ?? 'Guest';
const itemCount = cart?.items?.length ?? 0;

if (order?.shippingAddress?.city) {
  // Safe access
}

// ❌ BAD
const userName = user && user.profile && user.profile.firstName || 'Guest';
const itemCount = cart && cart.items ? cart.items.length : 0;
```

### 6. Use Readonly for Immutable Data

```typescript
// ✅ GOOD
interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
}

const orderStatuses: readonly string[] = ['pending', 'confirmed', 'shipped'];

// ❌ BAD
interface Config {
  apiUrl: string;  // Can be modified
  timeout: number;
}
```

---

## Zod Validation

### 1. Schema Organization

```typescript
// schemas/product.schema.ts

// ✅ GOOD - Organize related schemas together
export const productImageSchema = z.object({
  url: z.string().url('Invalid URL'),
  alt: z.string().optional(),
  position: z.number().int().min(0).optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  price: z.number().positive('Price must be positive'),
  images: z.array(productImageSchema).min(1, 'At least one image required'),
  categoryIds: z.array(z.string()).min(1),
});

export const updateProductSchema = createProductSchema.partial();

// Export types
export type ProductImage = z.infer<typeof productImageSchema>;
export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
```

### 2. Custom Validation Rules

```typescript
// ✅ GOOD - Use .refine() for complex validation
export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Order must have at least one item'),
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  paymentMethod: z.enum(['credit_card', 'paypal', 'cash_on_delivery']),
}).refine((data) => {
  // Custom validation: total amount must be positive
  const total = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return total > 0;
}, {
  message: 'Order total must be greater than zero',
  path: ['items'],
}).refine((data) => {
  // Validate payment method for high-value orders
  const total = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (total > 10000 && data.paymentMethod === 'cash_on_delivery') {
    return false;
  }
  return true;
}, {
  message: 'Cash on delivery not available for orders over $10,000',
  path: ['paymentMethod'],
});
```

### 3. Reusable Schemas

```typescript
// common/schemas/common.schema.ts

// ✅ GOOD - Create reusable schemas
export const emailSchema = z.string().email('Invalid email address').toLowerCase();

export const phoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number');

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const mongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID');

// Use in other schemas
import { emailSchema, phoneSchema } from '@/common/schemas/common.schema';

export const registerSchema = z.object({
  email: emailSchema,
  phone: phoneSchema.optional(),
  password: z.string().min(8),
});
```

### 4. Validation in Controllers

```typescript
// ✅ GOOD - Validate in controller before service
@Post()
async create(@Body() body: unknown) {
  // Explicit validation with Zod
  const dto = createProductSchema.parse(body);
  return this.productsService.create(dto);
}

// Alternative: Create a validation pipe
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      throw new BadRequestException('Validation failed', error.errors);
    }
  }
}

// Use in controller
@Post()
async create(
  @Body(new ZodValidationPipe(createProductSchema)) dto: CreateProductDto
) {
  return this.productsService.create(dto);
}
```

### 5. Error Messages

```typescript
// ✅ GOOD - Provide clear, user-friendly messages
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// ❌ BAD - Generic or no messages
export const passwordSchema = z.string().min(8).regex(/[A-Z]/);
```

---

## Error Handling

### 1. Use Built-in NestJS Exceptions

```typescript
// ✅ GOOD
import {
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

async findById(id: string): Promise<Product> {
  const product = await this.productsRepository.findById(id);
  
  if (!product) {
    throw new NotFoundException(`Product with ID ${id} not found`);
  }
  
  return product;
}

async create(dto: CreateProductDto): Promise<Product> {
  const existing = await this.productsRepository.findBySlug(dto.slug);
  
  if (existing) {
    throw new ConflictException('Product with this slug already exists');
  }
  
  return this.productsRepository.create(dto);
}

// ❌ BAD
async findById(id: string): Promise<Product | null> {
  return this.productsRepository.findById(id);
  // Returning null instead of throwing exception
}
```

### 2. Create Custom Exception Filters

```typescript
// common/filters/http-exception.filter.ts

// ✅ GOOD
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message,
      error: typeof exceptionResponse === 'object'
        ? (exceptionResponse as any).error
        : 'Error',
    };

    response.status(status).json(errorResponse);
  }
}

// Register in main.ts
app.useGlobalFilters(new HttpExceptionFilter());
```

### 3. Handle Async Errors Properly

```typescript
// ✅ GOOD
async processOrder(orderId: string): Promise<void> {
  try {
    const order = await this.ordersRepository.findById(orderId);
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.paymentService.process(order);
    await this.inventoryService.decrementStock(order.items);
    await this.emailService.sendConfirmation(order);
    
  } catch (error) {
    // Log error for debugging
    this.logger.error(`Order processing failed: ${error.message}`, error.stack);
    
    // Re-throw as appropriate exception
    if (error instanceof HttpException) {
      throw error;
    }
    
    throw new InternalServerErrorException('Order processing failed');
  }
}

// ❌ BAD
async processOrder(orderId: string): Promise<void> {
  const order = await this.ordersRepository.findById(orderId);
  await this.paymentService.process(order); // Might throw, not handled
  await this.inventoryService.decrementStock(order.items);
  // No error handling
}
```

### 4. Validation Error Responses

```typescript
// ✅ GOOD
@Post()
async create(@Body() body: unknown) {
  try {
    const dto = createProductSchema.parse(body);
    return await this.productsService.create(dto);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    throw error;
  }
}
```

---

## Database & Mongoose

### 1. Schema Design

```typescript
// ✅ GOOD - Properly structured schema
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true, index: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }], index: true })
  categories: Types.ObjectId[];

  @Prop({ type: [{ url: String, alt: String, position: Number }] })
  images: Array<{ url: string; alt?: string; position: number }>;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Add indexes
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ price: 1, createdAt: -1 });

// Add virtual properties
ProductSchema.virtual('displayPrice').get(function() {
  return `$${this.price.toFixed(2)}`;
});

// Add pre-save hooks
ProductSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
  }
  next();
});
```

### 2. Repository Pattern

```typescript
// ✅ GOOD - Use repository for database operations
@Injectable()
export class ProductsRepository {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async create(data: Partial<Product>): Promise<Product> {
    const product = new this.productModel(data);
    return product.save();
  }

  async findById(id: string): Promise<Product | null> {
    return this.productModel
      .findById(id)
      .populate('categories', 'name slug')
      .exec();
  }

  async update(id: string, data: Partial<Product>): Promise<Product | null> {
    return this.productModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }

  async softDelete(id: string): Promise<void> {
    await this.productModel
      .findByIdAndUpdate(id, { deletedAt: new Date() })
      .exec();
  }
}

// ❌ BAD - Direct model usage in service
@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async create(dto: CreateProductDto) {
    // Direct model usage - should be in repository
    const product = new this.productModel(dto);
    return product.save();
  }
}
```

### 3. Efficient Queries

```typescript
// ✅ GOOD - Optimize queries
async findProductsWithFilters(filters: FilterDto) {
  const query = this.productModel.find();

  // Build query dynamically
  if (filters.categoryId) {
    query.where('categories').in([filters.categoryId]);
  }

  if (filters.minPrice || filters.maxPrice) {
    query.where('price');
    if (filters.minPrice) query.gte(filters.minPrice);
    if (filters.maxPrice) query.lte(filters.maxPrice);
  }

  if (filters.search) {
    query.where({ $text: { $search: filters.search } });
  }

  // Select only needed fields
  query.select('name slug price images');

  // Pagination
  const skip = (filters.page - 1) * filters.limit;
  query.skip(skip).limit(filters.limit);

  // Execute with lean for better performance
  return query.lean().exec();
}

// Use aggregation for complex queries
async getProductStats() {
  return this.productModel.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$categoryId',
        count: { $sum: 1 },
        avgPrice: { $avg: '$price' },
      },
    },
    { $sort: { count: -1 } },
  ]);
}

// ❌ BAD - Inefficient queries
async findAll() {
  // Loading all fields when not needed
  return this.productModel.find().exec();
}

async getProductWithReviews(id: string) {
  const product = await this.productModel.findById(id).exec();
  const reviews = await this.reviewModel.find({ productId: id }).exec();
  // N+1 query problem - should use populate or aggregation
}
```

### 4. Transactions

```typescript
// ✅ GOOD - Use transactions for multiple operations
async createOrderWithInventoryUpdate(orderData: CreateOrderDto) {
  const session = await this.connection.startSession();
  session.startTransaction();

  try {
    // Create order
    const order = await this.orderModel.create([orderData], { session });

    // Update inventory
    for (const item of orderData.items) {
      await this.productModel.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } },
        { session },
      );
    }

    await session.commitTransaction();
    return order[0];
    
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

---

## API Design

### 1. RESTful Endpoints

```typescript
// ✅ GOOD - Follow REST conventions
GET    /products              // List products
GET    /products/:id          // Get single product
POST   /products              // Create product
PUT    /products/:id          // Update product
DELETE /products/:id          // Delete product

GET    /products/:id/reviews  // Get product reviews
POST   /products/:id/reviews  // Create review for product

GET    /users/:id/orders      // Get user's orders
GET    /orders/:id            // Get order details

// Filtering and pagination
GET    /products?category=electronics&page=1&limit=20&sort=price:asc

// ❌ BAD
POST   /getProducts
GET    /product/get/:id
POST   /products/delete/:id
GET    /productslist
```

### 2. Response Format

```typescript
// common/interceptors/transform.interceptor.ts

// ✅ GOOD - Consistent response format
export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map(data => ({
        data,
        message: 'Success',
        timestamp: new Date().toISOString(),
      })),
    );
  }
}

// Example responses:
// Success response
{
  "data": {
    "id": "123",
    "name": "Product Name"
  },
  "message": "Product created successfully"
}

// Paginated response
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}

// Error response
{
  "statusCode": 404,
  "message": "Product not found",
  "error": "Not Found",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 3. HTTP Status Codes

```typescript
// ✅ GOOD - Use appropriate status codes
@Post()
@HttpCode(HttpStatus.CREATED)  // 201
async create(@Body() dto: CreateProductDto) {
  return this.productsService.create(dto);
}

@Put(':id')
@HttpCode(HttpStatus.OK)  // 200
async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
  return this.productsService.update(id, dto);
}

@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)  // 204
async delete(@Param('id') id: string) {
  await this.productsService.delete(id);
}

@Get()
@HttpCode(HttpStatus.OK)  // 200
async findAll() {
  return this.productsService.findAll();
}
```

---

## Security

### 1. Password Hashing

```typescript
// ✅ GOOD
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export class PasswordUtil {
  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
```

### 2. Input Sanitization

```typescript
// ✅ GOOD - Sanitize user input
import { escape } from 'validator';

export const sanitizeInput = (input: string): string => {
  return escape(input.trim());
};

// Use in DTOs
export const createReviewSchema = z.object({
  comment: z.string()
    .min(10)
    .transform(sanitizeInput),
});
```

### 3. Rate Limiting

```typescript
// main.ts

// ✅ GOOD - Implement rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});

app.use(limiter);

// Stricter limits for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts',
});

app.use('/auth/login', authLimiter);
```

### 4. Environment Variables

```typescript
// config/app.config.ts

// ✅ GOOD - Use environment variables
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRY: z.string(),
});

export const config = envSchema.parse(process.env);

// ❌ BAD - Hardcoded secrets
const JWT_SECRET = 'my-secret-key';
```

---

## Testing

### 1. Unit Tests

```typescript
// products.service.spec.ts

// ✅ GOOD
describe('ProductsService', () => {
  let service: ProductsService;
  let repository: ProductsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductsRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<ProductsRepository>(ProductsRepository);
  });

  describe('create', () => {
    it('should create a product', async () => {
      const dto = {
        name: 'Test Product',
        price: 99.99,
        slug: 'test-product',
      };

      const expectedProduct = { id: '1', ...dto };
      jest.spyOn(repository, 'create').mockResolvedValue(expectedProduct as any);

      const result = await service.create(dto);

      expect(result).toEqual(expectedProduct);
      expect(repository.create).toHaveBeenCalledWith(dto);
    });

    it('should throw ConflictException if slug exists', async () => {
      const dto = { name: 'Test', slug: 'existing-slug', price: 99 };
      
      jest.spyOn(repository, 'findBySlug').mockResolvedValue({} as any);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });
});
```

### 2. E2E Tests

```typescript
// products.e2e-spec.ts

// ✅ GOOD
describe('Products (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get auth token
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'password' });
    
    authToken = response.body.token;
  });

  it('/products (POST) should create product', () => {
    return request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Product',
        slug: 'test-product',
        price: 99.99,
      })
      .expect(201)
      .expect(res => {
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data.name).toBe('Test Product');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

---

## Performance

### 1. Caching

```typescript
// ✅ GOOD - Implement caching
import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private productsRepository: ProductsRepository,
  ) {}

  async findById(id: string): Promise<Product> {
    const cacheKey = `product:${id}`;
    
    // Check cache first
    const cached = await this.cacheManager.get<Product>(cacheKey);
    if (cached) return cached;

    // Fetch from database
    const product = await this.productsRepository.findById(id);
    
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Store in cache
    await this.cacheManager.set(cacheKey, product, { ttl: 3600 });
    
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.productsRepository.update(id, dto);
    
    // Invalidate cache
    await this.cacheManager.del(`product:${id}`);
    
    return product;
  }
}
```

### 2. Pagination

```typescript
// ✅ GOOD - Always paginate list endpoints
async findAll(query: QueryDto) {
  const page = query.page || 1;
  const limit = Math.min(query.limit || 20, 100); // Max 100 items
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    this.productModel
      .find(filters)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
    this.productModel.countDocuments(filters).exec(),
  ]);

  return {
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

### 3. Lazy Loading

```typescript
// ✅ GOOD - Don't populate everything by default
async findById(id: string, includeRelations = false) {
  const query = this.productModel.findById(id);

  if (includeRelations) {
    query
      .populate('categories')
      .populate('reviews');
  }

  return query.exec();
}

// In controller
@Get(':id')
async findOne(
  @Param('id') id: string,
  @Query('include') include?: string,
) {
  const includeRelations = include?.includes('relations');
  return this.productsService.findById(id, includeRelations);
}
```

---

## Constants Organization

```typescript
// common/constants/index.ts

// ✅ GOOD - Centralize all constants
export * from './user-roles.constant';
export * from './order-status.constant';
export * from './payment-methods.constant';
export * from './app.constant';

// common/constants/order-status.constant.ts
export const ORDER_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// common/constants/user-roles.constant.ts
export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
```

---

This completes the Best Practices document. Follow these guidelines consistently across your project for maintainable, scalable code!
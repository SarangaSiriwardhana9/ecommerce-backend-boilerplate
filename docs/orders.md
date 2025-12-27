# E-Commerce Backend - Orders & Reviews Features

## Feature 8: Orders & Checkout

### Files Structure
```
src/
├── modules/
│   └── orders/
│       ├── orders.module.ts
│       ├── orders.controller.ts
│       ├── orders.service.ts
│       ├── dto/
│       │   ├── create-order.dto.ts
│       │   ├── update-order.dto.ts
│       │   └── order-filter.dto.ts
│       ├── schemas/
│       │   ├── order.schema.ts (Zod)
│       │   └── order.model.ts (Mongoose)
│       └── repositories/
│           └── orders.repository.ts
```

### Implementation Steps

**Step 1: Create Mongoose Schema**

```typescript
// schemas/order.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class CustomerInfo {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  phone: string;
}

@Schema({ _id: false })
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
}

@Schema({ _id: true })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ProductVariant' })
  variantId: Types.ObjectId;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  productSlug: string;

  @Prop({ required: true })
  productImage: string;

  @Prop({ required: true })
  sku: string;

  @Prop({ type: [{ name: String, value: String }] })
  variantOptions: Array<{ name: string; value: string }>;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;

  @Prop()
  compareAtPrice: number;

  @Prop({ default: 0 })
  discountAmount: number;

  @Prop({ default: 0 })
  taxAmount: number;

  @Prop({ required: true })
  total: number;
}

@Schema({ _id: false })
export class AppliedDiscount {
  @Prop({ type: Types.ObjectId, ref: 'Discount' })
  discountId: Types.ObjectId;

  @Prop()
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  amount: number;
}

@Schema({ _id: false })
export class PaymentDetails {
  @Prop()
  transactionId: string;

  @Prop()
  paymentGateway: string;

  @Prop()
  last4: string;

  @Prop()
  cardBrand: string;

  @Prop()
  paidAt: Date;
}

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ type: CustomerInfo, required: true })
  customer: CustomerInfo;

  @Prop({ type: Address, required: true })
  shippingAddress: Address;

  @Prop({ type: Address, required: true })
  billingAddress: Address;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop({ required: true })
  subtotal: number;

  @Prop({ default: 0 })
  discountTotal: number;

  @Prop({ default: 0 })
  taxTotal: number;

  @Prop({ default: 0 })
  shippingTotal: number;

  @Prop({ required: true })
  total: number;

  @Prop({ type: [AppliedDiscount] })
  appliedDiscounts: AppliedDiscount[];

  @Prop({
    enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery', 'mock'],
    required: true,
  })
  paymentMethod: string;

  @Prop({
    enum: ['pending', 'authorized', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending',
  })
  paymentStatus: string;

  @Prop({ type: PaymentDetails })
  paymentDetails: PaymentDetails;

  @Prop()
  shippingMethod: string;

  @Prop()
  shippingCarrier: string;

  @Prop()
  trackingNumber: string;

  @Prop()
  trackingUrl: string;

  @Prop()
  estimatedDeliveryDate: Date;

  @Prop()
  shippedAt: Date;

  @Prop()
  deliveredAt: Date;

  @Prop({
    enum: [
      'pending_payment',
      'payment_failed',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
    ],
    default: 'pending_payment',
  })
  status: string;

  @Prop({
    enum: ['unfulfilled', 'partially_fulfilled', 'fulfilled'],
    default: 'unfulfilled',
  })
  fulfillmentStatus: string;

  @Prop()
  customerNote: string;

  @Prop()
  internalNote: string;

  @Prop()
  cancellationReason: string;

  @Prop()
  cancelledAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  cancelledBy: Types.ObjectId;

  @Prop({ default: 0 })
  refundAmount: number;

  @Prop()
  refundReason: string;

  @Prop()
  refundedAt: Date;

  @Prop()
  orderConfirmationSentAt: Date;

  @Prop()
  shippingNotificationSentAt: Date;

  @Prop()
  deliveryNotificationSentAt: Date;

  @Prop({ enum: ['web', 'mobile', 'admin', 'api'], default: 'web' })
  source: string;

  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Indexes
OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ 'customer.userId': 1 });
OrderSchema.index({ 'customer.email': 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ fulfillmentStatus: 1 });
OrderSchema.index({ createdAt: -1 });

// Pre-save hook to generate order number
OrderSchema.pre('save', async function (next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Count orders from today to get next number
    const count = await this.model('Order').countDocuments({
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      },
    });

    this.orderNumber = `ORD-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});
```

**Step 2: Create Zod Schemas**

```typescript
// schemas/order.schema.ts
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
});

export const createOrderSchema = z.object({
  customer: z.object({
    email: z.string().email('Invalid email'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional(),
  }),
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  paymentMethod: z.enum(['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery', 'mock']),
  shippingMethod: z.string().optional(),
  customerNote: z.string().optional(),
  // Payment details for mock checkout
  mockPaymentDetails: z.object({
    cardNumber: z.string().optional(),
    cardHolder: z.string().optional(),
    expiryDate: z.string().optional(),
    cvv: z.string().optional(),
  }).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'pending_payment',
    'payment_failed',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
  ]),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().optional(),
  shippingCarrier: z.string().optional(),
  internalNote: z.string().optional(),
});

export const orderFilterSchema = z.object({
  page: z.number().positive().optional().default(1),
  limit: z.number().positive().max(100).optional().default(20),
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  email: z.string().email().optional(),
  orderNumber: z.string().optional(),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;
export type OrderFilterDto = z.infer<typeof orderFilterSchema>;
```

**Step 3: Create Repository**

```typescript
// repositories/orders.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Order } from '../schemas/order.model';
import { OrderFilterDto } from '../schemas/order.schema';

@Injectable()
export class OrdersRepository {
  constructor(@InjectModel(Order.name) private orderModel: Model<Order>) {}

  async create(orderData: Partial<Order>): Promise<Order> {
    const order = new this.orderModel(orderData);
    return order.save();
  }

  async findAll(filterDto: OrderFilterDto) {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      startDate,
      endDate,
      email,
      orderNumber,
    } = filterDto;

    const filter: FilterQuery<Order> = {};

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (email) filter['customer.email'] = email;
    if (orderNumber) filter.orderNumber = orderNumber;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .populate('customer.userId', 'email firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments(filter).exec(),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<Order | null> {
    return this.orderModel
      .findById(id)
      .populate('customer.userId', 'email firstName lastName')
      .exec();
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return this.orderModel.findOne({ orderNumber }).exec();
  }

  async findByUserId(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find({ 'customer.userId': userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments({ 'customer.userId': userId }).exec(),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, data: Partial<Order>): Promise<Order | null> {
    return this.orderModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async getOrderStats() {
    const stats = await this.orderModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' },
        },
      },
    ]);

    return stats;
  }

  async getRevenueByPeriod(startDate: Date, endDate: Date) {
    return this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $nin: ['cancelled', 'refunded'] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          revenue: { $sum: '$total' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);
  }
}
```

**Step 4: Create Service**

```typescript
// orders.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrdersRepository } from './repositories/orders.repository';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { ProductVariantsService } from '../product-variants/product-variants.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderFilterDto } from './schemas/order.schema';

@Injectable()
export class OrdersService {
  constructor(
    private ordersRepository: OrdersRepository,
    private cartService: CartService,
    private productsService: ProductsService,
    private variantsService: ProductVariantsService,
  ) {}

  async createOrder(createDto: CreateOrderDto, userId?: string, sessionId?: string) {
    // Get cart
    const cart = await this.cartService.getOrCreateCart(userId, sessionId);

    if (cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Verify stock availability for all items
    for (const item of cart.items) {
      if (item.variantId) {
        const hasStock = await this.variantsService.checkStock(
          item.variantId.toString(),
          item.quantity,
        );
        if (!hasStock) {
          throw new BadRequestException(
            `Insufficient stock for ${item.productName}`,
          );
        }
      } else {
        const hasStock = await this.productsService.checkStock(
          item.productId.toString(),
          item.quantity,
        );
        if (!hasStock) {
          throw new BadRequestException(
            `Insufficient stock for ${item.productName}`,
          );
        }
      }
    }

    // Prepare order items from cart
    const orderItems = cart.items.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      productSlug: item.productSlug,
      productImage: item.productImage,
      sku: item.variantId ? 'variant-sku' : 'product-sku', // Should fetch actual SKU
      variantOptions: item.variantOptions,
      quantity: item.quantity,
      price: item.price,
      compareAtPrice: item.compareAtPrice,
      discountAmount: item.discountAmount,
      taxAmount: (item.price * item.quantity * 0.1), // Simplified tax calculation
      total: (item.price - item.discountAmount) * item.quantity + (item.price * item.quantity * 0.1),
    }));

    // Prepare applied discounts
    const appliedDiscounts = cart.appliedCoupons.map(coupon => ({
      discountId: coupon.discountId,
      code: coupon.code,
      name: 'Discount', // Should fetch actual discount name
      type: 'coupon',
      amount: coupon.discountAmount,
    }));

    // Create order
    const order = await this.ordersRepository.create({
      customer: {
        userId: userId ? userId : undefined,
        email: createDto.customer.email,
        firstName: createDto.customer.firstName,
        lastName: createDto.customer.lastName,
        phone: createDto.customer.phone,
      },
      shippingAddress: createDto.shippingAddress,
      billingAddress: createDto.billingAddress,
      items: orderItems,
      subtotal: cart.subtotal,
      discountTotal: cart.discountTotal,
      taxTotal: cart.taxTotal,
      shippingTotal: cart.shippingTotal,
      total: cart.total,
      appliedDiscounts,
      paymentMethod: createDto.paymentMethod,
      paymentStatus: createDto.paymentMethod === 'mock' ? 'paid' : 'pending',
      status: createDto.paymentMethod === 'mock' ? 'confirmed' : 'pending_payment',
      shippingMethod: createDto.shippingMethod,
      customerNote: createDto.customerNote,
      source: 'web',
    });

    // Mock payment processing
    if (createDto.paymentMethod === 'mock') {
      await this.processPayment(order._id.toString(), {
        transactionId: `MOCK-${Date.now()}`,
        paymentGateway: 'mock',
        last4: '1234',
        cardBrand: 'Visa',
        paidAt: new Date(),
      });
    }

    // Decrement stock for all items
    for (const item of cart.items) {
      if (item.variantId) {
        await this.variantsService.checkStock(
          item.variantId.toString(),
          item.quantity,
        );
        // In real implementation, decrement variant stock here
      } else {
        await this.productsService.checkStock(
          item.productId.toString(),
          item.quantity,
        );
        // In real implementation, decrement product stock here
      }
    }

    // Clear cart
    await this.cartService.clearCart(cart._id.toString());

    // Send order confirmation email (implement email service)
    // await this.emailService.sendOrderConfirmation(order);

    return order;
  }

  async findAll(filterDto: OrderFilterDto) {
    return this.ordersRepository.findAll(filterDto);
  }

  async findById(id: string) {
    const order = await this.ordersRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async findByOrderNumber(orderNumber: string) {
    const order = await this.ordersRepository.findByOrderNumber(orderNumber);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async findUserOrders(userId: string, page: number = 1, limit: number = 10) {
    return this.ordersRepository.findByUserId(userId, page, limit);
  }

  async updateStatus(id: string, updateDto: UpdateOrderStatusDto) {
    const order = await this.findById(id);

    const updateData: any = {
      status: updateDto.status,
      internalNote: updateDto.internalNote,
    };

    // Handle status-specific updates
    if (updateDto.status === 'shipped') {
      updateData.shippedAt = new Date();
      updateData.fulfillmentStatus = 'fulfilled';
      updateData.trackingNumber = updateDto.trackingNumber;
      updateData.trackingUrl = updateDto.trackingUrl;
      updateData.shippingCarrier = updateDto.shippingCarrier;
      // Send shipping notification
    }

    if (updateDto.status === 'delivered') {
      updateData.deliveredAt = new Date();
      // Send delivery notification
    }

    if (updateDto.status === 'cancelled') {
      updateData.cancelledAt = new Date();
      // Restore stock
    }

    return this.ordersRepository.update(id, updateData);
  }

  async cancelOrder(id: string, reason: string, userId?: string) {
    const order = await this.findById(id);

    if (!['pending_payment', 'confirmed', 'processing'].includes(order.status)) {
      throw new BadRequestException('Order cannot be cancelled at this stage');
    }

    const updateData = {
      status: 'cancelled',
      cancellationReason: reason,
      cancelledAt: new Date(),
      cancelledBy: userId,
    };

    // Restore stock for all items
    // Implement stock restoration logic here

    return this.ordersRepository.update(id, updateData);
  }

  private async processPayment(orderId: string, paymentDetails: any) {
    return this.ordersRepository.update(orderId, {
      paymentDetails,
      paymentStatus: 'paid',
      status: 'confirmed',
    });
  }

  async getOrderStats() {
    return this.ordersRepository.getOrderStats();
  }

  async getRevenue(startDate: Date, endDate: Date) {
    return this.ordersRepository.getRevenueByPeriod(startDate, endDate);
  }
}
```

**Step 5: Create Controller**

```typescript
// orders.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { OrdersService } from './orders.service';
import { Public } from '../auth/decorators/public.decorator';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { createOrderSchema, updateOrderStatusSchema, orderFilterSchema } from './schemas/order.schema';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  private getSessionId(req: Request): string {
    return req.session?.id || 'guest-' + Date.now();
  }

  // Public/Guest endpoints
  @Post()
  @UseGuards(OptionalAuthGuard)
  async createOrder(
    @Body() body: unknown,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const dto = createOrderSchema.parse(body);
    const userId = user?.sub;
    const sessionId = userId ? undefined : this.getSessionId(req);
    return this.ordersService.createOrder(dto, userId, sessionId);
  }

  @Public()
  @Get('track/:orderNumber')
  async trackOrder(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber);
  }

  // Authenticated customer endpoints
  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  async getUserOrders(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.findUserOrders(
      user.sub,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('my-orders/:id')
  @UseGuards(JwtAuthGuard)
  async getUserOrder(@CurrentUser() user: any, @Param('id') id: string) {
    const order = await this.ordersService.findById(id);
    
    // Verify order belongs to user
    if (order.customer.userId?.toString() !== user.sub) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  @Put('my-orders/:id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelUserOrder(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    const order = await this.ordersService.findById(id);
    
    // Verify order belongs to user
    if (order.customer.userId?.toString() !== user.sub) {
      throw new NotFoundException('Order not found');
    }

    return this.ordersService.cancelOrder(id, body.reason, user.sub);
  }

  // Admin endpoints
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  async findAll(@Query() query: unknown) {
    const filterDto = orderFilterSchema.parse(query);
    return this.ordersService.findAll(filterDto);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  async getStats() {
    return this.ordersService.getOrderStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  async findById(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  async updateStatus(@Param('id') id: string, @Body() body: unknown) {
    const dto = updateOrderStatusSchema.parse(body);
    return this.ordersService.updateStatus(id, dto);
  }
}
```

---

## Feature 9: Reviews & Comments

### Files Structure
```
src/
├── modules/
│   └── reviews/
│       ├── reviews.module.ts
│       ├── reviews.controller.ts
│       ├── reviews.service.ts
│       ├── dto/
│       │   ├── create-review.dto.ts
│       │   ├── update-review.dto.ts
│       │   └── filter-reviews.dto.ts
│       ├── schemas/
│       │   ├── review.schema.ts (Zod)
│       │   └── review.model.ts (Mongoose)
│       └── repositories/
│           └── reviews.repository.ts
```

### Implementation Steps

**Step 1: Create Mongoose Schema**

```typescript
// schemas/review.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class ReviewImage {
  @Prop({ required: true })
  url: string;

  @Prop()
  alt: string;
}

@Schema({ _id: false })
export class ReviewResponse {
  @Prop({ required: true })
  text: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  respondedBy: Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  respondedAt: Date;
}

@Schema({ timestamps: true })
export class Review extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order' })
  orderId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop()
  title: string;

  @Prop({ required: true })
  comment: string;

  @Prop({ type: [ReviewImage] })
  images: ReviewImage[];

  @Prop({ default: false })
  isVerifiedPurchase: boolean;

  @Prop({ enum: ['pending', 'approved', 'rejected', 'flagged'], default: 'pending' })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  moderatedBy: Types.ObjectId;

  @Prop()
  moderatedAt: Date;

  @Prop()
  moderationNote: string;

  @Prop({ default: 0 })
  helpfulCount: number;

  @Prop({ default: 0 })
  notHelpfulCount: number;

  @Prop({ type: ReviewResponse })
  response: ReviewResponse;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Indexes
ReviewSchema.index({ productId: 1 });
ReviewSchema.index({ userId: 1 });
ReviewSchema.index({ status: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ isVerifiedPurchase: 1 });
ReviewSchema.index({ createdAt: -1 });
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
```

**Step 2: Create Zod Schemas**

```typescript
// schemas/review.schema.ts
import { z } from 'zod';

export const reviewImageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  alt: z.string().optional(),
});

export const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  title: z.string().max(100, 'Title cannot exceed 100 characters').optional(),
  comment: z.string().min(10, 'Comment must be at least 10 characters'),
  images: z.array(reviewImageSchema).max(5, 'Maximum 5 images allowed').optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(100).optional(),
  comment: z.string().min(10).optional(),
  images: z.array(reviewImageSchema).max(5).optional(),
});

export const moderateReviewSchema = z.object({
  status: z.enum(['approved', 'rejected', 'flagged']),
  moderationNote: z.string().optional(),
});

export const reviewResponseSchema = z.object({
  text: z.string().min(1, 'Response text is required'),
});

export const filterReviewsSchema = z.object({
  page: z.number().positive().optional().default(1),
  limit: z.number().positive().max(100).optional().default(20),
  productId: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'flagged']).optional(),
  isVerifiedPurchase: z.boolean().optional(),
  sortBy: z.enum(['rating', 'helpful', 'recent']).optional().default('recent'),
});

export type CreateReviewDto = z.infer<typeof createReviewSchema>;
export type UpdateReviewDto = z.infer<typeof updateReviewSchema>;
export type ModerateReviewDto = z.infer<typeof moderateReviewSchema>;
export type ReviewResponseDto = z.infer<typeof reviewResponseSchema>;
export type FilterReviewsDto = z.infer<typeof filterReviewsSchema>;
```

**Step 3: Create Repository**

```typescript
// repositories/reviews.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Review } from '../schemas/review.model';
import { FilterReviewsDto } from '../schemas/review.schema';

@Injectable()
export class ReviewsRepository {
  constructor(@InjectModel(Review.name) private reviewModel: Model<Review>) {}

  async create(reviewData: Partial<Review>): Promise<Review> {
    const review = new this.reviewModel(reviewData);
    return review.save();
  }

  async findAll(filterDto: FilterReviewsDto) {
    const {
      page = 1,
      limit = 20,
      productId,
      rating,
      status,
      isVerifiedPurchase,
      sortBy = 'recent',
    } = filterDto;

    const filter: FilterQuery<Review> = {};

    if (productId) filter.productId = productId;
    if (rating) filter.rating = rating;
    if (status) filter.status = status;
    if (isVerifiedPurchase !== undefined) filter.isVerifiedPurchase = isVerifiedPurchase;

    const skip = (page - 1) * limit;
    
    let sortOptions: any = {};
    switch (sortBy) {
      case 'helpful':
        sortOptions = { helpfulCount: -1 };
        break;
      case 'rating':
        sortOptions = { rating: -1 };
        break;
      case 'recent':
      default:
        sortOptions = { createdAt: -1 };
    }

    const [reviews, total] = await Promise.all([
      this.reviewModel
        .find(filter)
        .populate('userId', 'firstName lastName avatar')
        .populate('productId', 'name slug')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.reviewModel.countDocuments(filter).exec(),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<Review | null> {
    return this.reviewModel
      .findById(id)
      .populate('userId', 'firstName lastName avatar')
      .populate('productId', 'name slug')
      .exec();
  }

  async findByUserAndProduct(userId: string, productId: string): Promise<Review | null> {
    return this.reviewModel.findOne({ userId, productId }).exec();
  }

  async update(id: string, data: Partial<Review>): Promise<Review | null> {
    return this.reviewModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await this.reviewModel.findByIdAndDelete(id).exec();
  }

  async incrementHelpful(id: string): Promise<void> {
    await this.reviewModel.findByIdAndUpdate(id, { $inc: { helpfulCount: 1 } }).exec();
  }

  async incrementNotHelpful(id: string): Promise<void> {
    await this.reviewModel.findByIdAndUpdate(id, { $inc: { notHelpfulCount: 1 } }).exec();
  }

  async getProductRatingStats(productId: string) {
    const stats = await this.reviewModel.aggregate([
      {
        $match: {
          productId: productId,
          status: 'approved',
        },
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const total = stats.reduce((sum, stat) => sum + stat.count, 0);
    const average =
      stats.reduce((sum, stat) => sum + stat._id * stat.count, 0) / (total || 1);

    return {
      average: Math.round(average * 10) / 10,
      total,
      distribution: stats,
    };
  }
}
```

**Step 4: Create Service**

```typescript
// reviews.service.ts
import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { ReviewsRepository } from './repositories/reviews.repository';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';
import {
  CreateReviewDto,
  UpdateReviewDto,
  ModerateReviewDto,
  ReviewResponseDto,
  FilterReviewsDto,
} from './schemas/review.schema';

@Injectable()
export class ReviewsService {
  constructor(
    private reviewsRepository: ReviewsRepository,
    private productsService: ProductsService,
    private ordersService: OrdersService,
  ) {}

  async create(createDto: CreateReviewDto, userId: string) {
    // Verify product exists
    await this.productsService.findById(createDto.productId);

    // Check if user already reviewed this product
    const existing = await this.reviewsRepository.findByUserAndProduct(
      userId,
      createDto.productId,
    );

    if (existing) {
      throw new ConflictException('You have already reviewed this product');
    }

    // Check if verified purchase
    const userOrders = await this.ordersService.findUserOrders(userId, 1, 100);
    const isVerifiedPurchase = userOrders.orders.some(order =>
      order.items.some(item => item.productId.toString() === createDto.productId),
    );

    const review = await this.reviewsRepository.create({
      ...createDto,
      userId,
      isVerifiedPurchase,
      status: 'pending', // Requires moderation
    });

    // Update product rating
    await this.updateProductRating(createDto.productId);

    return review;
  }

  async findAll(filterDto: FilterReviewsDto) {
    return this.reviewsRepository.findAll(filterDto);
  }

  async findById(id: string) {
    const review = await this.reviewsRepository.findById(id);
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return review;
  }

  async update(id: string, updateDto: UpdateReviewDto, userId: string) {
    const review = await this.findById(id);

    // Verify ownership
    if (review.userId.toString() !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    // Reset status to pending if content changed
    const updatedReview = await this.reviewsRepository.update(id, {
      ...updateDto,
      status: 'pending',
    });

    // Update product rating
    await this.updateProductRating(review.productId.toString());

    return updatedReview;
  }

  async delete(id: string, userId: string) {
    const review = await this.findById(id);

    // Verify ownership
    if (review.userId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.reviewsRepository.delete(id);

    // Update product rating
    await this.updateProductRating(review.productId.toString());
  }

  async moderate(id: string, moderateDto: ModerateReviewDto, adminId: string) {
    const review = await this.findById(id);

    await this.reviewsRepository.update(id, {
      status: moderateDto.status,
      moderationNote: moderateDto.moderationNote,
      moderatedBy: adminId,
      moderatedAt: new Date(),
    });

    // Update product rating
    await this.updateProductRating(review.productId.toString());

    return this.findById(id);
  }

  async addResponse(id: string, responseDto: ReviewResponseDto, adminId: string) {
    await this.findById(id);

    return this.reviewsRepository.update(id, {
      response: {
        text: responseDto.text,
        respondedBy: adminId,
        respondedAt: new Date(),
      },
    });
  }

  async markHelpful(id: string) {
    await this.findById(id);
    await this.reviewsRepository.incrementHelpful(id);
  }

  async markNotHelpful(id: string) {
    await this.findById(id);
    await this.reviewsRepository.incrementNotHelpful(id);
  }

  private async updateProductRating(productId: string) {
    const stats = await this.reviewsRepository.getProductRatingStats(productId);
    
    // Update product with new rating
    // Implement in ProductsService
    // await this.productsService.updateRating(productId, stats.average, stats.total);
  }

  async getProductRatingStats(productId: string) {
    return this.reviewsRepository.getProductRatingStats(productId);
  }
}
```

**Step 5: Create Controller**

```typescript
// reviews.controller.ts
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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  createReviewSchema,
  updateReviewSchema,
  moderateReviewSchema,
  reviewResponseSchema,
  filterReviewsSchema,
} from './schemas/review.schema';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  // Public endpoints
  @Public()
  @Get()
  async findAll(@Query() query: unknown) {
    const filterDto = filterReviewsSchema.parse(query);
    return this.reviewsService.findAll(filterDto);
  }

  @Public()
  @Get('product/:productId/stats')
  async getProductStats(@Param('productId') productId: string) {
    return this.reviewsService.getProductRatingStats(productId);
  }

  // Authenticated customer endpoints
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: unknown, @CurrentUser() user: any) {
    const dto = createReviewSchema.parse(body);
    return this.reviewsService.create(dto, user.sub);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: any,
  ) {
    const dto = updateReviewSchema.parse(body);
    return this.reviewsService.update(id, dto, user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reviewsService.delete(id, user.sub);
  }

  @Post(':id/helpful')
  @HttpCode(HttpStatus.OK)
  async markHelpful(@Param('id') id: string) {
    return this.reviewsService.markHelpful(id);
  }

  @Post(':id/not-helpful')
  @HttpCode(HttpStatus.OK)
  async markNotHelpful(@Param('id') id: string) {
    return this.reviewsService.markNotHelpful(id);
  }

  // Admin endpoints
  @Put(':id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  async moderate(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: any,
  ) {
    const dto = moderateReviewSchema.parse(body);
    return this.reviewsService.moderate(id, dto, user.sub);
  }

  @Post(':id/response')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  async addResponse(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: any,
  ) {
    const dto = reviewResponseSchema.parse(body);
    return this.reviewsService.addResponse(id, dto, user.sub);
  }
}
```

---

*Continue in next file for Best Practices...*
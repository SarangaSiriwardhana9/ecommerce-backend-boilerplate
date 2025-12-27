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
export class OrderAddress {
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

@Schema({ _id: false })
export class VariantOption {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    value: string;
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

    @Prop({ type: [VariantOption], default: [] })
    variantOptions: VariantOption[];

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

    @Prop({ type: OrderAddress, required: true })
    shippingAddress: OrderAddress;

    @Prop({ type: OrderAddress, required: true })
    billingAddress: OrderAddress;

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

    @Prop({ type: [AppliedDiscount], default: [] })
    appliedDiscounts: AppliedDiscount[];

    @Prop({ enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery', 'mock'], required: true })
    paymentMethod: string;

    @Prop({ enum: ['pending', 'authorized', 'paid', 'failed', 'refunded', 'partially_refunded'], default: 'pending' })
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
        enum: ['pending_payment', 'payment_failed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending_payment'
    })
    status: string;

    @Prop({ enum: ['unfulfilled', 'partially_fulfilled', 'fulfilled'], default: 'unfulfilled' })
    fulfillmentStatus: string;

    @Prop()
    customerNote: string;

    @Prop()
    internalNote: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ 'customer.userId': 1 });
OrderSchema.index({ 'customer.email': 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });

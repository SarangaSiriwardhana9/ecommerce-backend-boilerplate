import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class VariantOption {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    value: string;
}

@Schema({ _id: true })
export class CartItem {
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    productId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'ProductVariant' })
    variantId: Types.ObjectId;

    @Prop({ required: true })
    productName: string;

    @Prop({ required: true })
    productSlug: string;

    @Prop()
    productImage: string;

    @Prop({ type: [VariantOption], default: [] })
    variantOptions: VariantOption[];

    @Prop({ required: true, min: 0 })
    price: number;

    @Prop({ min: 0 })
    compareAtPrice: number;

    @Prop({ required: true, min: 1 })
    quantity: number;

    @Prop({ type: Types.ObjectId, ref: 'Discount' })
    discountId: Types.ObjectId;

    @Prop({ default: 0, min: 0 })
    discountAmount: number;

    @Prop({ default: () => new Date() })
    addedAt: Date;
}

@Schema({ _id: false })
export class AppliedCoupon {
    @Prop({ type: Types.ObjectId, ref: 'Discount', required: true })
    discountId: Types.ObjectId;

    @Prop({ required: true })
    code: string;

    @Prop({ required: true, min: 0 })
    discountAmount: number;
}

@Schema({ timestamps: true })
export class Cart extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User' })
    userId: Types.ObjectId;

    @Prop()
    sessionId: string;

    @Prop({ type: [CartItem], default: [] })
    items: CartItem[];

    @Prop({ type: [AppliedCoupon], default: [] })
    appliedCoupons: AppliedCoupon[];

    @Prop({ default: 0, min: 0 })
    subtotal: number;

    @Prop({ default: 0, min: 0 })
    discountTotal: number;

    @Prop({ default: 0, min: 0 })
    taxTotal: number;

    @Prop({ default: 0, min: 0 })
    shippingTotal: number;

    @Prop({ default: 0, min: 0 })
    total: number;

    @Prop({ enum: ['active', 'abandoned', 'converted', 'merged'], default: 'active' })
    status: string;

    @Prop({ default: () => new Date() })
    lastActivityAt: Date;

    @Prop()
    expiresAt: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

CartSchema.index({ userId: 1 });
CartSchema.index({ sessionId: 1 });
CartSchema.index({ status: 1 });
CartSchema.index({ lastActivityAt: 1 });
CartSchema.index({ expiresAt: 1 });

const CartItemSchema = SchemaFactory.createForClass(CartItem);
export { CartItemSchema };

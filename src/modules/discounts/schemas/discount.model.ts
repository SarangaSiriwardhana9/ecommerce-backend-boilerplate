import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Discount extends Document {
    @Prop({ required: true, trim: true })
    name: string;

    @Prop()
    description: string;

    @Prop({ unique: true, sparse: true, uppercase: true, trim: true })
    code: string;

    @Prop({ enum: ['percentage', 'fixed_amount', 'free_shipping'], required: true })
    type: string;

    @Prop({ required: true, min: 0 })
    value: number;

    @Prop({ enum: ['entire_order', 'specific_products', 'specific_categories', 'minimum_purchase'], required: true })
    applicationType: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }], default: [] })
    applicableProducts: Types.ObjectId[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }], default: [] })
    applicableCategories: Types.ObjectId[];

    @Prop({ min: 0, default: 0 })
    minimumPurchaseAmount: number;

    @Prop({ min: 0, default: 0 })
    minimumQuantity: number;

    @Prop({ min: 0 })
    usageLimit: number;

    @Prop({ default: 0, min: 0 })
    usageCount: number;

    @Prop({ min: 1, default: 1 })
    usageLimitPerCustomer: number;

    @Prop({ required: true })
    startDate: Date;

    @Prop({ required: true })
    endDate: Date;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: true })
    isPublic: boolean;

    @Prop({ type: [String], default: [] })
    targetedUserEmails: string[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
    targetedUserIds: Types.ObjectId[];

    @Prop({ default: false })
    excludeSaleItems: boolean;

    @Prop({ default: false })
    firstOrderOnly: boolean;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy: Types.ObjectId;
}

export const DiscountSchema = SchemaFactory.createForClass(Discount);

DiscountSchema.index({ code: 1 }, { unique: true, sparse: true });
DiscountSchema.index({ isActive: 1 });
DiscountSchema.index({ startDate: 1, endDate: 1 });
DiscountSchema.index({ applicableProducts: 1 });
DiscountSchema.index({ applicableCategories: 1 });
DiscountSchema.index({ createdAt: -1 });

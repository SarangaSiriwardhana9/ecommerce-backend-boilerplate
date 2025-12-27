import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class VariantImage {
    @Prop({ required: true })
    url: string;

    @Prop()
    alt: string;

    @Prop({ default: 0 })
    position: number;

    @Prop({ default: false })
    isPrimary: boolean;
}

@Schema({ _id: false })
export class VariantOption {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    value: string;
}

@Schema({ _id: false })
export class VariantDimensions {
    @Prop()
    length: number;

    @Prop()
    width: number;

    @Prop()
    height: number;
}

@Schema({ timestamps: true })
export class ProductVariant extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    productId: Types.ObjectId;

    @Prop({ required: true, unique: true, uppercase: true, trim: true })
    sku: string;

    @Prop()
    barcode: string;

    @Prop({ type: [VariantOption], required: true })
    options: VariantOption[];

    @Prop({ required: true, min: 0 })
    price: number;

    @Prop({ min: 0 })
    compareAtPrice: number;

    @Prop({ min: 0 })
    cost: number;

    @Prop({ required: true, default: 0, min: 0 })
    stock: number;

    @Prop({ default: 10, min: 0 })
    lowStockThreshold: number;

    @Prop({ type: [VariantImage], default: [] })
    images: VariantImage[];

    @Prop({ min: 0 })
    weight: number;

    @Prop({ type: VariantDimensions })
    dimensions: VariantDimensions;

    @Prop()
    description: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: 0 })
    position: number;
}

export const ProductVariantSchema = SchemaFactory.createForClass(ProductVariant);

ProductVariantSchema.index({ sku: 1 }, { unique: true });
ProductVariantSchema.index({ productId: 1 });
ProductVariantSchema.index({ isActive: 1 });
ProductVariantSchema.index({ productId: 1, 'options.name': 1, 'options.value': 1 });

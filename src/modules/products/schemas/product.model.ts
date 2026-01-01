import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class ProductImage {
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
export class SecondaryImage {
    @Prop({ enum: ['size_guide', 'care_instructions', 'certificate'], required: true })
    type: string;

    @Prop({ required: true })
    url: string;

    @Prop()
    title: string;
}

@Schema({ _id: false })
export class ProductVideo {
    @Prop({ required: true })
    url: string;

    @Prop()
    thumbnail: string;

    @Prop()
    title: string;
}

@Schema({ _id: false })
export class Dimensions {
    @Prop()
    length: number;

    @Prop()
    width: number;

    @Prop()
    height: number;

    @Prop({ enum: ['cm', 'inch'], default: 'cm' })
    unit: string;
}

@Schema({ _id: false })
export class VariantOption {
    @Prop({ required: true })
    name: string;

    @Prop({ type: [String], required: true })
    values: string[];
}

@Schema({ _id: false })
export class ProductAttribute {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    value: string;
}

@Schema({ timestamps: true })
export class Product extends Document {
    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    slug: string;

    @Prop({ required: true, unique: true, uppercase: true, trim: true })
    sku: string;

    @Prop({ maxlength: 1000 }) // Increased to accommodate HTML formatting
    shortDescription: string;

    @Prop({ maxlength: 20000 }) // Increased to accommodate HTML formatting
    description: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }], default: [] })
    categories: Types.ObjectId[];

    @Prop({ type: Types.ObjectId, ref: 'Category' })
    primaryCategory: Types.ObjectId;

    @Prop({ type: [String], default: [] })
    tags: string[];

    @Prop()
    brand: string;

    @Prop()
    manufacturer: string;

    @Prop({ required: true, min: 0 })
    basePrice: number;

    @Prop({ min: 0 })
    compareAtPrice: number;

    @Prop({ min: 0 })
    cost: number;

    @Prop({ default: true })
    taxable: boolean;

    @Prop()
    taxCode: string;

    @Prop({ default: true })
    trackInventory: boolean;

    @Prop({ default: 0, min: 0 })
    stock: number;

    @Prop({ default: 10, min: 0 })
    lowStockThreshold: number;

    @Prop({ default: false })
    allowBackorder: boolean;

    @Prop({ min: 0 })
    weight: number;

    @Prop({ enum: ['kg', 'g', 'lb', 'oz'], default: 'kg' })
    weightUnit: string;

    @Prop({ type: Dimensions })
    dimensions: Dimensions;

    @Prop({ type: [ProductImage], default: [] })
    images: ProductImage[];

    @Prop({ type: [SecondaryImage], default: [] })
    secondaryImages: SecondaryImage[];

    @Prop({ type: [ProductVideo], default: [] })
    videos: ProductVideo[];

    @Prop({ default: false })
    hasVariants: boolean;

    @Prop({ type: [VariantOption], default: [] })
    variantOptions: VariantOption[];

    @Prop({ type: [ProductAttribute], default: [] })
    attributes: ProductAttribute[];

    @Prop()
    metaTitle: string;

    @Prop()
    metaDescription: string;

    @Prop({ type: [String], default: [] })
    metaKeywords: string[];

    @Prop({ enum: ['draft', 'active', 'archived', 'out_of_stock'], default: 'draft' })
    status: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: false })
    isFeatured: boolean;

    @Prop()
    publishedAt: Date;

    @Prop()
    availableFrom: Date;

    @Prop()
    availableUntil: Date;

    @Prop({ default: 0 })
    viewCount: number;

    @Prop({ default: 0 })
    salesCount: number;

    @Prop({ default: 0, min: 0, max: 5 })
    averageRating: number;

    @Prop({ default: 0 })
    reviewCount: number;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy: Types.ObjectId;

    @Prop()
    deletedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ sku: 1 }, { unique: true });
ProductSchema.index({ categories: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ averageRating: -1 });
ProductSchema.index({ basePrice: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

ProductSchema.pre('save', function (next) {
    if (this.isNew && !this.publishedAt && this.status === 'active') {
        this.publishedAt = new Date();
    }
    next();
});

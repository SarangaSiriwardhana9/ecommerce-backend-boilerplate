import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class CategoryAttribute {
    @Prop({ required: true })
    name: string;

    @Prop({ enum: ['text', 'number', 'select', 'multiselect'], required: true })
    type: string;

    @Prop({ type: [String], default: [] })
    values: string[];

    @Prop({ default: false })
    isRequired: boolean;

    @Prop({ default: false })
    isFilterable: boolean;
}

@Schema({ timestamps: true })
export class Category extends Document {
    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    slug: string;

    @Prop()
    description: string;

    @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
    parentCategory: Types.ObjectId;

    @Prop({ default: 0 })
    level: number;

    @Prop({ default: '' })
    path: string;

    @Prop()
    image: string;

    @Prop()
    icon: string;

    @Prop()
    metaTitle: string;

    @Prop()
    metaDescription: string;

    @Prop({ type: [String], default: [] })
    metaKeywords: string[];

    @Prop({ default: 0 })
    displayOrder: number;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: false })
    isFeatured: boolean;

    @Prop({ type: [CategoryAttribute], default: [] })
    attributes: CategoryAttribute[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ parentCategory: 1 });
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ displayOrder: 1 });
CategorySchema.index({ isFeatured: 1 });

CategorySchema.pre('save', async function (next) {
    const doc = this as any;
    if (doc.isModified('parentCategory') || doc.isNew) {
        if (doc.parentCategory) {
            const parent = await this.model('Category').findById(doc.parentCategory);
            if (parent) {
                doc.level = (parent as any).level + 1;
                doc.path = (parent as any).path ? `${(parent as any).path}/${doc.slug}` : doc.slug;
            }
        } else {
            doc.level = 0;
            doc.path = doc.slug;
        }
    }
    next();
});

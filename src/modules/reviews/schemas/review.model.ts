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

    @Prop({ default: () => new Date() })
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

    @Prop({ type: [ReviewImage], default: [] })
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

    @Prop({ default: 0, min: 0 })
    helpfulCount: number;

    @Prop({ default: 0, min: 0 })
    notHelpfulCount: number;

    @Prop({ type: ReviewResponse })
    response: ReviewResponse;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.index({ productId: 1 });
ReviewSchema.index({ userId: 1 });
ReviewSchema.index({ status: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ isVerifiedPurchase: 1 });
ReviewSchema.index({ createdAt: -1 });
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

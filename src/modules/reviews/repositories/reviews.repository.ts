import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review } from '../schemas/review.model';

@Injectable()
export class ReviewsRepository {
    constructor(@InjectModel(Review.name) private reviewModel: Model<Review>) { }

    async create(reviewData: Partial<Review>): Promise<Review> {
        const review = new this.reviewModel(reviewData);
        return review.save();
    }

    async findAll(filters?: any): Promise<Review[]> {
        const query: any = {};

        if (filters?.productId) {
            query.productId = new Types.ObjectId(filters.productId);
        }

        if (filters?.userId) {
            query.userId = new Types.ObjectId(filters.userId);
        }

        if (filters?.status) {
            query.status = filters.status;
        }

        return this.reviewModel
            .find(query)
            .populate('userId', 'firstName lastName')
            .sort({ createdAt: -1 })
            .exec();
    }

    async findById(id: string): Promise<Review | null> {
        return this.reviewModel
            .findById(id)
            .populate('userId', 'firstName lastName')
            .populate('response.respondedBy', 'firstName lastName')
            .exec();
    }

    async findByProduct(productId: string, approvedOnly: boolean = true): Promise<Review[]> {
        const query: any = { productId: new Types.ObjectId(productId) };
        if (approvedOnly) {
            query.status = 'approved';
        }

        return this.reviewModel
            .find(query)
            .populate('userId', 'firstName lastName')
            .sort({ createdAt: -1 })
            .exec();
    }

    async findByUser(userId: string): Promise<Review[]> {
        return this.reviewModel
            .find({ userId: new Types.ObjectId(userId) })
            .populate('productId', 'name slug')
            .sort({ createdAt: -1 })
            .exec();
    }

    async findByProductAndUser(productId: string, userId: string): Promise<Review | null> {
        return this.reviewModel
            .findOne({
                productId: new Types.ObjectId(productId),
                userId: new Types.ObjectId(userId),
            })
            .exec();
    }

    async update(id: string, data: Partial<Review>): Promise<Review | null> {
        return this.reviewModel.findByIdAndUpdate(id, data, { new: true }).exec();
    }

    async delete(id: string): Promise<void> {
        await this.reviewModel.findByIdAndDelete(id).exec();
    }

    async incrementHelpfulCount(id: string): Promise<void> {
        await this.reviewModel.findByIdAndUpdate(id, { $inc: { helpfulCount: 1 } }).exec();
    }

    async getAverageRating(productId: string): Promise<{ average: number; count: number }> {
        const result = await this.reviewModel.aggregate([
            {
                $match: {
                    productId: new Types.ObjectId(productId),
                    status: 'approved',
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    reviewCount: { $sum: 1 },
                },
            },
        ]).exec();

        if (result.length === 0) {
            return { average: 0, count: 0 };
        }

        return {
            average: Number(result[0].averageRating.toFixed(1)),
            count: result[0].reviewCount,
        };
    }
}

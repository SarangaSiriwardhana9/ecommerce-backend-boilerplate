import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ReviewsRepository } from './repositories/reviews.repository';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';
import { CreateReviewDto, UpdateReviewDto, ModerateReviewDto, RespondToReviewDto } from './dto';

@Injectable()
export class ReviewsService {
    constructor(
        private reviewsRepository: ReviewsRepository,
        private productsService: ProductsService,
        private ordersService: OrdersService,
    ) { }

    async create(createDto: CreateReviewDto, userId: string) {
        await this.productsService.findById(createDto.productId);

        const existingReview = await this.reviewsRepository.findByProductAndUser(
            createDto.productId,
            userId
        );

        if (existingReview) {
            throw new BadRequestException('You have already reviewed this product');
        }

        let isVerifiedPurchase = false;
        if (createDto.orderId) {
            const order = await this.ordersService.findById(createDto.orderId, userId, false);
            if (order) {
                const hasProduct = (order.items as any[]).some(
                    (item: any) => item.productId.toString() === createDto.productId
                );
                isVerifiedPurchase = hasProduct;
            }
        }

        const reviewData: any = {
            ...createDto,
            productId: new Types.ObjectId(createDto.productId),
            userId: new Types.ObjectId(userId),
            orderId: createDto.orderId ? new Types.ObjectId(createDto.orderId) : undefined,
            isVerifiedPurchase,
            status: 'approved',
        };

        const review = await this.reviewsRepository.create(reviewData);

        await this.updateProductRating(createDto.productId);

        return review;
    }

    async findByProduct(productId: string) {
        await this.productsService.findById(productId);
        return this.reviewsRepository.findByProduct(productId, true);
    }

    async findByUser(userId: string) {
        return this.reviewsRepository.findByUser(userId);
    }

    async findById(id: string) {
        const review = await this.reviewsRepository.findById(id);
        if (!review) {
            throw new NotFoundException('Review not found');
        }
        return review;
    }

    async update(id: string, updateDto: UpdateReviewDto, userId: string) {
        const review = await this.reviewsRepository.findById(id);
        if (!review) {
            throw new NotFoundException('Review not found');
        }

        if (review.userId.toString() !== userId) {
            throw new ForbiddenException('You can only update your own reviews');
        }

        const updated = await this.reviewsRepository.update(id, updateDto as any);

        if (updateDto.rating) {
            await this.updateProductRating(review.productId.toString());
        }

        return updated;
    }

    async delete(id: string, userId: string, isAdmin: boolean = false) {
        const review = await this.reviewsRepository.findById(id);
        if (!review) {
            throw new NotFoundException('Review not found');
        }

        if (!isAdmin && review.userId.toString() !== userId) {
            throw new ForbiddenException('You can only delete your own reviews');
        }

        const productId = review.productId.toString();

        await this.reviewsRepository.delete(id);

        await this.updateProductRating(productId);

        return { message: 'Review deleted successfully' };
    }

    async markHelpful(id: string) {
        const review = await this.reviewsRepository.findById(id);
        if (!review) {
            throw new NotFoundException('Review not found');
        }

        await this.reviewsRepository.incrementHelpfulCount(id);

        return { message: 'Review marked as helpful' };
    }

    async moderate(id: string, moderateDto: ModerateReviewDto, moderatorId: string) {
        const review = await this.reviewsRepository.findById(id);
        if (!review) {
            throw new NotFoundException('Review not found');
        }

        const updateData: any = {
            status: moderateDto.status,
            moderatedBy: new Types.ObjectId(moderatorId),
            moderatedAt: new Date(),
            moderationNote: moderateDto.moderationNote,
        };

        const updated = await this.reviewsRepository.update(id, updateData);

        await this.updateProductRating(review.productId.toString());

        return updated;
    }

    async respond(id: string, respondDto: RespondToReviewDto, responderId: string) {
        const review = await this.reviewsRepository.findById(id);
        if (!review) {
            throw new NotFoundException('Review not found');
        }

        const response = {
            text: respondDto.text,
            respondedBy: new Types.ObjectId(responderId),
            respondedAt: new Date(),
        };

        return this.reviewsRepository.update(id, { response } as any);
    }

    private async updateProductRating(productId: string) {
        const stats = await this.reviewsRepository.getAverageRating(productId);

        const product = await this.productsService.findById(productId);
        (product as any).averageRating = stats.average;
        (product as any).reviewCount = stats.count;
        await (product as any).save();
    }
}

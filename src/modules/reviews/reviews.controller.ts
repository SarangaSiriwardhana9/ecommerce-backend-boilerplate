import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
    createReviewSchema,
    updateReviewSchema,
    moderateReviewSchema,
    respondToReviewSchema,
} from './schemas/review.schema';

@Controller('reviews')
export class ReviewsController {
    constructor(private reviewsService: ReviewsService) { }

    @Get('product/:productId')
    async findByProduct(@Param('productId') productId: string) {
        const reviews = await this.reviewsService.findByProduct(productId);
        return {
            data: reviews,
            message: 'Product reviews retrieved successfully'
        };
    }

    @Get('user')
    @UseGuards(JwtAuthGuard)
    async findByUser(@CurrentUser() user: any) {
        const reviews = await this.reviewsService.findByUser(user.sub);
        return {
            data: reviews,
            message: 'User reviews retrieved successfully'
        };
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        const review = await this.reviewsService.findById(id);
        return {
            data: review,
            message: 'Review retrieved successfully'
        };
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() body: unknown, @CurrentUser() user: any) {
        const dto = createReviewSchema.parse(body);
        const review = await this.reviewsService.create(dto, user.sub);
        return {
            data: review,
            message: 'Review created successfully'
        };
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async update(@Param('id') id: string, @Body() body: unknown, @CurrentUser() user: any) {
        const dto = updateReviewSchema.parse(body);
        const review = await this.reviewsService.update(id, dto, user.sub);
        return {
            data: review,
            message: 'Review updated successfully'
        };
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async delete(@Param('id') id: string, @CurrentUser() user: any) {
        const isAdmin = user.role === 'admin' || user.role === 'super_admin';
        const result = await this.reviewsService.delete(id, user.sub, isAdmin);
        return result;
    }

    @Post(':id/helpful')
    async markHelpful(@Param('id') id: string) {
        const result = await this.reviewsService.markHelpful(id);
        return result;
    }

    @Put(':id/moderate')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async moderate(@Param('id') id: string, @Body() body: unknown, @CurrentUser() user: any) {
        const dto = moderateReviewSchema.parse(body);
        const review = await this.reviewsService.moderate(id, dto, user.sub);
        return {
            data: review,
            message: 'Review moderated successfully'
        };
    }

    @Post(':id/respond')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async respond(@Param('id') id: string, @Body() body: unknown, @CurrentUser() user: any) {
        const dto = respondToReviewSchema.parse(body);
        const review = await this.reviewsService.respond(id, dto, user.sub);
        return {
            data: review,
            message: 'Response added successfully'
        };
    }
}

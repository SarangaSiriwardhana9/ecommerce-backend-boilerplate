import { z } from 'zod';

const reviewImageSchema = z.object({
    url: z.string().url('Invalid image URL'),
    alt: z.string().optional(),
});

export const createReviewSchema = z.object({
    productId: z.string().min(1, 'Product ID is required'),
    orderId: z.string().optional(),
    rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
    title: z.string().max(200).optional(),
    comment: z.string().min(10, 'Comment must be at least 10 characters').max(2000),
    images: z.array(reviewImageSchema).max(5).optional().default([]),
});

export const updateReviewSchema = z.object({
    rating: z.number().int().min(1).max(5).optional(),
    title: z.string().max(200).optional(),
    comment: z.string().min(10).max(2000).optional(),
    images: z.array(reviewImageSchema).max(5).optional(),
});

export const moderateReviewSchema = z.object({
    status: z.enum(['approved', 'rejected', 'flagged']),
    moderationNote: z.string().optional(),
});

export const respondToReviewSchema = z.object({
    text: z.string().min(1, 'Response text is required').max(1000),
});

export type CreateReviewDto = z.infer<typeof createReviewSchema>;
export type UpdateReviewDto = z.infer<typeof updateReviewSchema>;
export type ModerateReviewDto = z.infer<typeof moderateReviewSchema>;
export type RespondToReviewDto = z.infer<typeof respondToReviewSchema>;

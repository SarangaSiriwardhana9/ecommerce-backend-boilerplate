import { z } from 'zod';

export const addToCartSchema = z.object({
    productId: z.string().min(1, 'Product ID is required'),
    variantId: z.string().optional(),
    quantity: z.number().int().positive('Quantity must be positive').default(1),
});

export const updateCartItemSchema = z.object({
    quantity: z.number().int().positive('Quantity must be positive'),
});

export const applyCouponSchema = z.object({
    code: z.string().min(1, 'Coupon code is required'),
});

export type AddToCartDto = z.infer<typeof addToCartSchema>;
export type UpdateCartItemDto = z.infer<typeof updateCartItemSchema>;
export type ApplyCouponDto = z.infer<typeof applyCouponSchema>;

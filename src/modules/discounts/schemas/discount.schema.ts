import { z } from 'zod';

export const createDiscountSchema = z.object({
    name: z.string().min(1, 'Discount name is required').max(200),
    description: z.string().optional(),
    code: z.string().min(3, 'Code must be at least 3 characters').max(50).optional(),
    type: z.enum(['percentage', 'fixed_amount', 'free_shipping']),
    value: z.number().positive('Value must be positive'),
    applicationType: z.enum(['entire_order', 'specific_products', 'specific_categories', 'minimum_purchase']),
    applicableProducts: z.array(z.string()).optional().default([]),
    applicableCategories: z.array(z.string()).optional().default([]),
    minimumPurchaseAmount: z.number().min(0).optional().default(0),
    minimumQuantity: z.number().int().min(0).optional().default(0),
    usageLimit: z.number().int().positive().optional(),
    usageLimitPerCustomer: z.number().int().positive().optional().default(1),
    startDate: z.string().datetime('Invalid start date'),
    endDate: z.string().datetime('Invalid end date'),
    isActive: z.boolean().optional().default(true),
    isPublic: z.boolean().optional().default(true),
    targetedUserEmails: z.array(z.string().email()).optional().default([]),
    targetedUserIds: z.array(z.string()).optional().default([]),
    excludeSaleItems: z.boolean().optional().default(false),
    firstOrderOnly: z.boolean().optional().default(false),
}).refine(data => {
    if (data.type === 'percentage' && data.value > 100) {
        return false;
    }
    return true;
}, {
    message: 'Percentage value cannot exceed 100',
    path: ['value']
}).refine(data => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end > start;
}, {
    message: 'End date must be after start date',
    path: ['endDate']
});

export const updateDiscountSchema = createDiscountSchema.partial();

export const validateCouponSchema = z.object({
    code: z.string().min(1, 'Code is required'),
    userId: z.string().optional(),
    cartTotal: z.number().min(0).optional(),
    productIds: z.array(z.string()).optional().default([]),
    categoryIds: z.array(z.string()).optional().default([]),
});

export type CreateDiscountDto = z.infer<typeof createDiscountSchema>;
export type UpdateDiscountDto = z.infer<typeof updateDiscountSchema>;
export type ValidateCouponDto = z.infer<typeof validateCouponSchema>;

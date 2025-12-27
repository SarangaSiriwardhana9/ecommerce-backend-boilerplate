import { z } from 'zod';

const variantImageSchema = z.object({
    url: z.string().url('Invalid image URL'),
    alt: z.string().optional(),
    position: z.number().int().min(0).optional().default(0),
    isPrimary: z.boolean().optional().default(false),
});

const variantOptionSchema = z.object({
    name: z.string().min(1, 'Option name is required'),
    value: z.string().min(1, 'Option value is required'),
});

const variantDimensionsSchema = z.object({
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
});

export const createProductVariantSchema = z.object({
    productId: z.string().min(1, 'Product ID is required'),
    sku: z.string().min(1, 'SKU is required').max(100),
    barcode: z.string().optional(),
    options: z.array(variantOptionSchema).min(1, 'At least one option is required'),
    price: z.number().positive('Price must be positive'),
    compareAtPrice: z.number().positive().optional(),
    cost: z.number().positive().optional(),
    stock: z.number().int().min(0).default(0),
    lowStockThreshold: z.number().int().min(0).optional().default(10),
    images: z.array(variantImageSchema).optional().default([]),
    weight: z.number().positive().optional(),
    dimensions: variantDimensionsSchema.optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional().default(true),
    position: z.number().int().min(0).optional().default(0),
});

export const updateProductVariantSchema = createProductVariantSchema.partial().omit({ productId: true });

export type CreateProductVariantDto = z.infer<typeof createProductVariantSchema>;
export type UpdateProductVariantDto = z.infer<typeof updateProductVariantSchema>;

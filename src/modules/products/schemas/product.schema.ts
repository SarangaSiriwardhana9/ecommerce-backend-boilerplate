import { z } from 'zod';

const productImageSchema = z.object({
    url: z.string().url('Invalid image URL'),
    alt: z.string().optional(),
    position: z.number().int().min(0).optional().default(0),
    isPrimary: z.boolean().optional().default(false),
});

const secondaryImageSchema = z.object({
    type: z.enum(['size_guide', 'care_instructions', 'certificate']),
    url: z.string().url('Invalid image URL'),
    title: z.string().optional(),
});

const productVideoSchema = z.object({
    url: z.string().url('Invalid video URL'),
    thumbnail: z.string().url().optional(),
    title: z.string().optional(),
});

const dimensionsSchema = z.object({
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    unit: z.enum(['cm', 'inch']).optional().default('cm'),
});

const variantOptionSchema = z.object({
    name: z.string().min(1, 'Variant option name is required'),
    values: z.array(z.string().min(1)).min(1, 'At least one value is required'),
});

const productAttributeSchema = z.object({
    name: z.string().min(1, 'Attribute name is required'),
    value: z.string().min(1, 'Attribute value is required'),
});

export const createProductSchema = z.object({
    name: z.string().min(1, 'Product name is required').max(200),
    slug: z.string().min(1, 'Slug is required').max(200).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
    sku: z.string().min(1, 'SKU is required').max(100),
    shortDescription: z.string().max(1000).optional(), // Increased to accommodate HTML formatting
    description: z.string().max(20000).optional(), // Increased to accommodate HTML formatting
    categories: z.array(z.string()).optional().default([]),
    primaryCategory: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    brand: z.string().optional(),
    manufacturer: z.string().optional(),
    basePrice: z.number().positive('Base price must be positive'),
    compareAtPrice: z.number().positive().optional(),
    cost: z.number().positive().optional(),
    taxable: z.boolean().optional().default(true),
    taxCode: z.string().optional(),
    trackInventory: z.boolean().optional().default(true),
    stock: z.number().int().min(0).optional().default(0),
    lowStockThreshold: z.number().int().min(0).optional().default(10),
    allowBackorder: z.boolean().optional().default(false),
    weight: z.number().positive().optional(),
    weightUnit: z.enum(['kg', 'g', 'lb', 'oz']).optional().default('kg'),
    dimensions: dimensionsSchema.optional(),
    images: z.array(productImageSchema).optional().default([]),
    secondaryImages: z.array(secondaryImageSchema).optional().default([]),
    videos: z.array(productVideoSchema).optional().default([]),
    hasVariants: z.boolean().optional().default(false),
    variantOptions: z.array(variantOptionSchema).optional().default([]),
    attributes: z.array(productAttributeSchema).optional().default([]),
    metaTitle: z.string().max(60).optional(),
    metaDescription: z.string().max(160).optional(),
    metaKeywords: z.array(z.string()).optional().default([]),
    status: z.enum(['draft', 'active', 'archived', 'out_of_stock']).optional().default('draft'),
    isActive: z.boolean().optional().default(true),
    isFeatured: z.boolean().optional().default(false),
    publishedAt: z.string().datetime().optional(),
    availableFrom: z.string().datetime().optional(),
    availableUntil: z.string().datetime().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
    page: z.number().positive().optional().default(1),
    limit: z.number().positive().max(100).optional().default(20),
    sortBy: z.enum(['name', 'basePrice', 'createdAt', 'salesCount', 'averageRating']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    categories: z.array(z.string()).optional(),
    minPrice: z.number().positive().optional(),
    maxPrice: z.number().positive().optional(),
    inStock: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    search: z.string().optional(),
    tags: z.array(z.string()).optional(),
    brand: z.string().optional(),
    status: z.enum(['draft', 'active', 'archived', 'out_of_stock']).optional(),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
export type ProductQueryDto = z.infer<typeof productQuerySchema>;

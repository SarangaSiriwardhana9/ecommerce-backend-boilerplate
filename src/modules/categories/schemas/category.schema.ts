import { z } from 'zod';

const categoryAttributeSchema = z.object({
    name: z.string().min(1, 'Attribute name is required'),
    type: z.enum(['text', 'number', 'select', 'multiselect']),
    values: z.array(z.string()).optional().default([]),
    isRequired: z.boolean().optional().default(false),
    isFilterable: z.boolean().optional().default(false),
});

export const createCategorySchema = z.object({
    name: z.string().min(1, 'Category name is required').max(100),
    slug: z.string().min(1, 'Slug is required').max(100).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
    description: z.string().optional(),
    parentCategory: z.string().optional(),
    image: z.string().url().optional(),
    icon: z.string().optional(),
    metaTitle: z.string().max(60).optional(),
    metaDescription: z.string().max(160).optional(),
    metaKeywords: z.array(z.string()).optional(),
    displayOrder: z.number().int().min(0).optional().default(0),
    isActive: z.boolean().optional().default(true),
    isFeatured: z.boolean().optional().default(false),
    attributes: z.array(categoryAttributeSchema).optional().default([]),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryQuerySchema = z.object({
    includeInactive: z.boolean().optional().default(false),
    parentId: z.string().optional(),
    isFeatured: z.boolean().optional(),
});

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
export type CategoryQueryDto = z.infer<typeof categoryQuerySchema>;
export type CategoryAttributeDto = z.infer<typeof categoryAttributeSchema>;

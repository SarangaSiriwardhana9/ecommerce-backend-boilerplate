import { z } from 'zod';
import { createProductVariantSchema } from '../schemas/product-variant.schema';

export const bulkCreateVariantsSchema = z.object({
    productId: z.string().min(1, 'Product ID is required'),
    variants: z.array(createProductVariantSchema.omit({ productId: true }))
        .min(1, 'At least one variant is required'),
});

export type BulkCreateVariantsDto = z.infer<typeof bulkCreateVariantsSchema>;

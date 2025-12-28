import { z } from 'zod';

export const findProductsQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(10),
    sortField: z.string().optional(),
    sortDir: z.enum(['asc', 'desc']).optional(),
    filter_name: z.string().optional(),
    filter_status: z.string().optional(),
    filter_brand: z.string().optional(),
});

export type FindProductsQuery = z.infer<typeof findProductsQuerySchema>;

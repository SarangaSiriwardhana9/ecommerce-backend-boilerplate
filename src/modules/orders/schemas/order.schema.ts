import { z } from 'zod';

const addressSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    phone: z.string().min(1, 'Phone is required'),
    addressLine1: z.string().min(1, 'Address line 1 is required'),
    addressLine2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
});

const customerInfoSchema = z.object({
    email: z.string().email('Invalid email'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional(),
});

export const createOrderSchema = z.object({
    customer: customerInfoSchema,
    shippingAddress: addressSchema,
    billingAddress: addressSchema,
    paymentMethod: z.enum(['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery', 'mock']),
    customerNote: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
    status: z.enum(['pending_payment', 'payment_failed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
    paymentStatus: z.enum(['pending', 'authorized', 'paid', 'failed', 'refunded', 'partially_refunded']).optional(),
    fulfillmentStatus: z.enum(['unfulfilled', 'partially_fulfilled', 'fulfilled']).optional(),
    trackingNumber: z.string().optional(),
    trackingUrl: z.string().optional(),
    shippingCarrier: z.string().optional(),
    internalNote: z.string().optional(),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;

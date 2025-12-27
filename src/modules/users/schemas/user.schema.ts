import { z } from 'zod';

// Address schema
export const addressSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    phone: z.string().min(1, 'Phone is required'),
    addressLine1: z.string().min(1, 'Address line 1 is required'),
    addressLine2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
    isDefault: z.boolean().optional(),
    type: z.enum(['shipping', 'billing', 'both']).optional(),
});

// User preferences schema
export const userPreferencesSchema = z.object({
    newsletter: z.boolean().optional(),
    smsNotifications: z.boolean().optional(),
    currency: z.string().optional(),
    language: z.string().optional(),
});

// Update profile schema
export const updateProfileSchema = z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    phone: z.string().optional(),
    avatar: z.string().url().optional(),
});

// Update preferences schema
export const updatePreferencesSchema = userPreferencesSchema;

// Add address schema
export const addAddressSchema = addressSchema;

// Update address schema
export const updateAddressSchema = addressSchema.partial();

// Export types
export type AddressDto = z.infer<typeof addressSchema>;
export type UserPreferencesDto = z.infer<typeof userPreferencesSchema>;
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type UpdatePreferencesDto = z.infer<typeof updatePreferencesSchema>;
export type AddAddressDto = z.infer<typeof addAddressSchema>;
export type UpdateAddressDto = z.infer<typeof updateAddressSchema>;

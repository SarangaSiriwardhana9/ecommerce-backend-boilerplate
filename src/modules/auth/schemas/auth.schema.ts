import { z } from 'zod';

// Email schema
export const emailSchema = z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .trim();

// Password schema with strength validation
export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Register schema
export const registerSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    phone: z.string().optional(),
});

// Login schema
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
    email: emailSchema,
});

// Reset password schema
export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
});

// Change password schema
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
});

// Export types
export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;

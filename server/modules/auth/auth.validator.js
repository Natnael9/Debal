import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be at most 72 characters'),
  name: z.string().trim().min(1, 'Name is required').max(100),
  acceptedPolicyVersion: z
    .string()
    .min(1, 'You must accept the current Privacy Policy / Terms of Service'),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export { registerSchema, loginSchema };
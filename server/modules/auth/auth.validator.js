const { z } = require('zod');

// POST /auth/register — email/password/name + mandatory policy acceptance (FR-1.8)
const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be at most 72 characters'), // bcrypt's practical limit
  name: z.string().trim().min(1, 'Name is required').max(100),
  acceptedPolicyVersion: z
    .string()
    .min(1, 'You must accept the current Privacy Policy / Terms of Service'),
});

// POST /auth/login
const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

module.exports = { registerSchema, loginSchema };
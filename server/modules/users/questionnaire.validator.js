import { z } from 'zod';

// POST /onboarding/questionnaire — FR-3.1, FR-3.2, FR-3.7
export const questionnaireSchema = z
  .object({
    housingStatus: z.enum(['has_room', 'needs_room']),
    age: z.number().int().min(18, 'Must be at least 18').max(100),
    gender: z.enum(['male', 'female']),
    bio: z.string().max(500).optional(),
    budget: z
      .object({
        budgetMin: z.number().nonnegative(),
        budgetMax: z.number().nonnegative(),
      })
      .refine((b) => b.budgetMax >= b.budgetMin, {
        message: 'budgetMax must be greater than or equal to budgetMin',
        path: ['budgetMax'],
      }),
    location: z.object({
      coordinates: z.tuple([z.number(), z.number()]), // [lng, lat]
      displayName: z.string().optional(),
    }),
    maxDistance: z.number().positive(),
    lifestyle: z.object({
      cleanliness: z.number().int().min(1).max(5),
      sleepSchedule: z.enum(['early_bird', 'night_owl', 'flexible']),
      smokingOk: z.boolean(),
      petsOk: z.boolean(),
    }),
    teamUpEnabled: z.boolean().optional().default(false),
  })
  // FR-3.7: team-up is only meaningful for needs_room users
  .refine((data) => !(data.teamUpEnabled && data.housingStatus !== 'needs_room'), {
    message: 'teamUpEnabled can only be set when housingStatus is "needs_room"',
    path: ['teamUpEnabled'],
  });
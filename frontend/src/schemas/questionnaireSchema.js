import { z } from "zod";

// ---- Step 1: Basic info (housing status first — FR-3.2) ----
export const step1Schema = z.object({
  housingStatus: z.enum(["has_room", "needs_room"], {
    errorMap: () => ({ message: "Please select whether you have a room or need one" }),
  }),
  age: z.coerce
    .number({ invalid_type_error: "Age is required" })
    .int("Age must be a whole number")
    .min(18, "You must be at least 18")
    .max(200, "Please enter a valid age"),
  gender: z.enum(["woman", "man", "prefer_not_to_say"], {
    errorMap: () => ({ message: "Please select an option" }),
  }),
  bio: z
    .string()
    .min(20, "Tell us a bit more — at least 20 characters")
    .max(500, "Bio must be 500 characters or fewer"),
});

// ---- Step 2: Budget ----
export const budgetSchema = z
  .object({
    budgetMin: z.coerce.number().min(0, "Minimum budget can't be negative"),
    budgetMax: z.coerce.number().min(0, "Maximum budget can't be negative"),
  })
  .refine((data) => data.budgetMax >= data.budgetMin, {
    message: "Maximum budget must be greater than or equal to minimum",
    path: ["budgetMax"],
  });

// ---- Step 3: Location ----
export const locationSchema = z.object({
  preferredLocation: z.string().min(2, "Please enter a preferred location"),
  maxDistanceKm: z.coerce
    .number()
    .min(1, "Distance must be at least 1 km")
    .max(200, "Distance must be 200 km or less"),
});

// ---- Step 4: Lifestyle ----
export const lifestyleSchema = z.object({
  cleanliness: z.enum(["relaxed", "moderate", "very_clean"], {
    errorMap: () => ({ message: "Please select a cleanliness level" }),
  }),
  sleepSchedule: z.enum(["early_bird", "night_owl", "flexible"], {
    errorMap: () => ({ message: "Please select a sleep schedule" }),
  }),
  smoking: z.enum(["no", "yes", "outdoors_only"], {
    errorMap: () => ({ message: "Please select an option" }),
  }),
  pets: z.enum(["no_pets", "has_pets", "okay_with_pets"], {
    errorMap: () => ({ message: "Please select an option" }),
  }),
});

// ---- Step 5: Photo (optional) ----
export const photoSchema = z.object({
  photo: z
    .any()
    .optional()
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, "Photo must be smaller than 5MB")
    .refine(
      (file) => !file || ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Photo must be a JPEG, PNG, or WEBP file"
    ),
});

// ---- Step 6: Team up (FR-3.7) — only shown when housingStatus === 'needs_room' ----
export const teamUpSchema = z.object({
  teamUp: z.boolean().default(false),
});

// Full ordered list of step keys. "teamUp" is filtered out at runtime
// (see QuestionnaireContext) unless housingStatus === 'needs_room'.
export const STEP_ORDER = ["basicInfo", "budget", "location", "lifestyle", "teamUp", "photo"];

export const STEP_LABELS = {
  basicInfo: "Basic Info",
  budget: "Budget",
  location: "Location",
  lifestyle: "Lifestyle",
  teamUp: "Team Up",
  photo: "Photo",
};

// Full payload schema (for the final submit)
export const fullQuestionnaireSchema = z
  .object({
    ...step1Schema.shape,
    budgetMin: z.coerce.number().min(0),
    budgetMax: z.coerce.number().min(0),
    ...locationSchema.shape,
    ...lifestyleSchema.shape,
    ...photoSchema.shape,
    ...teamUpSchema.shape,
  })
  .refine((data) => data.budgetMax >= data.budgetMin, {
    message: "Maximum budget must be greater than or equal to minimum",
    path: ["budgetMax"],
  });
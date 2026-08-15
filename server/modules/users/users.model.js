import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    // ---- Auth ----
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String, // absent for Google-only accounts
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // allows many docs with no googleId
    },

    // ---- Policy acceptance (FR-1.8) ----
    privacyPolicyAccepted: {
      version: { type: String },
      acceptedAt: { type: Date },
    },

    // ---- Profile (populated by questionnaire, FR-3.1) ----
    name: { type: String, required: true, trim: true },
    age: Number,
    gender: { type: String, enum: ['male', 'female'] },
    bio: { type: String, maxlength: 500 },
    avatarUrl: String,

    // ---- Housing status & team-up (FR-3.2, FR-3.7) ----
    housingStatus: {
      type: String,
      enum: ['has_room', 'needs_room'],
    },
    teamUpEnabled: { type: Boolean, default: false },

    // ---- Location ----
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number], default: undefined }, // [lng, lat]
      displayName: String,
    },
    maxDistance: Number, // km, match radius

    // ---- Preferences / lifestyle ----
    preferences: {
      budgetMin: Number,
      budgetMax: Number,
      cleanliness: { type: Number, min: 1, max: 5 },
      sleepSchedule: {
        type: String,
        enum: ['early_bird', 'night_owl', 'flexible'],
      },
      smokingOk: Boolean,
      petsOk: Boolean,
    },

    // ---- Onboarding / questionnaire state ----
    questionnaireCompleted: { type: Boolean, default: false },
    questionnaireStep: { type: Number, default: 1 },
    profileCompletionPercent: { type: Number, default: 0 },
    onboardingCompletedAt: Date,

    // ---- Identity verification placeholders (module built Day 2 — FR-2.x) ----
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    idNumberHash: {
      type: String, // never store the raw ID number
      select: false,
      unique: true,
      sparse: true,
    },
    verificationRejectedReason: String,
    verifiedAt: Date,

    // ---- Moderation state ----
    suspended: { type: Boolean, default: false },
    suspendedReason: String,
    suspendedAt: Date,
    suspendedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },

    notificationPreferences: {
      newChatRequest: { type: Boolean, default: true },
      requestAccepted: { type: Boolean, default: true },
      newMessage: { type: Boolean, default: true },
      meetupUpdate: { type: Boolean, default: true },
      reportStatus: { type: Boolean, default: true },
    },

    // ---- Social ----
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true } // gives createdAt / updatedAt automatically
);

// ---- Compound & Special Indexes ----
userSchema.index({ location: '2dsphere' }, { sparse: true });
userSchema.index({ questionnaireCompleted: 1, verificationStatus: 1 });

export const User = mongoose.model('User', userSchema);
export default User;
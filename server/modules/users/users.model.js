import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    privacyPolicyAccepted: {
      version: { type: String },
      acceptedAt: { type: Date },
    },

    name: { type: String, required: true, trim: true },
    age: Number,
    gender: { type: String, enum: ['male', 'female'] },
    bio: { type: String, maxlength: 500 },
    avatarUrl: String,

    housingStatus: {
      type: String,
      enum: ['has_room', 'needs_room'],
    },
    teamUpEnabled: { type: Boolean, default: false },

    location: {
      type: { type: String, enum: ['Point']},
      coordinates: { type: [Number], default: undefined },
      displayName: String,
    },
    maxDistance: Number,

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

    questionnaireCompleted: { type: Boolean, default: false },
    questionnaireStep: { type: Number, default: 1 },
    profileCompletionPercent: { type: Number, default: 0 },
    onboardingCompletedAt: Date,

    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    idNumberHash: {
      type: String,
      select: false,
      unique: true,
      sparse: true,
    },
    verificationRejectedReason: String,
    verifiedAt: Date,

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

    blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });
userSchema.index({ location: '2dsphere' });
userSchema.index({ questionnaireCompleted: 1, verificationStatus: 1 });
userSchema.index({ idNumberHash: 1 }, { unique: true, sparse: true });

export default mongoose.model('User', userSchema);
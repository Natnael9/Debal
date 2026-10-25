import mongoose from 'mongoose';
const { Schema } = mongoose;

// Deliberately a separate collection from users (architecture doc §6.2) —
// a role flag on the user document would mean any bug in a user-facing
// update endpoint could theoretically grant admin access. Isolating it
// removes that entire class of risk.
const adminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['moderator', 'superadmin'], required: true },
    lastLoginAt: Date,
  },
  { timestamps: true }
);


export default mongoose.model('Admin', adminSchema);
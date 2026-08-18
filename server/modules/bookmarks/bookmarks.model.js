import mongoose from 'mongoose';
const { Schema } = mongoose;

// FR-6.1, FR-6.2 — a separate collection linking a user to a bookmarked
// candidate. The compound unique index is what the task explicitly asks
// for: the same user can't bookmark the same candidate twice.
const bookmarkSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookmarkedUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

bookmarkSchema.index({ userId: 1, bookmarkedUserId: 1 }, { unique: true });

export default mongoose.model('Bookmark', bookmarkSchema);
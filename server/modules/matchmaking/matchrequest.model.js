import mongoose from 'mongoose';

const { Schema } = mongoose;

const matchRequestSchema = new Schema(
  {
    fromUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    message: {
      type: String,
      maxlength: 300,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

matchRequestSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });

export const MatchRequest = mongoose.model('MatchRequest', matchRequestSchema);
export default MatchRequest;

import mongoose from 'mongoose';
const { Schema } = mongoose;

const adminActionSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
    action: {
      type: String,
      enum: [
        'approve_verification',
        'reject_verification',
        'view_verification',    // §13.3 — decrypted identity viewed by admin
        'list_verifications',  // §13.3 — admin queried the pending-review queue
      ],
      required: true,
    },
    metadata: { type: Object }, // optional contextual payload (e.g. status filter, page)
    targetUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },
  },
  { timestamps: true }
);

adminActionSchema.index({ adminId: 1, createdAt: -1 });

export default mongoose.model('AdminAction', adminActionSchema);
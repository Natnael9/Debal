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
        'view_verification',  
        'list_verifications',  
        'approve_photo',       
        'reject_photo',       
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
import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  reportedUserId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  reason: { 
    type: String, 
    required: true 
  },
  details: { 
    type: String 
  },
  status: { 
    type: String, 
    enum: ['open', 'resolved', 'dismissed'], 
    default: 'open' 
  },
  resolvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin' 
  },
  resolutionNotes: { 
    type: String 
  },
  resolvedAt: { 
    type: Date 
  }
}, { timestamps: true }); // This automatically handles createdAt and updatedAt

// Index for faster admin queries
reportSchema.index({ reportedUserId: 1, status: 1 });

export default mongoose.model('Report', reportSchema);
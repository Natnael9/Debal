import mongoose from 'mongoose';

const verificationRequestSchema = new mongoose.Schema(
  {
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },

    idNumberHash: { 
        type: String, 
        required: true 
    },

    identityEncrypted: {
      ciphertext: { 
        type: String 
    },

    iv: { 
        type: String 
    },

    authTag: { 
        type: String 
    },

    },
    otpHash: { 
        type: String 
    },
    otpExpiresAt: { 
        type: Date 
    },
    otpVerifiedAt: { 
        type: Date 
    },
    result: {
      type: String,
      enum: ['matched', 'no_match', 'pending_review'],
    },
    rejectionReason: { 
        type: String 
    },
    reviewedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Admin' 
    },
    reviewNotes: { 
        type: String 
    },
    submittedAt: { 
        type: Date, 
        default: Date.now 
    },
    resolvedAt: { 
        type: Date 
    },
  },
  { 
    timestamps: false 
}
);

verificationRequestSchema.index({ 
    userId: 1, 
    submittedAt: -1 
});

verificationRequestSchema.index({ 
    result: 1 
});

export const VerificationRequest = mongoose.model(
  'VerificationRequest',
  verificationRequestSchema
);
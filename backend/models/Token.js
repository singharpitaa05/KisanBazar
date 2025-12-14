// TOKEN MODEL

import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    refreshToken: {
      type: String,
      required: true
    },
    // Store device/browser info for security
    userAgent: {
      type: String,
      default: ''
    },
    ipAddress: {
      type: String,
      default: ''
    },
    expiresAt: {
      type: Date,
      required: true,
      // Automatically delete expired tokens
      index: { expires: 0 }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
tokenSchema.index({ userId: 1, isActive: 1 });
tokenSchema.index({ refreshToken: 1 });

// Method to check if token is expired
tokenSchema.methods.isExpired = function () {
  return this.expiresAt < new Date();
};

const Token = mongoose.model('Token', tokenSchema);

export default Token;
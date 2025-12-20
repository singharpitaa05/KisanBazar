import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    images: [
      {
        url: {
          type: String,
          required: true
        },
        publicId: {
          type: String,
          required: true
        }
      }
    ],
    helpful: {
      type: Number,
      default: 0
    },
    helpfulBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    verified: {
      type: Boolean,
      default: true // Verified purchase
    },
    response: {
      comment: String,
      respondedAt: Date,
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved'
    }
  },
  {
    timestamps: true
  }
);

// Compound index to prevent duplicate reviews
reviewSchema.index({ productId: 1, buyerId: 1, orderId: 1 }, { unique: true });

// Index for efficient queries
reviewSchema.index({ productId: 1, status: 1, createdAt: -1 });
reviewSchema.index({ buyerId: 1, createdAt: -1 });

// Virtual for buyer info
reviewSchema.virtual('buyer', {
  ref: 'User',
  localField: 'buyerId',
  foreignField: '_id',
  justOne: true
});

// Virtual for product info
reviewSchema.virtual('product', {
  ref: 'Product',
  localField: 'productId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtuals are included in JSON
reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
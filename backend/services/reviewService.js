// REVIEW SERVICE

import { deleteMultipleFromCloudinary, uploadMultipleToCloudinary } from '../config/cloudinary.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';

class ReviewService {
  // Create review
  async createReview(userId, reviewData, imageFiles) {
    const { productId, rating, title, comment, orderId } = reviewData;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      throw new Error('You have already reviewed this product');
    }

    // Upload review images if any
    let images = [];
    if (imageFiles && imageFiles.length > 0) {
      images = await uploadMultipleToCloudinary(imageFiles, 'reviews');
    }

    // Create review
    const review = await Review.create({
      productId,
      userId,
      orderId,
      rating,
      title,
      comment,
      images,
      isVerifiedPurchase: !!orderId
    });

    // Update product rating
    await this.updateProductRating(productId);

    return await review.populate([
      { path: 'userId', select: 'name profilePhoto' },
      { path: 'productId', select: 'name' }
    ]);
  }

  // Get reviews for a product
  async getProductReviews(productId, page = 1, limit = 10, sortBy = 'recent') {
    const query = { productId, status: 'approved' };

    let sort = { createdAt: -1 }; // Default: most recent
    if (sortBy === 'helpful') sort = { helpfulCount: -1 };
    if (sortBy === 'rating_high') sort = { rating: -1 };
    if (sortBy === 'rating_low') sort = { rating: 1 };

    const skip = (page - 1) * limit;

    const [reviews, total, summary] = await Promise.all([
      Review.find(query)
        .populate('userId', 'name profilePhoto')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Review.countDocuments(query),
      Review.getProductRatingSummary(productId)
    ]);

    return {
      reviews,
      summary,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    };
  }

  // Get user's reviews
  async getUserReviews(userId) {
    const reviews = await Review.find({ userId })
      .populate('productId', 'name images')
      .sort({ createdAt: -1 });

    return reviews;
  }

  // Update review
  async updateReview(reviewId, userId, updateData, newImageFiles) {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new Error('Review not found');
    }

    // Verify ownership
    if (review.userId.toString() !== userId.toString()) {
      throw new Error('You do not have permission to update this review');
    }

    // Handle image updates
    if (newImageFiles && newImageFiles.length > 0) {
      const newImages = await uploadMultipleToCloudinary(newImageFiles, 'reviews');
      
      if (updateData.replaceImages && review.images.length > 0) {
        const publicIds = review.images.map(img => img.publicId);
        await deleteMultipleFromCloudinary(publicIds);
        review.images = newImages;
      } else {
        review.images = [...review.images, ...newImages];
      }
    }

    // Update fields
    if (updateData.rating) review.rating = updateData.rating;
    if (updateData.title !== undefined) review.title = updateData.title;
    if (updateData.comment) review.comment = updateData.comment;

    await review.save();

    // Update product rating if rating changed
    if (updateData.rating) {
      await this.updateProductRating(review.productId);
    }

    return await review.populate([
      { path: 'userId', select: 'name profilePhoto' },
      { path: 'productId', select: 'name' }
    ]);
  }

  // Delete review
  async deleteReview(reviewId, userId) {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new Error('Review not found');
    }

    // Verify ownership
    if (review.userId.toString() !== userId.toString()) {
      throw new Error('You do not have permission to delete this review');
    }

    const productId = review.productId;

    // Delete review images
    if (review.images.length > 0) {
      const publicIds = review.images.map(img => img.publicId);
      await deleteMultipleFromCloudinary(publicIds);
    }

    await Review.findByIdAndDelete(reviewId);

    // Update product rating
    await this.updateProductRating(productId);

    return { message: 'Review deleted successfully' };
  }

  // Mark review as helpful
  async markHelpful(reviewId, userId) {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new Error('Review not found');
    }

    await review.markHelpful(userId);

    return review;
  }

  // Unmark review as helpful
  async unmarkHelpful(reviewId, userId) {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new Error('Review not found');
    }

    await review.unmarkHelpful(userId);

    return review;
  }

  // Update product rating (called after review changes)
  async updateProductRating(productId) {
    const summary = await Review.getProductRatingSummary(productId);

    await Product.findByIdAndUpdate(productId, {
      'rating.average': summary.averageRating,
      'rating.count': summary.totalReviews
    });
  }

  // Check if user can review product
  async canUserReview(userId, productId) {
    const existingReview = await Review.findOne({ userId, productId });
    return !existingReview;
  }
}

export default new ReviewService();
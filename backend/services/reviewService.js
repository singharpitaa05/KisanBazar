import mongoose from 'mongoose';
import { deleteFromCloudinary, uploadToCloudinary } from '../config/cloudinary.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';

class ReviewService {
  // Create a new review
  async createReview(buyerId, reviewData, files) {
    const { productId, orderId, rating, comment } = reviewData;

    // Verify order exists and belongs to buyer
    const order = await Order.findOne({
      _id: orderId,
      buyerId,
      orderStatus: 'delivered'
    });

    if (!order) {
      throw new Error('Order not found or not eligible for review');
    }

    // Verify product was in the order
    const productInOrder = order.items.find(
      item => item.productId.toString() === productId
    );

    if (!productInOrder) {
      throw new Error('Product not found in this order');
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      productId,
      buyerId,
      orderId
    });

    if (existingReview) {
      throw new Error('You have already reviewed this product');
    }

    // Upload images to Cloudinary
    let images = [];
    if (files && files.length > 0) {
      images = await Promise.all(
        files.map(async file => {
          const result = await uploadToCloudinary(file.buffer, 'reviews');
          return {
            url: result.secure_url,
            publicId: result.public_id
          };
        })
      );
    }

    // Create review
    const review = await Review.create({
      productId,
      buyerId,
      orderId,
      rating,
      comment,
      images,
      verified: true
    });

    // Update product rating
    await this.updateProductRating(productId);

    return await review.populate([
      { path: 'buyerId', select: 'name profileImage' },
      { path: 'productId', select: 'name images' }
    ]);
  }

  // Get reviews for a product
  async getProductReviews(productId, query = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
      rating
    } = query;

    const filter = {
      productId,
      status: 'approved'
    };

    if (rating) {
      filter.rating = parseInt(rating);
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('buyerId', 'name profileImage')
        .populate('response.respondedBy', 'name')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments(filter)
    ]);

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId), status: 'approved' } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    return {
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
        hasMore: skip + reviews.length < total
      },
      ratingDistribution: ratingDistribution.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {})
    };
  }

  // Get buyer's reviews
  async getBuyerReviews(buyerId, query = {}) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ buyerId })
        .populate('productId', 'name images')
        .populate('response.respondedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments({ buyerId })
    ]);

    return {
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalReviews: total
      }
    };
  }

  // Update review
  async updateReview(reviewId, buyerId, updateData, files) {
    const review = await Review.findOne({ _id: reviewId, buyerId });

    if (!review) {
      throw new Error('Review not found or unauthorized');
    }

    const { rating, comment } = updateData;

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    // Handle new images
    if (files && files.length > 0) {
      // Delete old images from Cloudinary
      if (review.images.length > 0) {
        await Promise.all(
          review.images.map(img => deleteFromCloudinary(img.publicId))
        );
      }

      // Upload new images
      const newImages = await Promise.all(
        files.map(async file => {
          const result = await uploadToCloudinary(file.buffer, 'reviews');
          return {
            url: result.secure_url,
            publicId: result.public_id
          };
        })
      );

      review.images = newImages;
    }

    await review.save();

    // Update product rating
    await this.updateProductRating(review.productId);

    return await review.populate([
      { path: 'buyerId', select: 'name profileImage' },
      { path: 'productId', select: 'name images' }
    ]);
  }

  // Delete review
  async deleteReview(reviewId, buyerId) {
    const review = await Review.findOne({ _id: reviewId, buyerId });

    if (!review) {
      throw new Error('Review not found or unauthorized');
    }

    const productId = review.productId;

    // Delete images from Cloudinary
    if (review.images.length > 0) {
      await Promise.all(
        review.images.map(img => deleteFromCloudinary(img.publicId))
      );
    }

    await review.deleteOne();

    // Update product rating
    await this.updateProductRating(productId);

    return { message: 'Review deleted successfully' };
  }

  // Farmer responds to review
  async respondToReview(reviewId, farmerId, responseComment) {
    const review = await Review.findById(reviewId).populate('productId');

    if (!review) {
      throw new Error('Review not found');
    }

    // Verify farmer owns the product
    if (review.productId.farmerId.toString() !== farmerId) {
      throw new Error('Unauthorized to respond to this review');
    }

    review.response = {
      comment: responseComment,
      respondedAt: new Date(),
      respondedBy: farmerId
    };

    await review.save();

    return await review.populate([
      { path: 'buyerId', select: 'name profileImage' },
      { path: 'response.respondedBy', select: 'name' }
    ]);
  }

  // Mark review as helpful
  async markHelpful(reviewId, userId) {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw new Error('Review not found');
    }

    const alreadyMarked = review.helpfulBy.includes(userId);

    if (alreadyMarked) {
      // Remove helpful mark
      review.helpfulBy = review.helpfulBy.filter(
        id => id.toString() !== userId
      );
      review.helpful -= 1;
    } else {
      // Add helpful mark
      review.helpfulBy.push(userId);
      review.helpful += 1;
    }

    await review.save();

    return {
      helpful: review.helpful,
      isMarkedHelpful: !alreadyMarked
    };
  }

  // Check if user can review a product
  async canReview(buyerId, productId) {
    // Find delivered orders with this product
    const orders = await Order.find({
      buyerId,
      orderStatus: 'delivered',
      'items.productId': productId
    });

    if (orders.length === 0) {
      return { canReview: false, reason: 'No delivered orders found' };
    }

    // Check if already reviewed for any order
    const existingReviews = await Review.find({
      buyerId,
      productId
    });

    const reviewedOrderIds = existingReviews.map(r => r.orderId.toString());
    const eligibleOrders = orders.filter(
      order => !reviewedOrderIds.includes(order._id.toString())
    );

    return {
      canReview: eligibleOrders.length > 0,
      eligibleOrders: eligibleOrders.map(o => ({
        orderId: o._id,
        orderNumber: o.orderNumber,
        deliveredAt: o.updatedAt
      }))
    };
  }

  // Update product rating (called after review changes)
  async updateProductRating(productId) {
    const reviews = await Review.find({
      productId,
      status: 'approved'
    });

    if (reviews.length === 0) {
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        reviewCount: 0
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      reviewCount: reviews.length
    });
  }

  // Get review statistics for a product
  async getReviewStats(productId) {
    const reviews = await Review.find({
      productId,
      status: 'approved'
    });

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        percentage: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;

    reviews.forEach(review => {
      distribution[review.rating]++;
      totalRating += review.rating;
    });

    const percentage = {};
    Object.keys(distribution).forEach(rating => {
      percentage[rating] = (distribution[rating] / reviews.length) * 100;
    });

    return {
      averageRating: Math.round((totalRating / reviews.length) * 10) / 10,
      totalReviews: reviews.length,
      distribution,
      percentage
    };
  }
}

export default new ReviewService();
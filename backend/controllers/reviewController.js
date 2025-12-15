// REVIEW CONTROLLERS

import { asyncHandler } from '../middleware/errorHandler.js';
import reviewService from '../services/reviewService.js';
import { HTTP_STATUS } from '../utils/constants.js';

class ReviewController {
  // Create review
  createReview = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const reviewData = req.body;
    const imageFiles = req.files;

    const review = await reviewService.createReview(userId, reviewData, imageFiles);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Review created successfully',
      data: { review }
    });
  });

  // Get product reviews
  getProductReviews = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'recent';

    const result = await reviewService.getProductReviews(productId, page, limit, sortBy);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result
    });
  });

  // Get user's reviews
  getUserReviews = asyncHandler(async (req, res) => {
    const userId = req.userId;

    const reviews = await reviewService.getUserReviews(userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { reviews }
    });
  });

  // Update review
  updateReview = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { id } = req.params;
    const updateData = req.body;
    const newImageFiles = req.files;

    const review = await reviewService.updateReview(id, userId, updateData, newImageFiles);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Review updated successfully',
      data: { review }
    });
  });

  // Delete review
  deleteReview = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { id } = req.params;

    const result = await reviewService.deleteReview(id, userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: result.message
    });
  });

  // Mark review as helpful
  markHelpful = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { id } = req.params;

    const review = await reviewService.markHelpful(id, userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Marked as helpful',
      data: { review }
    });
  });

  // Unmark review as helpful
  unmarkHelpful = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { id } = req.params;

    const review = await reviewService.unmarkHelpful(id, userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Unmarked as helpful',
      data: { review }
    });
  });

  // Check if user can review product
  canReview = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { productId } = req.params;

    const canReview = await reviewService.canUserReview(userId, productId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { canReview }
    });
  });
}

export default new ReviewController();
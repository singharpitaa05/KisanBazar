import reviewService from '../services/reviewService.js';

// Create a review
export const createReview = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const reviewData = req.body;
    const files = req.files;

    const review = await reviewService.createReview(buyerId, reviewData, files);

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const query = req.query;

    const result = await reviewService.getProductReviews(productId, query);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get buyer's reviews
export const getBuyerReviews = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const query = req.query;

    const result = await reviewService.getBuyerReviews(buyerId, query);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Alias for getBuyerReviews (used in routes as getUserReviews)
export const getUserReviews = getBuyerReviews;

// Update a review
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const buyerId = req.user.id;
    const updateData = req.body;
    const files = req.files;

    const review = await reviewService.updateReview(
      reviewId,
      buyerId,
      updateData,
      files
    );

    res.status(200).json({
      success: true,
      data: review,
      message: 'Review updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const buyerId = req.user.id;

    const result = await reviewService.deleteReview(reviewId, buyerId);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Farmer responds to review
export const respondToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const farmerId = req.user.id;
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Response comment is required'
      });
    }

    const review = await reviewService.respondToReview(
      reviewId,
      farmerId,
      comment
    );

    res.status(200).json({
      success: true,
      data: review,
      message: 'Response added successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Mark review as helpful
export const markHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const result = await reviewService.markHelpful(reviewId, userId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Unmark review as helpful
export const unmarkHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const result = await reviewService.unmarkHelpful(reviewId, userId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Check if user can review a product
export const canReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const buyerId = req.user.id;

    const result = await reviewService.canReview(buyerId, productId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get review statistics
export const getReviewStats = async (req, res) => {
  try {
    const { productId } = req.params;

    const stats = await reviewService.getReviewStats(productId);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  createReview,
  getProductReviews,
  getBuyerReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  respondToReview,
  markHelpful,
  unmarkHelpful,
  canReview,
  getReviewStats
};
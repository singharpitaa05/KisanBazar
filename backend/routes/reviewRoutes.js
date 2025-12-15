// REVIEW ROUTES

import express from 'express';
import { body, param } from 'express-validator';
import reviewController from '../controllers/reviewController.js';
import { authenticate, isBuyer } from '../middleware/auth.js';
import { handleUploadError, uploadMultiple } from '../middleware/upload.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Validation rules
const createReviewValidation = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .notEmpty()
    .withMessage('Review comment is required')
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),
  body('title')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters')
];

const updateReviewValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid review ID'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),
  body('title')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters')
];

const reviewIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid review ID')
];

const productIdValidation = [
  param('productId')
    .isMongoId()
    .withMessage('Invalid product ID')
];

// Public routes - Anyone can view reviews
router.get(
  '/product/:productId',
  productIdValidation,
  validate,
  reviewController.getProductReviews
);

// Protected routes - Require authentication
router.use(authenticate);

// Get user's reviews
router.get(
  '/my-reviews',
  reviewController.getUserReviews
);

// Check if user can review
router.get(
  '/can-review/:productId',
  productIdValidation,
  validate,
  reviewController.canReview
);

// Buyer-only routes
router.post(
  '/',
  isBuyer,
  uploadMultiple,
  handleUploadError,
  createReviewValidation,
  validate,
  reviewController.createReview
);

router.put(
  '/:id',
  isBuyer,
  reviewIdValidation,
  uploadMultiple,
  handleUploadError,
  updateReviewValidation,
  validate,
  reviewController.updateReview
);

router.delete(
  '/:id',
  isBuyer,
  reviewIdValidation,
  validate,
  reviewController.deleteReview
);

// Mark/Unmark helpful (any authenticated user)
router.post(
  '/:id/helpful',
  reviewIdValidation,
  validate,
  reviewController.markHelpful
);

router.delete(
  '/:id/helpful',
  reviewIdValidation,
  validate,
  reviewController.unmarkHelpful
);

export default router;
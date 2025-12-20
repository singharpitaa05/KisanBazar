import express from 'express';
import multer from 'multer';
import {
  canReview,
  createReview,
  deleteReview,
  getBuyerReviews,
  getProductReviews,
  getReviewStats,
  markHelpful,
  respondToReview,
  updateReview
} from '../controllers/reviewController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Public routes
router.get('/product/:productId', getProductReviews);
router.get('/product/:productId/stats', getReviewStats);

// Buyer routes - Protected
router.post(
  '/',
  authenticate,
  authorize('buyer'),
  upload.array('images', 5),
  createReview
);

router.get(
  '/my-reviews',
  authenticate,
  authorize('buyer'),
  getBuyerReviews
);

router.put(
  '/:reviewId',
  authenticate,
  authorize('buyer'),
  upload.array('images', 5),
  updateReview
);

router.delete(
  '/:reviewId',
  authenticate,
  authorize('buyer'),
  deleteReview
);

router.get(
  '/can-review/:productId',
  authenticate,
  authorize('buyer'),
  canReview
);

// Farmer routes - Protected
router.post(
  '/:reviewId/respond',
  authenticate,
  authorize('farmer'),
  respondToReview
);

// Both roles can mark helpful
router.post(
  '/:reviewId/helpful',
  authenticate,
  markHelpful
);

export default router;
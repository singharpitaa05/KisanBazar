// WISHLIST ROUTES

import express from 'express';
import { body, param } from 'express-validator';
import wishlistController from '../controllers/wishlistController.js';
import { authenticate, isBuyer } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// All wishlist routes require authentication and buyer role
router.use(authenticate);
router.use(isBuyer);

// Validation rules
const addToWishlistValidation = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID')
];

const productIdValidation = [
  param('productId')
    .isMongoId()
    .withMessage('Invalid product ID')
];

// Routes
router.get('/', wishlistController.getWishlist);

router.post(
  '/',
  addToWishlistValidation,
  validate,
  wishlistController.addToWishlist
);

router.delete(
  '/:productId',
  productIdValidation,
  validate,
  wishlistController.removeFromWishlist
);

router.get(
  '/check/:productId',
  productIdValidation,
  validate,
  wishlistController.checkWishlist
);

router.delete(
  '/',
  wishlistController.clearWishlist
);

export default router;
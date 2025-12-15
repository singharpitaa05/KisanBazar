// CART ROUTES

import express from 'express';
import { body, param } from 'express-validator';
import cartController from '../controllers/cartController.js';
import { authenticate, isBuyer } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// All cart routes require authentication and buyer role
router.use(authenticate);
router.use(isBuyer);

// Validation rules
const addToCartValidation = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1')
];

const updateCartValidation = [
  param('productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer')
];

const productIdValidation = [
  param('productId')
    .isMongoId()
    .withMessage('Invalid product ID')
];

// Routes
router.get('/', cartController.getCart);

router.post(
  '/',
  addToCartValidation,
  validate,
  cartController.addToCart
);

router.put(
  '/:productId',
  updateCartValidation,
  validate,
  cartController.updateCartItem
);

router.delete(
  '/:productId',
  productIdValidation,
  validate,
  cartController.removeFromCart
);

router.delete(
  '/',
  cartController.clearCart
);

router.get(
  '/validate',
  cartController.validateCart
);

export default router;
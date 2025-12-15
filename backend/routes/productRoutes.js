// PRODUCT ROUTES

import express from 'express';
import { body, param } from 'express-validator';
import productController from '../controllers/productController.js';
import { authenticate, isFarmer } from '../middleware/auth.js';
import { handleUploadError, uploadMultiple } from '../middleware/upload.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Validation rules
const createProductValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 100 })
    .withMessage('Product name cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['vegetables', 'fruits', 'grains', 'pulses', 'dairy', 'spices', 'organic', 'others'])
    .withMessage('Invalid category'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('unit')
    .notEmpty()
    .withMessage('Unit is required')
    .isIn(['kg', 'gram', 'liter', 'piece', 'dozen', 'quintal', 'ton'])
    .withMessage('Invalid unit'),
  body('quantity.available')
    .notEmpty()
    .withMessage('Available quantity is required')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer')
];

const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Product name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('category')
    .optional()
    .isIn(['vegetables', 'fruits', 'grains', 'pulses', 'dairy', 'spices', 'organic', 'others'])
    .withMessage('Invalid category'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('unit')
    .optional()
    .isIn(['kg', 'gram', 'liter', 'piece', 'dozen', 'quintal', 'ton'])
    .withMessage('Invalid unit')
];

const updateStockValidation = [
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('operation')
    .optional()
    .isIn(['set', 'add', 'subtract'])
    .withMessage('Operation must be set, add, or subtract')
];

const productIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID')
];

// Public routes - Anyone can view products
router.get(
  '/',
  productController.getAllProducts
);

router.get(
  '/:id',
  productIdValidation,
  validate,
  productController.getProduct
);

router.get(
  '/farmer/:farmerId',
  param('farmerId').isMongoId().withMessage('Invalid farmer ID'),
  validate,
  productController.getProductsByFarmer
);

// Protected routes - Require authentication
router.use(authenticate);

// Farmer-only routes
router.post(
  '/',
  isFarmer,
  uploadMultiple,
  handleUploadError,
  createProductValidation,
  validate,
  productController.createProduct
);

router.get(
  '/my/products',
  isFarmer,
  productController.getFarmerProducts
);

router.get(
  '/my/stats',
  isFarmer,
  productController.getFarmerStats
);

router.put(
  '/:id',
  isFarmer,
  productIdValidation,
  uploadMultiple,
  handleUploadError,
  updateProductValidation,
  validate,
  productController.updateProduct
);

router.delete(
  '/:id',
  isFarmer,
  productIdValidation,
  validate,
  productController.deleteProduct
);

router.patch(
  '/:id/stock',
  isFarmer,
  productIdValidation,
  updateStockValidation,
  validate,
  productController.updateStock
);

router.patch(
  '/:id/toggle-status',
  isFarmer,
  productIdValidation,
  validate,
  productController.toggleStatus
);

router.delete(
  '/:id/image',
  isFarmer,
  productIdValidation,
  body('publicId').notEmpty().withMessage('Image public ID is required'),
  validate,
  productController.deleteImage
);

export default router;
// ORDER ROUTES

import express from 'express';
import { body, param } from 'express-validator';
import orderController from '../controllers/orderController.js';
import { authenticate, isBuyer, isFarmer } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// AfterShip webhook (public route - no auth)
router.post(
  '/webhook/tracking',
  orderController.trackingWebhook
);

// All other routes require authentication
router.use(authenticate);

// Validation rules
const createOrderValidation = [
  body('deliveryAddress.name')
    .notEmpty()
    .withMessage('Delivery name is required'),
  body('deliveryAddress.phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9]{10}$/)
    .withMessage('Invalid phone number'),
  body('deliveryAddress.addressLine1')
    .notEmpty()
    .withMessage('Address is required'),
  body('deliveryAddress.city')
    .notEmpty()
    .withMessage('City is required'),
  body('deliveryAddress.state')
    .notEmpty()
    .withMessage('State is required'),
  body('deliveryAddress.pincode')
    .notEmpty()
    .withMessage('Pincode is required')
    .matches(/^[0-9]{6}$/)
    .withMessage('Invalid pincode'),
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['online', 'cod'])
    .withMessage('Invalid payment method')
];

const verifyPaymentValidation = [
  param('orderId')
    .isMongoId()
    .withMessage('Invalid order ID'),
  body('razorpay_order_id')
    .notEmpty()
    .withMessage('Razorpay order ID is required'),
  body('razorpay_payment_id')
    .notEmpty()
    .withMessage('Razorpay payment ID is required'),
  body('razorpay_signature')
    .notEmpty()
    .withMessage('Razorpay signature is required')
];

const updateStatusValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order ID'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid status')
];

const addTrackingValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order ID'),
  body('trackingNumber')
    .notEmpty()
    .withMessage('Tracking number is required')
    .isString()
    .withMessage('Tracking number must be a string'),
  body('courier')
    .optional()
    .isString()
    .withMessage('Courier must be a string'),
  body('carrierName')
    .optional()
    .isString()
    .withMessage('Carrier name must be a string')
];

const cancelOrderValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order ID'),
  body('reason')
    .notEmpty()
    .withMessage('Cancellation reason is required')
];

const orderIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order ID')
];

// Public routes (with auth)
router.get('/razorpay-key', orderController.getRazorpayKey);

// Buyer routes
router.post(
  '/',
  isBuyer,
  createOrderValidation,
  validate,
  orderController.createOrder
);

router.post(
  '/:orderId/verify-payment',
  isBuyer,
  verifyPaymentValidation,
  validate,
  orderController.verifyPayment
);

router.get(
  '/buyer/orders',
  isBuyer,
  orderController.getBuyerOrders
);

router.get(
  '/buyer/stats',
  isBuyer,
  orderController.getBuyerStats
);

// Farmer routes
router.get(
  '/farmer/orders',
  isFarmer,
  orderController.getFarmerOrders
);

router.get(
  '/farmer/stats',
  isFarmer,
  orderController.getFarmerStats
);

router.patch(
  '/:id/status',
  isFarmer,
  updateStatusValidation,
  validate,
  orderController.updateOrderStatus
);

// Add tracking (farmer only)
router.post(
  '/:id/tracking',
  isFarmer,
  addTrackingValidation,
  validate,
  orderController.addTracking
);

// Shared routes (buyer or farmer)
router.get(
  '/:id',
  orderIdValidation,
  validate,
  orderController.getOrder
);

// Get tracking (buyer or farmer)
router.get(
  '/:id/tracking',
  orderIdValidation,
  validate,
  orderController.getTracking
);

router.post(
  '/:id/cancel',
  cancelOrderValidation,
  validate,
  orderController.cancelOrder
);

export default router;
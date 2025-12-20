// CHAT ROUTES

import express from 'express';
import { body, param } from 'express-validator';
import chatController from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation rules
const createConversationValidation = [
  body('farmerId')
    .notEmpty()
    .withMessage('Farmer ID is required')
    .isMongoId()
    .withMessage('Invalid farmer ID'),
  body('productId')
    .optional()
    .isMongoId()
    .withMessage('Invalid product ID')
];

const sendMessageValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid conversation ID'),
  body('content')
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: 2000 })
    .withMessage('Message cannot exceed 2000 characters'),
  body('messageType')
    .optional()
    .isIn(['text', 'product_inquiry', 'order_update'])
    .withMessage('Invalid message type')
];

const conversationIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid conversation ID')
];

// Routes
router.get('/', chatController.getUserConversations);

router.post(
  '/',
  createConversationValidation,
  validate,
  chatController.getOrCreateConversation
);

router.get(
  '/unread-count',
  chatController.getUnreadCount
);

router.get(
  '/:id',
  conversationIdValidation,
  validate,
  chatController.getConversation
);

router.post(
  '/:id/messages',
  sendMessageValidation,
  validate,
  chatController.sendMessage
);

router.patch(
  '/:id/read',
  conversationIdValidation,
  validate,
  chatController.markAsRead
);

router.delete(
  '/:id',
  conversationIdValidation,
  validate,
  chatController.deleteConversation
);

export default router;
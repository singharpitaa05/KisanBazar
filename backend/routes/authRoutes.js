// AUTHENTICATION ROUTES

import dotenv from 'dotenv';
import express from 'express';
import { body } from 'express-validator';
import passport from 'passport';
import authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { customValidators, validate } from '../middleware/validation.js';

// Load environment variables
dotenv.config();

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .custom(customValidators.isStrongPassword),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .custom(customValidators.isValidPhone),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .custom(customValidators.isValidRole)
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .trim()
    .custom(customValidators.isValidPhone),
  body('language')
    .optional()
    .custom(customValidators.isValidLanguage),
  body('farmDetails.location.coordinates')
    .optional()
    .custom(customValidators.isValidCoordinates)
];

const roleValidation = [
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .custom(customValidators.isValidRole)
];

// Public routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/refresh-token', authController.refreshToken);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`,
    session: false 
  }),
  authController.googleCallback
);

// Protected routes (require authentication)
router.use(authenticate); // All routes below require authentication

router.get('/me', authController.getProfile);
router.get('/check', authController.checkAuth);
router.put('/profile', updateProfileValidation, validate, authController.updateProfile);
router.patch('/role', roleValidation, validate, authController.updateRole);
router.post('/logout', authController.logout);
router.post('/logout-all', authController.logoutAll);

export default router;
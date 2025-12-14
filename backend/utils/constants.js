// CONSTANTS UTILITIES

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();
// Token expiration times
export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: '15m', // 15 minutes
  REFRESH_TOKEN: '7d', // 7 days
  REFRESH_TOKEN_MS: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
};

// Cookie settings
export const COOKIE_OPTIONS = {
  httpOnly: true, // Prevents XSS attacks
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict', // CSRF protection
  maxAge: TOKEN_EXPIRY.REFRESH_TOKEN_MS
};

// User roles
export const USER_ROLES = {
  BUYER: 'buyer',
  FARMER: 'farmer'
};

// Verification status
export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// Order status
export const ORDER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  PROCESSING: 'processing',
  READY_FOR_PICKUP: 'ready_for_pickup',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

// Payment methods
export const PAYMENT_METHODS = {
  ONLINE: 'online',
  COD: 'cod'
};

// Payment status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// Supported languages
export const LANGUAGES = {
  EN: 'en', // English
  HI: 'hi', // Hindi
  PA: 'pa', // Punjabi
  BN: 'bn', // Bengali
  TE: 'te', // Telugu
  MR: 'mr', // Marathi
  TA: 'ta', // Tamil
  GU: 'gu'  // Gujarati
};

// Product categories
export const PRODUCT_CATEGORIES = {
  VEGETABLES: 'vegetables',
  FRUITS: 'fruits',
  GRAINS: 'grains',
  PULSES: 'pulses',
  DAIRY: 'dairy',
  SPICES: 'spices',
  ORGANIC: 'organic',
  OTHERS: 'others'
};

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

// Error messages
export const ERROR_MESSAGES = {
  // Auth errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User already exists with this email',
  UNAUTHORIZED: 'Unauthorized access',
  TOKEN_EXPIRED: 'Token has expired',
  INVALID_TOKEN: 'Invalid token',
  
  // Validation errors
  VALIDATION_ERROR: 'Validation error',
  REQUIRED_FIELDS_MISSING: 'Required fields are missing',
  
  // Server errors
  SERVER_ERROR: 'Internal server error',
  DATABASE_ERROR: 'Database operation failed'
};

// Success messages
export const SUCCESS_MESSAGES = {
  USER_REGISTERED: 'User registered successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_UPDATED: 'Password updated successfully'
};
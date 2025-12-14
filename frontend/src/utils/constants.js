// CONSTANT UTILITIES

// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// User roles
export const USER_ROLES = {
  BUYER: 'buyer',
  FARMER: 'farmer'
};

// Auth endpoints
export const AUTH_ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  LOGOUT_ALL: '/auth/logout-all',
  REFRESH_TOKEN: '/auth/refresh-token',
  GET_PROFILE: '/auth/me',
  UPDATE_PROFILE: '/auth/profile',
  UPDATE_ROLE: '/auth/role',
  CHECK_AUTH: '/auth/check',
  GOOGLE_AUTH: '/auth/google'
};

// Supported languages
export const LANGUAGES = {
  EN: { code: 'en', name: 'English', native: 'English' },
  HI: { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  PA: { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  BN: { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  TE: { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  MR: { code: 'mr', name: 'Marathi', native: 'मराठी' },
  TA: { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  GU: { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' }
};

// Local storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'kisan_access_token',
  USER: 'kisan_user',
  LANGUAGE: 'kisan_language'
};

// Toast durations
export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  INFO: 3000
};

// Product categories
export const PRODUCT_CATEGORIES = [
  'vegetables',
  'fruits',
  'grains',
  'pulses',
  'dairy',
  'spices',
  'organic',
  'others'
];

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

// Validation patterns
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9]{10}$/,
  PASSWORD: /^.{6,}$/
};
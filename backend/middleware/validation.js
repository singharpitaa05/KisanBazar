// VALIDATION MIDDLEWARE

import { validationResult } from 'express-validator';
import { ERROR_MESSAGES, HTTP_STATUS } from '../utils/constants.js';

// Validation result handler
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      errors: extractedErrors
    });
  }

  next();
};

// Custom validators
export const customValidators = {
  // Validate phone number (10 digits)
  isValidPhone: (value) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(value)) {
      throw new Error('Phone number must be 10 digits');
    }
    return true;
  },

  // Validate role
  isValidRole: (value) => {
    const validRoles = ['buyer', 'farmer'];
    if (!validRoles.includes(value)) {
      throw new Error('Role must be either buyer or farmer');
    }
    return true;
  },

  // Validate password strength
  isStrongPassword: (value) => {
    if (value.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    return true;
  },

  // Validate coordinates
  isValidCoordinates: (value) => {
    if (!Array.isArray(value) || value.length !== 2) {
      throw new Error('Coordinates must be an array of [longitude, latitude]');
    }
    const [lng, lat] = value;
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      throw new Error('Invalid coordinates range');
    }
    return true;
  },

  // Validate language code
  isValidLanguage: (value) => {
    const validLanguages = ['en', 'hi', 'pa', 'bn', 'te', 'mr', 'ta', 'gu'];
    if (!validLanguages.includes(value)) {
      throw new Error('Invalid language code');
    }
    return true;
  }
};
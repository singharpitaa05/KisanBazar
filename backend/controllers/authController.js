// AUTHENTICATION CONTROLLER

import dotenv from 'dotenv';
import { asyncHandler } from '../middleware/errorHandler.js';
import authService from '../services/authService.js';
import { COOKIE_OPTIONS, HTTP_STATUS } from '../utils/constants.js';

// Load environment variables from .env file
dotenv.config();

class AuthController {
  // Register new user
  register = asyncHandler(async (req, res) => {
    const { name, email, password, phone, role } = req.body;

    const result = await authService.register({
      name,
      email,
      password,
      phone,
      role
    });

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: result.message,
      data: {
        user: result.user,
        accessToken: result.accessToken
      }
    });
  });

  // Login with email and password
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: result.message,
      data: {
        user: result.user,
        accessToken: result.accessToken
      }
    });
  });

  // Google OAuth - Initiate
  googleAuth = (req, res, next) => {
    // Passport handles the redirect to Google
  };

  // Google OAuth - Callback
  googleCallback = asyncHandler(async (req, res) => {
    // User data is available in req.user (set by passport)
    const { user, accessToken, refreshToken } = req.user;

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    // Redirect to frontend with token
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/google/success?token=${accessToken}`;
    res.redirect(redirectUrl);
  });

  // Refresh access token
  refreshToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Refresh token not provided'
      });
    }

    const result = await authService.refreshAccessToken(refreshToken);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user
      }
    });
  });

  // Logout
  logout = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken', COOKIE_OPTIONS);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Logged out successfully'
    });
  });

  // Logout from all devices
  logoutAll = asyncHandler(async (req, res) => {
    await authService.logoutAll(req.userId);

    // Clear refresh token cookie
    res.clearCookie('refreshToken', COOKIE_OPTIONS);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Logged out from all devices successfully'
    });
  });

  // Get current user profile
  getProfile = asyncHandler(async (req, res) => {
    const user = await authService.getProfile(req.userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { user }
    });
  });

  // Update user profile
  updateProfile = asyncHandler(async (req, res) => {
    const updateData = req.body;

    const result = await authService.updateProfile(req.userId, updateData);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: result.message,
      data: {
        user: result.user
      }
    });
  });

  // Update user role (for Google OAuth users)
  updateRole = asyncHandler(async (req, res) => {
    const { role } = req.body;

    const result = await authService.updateRole(req.userId, role);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: result.message,
      data: {
        user: result.user
      }
    });
  });

  // Check authentication status
  checkAuth = asyncHandler(async (req, res) => {
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        isAuthenticated: true,
        user: req.user
      }
    });
  });
}

export default new AuthController();
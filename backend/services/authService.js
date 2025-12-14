// AUTHENTICATION SERVICE

import User from '../models/User.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants.js';
import tokenService from './tokenService.js';

class AuthService {
  // Register new user
  async register(userData) {
    const { email, password, name, phone, role } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error(ERROR_MESSAGES.USER_ALREADY_EXISTS);
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role
    });

    // Generate tokens
    const { accessToken, refreshToken } = tokenService.generateTokens(
      user._id,
      user.role
    );

    // Save refresh token
    await tokenService.saveRefreshToken(user._id, refreshToken);

    return {
      user: user.getPublicProfile(),
      accessToken,
      refreshToken,
      message: SUCCESS_MESSAGES.USER_REGISTERED
    };
  }

  // Login with email and password
  async login(email, password) {
    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated. Please contact support.');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Generate tokens
    const { accessToken, refreshToken } = tokenService.generateTokens(
      user._id,
      user.role
    );

    // Save refresh token
    await tokenService.saveRefreshToken(user._id, refreshToken);

    return {
      user: user.getPublicProfile(),
      accessToken,
      refreshToken,
      message: SUCCESS_MESSAGES.LOGIN_SUCCESS
    };
  }

  // Google OAuth login/register
  async googleAuth(profile) {
    const { id: googleId, emails, displayName, photos } = profile;
    const email = emails[0].value;
    const profilePhoto = photos && photos[0] ? photos[0].value : '';

    // Check if user exists with this Google ID
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if user exists with this email
      user = await User.findOne({ email });

      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
        if (!user.profilePhoto) {
          user.profilePhoto = profilePhoto;
        }
        await user.save();
      } else {
        // Create new user - role will be set later
        user = await User.create({
          name: displayName,
          email,
          googleId,
          profilePhoto,
          // Temporary role - will be updated after user selects
          role: 'buyer',
          // No password for Google OAuth users
          phone: '0000000000', // Placeholder, will be updated in profile
          isVerified: true // Email verified by Google
        });
      }
    }

    // Generate tokens
    const { accessToken, refreshToken } = tokenService.generateTokens(
      user._id,
      user.role
    );

    // Save refresh token
    await tokenService.saveRefreshToken(user._id, refreshToken);

    return {
      user: user.getPublicProfile(),
      accessToken,
      refreshToken,
      message: SUCCESS_MESSAGES.LOGIN_SUCCESS
    };
  }

  // Refresh access token
  async refreshAccessToken(refreshToken) {
    // Verify refresh token
    const decoded = tokenService.verifyRefreshToken(refreshToken);

    // Check if token exists in database
    await tokenService.findRefreshToken(refreshToken);

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Generate new access token
    const accessToken = tokenService.generateAccessToken(user._id, user.role);

    return {
      accessToken,
      user: user.getPublicProfile()
    };
  }

  // Logout
  async logout(refreshToken) {
    await tokenService.removeRefreshToken(refreshToken);
    return {
      message: SUCCESS_MESSAGES.LOGOUT_SUCCESS
    };
  }

  // Logout from all devices
  async logoutAll(userId) {
    await tokenService.removeAllUserTokens(userId);
    return {
      message: 'Logged out from all devices successfully'
    };
  }

  // Get user profile
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return user.getPublicProfile();
  }

  // Update user profile
  async updateProfile(userId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'phone', 'profilePhoto', 'language', 'addresses', 'farmDetails'];
    
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        user[key] = updateData[key];
      }
    });

    await user.save();

    return {
      user: user.getPublicProfile(),
      message: SUCCESS_MESSAGES.PROFILE_UPDATED
    };
  }

  // Update role (for Google OAuth users who haven't selected role yet)
  async updateRole(userId, role) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    user.role = role;
    await user.save();

    return {
      user: user.getPublicProfile(),
      message: 'Role updated successfully'
    };
  }
}

export default new AuthService();
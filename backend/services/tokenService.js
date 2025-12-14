// TOKEN SERVCE

import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import Token from '../models/Token.js';
import { TOKEN_EXPIRY } from '../utils/constants.js';

// Load environment variables from .env file
dotenv.config();

class TokenService {
  // Generate access token
  generateAccessToken(userId, role) {
    return jwt.sign(
      { userId, role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: TOKEN_EXPIRY.ACCESS_TOKEN }
    );
  }

  // Generate refresh token
  generateRefreshToken(userId, role) {
    return jwt.sign(
      { userId, role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: TOKEN_EXPIRY.REFRESH_TOKEN }
    );
  }

  // Generate both tokens
  generateTokens(userId, role) {
    const accessToken = this.generateAccessToken(userId, role);
    const refreshToken = this.generateRefreshToken(userId, role);
    return { accessToken, refreshToken };
  }

  // Save refresh token to database
  async saveRefreshToken(userId, refreshToken, userAgent = '', ipAddress = '') {
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY.REFRESH_TOKEN_MS);
    
    const token = await Token.create({
      userId,
      refreshToken,
      userAgent,
      ipAddress,
      expiresAt
    });

    return token;
  }

  // Verify access token
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  // Verify refresh token
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  // Find refresh token in database
  async findRefreshToken(refreshToken) {
    const token = await Token.findOne({
      refreshToken,
      isActive: true
    });

    if (!token) {
      throw new Error('Refresh token not found');
    }

    if (token.isExpired()) {
      throw new Error('Refresh token has expired');
    }

    return token;
  }

  // Remove refresh token (logout)
  async removeRefreshToken(refreshToken) {
    const result = await Token.findOneAndUpdate(
      { refreshToken },
      { isActive: false },
      { new: true }
    );

    return result;
  }

  // Remove all user tokens (logout from all devices)
  async removeAllUserTokens(userId) {
    const result = await Token.updateMany(
      { userId, isActive: true },
      { isActive: false }
    );

    return result;
  }

  // Clean up expired tokens (can be run as a cron job)
  async cleanupExpiredTokens() {
    const result = await Token.deleteMany({
      expiresAt: { $lt: new Date() }
    });

    return result;
  }
}

export default new TokenService();
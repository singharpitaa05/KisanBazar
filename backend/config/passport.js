// PASSPORT CONFIGURATION FILE

import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import authService from '../services/authService.js';

// Load environment variables from .env file
dotenv.config();

// Configure Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Use auth service to handle Google authentication
        const result = await authService.googleAuth(profile);
        return done(null, result);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport;
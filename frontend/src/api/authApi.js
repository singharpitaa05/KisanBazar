// AUTHNENTICATION APPLICATION 

import { AUTH_ENDPOINTS } from '../utils/constants.js';
import axiosInstance from './axios.js';

class AuthAPI {
  // Register new user
  async register(userData) {
    const response = await axiosInstance.post(AUTH_ENDPOINTS.REGISTER, userData);
    return response.data;
  }

  // Login with email and password
  async login(credentials) {
    const response = await axiosInstance.post(AUTH_ENDPOINTS.LOGIN, credentials);
    return response.data;
  }

  // Google OAuth login
  googleLogin() {
    const url = `${axiosInstance.defaults.baseURL}${AUTH_ENDPOINTS.GOOGLE_AUTH}`;
    console.log('Redirecting to Google OAuth:', url);
    window.location.href = url;
  }

  // Refresh access token
  async refreshToken() {
    const response = await axiosInstance.post(AUTH_ENDPOINTS.REFRESH_TOKEN);
    return response.data;
  }

  // Get current user profile
  async getProfile() {
    const response = await axiosInstance.get(AUTH_ENDPOINTS.GET_PROFILE);
    return response.data;
  }

  // Update user profile
  async updateProfile(updateData) {
    const response = await axiosInstance.put(AUTH_ENDPOINTS.UPDATE_PROFILE, updateData);
    return response.data;
  }

  // Update user role (for Google OAuth users)
  async updateRole(role) {
    const response = await axiosInstance.patch(AUTH_ENDPOINTS.UPDATE_ROLE, { role });
    return response.data;
  }

  // Check authentication status
  async checkAuth() {
    const response = await axiosInstance.get(AUTH_ENDPOINTS.CHECK_AUTH);
    return response.data;
  }

  // Logout
  async logout() {
    const response = await axiosInstance.post(AUTH_ENDPOINTS.LOGOUT);
    return response.data;
  }

  // Logout from all devices
  async logoutAll() {
    const response = await axiosInstance.post(AUTH_ENDPOINTS.LOGOUT_ALL);
    return response.data;
  }
}

export default new AuthAPI();
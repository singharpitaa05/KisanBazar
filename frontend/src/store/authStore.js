// AUTHENTICATION STORE

import { create } from 'zustand';
import authApi from '../api/authApi.js';
import { STORAGE_KEYS } from '../utils/constants.js';

const useAuthStore = create((set, get) => ({
  // State
  user: JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)) || null,
  isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
  isLoading: false,
  error: null,

  // Actions
  
  // Register user
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(userData);
      const { user, accessToken } = response.data;
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(credentials);
      const { user, accessToken } = response.data;
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Google OAuth login
  googleLogin: () => {
    authApi.googleLogin();
  },

  // Handle Google OAuth callback
  handleGoogleCallback: async (token) => {
    set({ isLoading: true, error: null });
    try {
      // Save token
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      
      // Fetch user profile
      const response = await authApi.getProfile();
      const { user } = response.data;
      
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Google authentication failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Get user profile
  getProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.getProfile();
      const { user } = response.data;
      
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch profile';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (updateData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.updateProfile(updateData);
      const { user } = response.data;
      
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      
      set({ 
        user, 
        isLoading: false 
      });
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Update user role
  updateRole: async (role) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.updateRole(role);
      const { user } = response.data;
      
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      
      set({ 
        user, 
        isLoading: false 
      });
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update role';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Check authentication
  checkAuth: async () => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return false;
    }
    
    try {
      const response = await authApi.checkAuth();
      const { user } = response.data;
      
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      
      set({ 
        user, 
        isAuthenticated: true 
      });
      
      return true;
    } catch (error) {
      // Token invalid or expired
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      set({ isAuthenticated: false, user: null });
      return false;
    }
  },

  // Logout
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await authApi.logout();
      
      // Clear localStorage
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    } catch (error) {
      // Even if API call fails, clear local state
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    }
  },

  // Logout from all devices
  logoutAll: async () => {
    set({ isLoading: true, error: null });
    try {
      await authApi.logoutAll();
      
      // Clear localStorage
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    } catch (error) {
      // Even if API call fails, clear local state
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Get user role
  getUserRole: () => get().user?.role || null,

  // Check if user is farmer
  isFarmer: () => get().user?.role === 'farmer',

  // Check if user is buyer
  isBuyer: () => get().user?.role === 'buyer'
}));

export default useAuthStore;
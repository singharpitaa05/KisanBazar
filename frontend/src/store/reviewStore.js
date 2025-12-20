// REVIEW STORE

import { create } from 'zustand';
import * as reviewApi from '../api/reviewApi.js';

const useReviewStore = create((set, get) => ({
  // State
  reviews: [],
  reviewStats: null,
  myReviews: [],
  currentReview: null,
  pagination: null,
  ratingDistribution: {},
  isLoading: false,
  error: null,

  // Create a review
  createReview: async (reviewData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reviewApi.createReview(reviewData);
      
      // Add new review to the list
      set(state => ({
        reviews: [response.data, ...state.reviews],
        isLoading: false
      }));

      return response;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to create review',
        isLoading: false 
      });
      throw error;
    }
  },

  // Get reviews for a product
  getProductReviews: async (productId, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reviewApi.getProductReviews(productId, params);
      
      set({
        reviews: response.data.reviews,
        pagination: response.data.pagination,
        ratingDistribution: response.data.ratingDistribution,
        isLoading: false
      });

      return response;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch reviews',
        isLoading: false 
      });
      throw error;
    }
  },

  // Get review statistics
  getReviewStats: async (productId) => {
    try {
      const response = await reviewApi.getReviewStats(productId);
      
      set({ reviewStats: response.data });
      return response;
    } catch (error) {
      console.error('Failed to fetch review stats:', error);
      throw error;
    }
  },

  // Get buyer's reviews
  getMyReviews: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reviewApi.getBuyerReviews(params);
      
      set({
        myReviews: response.data.reviews,
        pagination: response.data.pagination,
        isLoading: false
      });

      return response;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch reviews',
        isLoading: false 
      });
      throw error;
    }
  },

  // Update a review
  updateReview: async (reviewId, reviewData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reviewApi.updateReview(reviewId, reviewData);
      
      // Update in reviews list
      set(state => ({
        reviews: state.reviews.map(review => 
          review._id === reviewId ? response.data : review
        ),
        myReviews: state.myReviews.map(review => 
          review._id === reviewId ? response.data : review
        ),
        isLoading: false
      }));

      return response;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to update review',
        isLoading: false 
      });
      throw error;
    }
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reviewApi.deleteReview(reviewId);
      
      // Remove from lists
      set(state => ({
        reviews: state.reviews.filter(review => review._id !== reviewId),
        myReviews: state.myReviews.filter(review => review._id !== reviewId),
        isLoading: false
      }));

      return response;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete review',
        isLoading: false 
      });
      throw error;
    }
  },

  // Respond to review (Farmer)
  respondToReview: async (reviewId, comment) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reviewApi.respondToReview(reviewId, comment);
      
      // Update review with response
      set(state => ({
        reviews: state.reviews.map(review => 
          review._id === reviewId ? response.data : review
        ),
        isLoading: false
      }));

      return response;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to respond to review',
        isLoading: false 
      });
      throw error;
    }
  },

  // Mark review as helpful
  markHelpful: async (reviewId) => {
    try {
      const response = await reviewApi.markHelpful(reviewId);
      
      // Update helpful count
      set(state => ({
        reviews: state.reviews.map(review => 
          review._id === reviewId 
            ? { 
                ...review, 
                helpful: response.data.helpful,
                isMarkedHelpful: response.data.isMarkedHelpful
              }
            : review
        )
      }));

      return response;
    } catch (error) {
      console.error('Failed to mark helpful:', error);
      throw error;
    }
  },

  // Check if user can review
  canReview: async (productId) => {
    try {
      const response = await reviewApi.canReview(productId);
      return response.data;
    } catch (error) {
      console.error('Failed to check review eligibility:', error);
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Clear reviews
  clearReviews: () => set({ 
    reviews: [], 
    reviewStats: null,
    pagination: null,
    ratingDistribution: {} 
  })
}));

export default useReviewStore;
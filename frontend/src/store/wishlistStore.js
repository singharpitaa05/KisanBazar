// WISHLIST STORE

import { create } from 'zustand';
import wishlistApi from '../api/wishlistApi.js';

const useWishlistStore = create((set, get) => ({
  // State
  wishlist: null,
  isLoading: false,
  error: null,

  // Actions

  // Get wishlist
  getWishlist: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await wishlistApi.getWishlist();
      const { wishlist } = response.data;

      set({
        wishlist,
        isLoading: false
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch wishlist';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Add to wishlist
  addToWishlist: async (productId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await wishlistApi.addToWishlist(productId);
      const { wishlist } = response.data;

      set({
        wishlist,
        isLoading: false
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add to wishlist';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Remove from wishlist
  removeFromWishlist: async (productId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await wishlistApi.removeFromWishlist(productId);
      const { wishlist } = response.data;

      set({
        wishlist,
        isLoading: false
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to remove from wishlist';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Check if product is in wishlist
  isInWishlist: (productId) => {
    const wishlist = get().wishlist;
    if (!wishlist || !wishlist.products) return false;
    
    return wishlist.products.some(
      item => item.productId?._id === productId
    );
  },

  // Toggle wishlist
  toggleWishlist: async (productId) => {
    const isInWishlist = get().isInWishlist(productId);
    
    if (isInWishlist) {
      return await get().removeFromWishlist(productId);
    } else {
      return await get().addToWishlist(productId);
    }
  },

  // Clear wishlist
  clearWishlist: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await wishlistApi.clearWishlist();
      const { wishlist } = response.data;

      set({
        wishlist,
        isLoading: false
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to clear wishlist';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Get wishlist count
  getWishlistCount: () => {
    const wishlist = get().wishlist;
    return wishlist?.products?.length || 0;
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Clear wishlist state (on logout)
  clearWishlistState: () => set({ wishlist: null, error: null })
}));

export default useWishlistStore;
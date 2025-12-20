// CART STORE

import { create } from 'zustand';
import cartApi from '../api/cartApi.js';

const useCartStore = create((set, get) => ({
  // State
  cart: null,
  isLoading: false,
  error: null,

  // Actions

  // Get cart
  getCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartApi.getCart();
      const { cart } = response.data;

      set({
        cart,
        isLoading: false
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch cart';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Add to cart
  addToCart: async (productId, quantity) => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartApi.addToCart(productId, quantity);
      const { cart } = response.data;

      set({
        cart,
        isLoading: false
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add to cart';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Update cart item
  updateCartItem: async (productId, quantity) => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartApi.updateCartItem(productId, quantity);
      const { cart } = response.data;

      set({
        cart,
        isLoading: false
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update cart';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Remove from cart
  removeFromCart: async (productId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartApi.removeFromCart(productId);
      const { cart } = response.data;

      set({
        cart,
        isLoading: false
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to remove from cart';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Clear cart
  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartApi.clearCart();
      const { cart } = response.data;

      set({
        cart,
        isLoading: false
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to clear cart';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Validate cart
  validateCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartApi.validateCart();

      set({ isLoading: false });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to validate cart';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Get cart item count
  getCartItemCount: () => {
    const cart = get().cart;
    return cart?.totalItems || 0;
  },

  // Get cart total price
  getCartTotalPrice: () => {
    const cart = get().cart;
    return cart?.totalPrice || 0;
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Clear cart state (on logout)
  clearCartState: () => set({ cart: null, error: null })
}));

export default useCartStore;
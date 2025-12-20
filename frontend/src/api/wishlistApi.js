// WISHLIST APPLICATION

import axiosInstance from './axios.js';

class WishlistAPI {
  // Get user's wishlist
  async getWishlist() {
    const response = await axiosInstance.get('/wishlist');
    return response.data;
  }

  // Add product to wishlist
  async addToWishlist(productId) {
    const response = await axiosInstance.post('/wishlist', {
      productId
    });
    return response.data;
  }

  // Remove product from wishlist
  async removeFromWishlist(productId) {
    const response = await axiosInstance.delete(`/wishlist/${productId}`);
    return response.data;
  }

  // Check if product is in wishlist
  async checkWishlist(productId) {
    const response = await axiosInstance.get(`/wishlist/check/${productId}`);
    return response.data;
  }

  // Clear wishlist
  async clearWishlist() {
    const response = await axiosInstance.delete('/wishlist');
    return response.data;
  }
}

export default new WishlistAPI();
// CART APPLICATION

import axiosInstance from './axios.js';

class CartAPI {
  // Get user's cart
  async getCart() {
    const response = await axiosInstance.get('/cart');
    return response.data;
  }

  // Add item to cart
  async addToCart(productId, quantity) {
    const response = await axiosInstance.post('/cart', {
      productId,
      quantity
    });
    return response.data;
  }

  // Update cart item quantity
  async updateCartItem(productId, quantity) {
    const response = await axiosInstance.put(`/cart/${productId}`, {
      quantity
    });
    return response.data;
  }

  // Remove item from cart
  async removeFromCart(productId) {
    const response = await axiosInstance.delete(`/cart/${productId}`);
    return response.data;
  }

  // Clear cart
  async clearCart() {
    const response = await axiosInstance.delete('/cart');
    return response.data;
  }

  // Validate cart
  async validateCart() {
    const response = await axiosInstance.get('/cart/validate');
    return response.data;
  }
}

export default new CartAPI();
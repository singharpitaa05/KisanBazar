// ORDER APPLICATION

import axiosInstance from './axios.js';

class OrderAPI {
  // Get Razorpay key
  async getRazorpayKey() {
    const response = await axiosInstance.get('/orders/razorpay-key');
    return response.data;
  }

  // Create order
  async createOrder(orderData) {
    const response = await axiosInstance.post('/orders', orderData);
    return response.data;
  }

  // Verify payment
  async verifyPayment(orderId, paymentData) {
    const response = await axiosInstance.post(`/orders/${orderId}/verify-payment`, paymentData);
    return response.data;
  }

  // Get order by ID
  async getOrderById(orderId) {
    const response = await axiosInstance.get(`/orders/${orderId}`);
    return response.data;
  }

  // Get buyer orders
  async getBuyerOrders(status) {
    const response = await axiosInstance.get('/orders/buyer/orders', {
      params: { status }
    });
    return response.data;
  }

  // Get farmer orders
  async getFarmerOrders(status) {
    const response = await axiosInstance.get('/orders/farmer/orders', {
      params: { status }
    });
    return response.data;
  }

  // Update order status (farmer)
  async updateOrderStatus(orderId, status, note = '') {
    const response = await axiosInstance.patch(`/orders/${orderId}/status`, {
      status,
      note
    });
    return response.data;
  }

  // Cancel order
  async cancelOrder(orderId, reason) {
    const response = await axiosInstance.post(`/orders/${orderId}/cancel`, {
      reason
    });
    return response.data;
  }

  // Get buyer statistics
  async getBuyerStats() {
    const response = await axiosInstance.get('/orders/buyer/stats');
    return response.data;
  }

  // Get farmer statistics
  async getFarmerStats() {
    const response = await axiosInstance.get('/orders/farmer/stats');
    return response.data;
  }
}

export default new OrderAPI();
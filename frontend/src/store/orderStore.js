// ORDER STORE

import { create } from 'zustand';
import orderApi from '../api/orderApi.js';
import * as trackingApi from '../api/trackingApi.js';

const useOrderStore = create((set, get) => ({
  // State
  orders: [],
  currentOrder: null,
  orderStats: null,
  razorpayKey: null,
  tracking: null,
  isLoading: false,
  error: null,

  // Actions

  // Get Razorpay key
  getRazorpayKey: async () => {
    try {
      const response = await orderApi.getRazorpayKey();
      const { key } = response.data;

      set({ razorpayKey: key });

      return key;
    } catch (error) {
      console.error('Failed to get Razorpay key:', error);
      return null;
    }
  },

  // Create order
  createOrder: async (orderData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderApi.createOrder(orderData);

      set({ isLoading: false });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create order';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Verify payment
  verifyPayment: async (orderId, paymentData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderApi.verifyPayment(orderId, paymentData);
      const { order } = response.data;

      set({
        currentOrder: order,
        isLoading: false
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Payment verification failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderApi.getOrderById(orderId);
      const { order } = response.data;

      set({
        currentOrder: order,
        isLoading: false
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch order';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Get my orders (for current user - buyer or farmer)
  getMyOrders: async (status = null) => {
    set({ isLoading: true, error: null });
    try {
      // Get the user from authStore to determine role
      const authStore = require('./authStore.js').default;
      const user = authStore.getState?.()?.user;
      
      let response;
      if (user?.role === 'farmer') {
        response = await orderApi.getFarmerOrders(status);
      } else {
        response = await orderApi.getBuyerOrders(status);
      }
      
      const { orders } = response.data;

      set({
        orders,
        isLoading: false
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch orders';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Get buyer orders
  getBuyerOrders: async (status = null) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderApi.getBuyerOrders(status);
      const { orders } = response.data;

      set({
        orders,
        isLoading: false
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch orders';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Get farmer orders
  getFarmerOrders: async (status = null) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderApi.getFarmerOrders(status);
      const { orders } = response.data;

      set({
        orders,
        isLoading: false
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch orders';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status, note = '') => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderApi.updateOrderStatus(orderId, status, note);
      const { order } = response.data;

      // Update in orders list
      set((state) => ({
        orders: state.orders.map((o) => (o._id === orderId ? order : o)),
        currentOrder: state.currentOrder?._id === orderId ? order : state.currentOrder,
        isLoading: false
      }));

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update order status';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Add tracking to order
  addTracking: async (orderId, trackingData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await trackingApi.addTracking(orderId, trackingData);
      const { order } = response.data;

      // Update in orders list and current order
      set((state) => ({
        orders: state.orders.map((o) => (o._id === orderId ? order : o)),
        currentOrder: state.currentOrder?._id === orderId ? order : state.currentOrder,
        isLoading: false
      }));

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add tracking';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Get tracking information
  getTracking: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await trackingApi.getTracking(orderId);
      const { tracking } = response.data;

      set({
        tracking,
        isLoading: false
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch tracking';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Cancel order
  cancelOrder: async (orderId, reason) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderApi.cancelOrder(orderId, reason);
      const { order } = response.data;

      // Update in orders list
      set((state) => ({
        orders: state.orders.map((o) => (o._id === orderId ? order : o)),
        currentOrder: state.currentOrder?._id === orderId ? order : state.currentOrder,
        isLoading: false
      }));

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to cancel order';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Get buyer stats
  getBuyerStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderApi.getBuyerStats();
      const { stats } = response.data;

      set({
        orderStats: stats,
        isLoading: false
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch stats';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Get farmer stats
  getFarmerStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderApi.getFarmerStats();
      const { stats } = response.data;

      set({
        orderStats: stats,
        isLoading: false
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch stats';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Handle real-time order update
  handleOrderUpdate: (data) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order._id === data.orderId
          ? { ...order, orderStatus: data.status }
          : order
      ),
      currentOrder:
        state.currentOrder?._id === data.orderId
          ? { ...state.currentOrder, orderStatus: data.status }
          : state.currentOrder
    }));
  },

  // Handle real-time tracking update
  handleTrackingUpdate: (data) => {
    const { orderId, status, trackingStatus } = data;
    
    set((state) => ({
      orders: state.orders.map((order) =>
        order._id === orderId
          ? { ...order, orderStatus: status, trackingStatus }
          : order
      ),
      currentOrder:
        state.currentOrder?._id === orderId
          ? { ...state.currentOrder, orderStatus: status, trackingStatus }
          : state.currentOrder
    }));

    // Refresh tracking info if user is viewing tracking
    if (get().tracking && get().currentOrder?._id === orderId) {
      get().getTracking(orderId);
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Clear current order
  clearCurrentOrder: () => set({ currentOrder: null }),

  // Clear tracking
  clearTracking: () => set({ tracking: null }),

  // Clear orders state
  clearOrdersState: () => set({ 
    orders: [], 
    currentOrder: null, 
    orderStats: null,
    tracking: null 
  }),

  // Subscribe to socket events
  subscribeToSocketEvents: () => {
    // Socket event subscriptions for order updates
    // This will be connected to real-time order updates via socket.io
  }
}));

export default useOrderStore;
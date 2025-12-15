// PRODUCT STORE

import { create } from 'zustand';
import productApi from '../api/productApi.js';
import {
    emitInventoryUpdate,
    emitProductCreated,
    emitProductDeleted,
    emitProductStatusChange,
    onInventoryUpdated,
    onNewProduct,
    onProductRemoved,
    onProductStatusChanged
} from '../utils/socket.js';

const useProductStore = create((set, get) => ({
  // State
  products: [],
  myProducts: [],
  currentProduct: null,
  farmerStats: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 0,
    limit: 20
  },
  filters: {
    category: '',
    search: '',
    minPrice: '',
    maxPrice: '',
    isOrganic: undefined,
    sortBy: '',
    status: ''
  },

  // Actions

  // Set filters
  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  // Clear filters
  clearFilters: () => {
    set({
      filters: {
        category: '',
        search: '',
        minPrice: '',
        maxPrice: '',
        isOrganic: undefined,
        sortBy: '',
        status: ''
      }
    });
  },

  // Create product
  createProduct: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productApi.createProduct(formData);
      const { product } = response.data;

      // Add to my products
      set((state) => ({
        myProducts: [product, ...state.myProducts],
        isLoading: false
      }));

      // Emit socket event
      emitProductCreated(product);

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create product';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Get all products
  getAllProducts: async (page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const filters = get().filters;
      const params = {
        ...filters,
        page,
        limit
      };

      const response = await productApi.getAllProducts(params);
      const { products, pagination } = response.data;

      set({
        products,
        pagination,
        isLoading: false
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch products';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Get product by ID
  getProductById: async (productId, incrementView = false) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productApi.getProductById(productId, incrementView);
      const { product } = response.data;

      set({
        currentProduct: product,
        isLoading: false
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch product';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Get my products (farmer)
  getMyProducts: async (status = '') => {
    set({ isLoading: true, error: null });
    try {
      const response = await productApi.getMyProducts(status);
      const { products } = response.data;

      set({
        myProducts: products,
        isLoading: false
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch products';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Get products by farmer
  getProductsByFarmer: async (farmerId, status = 'active') => {
    set({ isLoading: true, error: null });
    try {
      const response = await productApi.getProductsByFarmer(farmerId, status);
      const { products } = response.data;

      set({
        products,
        isLoading: false
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch products';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Update product
  updateProduct: async (productId, formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productApi.updateProduct(productId, formData);
      const { product } = response.data;

      // Update in my products
      set((state) => ({
        myProducts: state.myProducts.map((p) =>
          p._id === productId ? product : p
        ),
        currentProduct: state.currentProduct?._id === productId ? product : state.currentProduct,
        isLoading: false
      }));

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update product';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Delete product
  deleteProduct: async (productId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productApi.deleteProduct(productId);

      // Remove from my products
      set((state) => ({
        myProducts: state.myProducts.filter((p) => p._id !== productId),
        products: state.products.filter((p) => p._id !== productId),
        isLoading: false
      }));

      // Emit socket event
      emitProductDeleted(productId);

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete product';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Update stock
  updateStock: async (productId, quantity, operation = 'set') => {
    set({ isLoading: true, error: null });
    try {
      const response = await productApi.updateStock(productId, quantity, operation);
      const { product } = response.data;

      // Update in my products
      set((state) => ({
        myProducts: state.myProducts.map((p) =>
          p._id === productId ? product : p
        ),
        currentProduct: state.currentProduct?._id === productId ? product : state.currentProduct,
        isLoading: false
      }));

      // Emit socket event
      emitInventoryUpdate(productId, product.quantity.available, product.status);

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update stock';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Toggle product status
  toggleProductStatus: async (productId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productApi.toggleProductStatus(productId);
      const { product } = response.data;

      // Update in my products
      set((state) => ({
        myProducts: state.myProducts.map((p) =>
          p._id === productId ? product : p
        ),
        currentProduct: state.currentProduct?._id === productId ? product : state.currentProduct,
        isLoading: false
      }));

      // Emit socket event
      emitProductStatusChange(productId, product.status);

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to toggle status';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Delete product image
  deleteProductImage: async (productId, publicId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productApi.deleteProductImage(productId, publicId);
      const { product } = response.data;

      // Update in my products
      set((state) => ({
        myProducts: state.myProducts.map((p) =>
          p._id === productId ? product : p
        ),
        currentProduct: state.currentProduct?._id === productId ? product : state.currentProduct,
        isLoading: false
      }));

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete image';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Get farmer stats
  getFarmerStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await productApi.getFarmerStats();
      const { stats } = response.data;

      set({
        farmerStats: stats,
        isLoading: false
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch stats';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Search products
  searchProducts: async (searchTerm, filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productApi.searchProducts(searchTerm, filters);
      const { products, pagination } = response.data;

      set({
        products,
        pagination,
        isLoading: false
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Search failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Handle real-time inventory update
  handleInventoryUpdate: (data) => {
    set((state) => ({
      products: state.products.map((p) =>
        p._id === data.productId
          ? { ...p, quantity: { ...p.quantity, available: data.available }, status: data.status }
          : p
      ),
      myProducts: state.myProducts.map((p) =>
        p._id === data.productId
          ? { ...p, quantity: { ...p.quantity, available: data.available }, status: data.status }
          : p
      )
    }));
  },

  // Handle real-time product status change
  handleProductStatusChange: (data) => {
    set((state) => ({
      products: state.products.map((p) =>
        p._id === data.productId ? { ...p, status: data.status } : p
      ),
      myProducts: state.myProducts.map((p) =>
        p._id === data.productId ? { ...p, status: data.status } : p
      )
    }));
  },

  // Handle new product
  handleNewProduct: (data) => {
    set((state) => ({
      products: [data.product, ...state.products]
    }));
  },

  // Handle product removal
  handleProductRemoval: (data) => {
    set((state) => ({
      products: state.products.filter((p) => p._id !== data.productId)
    }));
  },

  // Subscribe to socket events
  subscribeToSocketEvents: () => {
    onInventoryUpdated(get().handleInventoryUpdate);
    onProductStatusChanged(get().handleProductStatusChange);
    onNewProduct(get().handleNewProduct);
    onProductRemoved(get().handleProductRemoval);
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Clear current product
  clearCurrentProduct: () => set({ currentProduct: null })
}));

export default useProductStore;
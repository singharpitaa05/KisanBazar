// PRODUCT APPLICATION

import axiosInstance from './axios.js';

class ProductAPI {
  // Create new product
  async createProduct(formData) {
    const response = await axiosInstance.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  // Get all products with filters
  async getAllProducts(params = {}) {
    const response = await axiosInstance.get('/products', { params });
    return response.data;
  }

  // Get single product by ID
  async getProductById(productId, incrementView = false) {
    const response = await axiosInstance.get(`/products/${productId}`, {
      params: { view: incrementView }
    });
    return response.data;
  }

  // Get farmer's own products
  async getMyProducts(status) {
    const response = await axiosInstance.get('/products/my/products', {
      params: { status }
    });
    return response.data;
  }

  // Get products by specific farmer (public)
  async getProductsByFarmer(farmerId, status = 'active') {
    const response = await axiosInstance.get(`/products/farmer/${farmerId}`, {
      params: { status }
    });
    return response.data;
  }

  // Update product
  async updateProduct(productId, formData) {
    const response = await axiosInstance.put(`/products/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  // Delete product
  async deleteProduct(productId) {
    const response = await axiosInstance.delete(`/products/${productId}`);
    return response.data;
  }

  // Update product stock
  async updateStock(productId, quantity, operation = 'set') {
    const response = await axiosInstance.patch(`/products/${productId}/stock`, {
      quantity,
      operation
    });
    return response.data;
  }

  // Toggle product status
  async toggleProductStatus(productId) {
    const response = await axiosInstance.patch(`/products/${productId}/toggle-status`);
    return response.data;
  }

  // Delete product image
  async deleteProductImage(productId, publicId) {
    const response = await axiosInstance.delete(`/products/${productId}/image`, {
      data: { publicId }
    });
    return response.data;
  }

  // Get farmer statistics
  async getFarmerStats() {
    const response = await axiosInstance.get('/products/my/stats');
    return response.data;
  }

  // Search products
  async searchProducts(searchTerm, filters = {}) {
    const params = {
      search: searchTerm,
      ...filters
    };
    const response = await axiosInstance.get('/products', { params });
    return response.data;
  }

  // Filter products
  async filterProducts(filters) {
    const response = await axiosInstance.get('/products', {
      params: filters
    });
    return response.data;
  }
}

export default new ProductAPI();
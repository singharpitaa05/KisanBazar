import api from './axios.js';

// Create a review
export const createReview = async (reviewData) => {
  const formData = new FormData();
  
  formData.append('productId', reviewData.productId);
  formData.append('orderId', reviewData.orderId);
  formData.append('rating', reviewData.rating);
  formData.append('comment', reviewData.comment);
  
  // Append images if any
  if (reviewData.images && reviewData.images.length > 0) {
    reviewData.images.forEach(image => {
      formData.append('images', image);
    });
  }
  
  const response = await api.post('/reviews', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

// Get reviews for a product
export const getProductReviews = async (productId, params = {}) => {
  const response = await api.get(`/reviews/product/${productId}`, { params });
  return response.data;
};

// Get review statistics
export const getReviewStats = async (productId) => {
  const response = await api.get(`/reviews/product/${productId}/stats`);
  return response.data;
};

// Get buyer's reviews
export const getBuyerReviews = async (params = {}) => {
  const response = await api.get('/reviews/my-reviews', { params });
  return response.data;
};

// Update a review
export const updateReview = async (reviewId, reviewData) => {
  const formData = new FormData();
  
  if (reviewData.rating) formData.append('rating', reviewData.rating);
  if (reviewData.comment) formData.append('comment', reviewData.comment);
  
  // Append images if any
  if (reviewData.images && reviewData.images.length > 0) {
    reviewData.images.forEach(image => {
      formData.append('images', image);
    });
  }
  
  const response = await api.put(`/reviews/${reviewId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

// Delete a review
export const deleteReview = async (reviewId) => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};

// Farmer responds to review
export const respondToReview = async (reviewId, comment) => {
  const response = await api.post(`/reviews/${reviewId}/respond`, { comment });
  return response.data;
};

// Mark review as helpful
export const markHelpful = async (reviewId) => {
  const response = await api.post(`/reviews/${reviewId}/helpful`);
  return response.data;
};

// Check if user can review a product
export const canReview = async (productId) => {
  const response = await api.get(`/reviews/can-review/${productId}`);
  return response.data;
};
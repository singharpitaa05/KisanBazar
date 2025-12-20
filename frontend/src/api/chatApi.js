// CHAT APPLICATION

import axiosInstance from './axios.js';

class ChatAPI {
  // Get or create conversation
  async getOrCreateConversation(farmerId, productId = null) {
    const response = await axiosInstance.post('/chat', {
      farmerId,
      productId
    });
    return response.data;
  }

  // Get user conversations
  async getUserConversations() {
    const response = await axiosInstance.get('/chat');
    return response.data;
  }

  // Get conversation by ID
  async getConversationById(conversationId) {
    const response = await axiosInstance.get(`/chat/${conversationId}`);
    return response.data;
  }

  // Send message
  async sendMessage(conversationId, content, messageType = 'text', productId = null, orderId = null) {
    const response = await axiosInstance.post(`/chat/${conversationId}/messages`, {
      content,
      messageType,
      productId,
      orderId
    });
    return response.data;
  }

  // Get unread count
  async getUnreadCount() {
    const response = await axiosInstance.get('/chat/unread-count');
    return response.data;
  }

  // Mark as read
  async markAsRead(conversationId) {
    const response = await axiosInstance.patch(`/chat/${conversationId}/read`);
    return response.data;
  }

  // Delete conversation
  async deleteConversation(conversationId) {
    const response = await axiosInstance.delete(`/chat/${conversationId}`);
    return response.data;
  }
}

export default new ChatAPI();
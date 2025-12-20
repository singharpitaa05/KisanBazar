// CHAT SERVICES

import { emitToConversation } from '../config/socket.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

class ChatService {
  // Get or create conversation
  async getOrCreateConversation(buyerId, farmerId, productId = null) {
    // Verify users
    const buyer = await User.findById(buyerId);
    const farmer = await User.findById(farmerId);

    if (!buyer || buyer.role !== 'buyer') {
      throw new Error('Invalid buyer');
    }

    if (!farmer || farmer.role !== 'farmer') {
      throw new Error('Invalid farmer');
    }

    const conversation = await Conversation.findOrCreate(buyerId, farmerId, productId);
    return conversation;
  }

  // Get user conversations
  async getUserConversations(userId) {
    const conversations = await Conversation.getUserConversations(userId);
    
    // Add unread count for each conversation
    const conversationsWithUnread = conversations.map(conv => {
      const convObj = conv.toObject();
      convObj.unreadCount = conv.getUnreadCount(userId);
      return convObj;
    });

    return conversationsWithUnread;
  }

  // Get conversation by ID
  async getConversationById(conversationId, userId) {
    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'name email profilePhoto role')
      .populate('productId', 'name price images')
      .populate('messages.senderId', 'name email profilePhoto role')
      .populate('messages.productId', 'name price images')
      .populate('messages.orderId', 'orderNumber status');

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(
      p => p._id.toString() === userId.toString()
    );

    if (!isParticipant) {
      throw new Error('You do not have access to this conversation');
    }

    // Mark messages as read
    await conversation.markAsRead(userId);

    return conversation;
  }

  // Send message
  async sendMessage(conversationId, senderId, content, messageType = 'text', metadata = {}) {
    const serviceStartTime = Date.now();
    console.log(`[Chat Service] Starting sendMessage at ${serviceStartTime}`);
    
    const conversation = await Conversation.findById(conversationId);

    const findTime = Date.now();
    console.log(`[Chat Service] Found conversation in ${findTime - serviceStartTime}ms`);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(
      p => p.toString() === senderId.toString()
    );

    if (!isParticipant) {
      throw new Error('You do not have access to this conversation');
    }

    // Add message to database
    await conversation.addMessage(senderId, content, messageType, metadata);

    const addTime = Date.now();
    console.log(`[Chat Service] Message added in ${addTime - findTime}ms`);

    // Get the last message (the one we just added)
    const lastMessage = conversation.messages[conversation.messages.length - 1];

    // Populate sender info for the last message only
    const senderData = await User.findById(lastMessage.senderId).select('name email profilePhoto role');
    
    // Create populated message object
    const populatedLastMessage = {
      ...lastMessage.toObject(),
      senderId: senderData
    };

    const populateTime = Date.now();
    console.log(`[Chat Service] Populated sender data in ${populateTime - addTime}ms`);

    // Get sender info for socket emission
    const sender = conversation.participants.find(p => p._id.toString() === senderId.toString());

    // Emit to conversation room (both participants will receive it)
    console.log(`[Chat Service] Emitting message to conversation: ${conversationId}`);
    emitToConversation(conversation._id.toString(), 'chat:message', {
      conversationId: conversation._id,
      message: populatedLastMessage,
      sender
    });

    const emitTime = Date.now();
    console.log(`[Chat Service] Socket emitted in ${emitTime - populateTime}ms`);
    console.log(`[Chat Service] Total time: ${emitTime - serviceStartTime}ms`);

    // Return minimal data for faster response
    return {
      conversation: {
        _id: conversation._id,
        lastMessage: {
          content: populatedLastMessage.content,
          senderId: populatedLastMessage.senderId,
          timestamp: new Date()
        }
      },
      message: populatedLastMessage
    };
  }

  // Get unread messages count
  async getUnreadCount(userId) {
    const conversations = await Conversation.find({
      participants: userId
    });

    let totalUnread = 0;
    conversations.forEach(conv => {
      totalUnread += conv.getUnreadCount(userId);
    });

    return totalUnread;
  }

  // Mark conversation as read
  async markAsRead(conversationId, userId) {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(
      p => p.toString() === userId.toString()
    );

    if (!isParticipant) {
      throw new Error('You do not have access to this conversation');
    }

    await conversation.markAsRead(userId);

    return conversation;
  }

  // Delete conversation (soft delete by clearing messages)
  async deleteConversation(conversationId, userId) {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(
      p => p.toString() === userId.toString()
    );

    if (!isParticipant) {
      throw new Error('You do not have access to this conversation');
    }

    // For now, just clear the conversation
    // In production, you might want to implement proper deletion logic
    await Conversation.findByIdAndDelete(conversationId);

    return { message: 'Conversation deleted successfully' };
  }
}

export default new ChatService();
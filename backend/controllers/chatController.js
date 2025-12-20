//  CHAT CONTROLLER

import { asyncHandler } from '../middleware/errorHandler.js';
import chatService from '../services/chatService.js';
import { HTTP_STATUS } from '../utils/constants.js';

class ChatController {
  // Get or create conversation
  getOrCreateConversation = asyncHandler(async (req, res) => {
    const buyerId = req.userId;
    const { farmerId, productId } = req.body;

    const conversation = await chatService.getOrCreateConversation(
      buyerId,
      farmerId,
      productId
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { conversation }
    });
  });

  // Get user conversations
  getUserConversations = asyncHandler(async (req, res) => {
    const userId = req.userId;

    const conversations = await chatService.getUserConversations(userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { conversations }
    });
  });

  // Get conversation by ID
  getConversation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    const conversation = await chatService.getConversationById(id, userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { conversation }
    });
  });

  // Send message
  sendMessage = asyncHandler(async (req, res) => {
    const startTime = Date.now();
    console.log(`[Chat Controller] Started processing message at ${startTime}`);
    
    const { id } = req.params;
    const senderId = req.userId;
    const { content, messageType, productId, orderId } = req.body;

    const metadata = {};
    if (productId) metadata.productId = productId;
    if (orderId) metadata.orderId = orderId;

    console.log(`[Chat Controller] Calling chat service...`);
    const result = await chatService.sendMessage(
      id,
      senderId,
      content,
      messageType,
      metadata
    );

    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`[Chat Controller] Message processed in ${duration}ms`);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Message sent successfully',
      data: result
    });
  });

  // Get unread count
  getUnreadCount = asyncHandler(async (req, res) => {
    const userId = req.userId;

    const unreadCount = await chatService.getUnreadCount(userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { unreadCount }
    });
  });

  // Mark as read
  markAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    await chatService.markAsRead(id, userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Marked as read'
    });
  });

  // Delete conversation
  deleteConversation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    const result = await chatService.deleteConversation(id, userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: result.message
    });
  });
}

export default new ChatController();
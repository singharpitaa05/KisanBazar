// SOCKET CONFIGURATION

import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';

// Load environment variables
dotenv.config();

let io;

// Initialize Socket.io
export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  // Authentication middleware for socket connections
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection event
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId} (${socket.userRole})`);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // If farmer, join farmer room for inventory updates
    if (socket.userRole === 'farmer') {
      socket.join('farmers');
    }

    // If buyer, join buyer room for notifications
    if (socket.userRole === 'buyer') {
      socket.join('buyers');
    }

    // ===== PRODUCT EVENTS =====
    
    // Handle inventory update event (from farmer)
    socket.on('inventory:update', (data) => {
      console.log('Inventory update:', data);
      // Broadcast to all buyers
      socket.to('buyers').emit('inventory:updated', {
        productId: data.productId,
        available: data.available,
        status: data.status
      });
    });

    // Handle product status change
    socket.on('product:status:change', (data) => {
      console.log('Product status change:', data);
      // Broadcast to all buyers
      socket.to('buyers').emit('product:status:changed', {
        productId: data.productId,
        status: data.status
      });
    });

    // Handle new product creation
    socket.on('product:created', (data) => {
      console.log('New product created:', data);
      // Broadcast to all buyers
      socket.to('buyers').emit('product:new', {
        product: data.product
      });
    });

    // Handle product deletion
    socket.on('product:deleted', (data) => {
      console.log('Product deleted:', data);
      // Broadcast to all buyers
      socket.to('buyers').emit('product:removed', {
        productId: data.productId
      });
    });

    // ===== CHAT EVENTS =====

    // Join conversation room
    socket.on('chat:join', (data) => {
      const { conversationId } = data;
      socket.join(`conversation:${conversationId}`);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    // Leave conversation room
    socket.on('chat:leave', (data) => {
      const { conversationId } = data;
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Handle typing indicator
    socket.on('chat:typing', (data) => {
      const { conversationId, recipientId } = data;
      socket.to(`user:${recipientId}`).emit('chat:typing', {
        senderId: socket.userId,
        conversationId
      });
    });

    // Handle stop typing indicator
    socket.on('chat:stop-typing', (data) => {
      const { conversationId, recipientId } = data;
      socket.to(`user:${recipientId}`).emit('chat:stop-typing', {
        senderId: socket.userId,
        conversationId
      });
    });

    // Handle message sent (for real-time delivery confirmation)
    socket.on('chat:message:sent', (data) => {
      const { conversationId, messageId } = data;
      socket.to(`conversation:${conversationId}`).emit('chat:message:delivered', {
        conversationId,
        messageId
      });
    });

    // ===== ORDER EVENTS =====

    // Handle order status update notification
    socket.on('order:status:update', (data) => {
      const { orderId, buyerId, status } = data;
      socket.to(`user:${buyerId}`).emit('order:status:updated', {
        orderId,
        status
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  console.log('Socket.io initialized');
  return io;
};

// Get io instance
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Emit event to specific user
export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

// Emit event to all farmers
export const emitToFarmers = (event, data) => {
  if (io) {
    io.to('farmers').emit(event, data);
  }
};

// Emit event to all buyers
export const emitToBuyers = (event, data) => {
  if (io) {
    io.to('buyers').emit(event, data);
  }
};

// Emit event to all connected users
export const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

// Emit to conversation room
export const emitToConversation = (conversationId, event, data) => {
  if (io) {
    io.to(`conversation:${conversationId}`).emit(event, data);
  }
};

export default { 
  initializeSocket, 
  getIO, 
  emitToUser, 
  emitToFarmers, 
  emitToBuyers, 
  emitToAll,
  emitToConversation 
};
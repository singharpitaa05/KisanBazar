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

    // Handle typing indicator for chat (Phase 4)
    socket.on('chat:typing', (data) => {
      socket.to(`user:${data.recipientId}`).emit('chat:typing', {
        senderId: socket.userId,
        conversationId: data.conversationId
      });
    });

    socket.on('chat:stop-typing', (data) => {
      socket.to(`user:${data.recipientId}`).emit('chat:stop-typing', {
        senderId: socket.userId,
        conversationId: data.conversationId
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

export default { initializeSocket, getIO, emitToUser, emitToFarmers, emitToBuyers, emitToAll };
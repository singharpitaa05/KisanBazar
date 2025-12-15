// SOCKET UTILITIES

import { io } from 'socket.io-client';
import { STORAGE_KEYS } from './constants.js';

let socket = null;

// Initialize socket connection
export const initializeSocket = () => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  
  if (!token) {
    console.warn('No token found, cannot initialize socket');
    return null;
  }

  if (socket && socket.connected) {
    return socket;
  }

  const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  socket = io(SOCKET_URL, {
    auth: {
      token
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });

  // Connection events
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

// Get socket instance
export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Emit event
export const emitEvent = (event, data) => {
  if (socket && socket.connected) {
    socket.emit(event, data);
  } else {
    console.warn('Socket not connected, cannot emit event:', event);
  }
};

// Listen to event
export const onEvent = (event, callback) => {
  if (socket) {
    socket.on(event, callback);
  }
};

// Remove event listener
export const offEvent = (event, callback) => {
  if (socket) {
    socket.off(event, callback);
  }
};

// Inventory update events
export const emitInventoryUpdate = (productId, available, status) => {
  emitEvent('inventory:update', { productId, available, status });
};

export const onInventoryUpdated = (callback) => {
  onEvent('inventory:updated', callback);
};

// Product status events
export const emitProductStatusChange = (productId, status) => {
  emitEvent('product:status:change', { productId, status });
};

export const onProductStatusChanged = (callback) => {
  onEvent('product:status:changed', callback);
};

// New product events
export const emitProductCreated = (product) => {
  emitEvent('product:created', { product });
};

export const onNewProduct = (callback) => {
  onEvent('product:new', callback);
};

// Product deletion events
export const emitProductDeleted = (productId) => {
  emitEvent('product:deleted', { productId });
};

export const onProductRemoved = (callback) => {
  onEvent('product:removed', callback);
};

export default {
  initializeSocket,
  getSocket,
  disconnectSocket,
  emitEvent,
  onEvent,
  offEvent,
  emitInventoryUpdate,
  onInventoryUpdated,
  emitProductStatusChange,
  onProductStatusChanged,
  emitProductCreated,
  onNewProduct,
  emitProductDeleted,
  onProductRemoved
};
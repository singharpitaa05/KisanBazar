// CHAT STORE

import { create } from 'zustand';
import chatApi from '../api/chatApi.js';
import { emitEvent, getSocket, joinConversation, leaveConversation, offEvent, onEvent } from '../utils/socket.js';

// Debounce timer for unread count requests
let unreadCountTimeout = null;
let lastUnreadCountTime = 0;
let consecutiveUnreadErrors = 0; // Track consecutive network errors for backoff
const UNREAD_COUNT_DEBOUNCE_MS = 3000; // Wait 3 seconds before next request

const useChatStore = create((set, get) => ({
  // State
  conversations: [],
  currentConversation: null,
   messages: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  typingUsers: {}, // { conversationId: userId }

  // Actions

  // Get or create conversation
  getOrCreateConversation: async (farmerId, productId = null) => {
    set({ isLoading: true, error: null });
    try {
      const response = await chatApi.getOrCreateConversation(farmerId, productId);
      const { conversation } = response.data;

      // Add to conversations if not exists
      set((state) => {
        const exists = state.conversations.find((c) => c._id === conversation._id);
        if (!exists) {
          return {
            conversations: [conversation, ...state.conversations],
            currentConversation: conversation,
            isLoading: false
          };
        }
        return {
          currentConversation: conversation,
          isLoading: false
        };
      });

      // Join conversation room via socket (idempotent)
      const socket = getSocket();
      if (socket) {
        joinConversation(conversation._id);
      }

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to get conversation';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Start conversation (alias for UI compatibility)
  startConversation: async (farmerId, productId = null) => {
    return await get().getOrCreateConversation(farmerId, productId);
  },

   // Compatibility: called by UI to fetch conversations
   getConversations: async () => {
     return await get().getUserConversations();
   },

  // Get user conversations
  getUserConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await chatApi.getUserConversations();
      const { conversations } = response.data;

      set({
        conversations,
        isLoading: false
      });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch conversations';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Get conversation by ID
  getConversationById: async (conversationId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await chatApi.getConversationById(conversationId);
      const { conversation } = response.data;

      set({
        currentConversation: conversation,
         messages: conversation.messages || [],
        isLoading: false
      });

      // Join conversation room via socket (idempotent)
      const socket = getSocket();
      if (socket) {
        joinConversation(conversation._id);
      }

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch conversation';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

   // Compatibility: fetch messages for a conversation
   getMessages: async (conversationId) => {
     return await get().getConversationById(conversationId);
   },

  // Send message
  sendMessage: async (conversationId, content, messageType = 'text', productId = null, orderId = null) => {
    try {
      const startTime = performance.now();
      console.log(`[Chat Store] Starting message send at ${startTime}`);
      
      const response = await chatApi.sendMessage(conversationId, content, messageType, productId, orderId);
      
      const endTime = performance.now();
      console.log(`[Chat Store] Message sent in ${endTime - startTime}ms`);
      
      const { message, conversation } = response.data;

      // Update current conversation immediately
      set((state) => {
        if (state.currentConversation?._id === conversationId) {
           const updatedMessages = [...(state.messages || []), message];
           return {
             currentConversation: {
               ...state.currentConversation,
               messages: updatedMessages,
               lastMessage: conversation.lastMessage
             },
             messages: updatedMessages
           };
        }
        return state;
      });

      // Update in conversations list
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c._id === conversationId
            ? { ...c, lastMessage: conversation.lastMessage }
            : c
        )
      }));

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send message';
      console.error('[Chat Store] Error sending message:', errorMessage);
      set({ error: errorMessage });
      throw error;
    }
  },

   // Select a conversation (UI helper)
   selectConversation: async (conversation) => {
     try {
       await get().getConversationById(conversation._id);
     } catch (error) {
       console.error('Failed to select conversation', error);
     }
   },

  // Get unread count with debouncing to prevent excessive API calls
  getUnreadCount: async () => {
    const now = Date.now();
    
    // If debounce is in progress, wait for it
    if (unreadCountTimeout) {
      return;
    }

    // If we've seen repeated network errors, back off to avoid resource exhaustion
    if (consecutiveUnreadErrors >= 3) {
      unreadCountTimeout = setTimeout(() => {
        unreadCountTimeout = null;
        // try again after extended backoff
        get().getUnreadCount();
      }, UNREAD_COUNT_DEBOUNCE_MS * 5);
      return;
    }
    
    // If called within debounce window, schedule it for later
    if (now - lastUnreadCountTime < UNREAD_COUNT_DEBOUNCE_MS) {
      if (unreadCountTimeout) clearTimeout(unreadCountTimeout);
      
      unreadCountTimeout = setTimeout(() => {
        unreadCountTimeout = null;
        get().getUnreadCount(); // Recursive call after debounce
      }, UNREAD_COUNT_DEBOUNCE_MS - (now - lastUnreadCountTime));
      
      return;
    }
    
    lastUnreadCountTime = now;
    
    try {
      const response = await chatApi.getUnreadCount();
      const { unreadCount } = response.data;

      // Reset consecutive error counter on success
      consecutiveUnreadErrors = 0;

      set({ unreadCount });

      return response;
    } catch (error) {
      console.error('Failed to get unread count:', error);

      // Increment consecutive error counter and schedule a backoff retry
      consecutiveUnreadErrors = Math.min(10, consecutiveUnreadErrors + 1);

      // If network errors are happening, schedule a delayed retry to avoid flooding
      if (!unreadCountTimeout) {
        const backoffMs = UNREAD_COUNT_DEBOUNCE_MS * (1 + consecutiveUnreadErrors);
        unreadCountTimeout = setTimeout(() => {
          unreadCountTimeout = null;
          get().getUnreadCount();
        }, backoffMs);
      }
    }
  },

  // Mark as read
  markAsRead: async (conversationId) => {
    try {
      await chatApi.markAsRead(conversationId);

      // Update unread count in conversation and recalculate total
      set((state) => {
        const updatedConversations = state.conversations.map((c) =>
          c._id === conversationId ? { ...c, unreadCount: 0 } : c
        );
        
        // Recalculate total unread count locally
        const totalUnread = updatedConversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
        
        return {
          conversations: updatedConversations,
          unreadCount: totalUnread
        };
      });
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  },

  // Delete conversation
  deleteConversation: async (conversationId) => {
    set({ isLoading: true, error: null });
    try {
      await chatApi.deleteConversation(conversationId);

      // Remove from conversations
      set((state) => ({
        conversations: state.conversations.filter((c) => c._id !== conversationId),
        currentConversation: state.currentConversation?._id === conversationId ? null : state.currentConversation,
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete conversation';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Handle real-time message
  handleNewMessage: (data) => {
    console.log('[Chat Store] Received message event:', data);
    const { conversationId, message, sender } = data;

    // Use single set call for both updates to ensure atomic operation
    set((state) => {
      if (state.currentConversation?._id === conversationId) {
        console.log('[Chat Store] Adding message to current conversation');
        
        // Create Set of existing message IDs for O(1) lookup
        const existingIds = new Set(state.currentConversation.messages?.map(m => m._id?.toString()) || []);
        
        if (existingIds.has(message._id?.toString())) {
          console.log('[Chat Store] Message already exists, skipping duplicate');
          return state;
        }
        
        // Deduplicate current conversation messages
        const uniqueConvMessages = Array.from(new Map(
          [...(state.currentConversation.messages || []), message].map(m => [m._id?.toString(), m])
        ).values());
        
        // Deduplicate top-level messages array
        const uniqueMessages = Array.from(new Map(
          [...(state.messages || []), message].map(m => [m._id?.toString(), m])
        ).values());
        
        return {
          currentConversation: {
            ...state.currentConversation,
            messages: uniqueConvMessages
          },
          messages: uniqueMessages
        };
      }
      return state;
    });

    // Update in conversations list
    set((state) => {
      const updatedConversations = state.conversations.map((c) =>
        c._id === conversationId
          ? {
              ...c,
              lastMessage: {
                content: message.content,
                senderId: sender,
                timestamp: message.createdAt
              },
              unreadCount: (c.unreadCount || 0) + 1
            }
          : c
      );
      
      // Recalculate total unread count locally
      const totalUnread = updatedConversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      
      return {
        conversations: updatedConversations,
        unreadCount: totalUnread
      };
    });
  },

  // Handle typing indicator
  handleTyping: (data) => {
    const { conversationId, senderId } = data;
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: senderId
      }
    }));
  },

  // Handle stop typing
  handleStopTyping: (data) => {
    const { conversationId } = data;
    set((state) => {
      const newTypingUsers = { ...state.typingUsers };
      delete newTypingUsers[conversationId];
      return { typingUsers: newTypingUsers };
    });
  },

  // Send typing indicator
  sendTyping: (conversationId, recipientId) => {
    emitEvent('chat:typing', { conversationId, recipientId });
  },

  // Send stop typing indicator
  sendStopTyping: (conversationId, recipientId) => {
    emitEvent('chat:stop-typing', { conversationId, recipientId });
  },

  // Subscribe to socket events
  subscribeToSocketEvents: () => {
    onEvent('chat:message', get().handleNewMessage);
    onEvent('chat:typing', get().handleTyping);
    onEvent('chat:stop-typing', get().handleStopTyping);
  },

  // Unsubscribe from socket events
  unsubscribeFromSocketEvents: () => {
    offEvent('chat:message', get().handleNewMessage);
    offEvent('chat:typing', get().handleTyping);
    offEvent('chat:stop-typing', get().handleStopTyping);
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Clear current conversation
  clearCurrentConversation: () => {
    const currentConv = get().currentConversation;
    if (currentConv) {
      const socket = getSocket();
      if (socket) {
        leaveConversation(currentConv._id);
      }
    }
    set({ currentConversation: null });
  },

  // Clear chat state
  clearChatState: () => set({ 
    conversations: [], 
    currentConversation: null, 
    unreadCount: 0,
    typingUsers: {}
  })
}));

export default useChatStore;
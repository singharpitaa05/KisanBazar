// CHAT STORE

import { create } from 'zustand';
import chatApi from '../api/chatApi.js';
import { emitEvent, getSocket, joinConversation, leaveConversation, offEvent, onEvent } from '../utils/socket.js';

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

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await chatApi.getUnreadCount();
      const { unreadCount } = response.data;

      set({ unreadCount });

      return response;
    } catch (error) {
      console.error('Failed to get unread count:', error);
    }
  },

  // Mark as read
  markAsRead: async (conversationId) => {
    try {
      await chatApi.markAsRead(conversationId);

      // Update unread count in conversation
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c._id === conversationId ? { ...c, unreadCount: 0 } : c
        )
      }));

      // Refresh total unread count
      get().getUnreadCount();
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

    // Update current conversation if viewing
    set((state) => {
      if (state.currentConversation?._id === conversationId) {
        console.log('[Chat Store] Adding message to current conversation');
        return {
          currentConversation: {
            ...state.currentConversation,
            messages: [...(state.currentConversation.messages || []), message]
          }
        };
      }
      return state;
    });

    // Also append to top-level messages array if the current conversation is open
    set((state) => {
      if (state.currentConversation?._id === conversationId) {
        console.log('[Chat Store] Adding message to messages array');
        return {
          messages: [...(state.messages || []), message]
        };
      }
      return state;
    });

    // Update in conversations list
    set((state) => ({
      conversations: state.conversations.map((c) =>
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
      )
    }));

    // Update total unread count
    get().getUnreadCount();
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
// MESSAGE PAGE

import { useEffect, useRef, useState } from 'react';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import useAuthStore from '../store/authStore.js';
import useChatStore from '../store/chatStore.js';

const Messages = () => {
  const { user } = useAuthStore();
  const {
    conversations,
    currentConversation,
    messages,
    isLoading,
    getConversations,
    getMessages,
    sendMessage,
    selectConversation
  } = useChatStore();

  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  useEffect(() => {
    getConversations();
  }, [getConversations]);

  useEffect(() => {
    if (currentConversation) {
      getMessages(currentConversation._id);
    }
  }, [currentConversation, getMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        messagesEndRef.current?.parentElement?.scrollTo({
          top: messagesEndRef.current.parentElement.scrollHeight,
          behavior: 'auto'
        });
      });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim() || !currentConversation) return;

    try {
      await sendMessage(currentConversation._id, messageText);
      setMessageText('');
      messageInputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleConversationSelect = (conversation) => {
    selectConversation(conversation);
  };

  const getOtherParticipant = (conversation) => {
    if (!conversation || !user) return null;
    return conversation.participants.find(p => p._id !== user._id);
  };

  const formatMessageTime = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const otherUser = getOtherParticipant(conv);
    return otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (isLoading && !conversations.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading conversations..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-screen overflow-hidden">
      <div className="h-screen flex flex-col sm:flex-row">
        {/* Conversations Sidebar */}
        <div className="w-full sm:w-96 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>
            
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <svg
                  className="mx-auto w-16 h-16 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-gray-600">No conversations yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  {searchQuery ? 'Try a different search' : 'Start a conversation from product pages'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredConversations.map((conversation) => {
                  const otherUser = getOtherParticipant(conversation);
                  const isSelected = currentConversation?._id === conversation._id;
                  const hasUnread = conversation.unreadCount > 0;

                  return (
                    <button
                      key={conversation._id}
                      onClick={() => handleConversationSelect(conversation)}
                      className={`w-full p-4 hover:bg-gray-50 transition-colors text-left ${
                        isSelected ? 'bg-green-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                          {otherUser?.profileImage ? (
                            <img
                              src={otherUser.profileImage.url}
                              alt={otherUser.name}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <span className="text-green-600 font-semibold text-lg">
                              {otherUser?.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Conversation Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={`font-semibold truncate ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                              {otherUser?.name}
                            </h3>
                            {conversation.lastMessage && (
                              <span className="text-xs text-gray-500 ml-2 shrink-0">
                                {formatMessageTime(conversation.lastMessage.timestamp)}
                              </span>
                            )}
                          </div>
                          
                          {conversation.lastMessage && (
                            <p className={`text-sm truncate ${hasUnread ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                              {(conversation.lastMessage.senderId?._id === user?._id || conversation.lastMessage.senderId === user?._id) && 'You: '}
                              {conversation.lastMessage.content}
                            </p>
                          )}
                          
                          {otherUser?.role && (
                            <span className="inline-block text-xs text-gray-500 mt-1">
                              {otherUser.role === 'farmer' ? '🌾 Farmer' : '🛒 Buyer'}
                            </span>
                          )}
                        </div>

                        {/* Unread Badge */}
                        {hasUnread && (
                          <div className="shrink-0">
                            <span className="inline-flex items-center justify-center w-5 h-5 bg-green-600 text-white text-xs font-bold rounded-full">
                              {conversation.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {currentConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    {getOtherParticipant(currentConversation)?.profileImage ? (
                      <img
                        src={getOtherParticipant(currentConversation).profileImage.url}
                        alt={getOtherParticipant(currentConversation).name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-green-600 font-semibold">
                        {getOtherParticipant(currentConversation)?.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {getOtherParticipant(currentConversation)?.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {getOtherParticipant(currentConversation)?.role === 'farmer' ? 'Farmer' : 'Buyer'}
                    </p>
                  </div>
                </div>

                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <svg
                        className="mx-auto w-16 h-16 text-gray-400 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <p className="text-gray-600">No messages yet</p>
                      <p className="text-sm text-gray-500 mt-1">Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {messages.map((message) => {
                      const isOwnMessage = message.senderId?._id === user?._id || message.senderId === user?._id;
                      
                      return (
                        <div
                          key={message._id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] px-4 py-2 rounded-lg wrap-break-word whitespace-pre-wrap ${
                              isOwnMessage
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isOwnMessage ? 'text-green-100' : 'text-gray-500'
                              }`}
                            >
                              {new Date(message.createdAt).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                              {isOwnMessage && message.isRead && (
                                <span className="ml-2">✓✓</span>
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    ref={messageInputRef}
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!messageText.trim()}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="mx-auto w-20 h-20 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-600">
                  Choose a conversation from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
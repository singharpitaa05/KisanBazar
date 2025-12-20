// CONVERSATION MODEL

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  messageType: {
    type: String,
    enum: ['text', 'product_inquiry', 'order_update'],
    default: 'text'
  },
  // For product inquiries
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  // For order updates
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date
}, {
  timestamps: true
});

const conversationSchema = new mongoose.Schema(
  {
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }],
    // For quick identification
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    // Related product (optional)
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    messages: [messageSchema],
    lastMessage: {
      content: String,
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      timestamp: Date
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Compound index for finding conversations
conversationSchema.index({ buyerId: 1, farmerId: 1 });
conversationSchema.index({ participants: 1 });

// Update last message and unread count
conversationSchema.methods.addMessage = function(senderId, content, messageType = 'text', metadata = {}) {
  const message = {
    senderId,
    content,
    messageType,
    ...metadata
  };

  this.messages.push(message);

  // Update last message
  this.lastMessage = {
    content,
    senderId,
    timestamp: new Date()
  };

  // Update unread count for other participant
  const otherParticipant = this.participants.find(
    p => p.toString() !== senderId.toString()
  );
  
  if (otherParticipant) {
    const currentCount = this.unreadCount.get(otherParticipant.toString()) || 0;
    this.unreadCount.set(otherParticipant.toString(), currentCount + 1);
  }

  return this.save();
};

// Mark messages as read
conversationSchema.methods.markAsRead = function(userId) {
  const now = new Date();
  
  this.messages.forEach(message => {
    if (message.senderId.toString() !== userId.toString() && !message.isRead) {
      message.isRead = true;
      message.readAt = now;
    }
  });

  // Reset unread count for this user
  this.unreadCount.set(userId.toString(), 0);

  return this.save();
};

// Get unread message count for user
conversationSchema.methods.getUnreadCount = function(userId) {
  return this.unreadCount.get(userId.toString()) || 0;
};

// Static method to find or create conversation
conversationSchema.statics.findOrCreate = async function(buyerId, farmerId, productId = null) {
  let conversation = await this.findOne({
    buyerId,
    farmerId
  }).populate('participants', 'name email profilePhoto')
    .populate('productId', 'name price images');

  if (!conversation) {
    conversation = await this.create({
      participants: [buyerId, farmerId],
      buyerId,
      farmerId,
      productId,
      messages: [],
      unreadCount: new Map()
    });
    
    conversation = await conversation.populate('participants', 'name email profilePhoto');
    if (productId) {
      conversation = await conversation.populate('productId', 'name price images');
    }
  }

  return conversation;
};

// Static method to get user conversations
conversationSchema.statics.getUserConversations = function(userId) {
  return this.find({
    participants: userId
  })
    .populate('participants', 'name email profilePhoto role')
    .populate('productId', 'name price images')
    .populate('messages.senderId', 'name email profilePhoto role')
    .sort({ 'lastMessage.timestamp': -1 });
};

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
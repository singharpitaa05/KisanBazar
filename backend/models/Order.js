// ORDER MODEL

import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unit: {
    type: String,
    required: true
  },
  images: [{
    url: String,
    publicId: String
  }]
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    items: [orderItemSchema],
    // Delivery Address
    deliveryAddress: {
      name: {
        type: String,
        required: true
      },
      phone: {
        type: String,
        required: true
      },
      addressLine1: {
        type: String,
        required: true
      },
      addressLine2: String,
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      pincode: {
        type: String,
        required: true
      }
    },
    // Pricing
    subtotal: {
      type: Number,
      required: true
    },
    deliveryFee: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    },
    // Payment
    paymentMethod: {
      type: String,
      enum: ['online', 'cod'],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true
    },
    paymentDetails: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      paidAt: Date
    },
    // Order Status
    status: {
      type: String,
      enum: ['pending', 'accepted', 'processing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
      index: true
    },
    statusHistory: [{
      status: String,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      note: String
    }],
    // Tracking
    trackingId: String,
    estimatedDelivery: Date,
    deliveredAt: Date,
    // Cancellation
    cancellationReason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    // Notes
    buyerNotes: String,
    farmerNotes: String
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
orderSchema.index({ buyerId: 1, createdAt: -1 });
orderSchema.index({ 'items.farmerId': 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });

// Generate order number before validation so required validator passes
orderSchema.pre('validate', function() {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `ORD${year}${month}${random}`;
  }
});

// Add status to history before saving
orderSchema.pre('save', function() {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }
});

// Method to check if order can be cancelled
orderSchema.methods.canCancel = function() {
  return ['pending', 'accepted', 'processing'].includes(this.status);
};

// Method to check if order is delivered
orderSchema.methods.isDelivered = function() {
  return this.status === 'delivered';
};

// Method to get farmer orders
orderSchema.statics.getFarmerOrders = function(farmerId, status = null) {
  const query = { 'items.farmerId': farmerId };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('buyerId', 'name email phone')
    .sort({ createdAt: -1 });
};

// Method to get buyer orders
orderSchema.statics.getBuyerOrders = function(buyerId, status = null) {
  const query = { buyerId };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('items.farmerId', 'name email phone')
    .sort({ createdAt: -1 });
};

const Order = mongoose.model('Order', orderSchema);

export default Order;
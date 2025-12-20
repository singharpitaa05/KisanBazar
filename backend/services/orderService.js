// ORDER SERVICES 


import { createRazorpayOrder, createRefund, verifyRazorpaySignature } from '../config/razorpay.js';
import { emitToUser } from '../config/socket.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

class OrderService {
  // Create order from cart
  async createOrder(userId, orderData) {
    const { deliveryAddress, paymentMethod, buyerNotes } = orderData;

    // Get user's cart
    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    // Validate cart items and check stock
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = item.productId;

      if (!product) {
        throw new Error('Product not found in cart');
      }

      if (product.status !== 'active') {
        throw new Error(`${product.name} is no longer available`);
      }

      if (product.quantity.available < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      orderItems.push({
        productId: product._id,
        farmerId: product.farmerId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        unit: product.unit,
        images: product.images
      });

      subtotal += product.price * item.quantity;
    }

    // Calculate totals
    const deliveryFee = 0; // Free delivery for now
    const tax = 0; // No tax for now
    const total = subtotal + deliveryFee + tax;

    // Create order
    const order = await Order.create({
      buyerId: userId,
      items: orderItems,
      deliveryAddress,
      subtotal,
      deliveryFee,
      tax,
      total,
      paymentMethod,
      buyerNotes,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      status: 'pending'
    });

    // If online payment, create Razorpay order
    let razorpayOrder = null;
    if (paymentMethod === 'online') {
      razorpayOrder = await createRazorpayOrder(
        total,
        'INR',
        order.orderNumber
      );

      order.paymentDetails = {
        razorpayOrderId: razorpayOrder.id
      };
      await order.save();
    }

    // Update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: {
          'quantity.available': -item.quantity,
          'quantity.sold': item.quantity
        }
      });
    }

    // Clear cart
    await cart.clearCart();

    // Notify farmers
    const farmerIds = [...new Set(orderItems.map(item => item.farmerId.toString()))];
    for (const farmerId of farmerIds) {
      emitToUser(farmerId, 'order:new', {
        orderId: order._id,
        orderNumber: order.orderNumber
      });
    }

    return {
      order: await Order.findById(order._id).populate('buyerId', 'name email phone'),
      razorpayOrder
    };
  }

  // Verify payment and update order
  async verifyPayment(orderId, paymentData) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.paymentDetails.razorpayOrderId !== razorpay_order_id) {
      throw new Error('Invalid order ID');
    }

    // Verify signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      order.paymentStatus = 'failed';
      await order.save();
      throw new Error('Payment verification failed');
    }

    // Update order
    order.paymentStatus = 'completed';
    order.paymentDetails.razorpayPaymentId = razorpay_payment_id;
    order.paymentDetails.razorpaySignature = razorpay_signature;
    order.paymentDetails.paidAt = new Date();
    await order.save();

    // Notify farmers
    const farmerIds = [...new Set(order.items.map(item => item.farmerId.toString()))];
    for (const farmerId of farmerIds) {
      emitToUser(farmerId, 'order:payment_confirmed', {
        orderId: order._id,
        orderNumber: order.orderNumber
      });
    }

    return order;
  }

  // Get order by ID
  async getOrderById(orderId, userId) {
    const order = await Order.findById(orderId)
      .populate('buyerId', 'name email phone')
      .populate('items.farmerId', 'name email phone farmDetails');

    if (!order) {
      throw new Error('Order not found');
    }

    // Check if user has access to this order
    const isBuyer = order.buyerId._id.toString() === userId.toString();
    const isFarmer = order.items.some(item => item.farmerId._id.toString() === userId.toString());

    if (!isBuyer && !isFarmer) {
      throw new Error('You do not have access to this order');
    }

    return order;
  }

  // Get buyer orders
  async getBuyerOrders(buyerId, status = null) {
    const orders = await Order.getBuyerOrders(buyerId, status);
    return orders;
  }

  // Get farmer orders
  async getFarmerOrders(farmerId, status = null) {
    const orders = await Order.getFarmerOrders(farmerId, status);
    return orders;
  }

  // Update order status (farmer only)
  async updateOrderStatus(orderId, farmerId, status, note = '') {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    // Check if farmer is part of this order
    const isFarmer = order.items.some(item => item.farmerId.toString() === farmerId.toString());

    if (!isFarmer) {
      throw new Error('You do not have access to this order');
    }

    // Validate status transition
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: []
    };

    if (!validTransitions[order.orderStatus]?.includes(status)) {
      throw new Error(`Cannot change status from ${order.orderStatus} to ${status}`);
    }

    order.orderStatus = status;

    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    // Notify buyer
    emitToUser(order.buyerId.toString(), 'order:status_updated', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status
    });

    return order;
  }

  // Add tracking to order
  async addTracking(orderId, farmerId, trackingData) {
    const { trackingNumber, courier, carrierName } = trackingData;

    const order = await Order.findById(orderId).populate('buyerId', 'name email');

    if (!order) {
      throw new Error('Order not found');
    }

    // Check if farmer is part of this order
    const isFarmer = order.items.some(item => item.farmerId.toString() === farmerId.toString());

    if (!isFarmer) {
      throw new Error('You do not have access to this order');
    }

    // Update order with tracking info
    order.trackingNumber = trackingNumber;
    order.carrier = courier || carrierName;

    // Create tracking in AfterShip if configured
    if (aftershipService.isConfigured()) {
      try {
        const aftershipTracking = await aftershipService.createTracking({
          trackingNumber,
          courier,
          title: `Order ${order.orderNumber}`,
          orderId: order._id.toString(),
          customerName: order.buyerId.name,
          emails: [order.buyerId.email],
          customFields: {
            orderNumber: order.orderNumber,
            deliveryAddress: `${order.deliveryAddress.city}, ${order.deliveryAddress.state}`
          }
        });

        order.trackingId = aftershipTracking.data?.tracking?.id;
      } catch (error) {
        console.error('Failed to create AfterShip tracking:', error.message);
        // Continue without AfterShip tracking
      }
    }

    // Update order status to shipped if not already
    if (order.orderStatus !== 'shipped' && order.orderStatus !== 'delivered') {
      order.orderStatus = 'shipped';
    }

    await order.save();

    // Notify buyer
    emitToUser(order.buyerId.toString(), 'order:tracking_added', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      trackingNumber,
      carrier: order.carrier
    });

    return order;
  }

  // Get tracking information
  async getTracking(orderId, userId) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    // Check if user has access
    const isBuyer = order.buyerId.toString() === userId.toString();
    const isFarmer = order.items.some(item => item.farmerId.toString() === userId.toString());

    if (!isBuyer && !isFarmer) {
      throw new Error('You do not have access to this order');
    }

    if (!order.trackingNumber) {
      return {
        hasTracking: false,
        message: 'Tracking information not available yet'
      };
    }

    // If AfterShip is configured, get live tracking
    if (aftershipService.isConfigured() && order.trackingId) {
      try {
        const trackingData = await aftershipService.getTracking(
          order.trackingNumber,
          order.carrier
        );

        const transformedData = aftershipService.transformTrackingData(trackingData);

        return {
          hasTracking: true,
          ...transformedData,
          orderNumber: order.orderNumber,
          orderStatus: order.orderStatus
        };
      } catch (error) {
        console.error('Failed to get AfterShip tracking:', error.message);
      }
    }

    // Return basic tracking info if AfterShip fails or is not configured
    return {
      hasTracking: true,
      trackingNumber: order.trackingNumber,
      carrier: order.carrier,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      checkpoints: [],
      message: 'Tracking details will be updated shortly'
    };
  }

  // Update tracking from AfterShip webhook
  async updateTrackingFromWebhook(webhookData) {
    try {
      const tracking = webhookData.msg;
      const orderId = tracking.order_id;

      if (!orderId) {
        throw new Error('Order ID not found in webhook data');
      }

      const order = await Order.findById(orderId);

      if (!order) {
        throw new Error('Order not found');
      }

      // Update order status based on tracking status
      const newStatus = aftershipService.mapToOrderStatus(tracking.tag);

      if (newStatus !== order.orderStatus) {
        order.orderStatus = newStatus;

        if (newStatus === 'delivered') {
          order.deliveredAt = new Date();
        }

        await order.save();

        // Notify buyer about status update
        emitToUser(order.buyerId.toString(), 'order:tracking_updated', {
          orderId: order._id,
          orderNumber: order.orderNumber,
          status: newStatus,
          trackingStatus: tracking.tag,
          lastCheckpoint: tracking.checkpoints?.[tracking.checkpoints.length - 1]
        });
      }

      return order;
    } catch (error) {
      console.error('Failed to process tracking webhook:', error.message);
      throw error;
    }
  }

  // Cancel order
  async cancelOrder(orderId, userId, reason) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    // Check if user can cancel
    const isBuyer = order.buyerId.toString() === userId.toString();
    const isFarmer = order.items.some(item => item.farmerId.toString() === userId.toString());

    if (!isBuyer && !isFarmer) {
      throw new Error('You do not have access to this order');
    }

    if (order.orderStatus === 'delivered' || order.orderStatus === 'cancelled') {
      throw new Error('Order cannot be cancelled at this stage');
    }

    order.orderStatus = 'cancelled';

    // Refund if payment was completed
    if (order.paymentStatus === 'completed' && order.paymentDetails.razorpayPaymentId) {
      try {
        await createRefund(order.paymentDetails.razorpayPaymentId);
        order.paymentStatus = 'refunded';
      } catch (error) {
        console.error('Refund failed:', error);
        // Continue with cancellation even if refund fails
      }
    }

    // Delete AfterShip tracking if exists
    if (aftershipService.isConfigured() && order.trackingNumber && order.carrier) {
      try {
        await aftershipService.deleteTracking(order.trackingNumber, order.carrier);
      } catch (error) {
        console.error('Failed to delete AfterShip tracking:', error.message);
      }
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: {
          'quantity.available': item.quantity,
          'quantity.sold': -item.quantity
        }
      });
    }

    await order.save();

    // Notify relevant parties
    if (isBuyer) {
      const farmerIds = [...new Set(order.items.map(item => item.farmerId.toString()))];
      for (const farmerId of farmerIds) {
        emitToUser(farmerId, 'order:cancelled', {
          orderId: order._id,
          orderNumber: order.orderNumber
        });
      }
    } else {
      emitToUser(order.buyerId.toString(), 'order:cancelled', {
        orderId: order._id,
        orderNumber: order.orderNumber
      });
    }

    return order;
  }

  // Get order statistics for buyer
  async getBuyerStats(buyerId) {
    const orders = await Order.find({ buyerId });

    const stats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.orderStatus)).length,
      completedOrders: orders.filter(o => o.orderStatus === 'delivered').length,
      cancelledOrders: orders.filter(o => o.orderStatus === 'cancelled').length,
      totalSpent: orders
        .filter(o => o.paymentStatus === 'completed')
        .reduce((sum, o) => sum + o.totalAmount, 0)
    };

    return stats;
  }

  // Get order statistics for farmer
  async getFarmerStats(farmerId) {
    const orders = await Order.find({ 'items.farmerId': farmerId });

    // Calculate farmer's revenue from orders
    let totalRevenue = 0;
    let pendingRevenue = 0;
    let completedRevenue = 0;

    orders.forEach(order => {
      const farmerItems = order.items.filter(item => item.farmerId.toString() === farmerId.toString());
      const orderRevenue = farmerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      if (order.paymentStatus === 'completed') {
        totalRevenue += orderRevenue;
        if (order.orderStatus === 'delivered') {
          completedRevenue += orderRevenue;
        } else {
          pendingRevenue += orderRevenue;
        }
      }
    });

    const stats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.orderStatus)).length,
      completedOrders: orders.filter(o => o.orderStatus === 'delivered').length,
      cancelledOrders: orders.filter(o => o.orderStatus === 'cancelled').length,
      totalRevenue,
      pendingRevenue,
      completedRevenue
    };

    return stats;
  }
}

export default new OrderService();
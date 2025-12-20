// ORDER CONTROLLER

import dotenv from 'dotenv';
import { asyncHandler } from '../middleware/errorHandler.js';
import orderService from '../services/orderService.js';
import { HTTP_STATUS } from '../utils/constants.js';

// Load environment variables
dotenv.config();

class OrderController {
  // Create order
  createOrder = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const orderData = req.body;

    const result = await orderService.createOrder(userId, orderData);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Order created successfully',
      data: result
    });
  });

  // Verify payment
  verifyPayment = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const paymentData = req.body;

    const order = await orderService.verifyPayment(orderId, paymentData);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Payment verified successfully',
      data: { order }
    });
  });

  // Get order by ID
  getOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    const order = await orderService.getOrderById(id, userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { order }
    });
  });

  // Get buyer orders
  getBuyerOrders = asyncHandler(async (req, res) => {
    const buyerId = req.userId;
    const status = req.query.status;

    const orders = await orderService.getBuyerOrders(buyerId, status);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { orders }
    });
  });

  // Get farmer orders
  getFarmerOrders = asyncHandler(async (req, res) => {
    const farmerId = req.userId;
    const status = req.query.status;

    const orders = await orderService.getFarmerOrders(farmerId, status);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { orders }
    });
  });

  // Update order status (farmer)
  updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const farmerId = req.userId;
    const { status, note } = req.body;

    const order = await orderService.updateOrderStatus(id, farmerId, status, note);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  });

  // Add tracking to order (farmer)
  addTracking = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const farmerId = req.userId;
    const trackingData = req.body;

    if (!trackingData.trackingNumber) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Tracking number is required'
      });
    }

    const order = await orderService.addTracking(id, farmerId, trackingData);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Tracking information added successfully',
      data: { order }
    });
  });

  // Get tracking information
  getTracking = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    const tracking = await orderService.getTracking(id, userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { tracking }
    });
  });

  // AfterShip webhook handler
  trackingWebhook = asyncHandler(async (req, res) => {
    const webhookData = req.body;

    try {
      await orderService.updateTrackingFromWebhook(webhookData);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Webhook processed successfully'
      });
    } catch (error) {
      console.error('Webhook processing error:', error);
      // Still return 200 to AfterShip to prevent retries
      res.status(HTTP_STATUS.OK).json({
        success: false,
        message: error.message
      });
    }
  });

  // Cancel order
  cancelOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    const { reason } = req.body;

    const order = await orderService.cancelOrder(id, userId, reason);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });
  });

  // Get buyer statistics
  getBuyerStats = asyncHandler(async (req, res) => {
    const buyerId = req.userId;

    const stats = await orderService.getBuyerStats(buyerId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { stats }
    });
  });

  // Get farmer statistics
  getFarmerStats = asyncHandler(async (req, res) => {
    const farmerId = req.userId;

    const stats = await orderService.getFarmerStats(farmerId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { stats }
    });
  });

  // Get Razorpay key
  getRazorpayKey = asyncHandler(async (req, res) => {
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  });
}

export default new OrderController();
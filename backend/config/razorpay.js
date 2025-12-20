// RAZORPAY CONFIGURATION

import crypto from 'crypto';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';

dotenv.config();

// Initialize Razorpay instance
export const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
export const createRazorpayOrder = async (amount, currency = 'INR', receipt) => {
  try {
    const options = {
      amount: amount * 100, // Amount in paise (multiply by 100)
      currency,
      receipt,
      payment_capture: 1 // Auto capture payment
    };

    const order = await razorpayInstance.orders.create(options);
    return order;
  } catch (error) {
    throw new Error(`Razorpay order creation failed: ${error.message}`);
  }
};

// Verify Razorpay payment signature
export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  try {
    const body = orderId + '|' + paymentId;
    
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    throw new Error(`Signature verification failed: ${error.message}`);
  }
};

// Fetch payment details
export const fetchPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpayInstance.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    throw new Error(`Failed to fetch payment details: ${error.message}`);
  }
};

// Create refund
export const createRefund = async (paymentId, amount = null) => {
  try {
    const refundOptions = {
      payment_id: paymentId
    };

    if (amount) {
      refundOptions.amount = amount * 100; // Amount in paise
    }

    const refund = await razorpayInstance.payments.refund(paymentId, refundOptions);
    return refund;
  } catch (error) {
    throw new Error(`Refund creation failed: ${error.message}`);
  }
};

export default {
  razorpayInstance,
  createRazorpayOrder,
  verifyRazorpaySignature,
  fetchPaymentDetails,
  createRefund
};
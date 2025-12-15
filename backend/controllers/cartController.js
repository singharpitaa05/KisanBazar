// CART CONTROLLERS

import { asyncHandler } from '../middleware/errorHandler.js';
import cartService from '../services/cartService.js';
import { HTTP_STATUS } from '../utils/constants.js';

class CartController {
  // Get user's cart
  getCart = asyncHandler(async (req, res) => {
    const userId = req.userId;

    const cart = await cartService.getCart(userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { cart }
    });
  });

  // Add item to cart
  addToCart = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { productId, quantity } = req.body;

    const cart = await cartService.addToCart(userId, productId, quantity);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Item added to cart',
      data: { cart }
    });
  });

  // Update cart item quantity
  updateCartItem = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await cartService.updateCartItem(userId, productId, quantity);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Cart updated',
      data: { cart }
    });
  });

  // Remove item from cart
  removeFromCart = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { productId } = req.params;

    const cart = await cartService.removeFromCart(userId, productId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Item removed from cart',
      data: { cart }
    });
  });

  // Clear cart
  clearCart = asyncHandler(async (req, res) => {
    const userId = req.userId;

    const cart = await cartService.clearCart(userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Cart cleared',
      data: { cart }
    });
  });

  // Validate cart (before checkout)
  validateCart = asyncHandler(async (req, res) => {
    const userId = req.userId;

    const validation = await cartService.validateCart(userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: validation
    });
  });
}

export default new CartController();
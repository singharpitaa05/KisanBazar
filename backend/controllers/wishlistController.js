// WISHLIST CONTROLLERS

import { asyncHandler } from '../middleware/errorHandler.js';
import wishlistService from '../services/wishlistService.js';
import { HTTP_STATUS } from '../utils/constants.js';

class WishlistController {
  // Get user's wishlist
  getWishlist = asyncHandler(async (req, res) => {
    const userId = req.userId;

    const wishlist = await wishlistService.getWishlist(userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { wishlist }
    });
  });

  // Add product to wishlist
  addToWishlist = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { productId } = req.body;

    const wishlist = await wishlistService.addToWishlist(userId, productId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Product added to wishlist',
      data: { wishlist }
    });
  });

  // Remove product from wishlist
  removeFromWishlist = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { productId } = req.params;

    const wishlist = await wishlistService.removeFromWishlist(userId, productId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Product removed from wishlist',
      data: { wishlist }
    });
  });

  // Check if product is in wishlist
  checkWishlist = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { productId } = req.params;

    const isInWishlist = await wishlistService.isInWishlist(userId, productId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { isInWishlist }
    });
  });

  // Clear wishlist
  clearWishlist = asyncHandler(async (req, res) => {
    const userId = req.userId;

    const wishlist = await wishlistService.clearWishlist(userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Wishlist cleared',
      data: { wishlist }
    });
  });
}

export default new WishlistController();
// WISH LIST SERVICE

import Product from '../models/Product.js';
import Wishlist from '../models/Wishlist.js';

class WishlistService {
  // Get user's wishlist
  async getWishlist(userId) {
    let wishlist = await Wishlist.findOne({ userId }).populate({
      path: 'products.productId',
      select: 'name price unit images status quantity rating farmerId category isOrganic',
      populate: {
        path: 'farmerId',
        select: 'name'
      }
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, products: [] });
    }

    // Filter out products that no longer exist or are inactive
    const validProducts = wishlist.products.filter(item => 
      item.productId && item.productId.status === 'active'
    );

    // Update wishlist if some products were removed
    if (validProducts.length !== wishlist.products.length) {
      wishlist.products = validProducts;
      await wishlist.save();
    }

    return wishlist;
  }

  // Add product to wishlist
  async addToWishlist(userId, productId) {
    // Check if product exists and is active
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.status !== 'active') {
      throw new Error('Product is not available');
    }

    // Get or create wishlist
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, products: [] });
    }

    // Check if product already in wishlist
    if (wishlist.hasProduct(productId)) {
      throw new Error('Product is already in your wishlist');
    }

    await wishlist.addProduct(productId);

    // Populate and return wishlist
    return await Wishlist.findOne({ userId }).populate({
      path: 'products.productId',
      select: 'name price unit images status quantity rating farmerId category isOrganic',
      populate: {
        path: 'farmerId',
        select: 'name'
      }
    });
  }

  // Remove product from wishlist
  async removeFromWishlist(userId, productId) {
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      throw new Error('Wishlist not found');
    }

    await wishlist.removeProduct(productId);

    // Populate and return wishlist
    return await Wishlist.findOne({ userId }).populate({
      path: 'products.productId',
      select: 'name price unit images status quantity rating farmerId category isOrganic',
      populate: {
        path: 'farmerId',
        select: 'name'
      }
    });
  }

  // Check if product is in wishlist
  async isInWishlist(userId, productId) {
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return false;
    }

    return wishlist.hasProduct(productId);
  }

  // Clear wishlist
  async clearWishlist(userId) {
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      throw new Error('Wishlist not found');
    }

    await wishlist.clearWishlist();

    return wishlist;
  }

  // Move wishlist items to cart (helper for bulk operations)
  async moveToCart(userId, productIds) {
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      throw new Error('Wishlist not found');
    }

    const movedItems = [];
    const failedItems = [];

    for (const productId of productIds) {
      try {
        // Remove from wishlist
        await wishlist.removeProduct(productId);
        movedItems.push(productId);
      } catch (error) {
        failedItems.push({ productId, error: error.message });
      }
    }

    return {
      success: movedItems,
      failed: failedItems
    };
  }
}

export default new WishlistService();
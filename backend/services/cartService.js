// CART SERVICES 

import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

class CartService {
  // Get user's cart
  async getCart(userId) {
    let cart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      select: 'name price unit images status quantity farmerId',
      populate: {
        path: 'farmerId',
        select: 'name email phone'
      }
    });

    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    return cart;
  }

  // Add item to cart
  async addToCart(userId, productId, quantity) {
    // Check if product exists and is available
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new Error('Product not found');
    }

    if (product.status !== 'active') {
      throw new Error('Product is not available');
    }

    if (product.quantity.available < quantity) {
      throw new Error(`Only ${product.quantity.available} ${product.unit} available`);
    }

    if (quantity < product.minOrder) {
      throw new Error(`Minimum order quantity is ${product.minOrder} ${product.unit}`);
    }

    // Get or create cart
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    // Add item to cart
    await cart.addItem(productId, quantity, product.price);

    // Populate and return cart
    return await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      select: 'name price unit images status quantity farmerId',
      populate: {
        path: 'farmerId',
        select: 'name email phone'
      }
    });
  }

  // Update cart item quantity
  async updateCartItem(userId, productId, quantity) {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      throw new Error('Cart not found');
    }

    // Check product availability
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new Error('Product not found');
    }

    if (quantity > 0) {
      if (product.quantity.available < quantity) {
        throw new Error(`Only ${product.quantity.available} ${product.unit} available`);
      }

      if (quantity < product.minOrder) {
        throw new Error(`Minimum order quantity is ${product.minOrder} ${product.unit}`);
      }
    }

    await cart.updateItemQuantity(productId, quantity);

    // Populate and return cart
    return await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      select: 'name price unit images status quantity farmerId',
      populate: {
        path: 'farmerId',
        select: 'name email phone'
      }
    });
  }

  // Remove item from cart
  async removeFromCart(userId, productId) {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      throw new Error('Cart not found');
    }

    await cart.removeItem(productId);

    // Populate and return cart
    return await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      select: 'name price unit images status quantity farmerId',
      populate: {
        path: 'farmerId',
        select: 'name email phone'
      }
    });
  }

  // Clear cart
  async clearCart(userId) {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      throw new Error('Cart not found');
    }

    await cart.clearCart();

    return cart;
  }

  // Validate cart items before checkout
  async validateCart(userId) {
    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const errors = [];
    const validItems = [];

    for (const item of cart.items) {
      const product = item.productId;

      if (!product) {
        errors.push({
          message: 'Product not found',
          productId: item.productId
        });
        continue;
      }

      if (product.status !== 'active') {
        errors.push({
          message: `${product.name} is no longer available`,
          productId: product._id
        });
        continue;
      }

      if (product.quantity.available < item.quantity) {
        errors.push({
          message: `${product.name}: Only ${product.quantity.available} ${product.unit} available`,
          productId: product._id,
          availableQuantity: product.quantity.available
        });
        continue;
      }

      if (item.price !== product.price) {
        errors.push({
          message: `${product.name}: Price has changed from ₹${item.price} to ₹${product.price}`,
          productId: product._id,
          oldPrice: item.price,
          newPrice: product.price
        });
      }

      validItems.push(item);
    }

    return {
      isValid: errors.length === 0,
      errors,
      validItems,
      totalItems: validItems.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
  }
}

export default new CartService();
// WISHLIST MODEL

import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    products: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  {
    timestamps: true
  }
);

// Method to add product to wishlist
wishlistSchema.methods.addProduct = function(productId) {
  const exists = this.products.some(
    item => item.productId.toString() === productId.toString()
  );

  if (!exists) {
    this.products.push({ productId });
  }

  return this.save();
};

// Method to remove product from wishlist
wishlistSchema.methods.removeProduct = function(productId) {
  this.products = this.products.filter(
    item => item.productId.toString() !== productId.toString()
  );

  return this.save();
};

// Method to check if product is in wishlist
wishlistSchema.methods.hasProduct = function(productId) {
  return this.products.some(
    item => item.productId.toString() === productId.toString()
  );
};

// Method to clear wishlist
wishlistSchema.methods.clearWishlist = function() {
  this.products = [];
  return this.save();
};

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;
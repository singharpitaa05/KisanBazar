// PRODUCTS MODEL

import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['vegetables', 'fruits', 'grains', 'pulses', 'dairy', 'spices', 'organic', 'others'],
      index: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      enum: ['kg', 'gram', 'liter', 'piece', 'dozen', 'quintal', 'ton'],
      default: 'kg'
    },
    quantity: {
      available: {
        type: Number,
        required: [true, 'Available quantity is required'],
        min: [0, 'Quantity cannot be negative'],
        default: 0
      },
      sold: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    images: [{
      url: {
        type: String,
        required: true
      },
      publicId: {
        type: String,
        required: true
      }
    }],
    // Location where product is available
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      },
      address: String,
      city: String,
      state: String,
      pincode: String
    },
    // Quality & Certifications
    isOrganic: {
      type: Boolean,
      default: false
    },
    certifications: [String],
    // Product status
    status: {
      type: String,
      enum: ['active', 'out_of_stock', 'inactive'],
      default: 'active',
      index: true
    },
    // Ratings and reviews
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    },
    // Harvest/Production date
    harvestDate: {
      type: Date
    },
    // Minimum order quantity
    minOrder: {
      type: Number,
      default: 1,
      min: 1
    },
    // SEO and search
    tags: [String],
    // Views count
    views: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
productSchema.index({ farmerId: 1, status: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ 'location': '2dsphere' });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ createdAt: -1 });

// Virtual for total quantity
productSchema.virtual('totalQuantity').get(function () {
  return this.quantity.available + this.quantity.sold;
});

// Method to check if product is in stock
productSchema.methods.isInStock = function () {
  return this.quantity.available > 0 && this.status === 'active';
};

// Method to update stock
productSchema.methods.updateStock = function (quantitySold) {
  if (quantitySold > this.quantity.available) {
    throw new Error('Insufficient stock');
  }
  
  this.quantity.available -= quantitySold;
  this.quantity.sold += quantitySold;
  
  if (this.quantity.available === 0) {
    this.status = 'out_of_stock';
  }
  
  return this.save();
};

// Method to increment views
productSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// Static method to get products by farmer
productSchema.statics.getByFarmer = function (farmerId, options = {}) {
  const query = { farmerId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 50);
};

// Static method to search products
productSchema.statics.searchProducts = function (searchTerm, filters = {}) {
  const query = {
    $text: { $search: searchTerm },
    status: 'active'
  };
  
  if (filters.category) {
    query.category = filters.category;
  }
  
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = filters.minPrice;
    if (filters.maxPrice) query.price.$lte = filters.maxPrice;
  }
  
  if (filters.isOrganic !== undefined) {
    query.isOrganic = filters.isOrganic;
  }
  
  return this.find(query).sort({ score: { $meta: 'textScore' } });
};

const Product = mongoose.model('Product', productSchema);

export default Product;
// PRODUCT SERIVICE

import { deleteMultipleFromCloudinary, uploadMultipleToCloudinary } from '../config/cloudinary.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

class ProductService {
  // Create new product
  async createProduct(farmerId, productData, imageFiles) {
    // Verify farmer exists
    const farmer = await User.findById(farmerId);
    if (!farmer || farmer.role !== 'farmer') {
      throw new Error('Only farmers can create products');
    }

    // Upload images to Cloudinary
    let images = [];
    if (imageFiles && imageFiles.length > 0) {
      images = await uploadMultipleToCloudinary(imageFiles, 'products');
    }

    // Get farmer's location if not provided
    if (!productData.location && farmer.farmDetails?.location) {
      productData.location = farmer.farmDetails.location;
    }

    // Create product
    const product = await Product.create({
      ...productData,
      farmerId,
      images
    });

    return await product.populate('farmerId', 'name email phone farmDetails rating');
  }

  // Get product by ID
  async getProductById(productId, incrementView = false) {
    const product = await Product.findById(productId)
      .populate('farmerId', 'name email phone profilePhoto farmDetails rating');

    if (!product) {
      throw new Error('Product not found');
    }

    // Increment view count if requested
    if (incrementView) {
      await product.incrementViews();
    }

    return product;
  }

  // Update product
  async updateProduct(productId, farmerId, updateData, newImageFiles) {
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    // Verify ownership
    if (product.farmerId.toString() !== farmerId.toString()) {
      throw new Error('You do not have permission to update this product');
    }

    // Handle image updates
    if (newImageFiles && newImageFiles.length > 0) {
      // Upload new images
      const newImages = await uploadMultipleToCloudinary(newImageFiles, 'products');
      
      // If replacing all images, delete old ones
      if (updateData.replaceImages && product.images.length > 0) {
        const publicIds = product.images.map(img => img.publicId);
        await deleteMultipleFromCloudinary(publicIds);
        updateData.images = newImages;
      } else {
        // Append new images to existing
        updateData.images = [...product.images, ...newImages];
      }
    }

    // Update product fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        product[key] = updateData[key];
      }
    });

    await product.save();
    return await product.populate('farmerId', 'name email phone farmDetails rating');
  }

  // Delete product
  async deleteProduct(productId, farmerId) {
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    // Verify ownership
    if (product.farmerId.toString() !== farmerId.toString()) {
      throw new Error('You do not have permission to delete this product');
    }

    // Delete images from Cloudinary
    if (product.images.length > 0) {
      const publicIds = product.images.map(img => img.publicId);
      await deleteMultipleFromCloudinary(publicIds);
    }

    await Product.findByIdAndDelete(productId);
    return { message: 'Product deleted successfully' };
  }

  // Get all products with filters
  async getAllProducts(filters = {}, page = 1, limit = 20) {
    const query = { status: 'active' };

    // Apply filters
    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.isOrganic !== undefined) {
      query.isOrganic = filters.isOrganic;
    }

    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
      if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
    }

    if (filters.farmerId) {
      query.farmerId = filters.farmerId;
    }

    // Search by name or description
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { tags: { $regex: filters.search, $options: 'i' } }
      ];
    }

    // Location-based search (nearby products)
    if (filters.latitude && filters.longitude && filters.maxDistance) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(filters.longitude), Number(filters.latitude)]
          },
          $maxDistance: Number(filters.maxDistance) * 1000 // Convert km to meters
        }
      };
    }

    // Sorting
    let sort = { createdAt: -1 }; // Default: newest first
    if (filters.sortBy === 'price_asc') sort = { price: 1 };
    if (filters.sortBy === 'price_desc') sort = { price: -1 };
    if (filters.sortBy === 'rating') sort = { 'rating.average': -1 };
    if (filters.sortBy === 'popular') sort = { views: -1 };

    // Pagination
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('farmerId', 'name email phone profilePhoto farmDetails rating')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query)
    ]);

    return {
      products,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    };
  }

  // Get products by farmer
  async getFarmerProducts(farmerId, status = null) {
    const query = { farmerId };
    
    if (status) {
      query.status = status;
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .populate('farmerId', 'name email phone farmDetails rating');

    return products;
  }

  // Update product stock
  async updateStock(productId, farmerId, quantity, operation = 'set') {
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    // Verify ownership
    if (product.farmerId.toString() !== farmerId.toString()) {
      throw new Error('You do not have permission to update this product');
    }

    if (operation === 'set') {
      product.quantity.available = quantity;
    } else if (operation === 'add') {
      product.quantity.available += quantity;
    } else if (operation === 'subtract') {
      if (product.quantity.available < quantity) {
        throw new Error('Insufficient stock');
      }
      product.quantity.available -= quantity;
    }

    // Update status based on availability
    if (product.quantity.available === 0) {
      product.status = 'out_of_stock';
    } else if (product.status === 'out_of_stock') {
      product.status = 'active';
    }

    await product.save();
    return product;
  }

  // Toggle product status
  async toggleProductStatus(productId, farmerId) {
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    // Verify ownership
    if (product.farmerId.toString() !== farmerId.toString()) {
      throw new Error('You do not have permission to update this product');
    }

    if (product.status === 'active') {
      product.status = 'inactive';
    } else if (product.status === 'inactive') {
      product.status = 'active';
    }

    await product.save();
    return product;
  }

  // Delete single image from product
  async deleteProductImage(productId, farmerId, imagePublicId) {
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    // Verify ownership
    if (product.farmerId.toString() !== farmerId.toString()) {
      throw new Error('You do not have permission to update this product');
    }

    // Find and remove image
    const imageIndex = product.images.findIndex(img => img.publicId === imagePublicId);
    
    if (imageIndex === -1) {
      throw new Error('Image not found');
    }

    // Delete from Cloudinary
    await deleteMultipleFromCloudinary([imagePublicId]);

    // Remove from product
    product.images.splice(imageIndex, 1);
    await product.save();

    return product;
  }

  // Get product statistics for farmer
  async getFarmerStats(farmerId) {
    const products = await Product.find({ farmerId });

    const stats = {
      totalProducts: products.length,
      activeProducts: products.filter(p => p.status === 'active').length,
      outOfStock: products.filter(p => p.status === 'out_of_stock').length,
      inactiveProducts: products.filter(p => p.status === 'inactive').length,
      totalViews: products.reduce((sum, p) => sum + p.views, 0),
      averageRating: products.length > 0 
        ? products.reduce((sum, p) => sum + p.rating.average, 0) / products.length 
        : 0,
      totalInventoryValue: products
        .filter(p => p.status === 'active')
        .reduce((sum, p) => sum + (p.price * p.quantity.available), 0)
    };

    return stats;
  }
}

export default new ProductService();
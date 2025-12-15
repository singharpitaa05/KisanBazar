// PRODUCT CONTROLLER

import { asyncHandler } from '../middleware/errorHandler.js';
import productService from '../services/productService.js';
import { HTTP_STATUS } from '../utils/constants.js';

class ProductController {
  // Create new product
  createProduct = asyncHandler(async (req, res) => {
    const farmerId = req.userId;
    const productData = req.body;
    const imageFiles = req.files;

    // Validate that at least one image is provided
    if (!imageFiles || imageFiles.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'At least one product image is required'
      });
    }

    const product = await productService.createProduct(
      farmerId,
      productData,
      imageFiles
    );

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  });

  // Get product by ID
  getProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const incrementView = req.query.view === 'true';

    const product = await productService.getProductById(id, incrementView);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { product }
    });
  });

  // Get all products with filters
  getAllProducts = asyncHandler(async (req, res) => {
    const filters = {
      category: req.query.category,
      isOrganic: req.query.isOrganic === 'true' ? true : req.query.isOrganic === 'false' ? false : undefined,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      farmerId: req.query.farmerId,
      search: req.query.search,
      latitude: req.query.latitude,
      longitude: req.query.longitude,
      maxDistance: req.query.maxDistance,
      sortBy: req.query.sortBy
    };

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await productService.getAllProducts(filters, page, limit);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result
    });
  });

  // Get farmer's products
  getFarmerProducts = asyncHandler(async (req, res) => {
    const farmerId = req.userId;
    const status = req.query.status;

    const products = await productService.getFarmerProducts(farmerId, status);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { products }
    });
  });

  // Update product
  updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const farmerId = req.userId;
    const updateData = req.body;
    const newImageFiles = req.files;

    const product = await productService.updateProduct(
      id,
      farmerId,
      updateData,
      newImageFiles
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  });

  // Delete product
  deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const farmerId = req.userId;

    const result = await productService.deleteProduct(id, farmerId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: result.message
    });
  });

  // Update product stock
  updateStock = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const farmerId = req.userId;
    const { quantity, operation } = req.body;

    if (quantity === undefined || quantity < 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    const product = await productService.updateStock(
      id,
      farmerId,
      quantity,
      operation
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Stock updated successfully',
      data: { product }
    });
  });

  // Toggle product status (active/inactive)
  toggleStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const farmerId = req.userId;

    const product = await productService.toggleProductStatus(id, farmerId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Product ${product.status === 'active' ? 'activated' : 'deactivated'} successfully`,
      data: { product }
    });
  });

  // Delete single image from product
  deleteImage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { publicId } = req.body;
    const farmerId = req.userId;

    if (!publicId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Image public ID is required'
      });
    }

    const product = await productService.deleteProductImage(
      id,
      farmerId,
      publicId
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Image deleted successfully',
      data: { product }
    });
  });

  // Get farmer statistics
  getFarmerStats = asyncHandler(async (req, res) => {
    const farmerId = req.userId;

    const stats = await productService.getFarmerStats(farmerId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { stats }
    });
  });

  // Get products by specific farmer (public route)
  getProductsByFarmer = asyncHandler(async (req, res) => {
    const { farmerId } = req.params;
    const status = req.query.status || 'active';

    const products = await productService.getFarmerProducts(farmerId, status);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { products }
    });
  });
}

export default new ProductController();
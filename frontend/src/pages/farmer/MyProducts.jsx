// MY PRODUCTS PAGE

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import useProductStore from '../../store/productStore.js';

const MyProducts = () => {
  const navigate = useNavigate();
  const { myProducts, isLoading, getMyProducts, deleteProduct, toggleProductStatus, updateStock } = useProductStore();
  const [filter, setFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [stockModal, setStockModal] = useState(null);
  const [stockQuantity, setStockQuantity] = useState('');
  const [stockOperation, setStockOperation] = useState('set');

  useEffect(() => {
    getMyProducts(filter);
  }, [filter, getMyProducts]);

  // Filter products based on status
  const filteredProducts = filter
    ? myProducts.filter(p => p.status === filter)
    : myProducts;

  // Handle delete product
  const handleDelete = async (productId) => {
    try {
      await deleteProduct(productId);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (productId) => {
    try {
      await toggleProductStatus(productId);
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  // Handle stock update
  const handleStockUpdate = async () => {
    if (!stockQuantity || stockQuantity < 0) {
      alert('Please enter a valid quantity');
      return;
    }

    try {
      await updateStock(stockModal._id, parseInt(stockQuantity), stockOperation);
      setStockModal(null);
      setStockQuantity('');
      setStockOperation('set');
    } catch (error) {
      console.error('Failed to update stock:', error);
    }
  };

  if (isLoading && myProducts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading products..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
            <p className="text-gray-600 mt-1">Manage your product listings</p>
          </div>
          <Link to="/add-product">
            <Button variant="primary" size="md">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === ''
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({myProducts.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active ({myProducts.filter(p => p.status === 'active').length})
            </button>
            <button
              onClick={() => setFilter('out_of_stock')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'out_of_stock'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Out of Stock ({myProducts.filter(p => p.status === 'out_of_stock').length})
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'inactive'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Inactive ({myProducts.filter(p => p.status === 'inactive').length})
            </button>
          </div>
        </div>

        {/* Products List */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-600 mb-6">
              {filter ? `No ${filter.replace('_', ' ')} products` : 'Start by adding your first product'}
            </p>
            <Link to="/add-product">
              <Button variant="primary" size="md">
                Add Your First Product
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Product Image */}
                  <div className="md:w-48 h-48 bg-gray-100 shrink-0">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                          {product.isOrganic && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded">
                              Organic
                            </span>
                          )}
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                            product.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : product.status === 'out_of_stock'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {product.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-600 line-clamp-2 mb-3">{product.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Category:</span>
                            <span className="ml-1 font-medium text-gray-900">
                              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Price:</span>
                            <span className="ml-1 font-bold text-green-600">
                              ₹{product.price}/{product.unit}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Available:</span>
                            <span className="ml-1 font-medium text-gray-900">
                              {product.quantity.available} {product.unit}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Sold:</span>
                            <span className="ml-1 font-medium text-gray-900">
                              {product.quantity.sold} {product.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => navigate(`/products/${product._id}`)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/edit-product/${product._id}`)}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setStockModal(product)}
                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                      >
                        Update Stock
                      </button>
                      <button
                        onClick={() => handleToggleStatus(product._id)}
                        className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                          product.status === 'active'
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        disabled={isLoading}
                      >
                        {product.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(product)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "<strong>{deleteConfirm.name}</strong>"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setDeleteConfirm(null)}
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(deleteConfirm._id)}
                  isLoading={isLoading}
                  fullWidth
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Stock Update Modal */}
        {stockModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Update Stock</h3>
              <p className="text-gray-600 mb-4">
                Product: <strong>{stockModal.name}</strong>
              </p>
              <p className="text-gray-600 mb-4">
                Current Available: <strong>{stockModal.quantity.available} {stockModal.unit}</strong>
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Operation</label>
                  <select
                    value={stockOperation}
                    onChange={(e) => setStockOperation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="set">Set to exact quantity</option>
                    <option value="add">Add quantity</option>
                    <option value="subtract">Subtract quantity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="Enter quantity"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStockModal(null);
                    setStockQuantity('');
                    setStockOperation('set');
                  }}
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleStockUpdate}
                  isLoading={isLoading}
                  fullWidth
                >
                  Update
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProducts;
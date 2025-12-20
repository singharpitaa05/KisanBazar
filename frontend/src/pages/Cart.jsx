// CART PAGE

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import useCartStore from '../store/cartStore.js';

const Cart = () => {
  const navigate = useNavigate();
  const { 
    cart, 
    isLoading, 
    getCart, 
    updateCartItem, 
    removeFromCart, 
    clearCart 
  } = useCartStore();

  const [clearConfirm, setClearConfirm] = useState(false);

  useEffect(() => {
    getCart();
  }, [getCart]);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      await updateCartItem(productId, newQuantity);
      toast.success('Cart updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update cart');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await removeFromCart(productId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast.success('Cart cleared');
      setClearConfirm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to clear cart');
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (isLoading && !cart) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading cart..." />
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-1">
              {isEmpty ? 'Your cart is empty' : `${cart.totalItems} items in your cart`}
            </p>
          </div>
          {!isEmpty && (
            <button
              onClick={() => setClearConfirm(true)}
              className="text-red-600 hover:text-red-700 font-medium text-sm"
            >
              Clear Cart
            </button>
          )}
        </div>

        {isEmpty ? (
          /* Empty Cart */
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Start adding products to your cart</p>
            <Link to="/products">
              <Button variant="primary" size="lg">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => {
                const product = item.productId;
                if (!product) return null;

                const isAvailable = product.status === 'active' && product.quantity.available >= item.quantity;

                return (
                  <div key={item._id || product._id} className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <Link to={`/products/${product._id}`} className="shrink-0">
                        <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
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
                      </Link>

                      {/* Product Info */}
                      <div className="flex-1">
                        <Link to={`/products/${product._id}`}>
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors mb-1">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 mb-2">
                          Sold by: {product.farmerId?.name || 'Unknown'}
                        </p>
                        <p className="text-2xl font-bold text-green-600 mb-3">
                          ₹{item.price}
                          <span className="text-sm text-gray-500 font-normal">/{product.unit}</span>
                        </p>

                        {!isAvailable && (
                          <div className="mb-3">
                            <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
                              {product.status !== 'active' ? 'No longer available' : 'Insufficient stock'}
                            </span>
                          </div>
                        )}

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleUpdateQuantity(product._id, item.quantity - 1)}
                              className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                              disabled={isLoading || item.quantity <= (product.minOrder || 1)}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="w-12 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(product._id, item.quantity + 1)}
                              className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                              disabled={isLoading || item.quantity >= product.quantity.available}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(product._id)}
                            className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center space-x-1"
                            disabled={isLoading}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cart.totalItems} items)</span>
                    <span className="font-semibold">₹{cart.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-bold text-green-600">₹{cart.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleCheckout}
                  isLoading={isLoading}
                >
                  Proceed to Checkout
                </Button>

                <Link to="/products">
                  <button className="w-full mt-3 px-4 py-2 text-green-600 font-medium hover:bg-green-50 rounded-lg transition-colors">
                    Continue Shopping
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Clear Cart Confirmation Modal */}
        {clearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Clear Cart?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove all items from your cart? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setClearConfirm(false)}
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleClearCart}
                  isLoading={isLoading}
                  fullWidth
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
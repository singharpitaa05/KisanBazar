// WISHLIST PAGE

import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import ProductCard from '../components/common/ProductCard.jsx';
import useCartStore from '../store/cartStore.js';
import useWishlistStore from '../store/wishlistStore.js';

const Wishlist = () => {
  const { wishlist, isLoading, getWishlist, removeFromWishlist, clearWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();

  useEffect(() => {
    getWishlist();
  }, [getWishlist]);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove from wishlist');
    }
  };

  const handleAddToCart = async (productId, minOrder = 1) => {
    try {
      await addToCart(productId, minOrder);
      toast.success('Added to cart');
      await removeFromWishlist(productId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      try {
        await clearWishlist();
        toast.success('Wishlist cleared');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to clear wishlist');
      }
    }
  };

  if (isLoading && !wishlist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading wishlist..." />
      </div>
    );
  }

  const isEmpty = !wishlist || wishlist.products.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600 mt-1">
              {isEmpty ? 'Your wishlist is empty' : `${wishlist.products.length} items`}
            </p>
          </div>
          {!isEmpty && (
            <button
              onClick={handleClearWishlist}
              className="text-red-600 hover:text-red-700 font-medium text-sm"
              disabled={isLoading}
            >
              Clear Wishlist
            </button>
          )}
        </div>

        {isEmpty ? (
          /* Empty Wishlist */
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Save products you love to come back to later</p>
            <Link to="/products">
              <Button variant="primary" size="lg">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          /* Wishlist Items Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.products.map((item) => {
              const product = item.productId;
              if (!product) return null;

              return (
                <div key={product._id} className="relative">
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(product._id)}
                    className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-red-50 transition-colors group"
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Product Card */}
                  <ProductCard product={product} showFarmer={true} />

                  {/* Add to Cart Button */}
                  {product.status === 'active' && product.quantity.available > 0 && (
                    <div className="mt-3">
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={() => handleAddToCart(product._id, product.minOrder || 1)}
                        isLoading={isLoading}
                        icon={({ className }) => (
                          <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        )}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
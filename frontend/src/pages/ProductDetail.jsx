// PRODUCT DETAILS PAGE

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import StarRating from '../components/common/StarRating.jsx';
import ProductReviews from '../components/reviews/ProductReviews.jsx';
import useAuthStore from '../store/authStore.js';
import useCartStore from '../store/cartStore.js';
import useChatStore from '../store/chatStore.js';
import useProductStore from '../store/productStore.js';
import useWishlistStore from '../store/wishlistStore.js';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { user, isAuthenticated } = useAuthStore();
  const { currentProduct, isLoading, getProductById, clearCurrentProduct } = useProductStore();
  const { addToCart, isLoading: cartLoading } = useCartStore();
  const { isInWishlist, toggleWishlist, isLoading: wishlistLoading } = useWishlistStore();
  const { startConversation, isLoading: chatLoading } = useChatStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const isBuyer = user?.role === 'buyer';
  const inWishlist = isInWishlist(id);

  useEffect(() => {
    getProductById(id, true); // true = increment view

    return () => {
      clearCurrentProduct();
    };
  }, [id, getProductById, clearCurrentProduct]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (!isBuyer) {
      toast.error('Only buyers can add products to cart');
      return;
    }

    try {
      await addToCart(id, quantity);
      toast.success('Added to cart successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      navigate('/login');
      return;
    }

    if (!isBuyer) {
      toast.error('Only buyers can add products to wishlist');
      return;
    }

    try {
      await toggleWishlist(id);
      toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update wishlist');
    }
  };

  const handleContactFarmer = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to chat with the farmer');
      navigate('/login');
      return;
    }

    if (!isBuyer) {
      toast.error('Only buyers can chat with farmers');
      return;
    }

    try {
      const farmerIdToContact = product.farmerId?._id || product.farmerId;
      await startConversation(farmerIdToContact, product._id);
      navigate('/messages');
    } catch (error) {
      console.error('[ProductDetail] Error starting conversation:', error?.response?.data || error);
      toast.error(error.response?.data?.message || 'Failed to start chat');
    }
  };

  if (isLoading && !currentProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading product..." />
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <Link to="/products">
            <Button variant="primary">Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const product = currentProduct;
  const isInStock = product.quantity?.available > 0 && product.status === 'active';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-6">
          <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
          <span className="text-gray-400">/</span>
          <Link to="/products" className="text-gray-500 hover:text-gray-700">Products</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Images Section */}
          <div>
            {/* Main Image */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]?.url}
                  alt={product.name}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
                  <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`bg-white rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-green-600' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            {/* Title and Category */}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full mb-3">
                {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              {/* Rating */}
              {product.rating > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <StarRating rating={product.rating} size="md" />
                  <span className="text-sm font-semibold text-gray-700">
                    {product.rating.toFixed(1)}
                  </span>
                  {product.reviewCount > 0 && (
                    <span className="text-sm text-gray-500">
                      ({product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''})
                    </span>
                  )}
                </div>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {product.isOrganic && (
                  <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded">
                    Organic
                  </span>
                )}
                {!isInStock && (
                  <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold text-green-600">₹{product.price}</span>
                <span className="text-xl text-gray-500">/ {product.unit}</span>
              </div>
              {isInStock && (
                <p className="text-sm text-gray-600 mt-2">
                  Available: <span className="font-semibold">{product.quantity.available} {product.unit}</span>
                </p>
              )}
              {product.minOrder > 1 && (
                <p className="text-sm text-gray-600 mt-1">
                  Minimum order: <span className="font-semibold">{product.minOrder} {product.unit}</span>
                </p>
              )}
            </div>

            {/* Description */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
            </div>

            {/* Quantity Selector and Actions */}
            {isInStock && isBuyer && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity ({product.unit})
                </label>
                <div className="flex items-center space-x-3 mb-4">
                  <button
                    onClick={() => setQuantity(Math.max(product.minOrder, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    disabled={quantity <= product.minOrder}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || product.minOrder;
                      setQuantity(Math.min(Math.max(product.minOrder, val), product.quantity.available));
                    }}
                    className="w-20 text-center px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    min={product.minOrder}
                    max={product.quantity.available}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.quantity.available, quantity + 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    disabled={quantity >= product.quantity.available}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {isBuyer && (
              <div className="flex flex-col sm:flex-row gap-3">
                {isInStock ? (
                  <>
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={handleAddToCart}
                      isLoading={cartLoading}
                      icon={({ className }) => (
                        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      )}
                    >
                      Add to Cart
                    </Button>
                    <button
                      onClick={handleToggleWishlist}
                      disabled={wishlistLoading}
                      className={`px-4 py-3 rounded-lg border-2 transition-all flex items-center justify-center ${
                        inWishlist
                          ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100'
                          : 'border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-600'
                      }`}
                    >
                      <svg
                        className={`w-6 h-6 ${inWishlist ? 'fill-current' : ''}`}
                        fill={inWishlist ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-red-600 font-semibold mb-2">Currently Out of Stock</p>
                    <p className="text-sm text-gray-600">Check back later or contact the farmer</p>
                  </div>
                )}
              </div>
            )}

            {!isAuthenticated && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-blue-800 mb-3">Please login to purchase this product</p>
                <Link to="/login">
                  <Button variant="primary" size="md">Login</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Farmer Info */}
        {product.farmerId && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Seller Information</h2>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  {product.farmerId.profileImage ? (
                    <img
                      src={product.farmerId.profileImage.url}
                      alt={product.farmerId.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-green-700 font-bold text-xl">
                      {product.farmerId.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{product.farmerId.name}</h3>
                  <p className="text-sm text-gray-600">{product.farmerId.email}</p>
                  {product.farmerId.location && (
                    <p className="text-sm text-gray-500 mt-1">
                      📍 {product.farmerId.location.city}, {product.farmerId.location.state}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Link to={`/products?farmerId=${product.farmerId._id}`}>
                  <Button variant="outline" size="sm">
                    View More Products
                  </Button>
                </Link>
                {isBuyer && (
                  <Button
                    onClick={handleContactFarmer}
                    variant="primary"
                    size="sm"
                    isLoading={chatLoading}
                    icon={({ className }) => (
                      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    )}
                  >
                    Chat with Farmer
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <ProductReviews product={product} />
      </div>
    </div>
  );
};

export default ProductDetail;
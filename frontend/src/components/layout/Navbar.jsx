// NAVBAR COMPONENTS

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore.js';
import useCartStore from '../../store/cartStore.js';
import useChatStore from '../../store/chatStore.js';
import useOrderStore from '../../store/orderStore.js';
import useWishlistStore from '../../store/wishlistStore.js';
import Button from '../common/Button.jsx';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { getCartItemCount } = useCartStore();
  const { getWishlistCount } = useWishlistStore();
  const { getUnreadCount } = useChatStore();
  const { orders } = useOrderStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const isBuyer = user?.role === 'buyer';
  const isFarmer = user?.role === 'farmer';
  const cartCount = isAuthenticated ? getCartItemCount() : 0;
  const wishlistCount = isAuthenticated ? getWishlistCount() : 0;
  const unreadMessagesCount = isAuthenticated ? getUnreadCount() : 0;
  
  // Count pending orders for farmers or processing/shipped orders for buyers
  const pendingOrdersCount = orders?.filter(order => {
    if (isFarmer) {
      return ['pending', 'confirmed'].includes(order.orderStatus);
    } else if (isBuyer) {
      return ['processing', 'shipped'].includes(order.orderStatus);
    }
    return false;
  }).length || 0;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">KB</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Kisan Bazar</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
            >
              Products
            </Link>
            <Link 
              to="/about" 
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Desktop Auth Buttons & Icons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && (
              <>
                {/* Orders Icon (Both Roles) */}
                <Link to="/orders" className="relative p-2 text-gray-700 hover:text-green-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {pendingOrdersCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {pendingOrdersCount > 9 ? '9+' : pendingOrdersCount}
                    </span>
                  )}
                </Link>

                {/* Messages Icon (Both Roles) */}
                <Link to="/messages" className="relative p-2 text-gray-700 hover:text-green-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {unreadMessagesCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {/* Buyer Icons (Cart & Wishlist) */}
            {isAuthenticated && isBuyer && (
              <>
                <Link to="/wishlist" className="relative p-2 text-gray-700 hover:text-green-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </Link>

                <Link to="/cart" className="relative p-2 text-gray-700 hover:text-green-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2 hover:bg-gray-200 transition-colors"
                >
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-gray-900 font-medium">{user.name}</span>
                  <svg 
                    className={`w-4 h-4 text-gray-600 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                        {user.role === 'farmer' ? 'Farmer' : 'Buyer'}
                      </span>
                    </div>
                    
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Profile Settings
                    </Link>

                    <Link
                      to="/orders"
                      className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <span>My Orders</span>
                      {pendingOrdersCount > 0 && (
                        <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">
                          {pendingOrdersCount}
                        </span>
                      )}
                    </Link>

                    <Link
                      to="/messages"
                      className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <span>Messages</span>
                      {unreadMessagesCount > 0 && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                          {unreadMessagesCount}
                        </span>
                      )}
                    </Link>
                    
                    {user.role === 'farmer' && (
                      <Link
                        to="/my-products"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        My Products
                      </Link>
                    )}
                    
                    {user.role === 'buyer' && (
                      <>
                        <Link
                          to="/cart"
                          className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <span>My Cart</span>
                          {cartCount > 0 && (
                            <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                              {cartCount}
                            </span>
                          )}
                        </Link>
                        <Link
                          to="/wishlist"
                          className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <span>My Wishlist</span>
                          {wishlistCount > 0 && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                              {wishlistCount}
                            </span>
                          )}
                        </Link>
                      </>
                    )}
                    
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
          >
            {isMobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/products"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            
            {/* Authenticated User Mobile Links */}
            {isAuthenticated && (
              <>
                <Link
                  to="/orders"
                  className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>Orders</span>
                  {pendingOrdersCount > 0 && (
                    <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">
                      {pendingOrdersCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/messages"
                  className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>Messages</span>
                  {unreadMessagesCount > 0 && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                      {unreadMessagesCount}
                    </span>
                  )}
                </Link>
              </>
            )}
            
            {/* Buyer Mobile Links */}
            {isAuthenticated && isBuyer && (
              <>
                <Link
                  to="/cart"
                  className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/wishlist"
                  className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {/* Farmer Mobile Links */}
            {isAuthenticated && isFarmer && (
              <Link
                to="/my-products"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Products
              </Link>
            )}
          </div>

          {/* Mobile Auth Section */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isAuthenticated && user ? (
              <div className="px-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-base font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile Settings
                </Link>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="px-4 space-y-2">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" size="md" fullWidth>
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" size="md" fullWidth>
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
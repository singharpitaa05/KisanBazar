import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Footer from './components/layout/Footer.jsx';
import Navbar from './components/layout/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import GoogleCallback from './pages/auth/GoogleCallback.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AddProduct from './pages/farmer/AddProduct.jsx';
import MyProducts from './pages/farmer/MyProducts.jsx';
import Home from './pages/Home.jsx';
import Messages from './pages/Messages.jsx';
import OrderDetails from './pages/OrderDetails.jsx';
import Orders from './pages/Orders.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Products from './pages/Products.jsx';
import Wishlist from './pages/Wishlist.jsx';
import useAuthStore from './store/authStore.js';
import useCartStore from './store/cartStore.js';
import useChatStore from './store/chatStore.js';
import useOrderStore from './store/orderStore.js';
import useProductStore from './store/productStore.js';
import useWishlistStore from './store/wishlistStore.js';
import { disconnectSocket, initializeSocket } from './utils/socket.js';

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const { subscribeToSocketEvents } = useProductStore();
  const { getCart, clearCartState } = useCartStore();
  const { getWishlist, clearWishlistState } = useWishlistStore();
  const { subscribeToSocketEvents: subscribeToChatEvents } = useChatStore();
  const { subscribeToSocketEvents: subscribeToOrderEvents } = useOrderStore();

  // Initialize socket when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      initializeSocket();
      subscribeToSocketEvents();
      subscribeToChatEvents();
      subscribeToOrderEvents();
      
      // Load cart and wishlist for buyers
      if (user?.role === 'buyer') {
        getCart();
        getWishlist();
      }
    } else {
      disconnectSocket();
      clearCartState();
      clearWishlistState();
    }

    return () => {
      disconnectSocket();
    };
  }, [
    isAuthenticated, 
    user, 
    subscribeToSocketEvents, 
    subscribeToChatEvents,
    subscribeToOrderEvents,
    getCart, 
    getWishlist, 
    clearCartState, 
    clearWishlistState
  ]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/google/success" element={<GoogleCallback />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Farmer Routes */}
            <Route 
              path="/my-products" 
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <MyProducts />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/add-product" 
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <AddProduct />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/edit-product/:id" 
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <PlaceholderPage title="Edit Product" />
                </ProtectedRoute>
              } 
            />

            {/* Buyer Routes */}
            <Route 
              path="/cart" 
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <Cart />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/wishlist" 
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <Wishlist />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <Checkout />
                </ProtectedRoute>
              } 
            />

            {/* Order Routes (Both Farmer & Buyer) */}
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orders/:orderId" 
              element={
                <ProtectedRoute>
                  <OrderDetails />
                </ProtectedRoute>
              } 
            />

            {/* Chat/Messages Route (Both Farmer & Buyer) */}
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } 
            />

            {/* Other Protected Routes */}
            <Route path="/profile" element={<ProtectedRoute><PlaceholderPage title="Profile" /></ProtectedRoute>} />
            <Route path="/about" element={<PlaceholderPage title="About Us" />} />
            <Route path="/contact" element={<PlaceholderPage title="Contact" />} />

            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#363636',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

// Placeholder component for future pages
const PlaceholderPage = ({ title }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 mb-6">This page is coming soon in the next phase!</p>
        <a href="/dashboard" className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Back to Dashboard
        </a>
      </div>
    </div>
  );
};

// 404 Not Found component
const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
        <a href="/" className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Go Home
        </a>
      </div>
    </div>
  );
};

export default App;
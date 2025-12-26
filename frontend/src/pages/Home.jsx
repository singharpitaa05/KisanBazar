// HOME PAGE COMPONENT

import { Link } from 'react-router-dom';
import Button from '../components/common/Button.jsx';
import useAuthStore from '../store/authStore.js';

const Home = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-linear-gradient-to-br from-green-50 to-green-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Fresh From Farm
                <span className="block text-green-600">Direct to Your Door</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl">
                Connecting farmers with consumers. Buy fresh produce directly from local farmers at fair prices. 
                Support sustainable agriculture while enjoying the best quality products.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {isAuthenticated ? (
                  <Link to="/products">
                    <Button variant="primary" size="lg">
                      Browse Products
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/register">
                      <Button variant="primary" size="lg">
                        Get Started
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button variant="outline" size="lg">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=600&fit=crop"
                  alt="Fresh vegetables"
                  className="rounded-2xl shadow-2xl w-full"
                />
              </div>
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Kisan Bazar?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We bridge the gap between farmers and consumers, ensuring fresh produce and fair prices for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-green-50 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fresh & Organic</h3>
              <p className="text-gray-600">
                Get farm-fresh organic produce delivered to your doorstep. No middlemen, just quality products.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-green-50 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fair Pricing</h3>
              <p className="text-gray-600">
                Direct transactions mean better prices for buyers and fair compensation for farmers.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-green-50 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Direct Communication</h3>
              <p className="text-gray-600">
                Chat directly with farmers, negotiate prices, and build lasting relationships.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-green-50 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Payments</h3>
              <p className="text-gray-600">
                Multiple payment options including online and cash on delivery for your convenience.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-green-50 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Order Tracking</h3>
              <p className="text-gray-600">
                Track your orders in real-time from farm to your doorstep with complete transparency.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-green-50 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multilingual Support</h3>
              <p className="text-gray-600">
                Available in multiple Indian languages to serve farmers and buyers across the country.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple steps to connect farmers with buyers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* For Farmers */}
            <div className="bg-white rounded-xl p-8 shadow-md">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  F
                </span>
                For Farmers
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <span className="text-green-600 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Register Your Farm</h4>
                    <p className="text-gray-600 text-sm">Create an account and add your farm details</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">List Your Products</h4>
                    <p className="text-gray-600 text-sm">Upload photos, set prices, and manage inventory</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <span className="text-green-600 font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Receive Orders</h4>
                    <p className="text-gray-600 text-sm">Get notified when buyers place orders</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <span className="text-green-600 font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Deliver & Earn</h4>
                    <p className="text-gray-600 text-sm">Fulfill orders and receive payments directly</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Buyers */}
            <div className="bg-white rounded-xl p-8 shadow-md">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  B
                </span>
                For Buyers
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Browse Products</h4>
                    <p className="text-gray-600 text-sm">Explore fresh produce from local farmers</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Chat & Negotiate</h4>
                    <p className="text-gray-600 text-sm">Communicate directly with farmers</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <span className="text-blue-600 font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Place Order</h4>
                    <p className="text-gray-600 text-sm">Add to cart and checkout securely</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <span className="text-blue-600 font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Track & Receive</h4>
                    <p className="text-gray-600 text-sm">Track delivery and enjoy fresh produce</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;


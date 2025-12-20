// ORDER PAGE

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import useAuthStore from '../store/authStore.js';
import useOrderStore from '../store/orderStore.js';

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { orders, getMyOrders, isLoading } = useOrderStore();

  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    getMyOrders();
  }, [getMyOrders]);

  useEffect(() => {
    if (orders) {
      let filtered = [...orders];

      // Filter by status
      if (selectedStatus !== 'all') {
        filtered = filtered.filter(order => order.orderStatus === selectedStatus);
      }

      // Filter by search query
      if (searchQuery.trim()) {
        filtered = filtered.filter(order => 
          order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.items.some(item => 
            item.productName.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      }

      // Sort by date (newest first)
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setFilteredOrders(filtered);
    }
  }, [orders, selectedStatus, searchQuery]);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const statusFilters = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  if (isLoading && !orders) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading orders..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">
            {user?.role === 'farmer' ? 'Manage your received orders' : 'Track your orders'}
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by order number or product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <svg
                  className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-64">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {statusFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter chips */}
          {(selectedStatus !== 'all' || searchQuery) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-600">Active filters:</span>
              
              {selectedStatus !== 'all' && (
                <button
                  onClick={() => setSelectedStatus('all')}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 hover:bg-green-200"
                >
                  Status: {statusFilters.find(f => f.value === selectedStatus)?.label}
                  <svg className="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 hover:bg-green-200"
                >
                  Search: "{searchQuery}"
                  <svg className="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <svg
              className="mx-auto w-16 h-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedStatus !== 'all'
                ? 'Try adjusting your filters'
                : user?.role === 'farmer'
                ? "You haven't received any orders yet"
                : "You haven't placed any orders yet"}
            </p>
            {user?.role === 'buyer' && (
              <Button onClick={() => navigate('/products')} variant="primary">
                Start Shopping
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div className="mb-2 sm:mb-0">
                      <h3 className="text-lg font-bold text-gray-900">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus === 'completed' ? 'Paid' : 'Payment ' + order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t border-b border-gray-200 py-4 mb-4">
                    <div className="space-y-3">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg shrink-0">
                            {item.productId?.images?.[0] && (
                              <img
                                src={item.productId.images[0].url}
                                alt={item.productName}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {item.productName}
                            </p>
                            <p className="text-sm text-gray-600">
                              Qty: {item.quantity} {item.unit} × ₹{item.price}
                            </p>
                            {user?.role === 'buyer' && item.farmerId && (
                              <p className="text-sm text-gray-500">
                                Farmer: {item.farmerId.name}
                              </p>
                            )}
                            {user?.role === 'farmer' && order.buyerId && (
                              <p className="text-sm text-gray-500">
                                Buyer: {order.buyerId.name}
                              </p>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {order.items.length > 2 && (
                        <p className="text-sm text-gray-600 pl-20">
                          +{order.items.length - 2} more item(s)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-green-600">
                        ₹{order.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {order.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => navigate(`/orders/${order._id}`)}
                        variant="outline"
                      >
                        View Details
                      </Button>
                      
                      {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
                        <Button
                          onClick={() => navigate(`/orders/${order._id}`)}
                          variant="primary"
                        >
                          Track Order
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results count */}
        {filteredOrders.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Showing {filteredOrders.length} of {orders.length} order(s)
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
// ORDER DETAILS PAGE

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import useAuthStore from '../store/authStore.js';
import useChatStore from '../store/chatStore.js';
import useOrderStore from '../store/orderStore.js';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentOrder, getOrderById, updateOrderStatus, isLoading } = useOrderStore();
  const { startConversation } = useChatStore();

  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    if (orderId) {
      getOrderById(orderId);
    }
  }, [orderId, getOrderById]);

  useEffect(() => {
    if (currentOrder) {
      setSelectedStatus(currentOrder.orderStatus);
    }
  }, [currentOrder]);

  const handleStatusUpdate = async () => {
    if (selectedStatus === currentOrder.orderStatus) {
      toast.error('Please select a different status');
      return;
    }

    try {
      await updateOrderStatus(orderId, selectedStatus);
      toast.success('Order status updated successfully');
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const handleContactSeller = async () => {
    if (!currentOrder?.items?.[0]?.farmerId?._id) {
      toast.error('Farmer information not available');
      return;
    }

    try {
      await startConversation(currentOrder.items[0].farmerId._id);
      navigate('/messages');
    } catch (error) {
      toast.error('Failed to start conversation');
    }
  };

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

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  if (isLoading || !currentOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading order details..." />
      </div>
    );
  }

  const isFarmer = user?.role === 'farmer';
  const isBuyer = user?.role === 'buyer';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center text-green-600 hover:text-green-700 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Orders
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
              <p className="text-gray-600 mt-1">Order #{currentOrder.orderNumber}</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(currentOrder.orderStatus)}`}>
                {currentOrder.orderStatus.charAt(0).toUpperCase() + currentOrder.orderStatus.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
              
              <div className="space-y-4">
                {currentOrder.items.map((item, index) => (
                  <div key={index} className="flex space-x-4 pb-4 border-b last:border-b-0 last:pb-0">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg shrink-0">
                      {item.productId?.images?.[0] && (
                        <img
                          src={item.productId.images[0].url}
                          alt={item.productName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900">{item.productName}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Quantity: {item.quantity} {item.unit}
                      </p>
                      <p className="text-sm text-gray-600">
                        Price: ₹{item.price} per {item.unit}
                      </p>
                      {isBuyer && item.farmerId && (
                        <p className="text-sm text-gray-600 mt-1">
                          Farmer: {item.farmerId.name}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{currentOrder.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                  <span>Total</span>
                  <span className="text-green-600">₹{currentOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Address</h2>
              
              <div className="text-gray-700">
                <p className="font-semibold text-gray-900">{currentOrder.deliveryAddress.name}</p>
                <p className="mt-2">{currentOrder.deliveryAddress.addressLine1}</p>
                {currentOrder.deliveryAddress.addressLine2 && (
                  <p>{currentOrder.deliveryAddress.addressLine2}</p>
                )}
                <p>
                  {currentOrder.deliveryAddress.city}, {currentOrder.deliveryAddress.state} {currentOrder.deliveryAddress.pincode}
                </p>
                <p className="mt-2">Phone: {currentOrder.deliveryAddress.phone}</p>
              </div>
            </div>

            {/* Buyer Notes */}
            {currentOrder.buyerNotes && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Buyer Notes</h2>
                <p className="text-gray-700">{currentOrder.buyerNotes}</p>
              </div>
            )}

            {/* Status Update (Farmer Only) */}
            {isFarmer && currentOrder.orderStatus !== 'cancelled' && currentOrder.orderStatus !== 'delivered' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Update Order Status</h2>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  
                  <Button
                    onClick={handleStatusUpdate}
                    variant="primary"
                    isLoading={isLoading}
                    disabled={selectedStatus === currentOrder.orderStatus}
                  >
                    Update Status
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(currentOrder.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-semibold text-gray-900">
                    {currentOrder.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(currentOrder.paymentStatus)}`}>
                    {currentOrder.paymentStatus.charAt(0).toUpperCase() + currentOrder.paymentStatus.slice(1)}
                  </span>
                </div>

                {currentOrder.paymentId && (
                  <div>
                    <p className="text-sm text-gray-600">Payment ID</p>
                    <p className="font-mono text-xs text-gray-900">{currentOrder.paymentId}</p>
                  </div>
                )}

                {currentOrder.trackingId && (
                  <div>
                    <p className="text-sm text-gray-600">Tracking ID</p>
                    <p className="font-mono text-xs text-gray-900">{currentOrder.trackingId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Actions</h2>
              
              <div className="space-y-3">
                {isBuyer && currentOrder.items?.[0]?.farmerId && (
                  <Button
                    onClick={handleContactSeller}
                    variant="outline"
                    fullWidth
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Contact Farmer
                  </Button>
                )}

                {isFarmer && currentOrder.buyerId && (
                  <Button
                    onClick={() => {
                      startConversation(currentOrder.buyerId._id);
                      navigate('/messages');
                    }}
                    variant="outline"
                    fullWidth
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Contact Buyer
                  </Button>
                )}

                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  fullWidth
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Invoice
                </Button>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Timeline</h2>
              
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                <div className="space-y-6">
                  <div className="relative flex items-start">
                    <div className="absolute left-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-12">
                      <p className="font-semibold text-gray-900">Order Placed</p>
                      <p className="text-sm text-gray-600">
                        {new Date(currentOrder.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {currentOrder.orderStatus !== 'pending' && (
                    <div className="relative flex items-start">
                      <div className="absolute left-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-12">
                        <p className="font-semibold text-gray-900">Order Confirmed</p>
                        <p className="text-sm text-gray-600">Processing started</p>
                      </div>
                    </div>
                  )}

                  {['processing', 'shipped', 'delivered'].includes(currentOrder.orderStatus) && (
                    <div className="relative flex items-start">
                      <div className="absolute left-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-12">
                        <p className="font-semibold text-gray-900">Processing</p>
                        <p className="text-sm text-gray-600">Order is being prepared</p>
                      </div>
                    </div>
                  )}

                  {['shipped', 'delivered'].includes(currentOrder.orderStatus) && (
                    <div className="relative flex items-start">
                      <div className="absolute left-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-12">
                        <p className="font-semibold text-gray-900">Shipped</p>
                        <p className="text-sm text-gray-600">Order is on the way</p>
                      </div>
                    </div>
                  )}

                  {currentOrder.orderStatus === 'delivered' && (
                    <div className="relative flex items-start">
                      <div className="absolute left-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-12">
                        <p className="font-semibold text-gray-900">Delivered</p>
                        <p className="text-sm text-gray-600">Order completed</p>
                      </div>
                    </div>
                  )}

                  {currentOrder.orderStatus === 'cancelled' && (
                    <div className="relative flex items-start">
                      <div className="absolute left-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-12">
                        <p className="font-semibold text-gray-900">Cancelled</p>
                        <p className="text-sm text-gray-600">Order was cancelled</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
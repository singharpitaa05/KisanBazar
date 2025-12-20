// CHECKOUT PAGE

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import useAuthStore from '../store/authStore.js';
import useCartStore from '../store/cartStore.js';
import useOrderStore from '../store/orderStore.js';

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { cart, validateCart, clearCart, isLoading: cartLoading } = useCartStore();
  const { createOrder, verifyPayment, getRazorpayKey, isLoading: orderLoading } = useOrderStore();

  const [deliveryAddress, setDeliveryAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('online');
  const [buyerNotes, setBuyerNotes] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [isValidating, setIsValidating] = useState(true);
  const [cartValidation, setCartValidation] = useState(null);

  useEffect(() => {
    const validateCartItems = async () => {
      try {
        const validation = await validateCart();
        setCartValidation(validation);
        
        if (!validation.isValid) {
          toast.error('Some items in your cart are no longer available');
        }
      } catch (error) {
        toast.error('Failed to validate cart');
        navigate('/cart');
      } finally {
        setIsValidating(false);
      }
    };

    validateCartItems();
  }, [validateCart, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryAddress(prev => ({ ...prev, [name]: value }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!deliveryAddress.name.trim()) errors.name = 'Name is required';
    if (!deliveryAddress.phone.trim()) errors.phone = 'Phone is required';
    if (!/^[0-9]{10}$/.test(deliveryAddress.phone)) errors.phone = 'Invalid phone number';
    if (!deliveryAddress.addressLine1.trim()) errors.addressLine1 = 'Address is required';
    if (!deliveryAddress.city.trim()) errors.city = 'City is required';
    if (!deliveryAddress.state.trim()) errors.state = 'State is required';
    if (!deliveryAddress.pincode.trim()) errors.pincode = 'Pincode is required';
    if (!/^[0-9]{6}$/.test(deliveryAddress.pincode)) errors.pincode = 'Invalid pincode';

    return errors;
  };

  const handleRazorpayPayment = async (order, razorpayOrder) => {
    const res = await loadRazorpayScript();

    if (!res) {
      toast.error('Razorpay SDK failed to load');
      return;
    }

    const razorpayKey = await getRazorpayKey();

    const options = {
      key: razorpayKey,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: 'Kisan Bazar',
      description: `Order #${order.orderNumber}`,
      order_id: razorpayOrder.id,
      handler: async function (response) {
        try {
          await verifyPayment(order._id, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });

          await clearCart();
          toast.success('Payment successful!');
          navigate(`/orders/${order._id}`);
        } catch (error) {
          toast.error('Payment verification failed');
          navigate(`/orders/${order._id}`);
        }
      },
      prefill: {
        name: deliveryAddress.name,
        email: user.email,
        contact: deliveryAddress.phone
      },
      theme: {
        color: '#16a34a'
      }
    };

    const paymentObject = new window.Razorpay(options);
    
    paymentObject.on('payment.failed', function (response) {
      toast.error('Payment failed. Please try again.');
    });

    paymentObject.open();
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!cartValidation?.isValid) {
      toast.error('Please review your cart before placing order');
      return;
    }

    try {
      const orderData = {
        deliveryAddress,
        paymentMethod,
        buyerNotes
      };

      const result = await createOrder(orderData);
      const { order, razorpayOrder } = result.data;

      if (paymentMethod === 'online' && razorpayOrder) {
        await handleRazorpayPayment(order, razorpayOrder);
      } else {
        // COD order
        await clearCart();
        toast.success('Order placed successfully!');
        navigate(`/orders/${order._id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    }
  };

  if (isValidating || !cart) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Validating cart..." />
      </div>
    );
  }

  if (cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Address</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={deliveryAddress.name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          formErrors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={deliveryAddress.phone}
                        onChange={handleInputChange}
                        maxLength="10"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          formErrors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.phone && <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={deliveryAddress.addressLine1}
                      onChange={handleInputChange}
                      placeholder="House No., Building Name"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        formErrors.addressLine1 ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.addressLine1 && <p className="mt-1 text-sm text-red-600">{formErrors.addressLine1}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={deliveryAddress.addressLine2}
                      onChange={handleInputChange}
                      placeholder="Road Name, Area, Colony"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={deliveryAddress.city}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          formErrors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.city && <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={deliveryAddress.state}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          formErrors.state ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.state && <p className="mt-1 text-sm text-red-600">{formErrors.state}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={deliveryAddress.pincode}
                        onChange={handleInputChange}
                        maxLength="6"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          formErrors.pincode ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.pincode && <p className="mt-1 text-sm text-red-600">{formErrors.pincode}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
                
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-3 flex-1">
                      <span className="block font-medium text-gray-900">Online Payment</span>
                      <span className="block text-sm text-gray-500">Pay securely using Razorpay (Cards, UPI, Wallets)</span>
                    </span>
                  </label>

                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-3 flex-1">
                      <span className="block font-medium text-gray-900">Cash on Delivery</span>
                      <span className="block text-sm text-gray-500">Pay when you receive the order</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Notes (Optional)</h2>
                <textarea
                  value={buyerNotes}
                  onChange={(e) => setBuyerNotes(e.target.value)}
                  rows="3"
                  placeholder="Any special instructions for delivery..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                {/* Cart Items */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cart.items.map((item) => {
                    const product = item.productId;
                    return (
                      <div key={item._id || product._id} className="flex space-x-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg shrink-0">
                          {product.images?.[0] && (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                          <p className="text-xs text-gray-500">{item.quantity} × ₹{item.price}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 mb-6 pb-6 border-t border-b border-gray-200 py-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cart.totalItems} items)</span>
                    <span className="font-semibold">₹{cart.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2">
                    <span>Total</span>
                    <span className="text-green-600">₹{cart.totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={orderLoading || cartLoading}
                >
                  {paymentMethod === 'online' ? 'Proceed to Payment' : 'Place Order'}
                </Button>

                <p className="mt-4 text-xs text-gray-500 text-center">
                  By placing this order, you agree to our Terms & Conditions
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
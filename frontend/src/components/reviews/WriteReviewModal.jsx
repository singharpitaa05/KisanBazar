// WRITE REVIEW MODAL COMPONENT

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useReviewStore from '../../store/reviewStore.js';
import Button from '../common/Button.jsx';
import StarRating from '../common/StarRating.jsx';

const WriteReviewModal = ({ isOpen, onClose, product, eligibleOrders }) => {
  const { createReview, isLoading } = useReviewStore();
  
  const [formData, setFormData] = useState({
    orderId: '',
    rating: 0,
    comment: '',
    images: []
  });
  
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (eligibleOrders && eligibleOrders.length > 0) {
      setFormData(prev => ({ ...prev, orderId: eligibleOrders[0].orderId }));
    }
  }, [eligibleOrders]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + imagePreviews.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 5MB`);
        return false;
      }
      return true;
    });

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.orderId) {
      newErrors.orderId = 'Please select an order';
    }
    if (formData.rating === 0) {
      newErrors.rating = 'Please select a rating';
    }
    if (!formData.comment.trim()) {
      newErrors.comment = 'Please write a review';
    }
    if (formData.comment.length < 10) {
      newErrors.comment = 'Review must be at least 10 characters';
    }
    if (formData.comment.length > 1000) {
      newErrors.comment = 'Review must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await createReview({
        productId: product._id,
        orderId: formData.orderId,
        rating: formData.rating,
        comment: formData.comment,
        images: formData.images
      });

      toast.success('Review submitted successfully!');
      onClose();
      
      // Reset form
      setFormData({
        orderId: eligibleOrders[0]?.orderId || '',
        rating: 0,
        comment: '',
        images: []
      });
      setImagePreviews([]);
      setErrors({});
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Write a Review</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Product Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-100 rounded-lg shrink-0">
              {product.images?.[0] && (
                <img
                  src={product.images[0].url}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-600">{product.category}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Order Selection */}
          {eligibleOrders && eligibleOrders.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Order <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.orderId}
                onChange={(e) => setFormData(prev => ({ ...prev, orderId: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.orderId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {eligibleOrders.map(order => (
                  <option key={order.orderId} value={order.orderId}>
                    Order #{order.orderNumber} - {new Date(order.deliveredAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
              {errors.orderId && <p className="mt-1 text-sm text-red-600">{errors.orderId}</p>}
            </div>
          )}

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating <span className="text-red-500">*</span>
            </label>
            <StarRating
              rating={formData.rating}
              onRatingChange={(rating) => {
                setFormData(prev => ({ ...prev, rating }));
                setErrors(prev => ({ ...prev, rating: '' }));
              }}
              size="lg"
              interactive={true}
              showValue={true}
            />
            {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating}</p>}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, comment: e.target.value }));
                setErrors(prev => ({ ...prev, comment: '' }));
              }}
              rows="5"
              placeholder="Share your experience with this product..."
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.comment ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <div className="flex justify-between mt-1">
              {errors.comment ? (
                <p className="text-sm text-red-600">{errors.comment}</p>
              ) : (
                <p className="text-sm text-gray-500">Minimum 10 characters</p>
              )}
              <p className="text-sm text-gray-500">{formData.comment.length}/1000</p>
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Photos (Optional)
            </label>
            
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {imagePreviews.length < 5 && (
              <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                <div className="flex flex-col items-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm text-gray-500">Add photos ({5 - imagePreviews.length} left)</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
            <p className="mt-1 text-xs text-gray-500">Max 5 images, 5MB each</p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              Submit Review
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WriteReviewModal;
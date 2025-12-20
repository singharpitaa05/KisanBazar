// PRODUCTION REVIEWS COMPONENT

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore.js';
import useReviewStore from '../../store/reviewStore.js';
import Button from '../common/Button.jsx';
import Loader from '../common/Loader.jsx';
import StarRating from '../common/StarRating.jsx';
import WriteReviewModal from './WriteReviewModal.jsx';

const ProductReviews = ({ product }) => {
  const { user, isAuthenticated } = useAuthStore();
  const {
    reviews,
    reviewStats,
    pagination,
    isLoading,
    getProductReviews,
    getReviewStats,
    canReview: checkCanReview,
    markHelpful,
    respondToReview
  } = useReviewStore();

  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [canWriteReview, setCanWriteReview] = useState(false);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState('');

  const isBuyer = user?.role === 'buyer';
  const isFarmer = user?.role === 'farmer';
  const isOwner = isFarmer && product.farmerId?._id === user?._id;

  useEffect(() => {
    if (product?._id) {
      loadReviews();
      loadStats();
    }
  }, [product?._id, selectedRatingFilter, sortBy]);

  useEffect(() => {
    if (isBuyer && product?._id) {
      checkEligibility();
    }
  }, [isBuyer, product?._id]);

  const loadReviews = async () => {
    const params = { sortBy };
    if (selectedRatingFilter) {
      params.rating = selectedRatingFilter;
    }
    await getProductReviews(product._id, params);
  };

  const loadStats = async () => {
    await getReviewStats(product._id);
  };

  const checkEligibility = async () => {
    try {
      const result = await checkCanReview(product._id);
      setCanWriteReview(result.canReview);
      setEligibleOrders(result.eligibleOrders || []);
    } catch (error) {
      console.error('Failed to check eligibility:', error);
    }
  };

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      toast.error('Please login to write a review');
      return;
    }
    if (!canWriteReview) {
      toast.error('You can only review products you have purchased');
      return;
    }
    setIsWriteModalOpen(true);
  };

  const handleMarkHelpful = async (reviewId) => {
    if (!isAuthenticated) {
      toast.error('Please login to vote');
      return;
    }

    try {
      await markHelpful(reviewId);
    } catch (error) {
      toast.error('Failed to mark as helpful');
    }
  };

  const handleSubmitResponse = async (reviewId) => {
    if (!responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      await respondToReview(reviewId, responseText);
      toast.success('Response added successfully');
      setRespondingTo(null);
      setResponseText('');
    } catch (error) {
      toast.error('Failed to add response');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (isLoading && !reviews.length) {
    return (
      <div className="py-8 flex justify-center">
        <Loader size="lg" text="Loading reviews..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      {reviewStats && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Overall Rating */}
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <div className="text-5xl font-bold text-gray-900">
                {reviewStats.averageRating.toFixed(1)}
              </div>
              <StarRating rating={reviewStats.averageRating} size="lg" />
              <p className="text-gray-600">
                Based on {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''}
              </p>
              
              {isBuyer && canWriteReview && (
                <Button onClick={handleWriteReview} variant="primary" size="sm">
                  Write a Review
                </Button>
              )}
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviewStats.distribution[rating] || 0;
                const percentage = reviewStats.percentage[rating] || 0;
                
                return (
                  <button
                    key={rating}
                    onClick={() => setSelectedRatingFilter(selectedRatingFilter === rating ? null : rating)}
                    className={`w-full flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors ${
                      selectedRatingFilter === rating ? 'bg-green-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1 w-20">
                      <span className="text-sm font-medium text-gray-700">{rating}</span>
                      <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filters & Sort */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            {selectedRatingFilter && (
              <button
                onClick={() => setSelectedRatingFilter(null)}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm hover:bg-green-200 transition-colors"
              >
                <span>{selectedRatingFilter} stars</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="createdAt">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating">Highest Rating</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <svg className="mx-auto w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-600 mb-6">
            {selectedRatingFilter 
              ? `No ${selectedRatingFilter}-star reviews found`
              : 'Be the first to review this product'
            }
          </p>
          {isBuyer && canWriteReview && !selectedRatingFilter && (
            <Button onClick={handleWriteReview} variant="primary">
              Write the First Review
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-xl shadow-md p-6">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                    {review.buyerId?.profileImage ? (
                      <img
                        src={review.buyerId.profileImage.url}
                        alt={review.buyerId.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-green-600 font-semibold text-lg">
                        {review.buyerId?.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{review.buyerId?.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={review.rating} size="sm" />
                      {review.verified && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
              </div>

              {/* Review Content */}
              <p className="text-gray-700 mb-4">{review.comment}</p>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
                  {review.images.map((image, index) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={`Review ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                    />
                  ))}
                </div>
              )}

              {/* Helpful Button */}
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => handleMarkHelpful(review._id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                    review.isMarkedHelpful
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-green-500 text-gray-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  <span className="text-sm">Helpful ({review.helpful || 0})</span>
                </button>

                {isOwner && !review.response && (
                  <button
                    onClick={() => setRespondingTo(review._id)}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Respond
                  </button>
                )}
              </div>

              {/* Farmer Response Form */}
              {respondingTo === review._id && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Write your response..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-2"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSubmitResponse(review._id)}
                      variant="primary"
                      size="sm"
                    >
                      Submit Response
                    </Button>
                    <Button
                      onClick={() => {
                        setRespondingTo(null);
                        setResponseText('');
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Farmer Response Display */}
              {review.response && (
                <div className="mt-4 pl-4 border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-gray-900">
                      Response from {review.response.respondedBy?.name || 'Farmer'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(review.response.respondedAt)}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.response.comment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        product={product}
        eligibleOrders={eligibleOrders}
      />
    </div>
  );
};

export default ProductReviews;
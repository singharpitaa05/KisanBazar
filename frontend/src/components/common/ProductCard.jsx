// PRODUCT CARD COMPONENT

import { Link } from 'react-router-dom';

const ProductCard = ({ product, showFarmer = true }) => {
  const {
    _id,
    name,
    description,
    price,
    unit,
    quantity,
    images,
    category,
    isOrganic,
    rating,
    status,
    farmerId
  } = product;

  // Check if product is in stock
  const isInStock = quantity?.available > 0 && status === 'active';

  // Get category display name
  const getCategoryDisplay = (cat) => {
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  return (
    <Link to={`/products/${_id}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group h-full flex flex-col">
        {/* Image Section */}
        <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-100">
          {images && images.length > 0 ? (
            <img
              src={images[0].url}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isOrganic && (
              <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded shadow-md">
                Organic
              </span>
            )}
            {!isInStock && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded shadow-md">
                Out of Stock
              </span>
            )}
          </div>

          {/* Category Badge */}
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 bg-white bg-opacity-90 text-gray-800 text-xs font-medium rounded shadow-md">
              {getCategoryDisplay(category)}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Product Name */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
            {name}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
            {description}
          </p>

          {/* Price and Stock */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-2xl font-bold text-green-600">
                ₹{price}
                <span className="text-sm text-gray-500 font-normal">/{unit}</span>
              </p>
            </div>
            {isInStock && (
              <div className="text-right">
                <p className="text-xs text-gray-500">Available</p>
                <p className="text-sm font-semibold text-gray-700">
                  {quantity.available} {unit}
                </p>
              </div>
            )}
          </div>

          {/* Rating */}
          {rating && rating.count > 0 && (
            <div className="flex items-center space-x-1 mb-3">
              <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <span className="text-sm font-semibold text-gray-700">
                {rating.average.toFixed(1)}
              </span>
              <span className="text-xs text-gray-500">
                ({rating.count} reviews)
              </span>
            </div>
          )}

          {/* Farmer Info */}
          {showFarmer && farmerId && (
            <div className="pt-3 border-t border-gray-200 flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                {farmerId.profilePhoto ? (
                  <img
                    src={farmerId.profilePhoto}
                    alt={farmerId.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-green-700 font-semibold text-sm">
                    {farmerId.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Sold by</p>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {farmerId.name}
                </p>
              </div>
              {farmerId.rating && farmerId.rating.average > 0 && (
                <div className="flex items-center space-x-1">
                  <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">
                    {farmerId.rating.average.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
// ADD PRODEUCT PAGE FOR FARMER

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import ImageUpload from '../../components/common/ImageUpload.jsx';
import Input from '../../components/common/Input.jsx';
import useAuthStore from '../../store/authStore.js';
import useProductStore from '../../store/productStore.js';
import { PRODUCT_CATEGORIES } from '../../utils/constants.js';

const AddProduct = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createProduct, isLoading, error, clearError } = useProductStore();

  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    unit: 'kg',
    'quantity.available': '',
    minOrder: '1',
    isOrganic: false,
    tags: '',
    harvestDate: '',
    certifications: '',
    'location.address': user?.farmDetails?.farmAddress || '',
    'location.city': '',
    'location.state': '',
    'location.pincode': ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    clearError();
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = 'Product name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.price || formData.price <= 0) errors.price = 'Valid price is required';
    if (!formData['quantity.available'] || formData['quantity.available'] < 0) {
      errors['quantity.available'] = 'Valid quantity is required';
    }
    if (images.length === 0) errors.images = 'At least one image is required';

    return errors;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Append text fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '' && formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append images
      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      await createProduct(formDataToSend);
      navigate('/my-products');
    } catch (err) {
      console.error('Failed to create product:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600 mt-2">Fill in the details to list your product</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <svg className="w-5 h-5 text-red-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
          {/* Product Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images <span className="text-red-500">*</span>
            </label>
            <ImageUpload images={images} setImages={setImages} maxImages={5} />
            {formErrors.images && (
              <p className="mt-2 text-sm text-red-600">{formErrors.images}</p>
            )}
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h2>

            <Input
              label="Product Name"
              name="name"
              placeholder="e.g., Fresh Tomatoes"
              value={formData.name}
              onChange={handleChange}
              error={formErrors.name}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                rows="4"
                placeholder="Describe your product, quality, harvest details, etc."
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  formErrors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    formErrors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Category</option>
                  {PRODUCT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
                {formErrors.category && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
                )}
              </div>

              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  id="isOrganic"
                  name="isOrganic"
                  checked={formData.isOrganic}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="isOrganic" className="ml-2 block text-sm text-gray-700">
                  Organic Product
                </label>
              </div>
            </div>
          </div>

          {/* Pricing & Quantity */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Pricing & Quantity</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Price"
                type="number"
                name="price"
                placeholder="0"
                value={formData.price}
                onChange={handleChange}
                error={formErrors.price}
                required
                min="0"
                step="0.01"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="gram">Gram (g)</option>
                  <option value="liter">Liter (L)</option>
                  <option value="piece">Piece</option>
                  <option value="dozen">Dozen</option>
                  <option value="quintal">Quintal</option>
                  <option value="ton">Ton</option>
                </select>
              </div>

              <Input
                label="Available Quantity"
                type="number"
                name="quantity.available"
                placeholder="0"
                value={formData['quantity.available']}
                onChange={handleChange}
                error={formErrors['quantity.available']}
                required
                min="0"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Minimum Order Quantity"
                type="number"
                name="minOrder"
                placeholder="1"
                value={formData.minOrder}
                onChange={handleChange}
                min="1"
              />

              <Input
                label="Harvest Date"
                type="date"
                name="harvestDate"
                value={formData.harvestDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h2>

            <Input
              label="Tags (comma separated)"
              name="tags"
              placeholder="e.g., fresh, organic, local"
              value={formData.tags}
              onChange={handleChange}
            />

            <Input
              label="Certifications (comma separated)"
              name="certifications"
              placeholder="e.g., Organic Certificate, Quality Assured"
              value={formData.certifications}
              onChange={handleChange}
            />
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Location</h2>

            <Input
              label="Address"
              name="location.address"
              placeholder="Farm address"
              value={formData['location.address']}
              onChange={handleChange}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="City"
                name="location.city"
                placeholder="City"
                value={formData['location.city']}
                onChange={handleChange}
              />

              <Input
                label="State"
                name="location.state"
                placeholder="State"
                value={formData['location.state']}
                onChange={handleChange}
              />

              <Input
                label="Pincode"
                name="location.pincode"
                placeholder="Pincode"
                value={formData['location.pincode']}
                onChange={handleChange}
                maxLength="6"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => navigate(-1)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              Add Product
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
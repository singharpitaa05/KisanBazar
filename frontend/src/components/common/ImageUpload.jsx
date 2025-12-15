// UPLOAD IMAGE COMPONENT

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const ImageUpload = ({ 
  images = [], 
  setImages, 
  maxImages = 5, 
  existingImages = [],
  onDeleteExisting 
}) => {
  const [previews, setPreviews] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    // Filter to max images
    const remainingSlots = maxImages - images.length - existingImages.length;
    const filesToAdd = acceptedFiles.slice(0, remainingSlots);

    // Update images state
    setImages([...images, ...filesToAdd]);

    // Create preview URLs
    const newPreviews = filesToAdd.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setPreviews([...previews, ...newPreviews]);
  }, [images, previews, maxImages, existingImages, setImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: true,
    disabled: images.length + existingImages.length >= maxImages
  });

  // Remove new image
  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    // Revoke object URL
    URL.revokeObjectURL(previews[index].preview);
    
    setImages(newImages);
    setPreviews(newPreviews);
  };

  // Remove existing image
  const removeExistingImage = (publicId, index) => {
    if (onDeleteExisting) {
      onDeleteExisting(publicId, index);
    }
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      {images.length + existingImages.length < maxImages && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-3">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div>
              <p className="text-sm text-gray-600 mb-1">
                {isDragActive ? 'Drop images here' : 'Drag & drop images here, or click to select'}
              </p>
              <p className="text-xs text-gray-500">
                Max {maxImages} images, up to 5MB each (JPEG, PNG, WebP)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Image Previews */}
      {(existingImages.length > 0 || previews.length > 0) && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Images ({existingImages.length + images.length}/{maxImages})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* Existing Images */}
            {existingImages.map((image, index) => (
              <div key={`existing-${index}`} className="relative group">
                <img
                  src={image.url}
                  alt={`Product ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(image.publicId, index)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded">
                  Existing
                </div>
              </div>
            ))}

            {/* New Images */}
            {previews.map((preview, index) => (
              <div key={`new-${index}`} className="relative group">
                <img
                  src={preview.preview}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-green-200"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded">
                  New
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Text */}
      {images.length + existingImages.length >= maxImages && (
        <p className="mt-3 text-sm text-orange-600 text-center">
          Maximum number of images reached ({maxImages})
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
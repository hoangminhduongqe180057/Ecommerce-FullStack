import { useState, useEffect } from 'react';
import type { Product } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProductForm({ product, onSubmit, onCancel, isLoading }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    imageUrl: product?.imageUrl || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        imageUrl: product.imageUrl || '',
      });
    }
  }, [product]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    const price = parseFloat(formData.price);
    if (!formData.price || price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    } else if (price < 15000) {
      newErrors.price = 'Price must be at least 15,000 VND (Stripe payment requirement)';
    }

    if (formData.imageUrl && !/^https?:\/\/.+/.test(formData.imageUrl)) {
      newErrors.imageUrl = 'Image URL must be a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onSubmit({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        imageUrl: formData.imageUrl,
      });
    } catch (error) {
      console.error('Failed to submit:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Product Name"
        name="name"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name}
        required
        disabled={isLoading}
      />

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          disabled={isLoading}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          required
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div>
        <Input
          label="Price (VND)"
          name="price"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => handleChange('price', e.target.value)}
          error={errors.price}
          required
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500 mt-1">Minimum price: 15,000 VND (Stripe payment requirement)</p>
      </div>

      <Input
        label="Image URL"
        name="imageUrl"
        type="url"
        value={formData.imageUrl}
        onChange={(e) => handleChange('imageUrl', e.target.value)}
        error={errors.imageUrl}
        disabled={isLoading}
      />
      <p className="text-xs text-gray-500 mt-1">Optional: Enter a valid image URL (https://...)</p>

      {formData.imageUrl && !errors.imageUrl && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Image Preview:</p>
          <img
            src={formData.imageUrl}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
            }}
          />
        </div>
      )}

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
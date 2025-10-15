// src/components/products/ProductDetail.tsx
import { useState } from 'react'
import type { Product } from '../../types'
import { Button, Card } from '../common'

interface ProductDetailProps {
  product: Product
  onAddToCart?: (productId: string, quantity: number, size?: string, color?: string) => void
}

export default function ProductDetail({ product, onAddToCart }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [isAdding, setIsAdding] = useState(false)

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    // Đã xóa giới hạn số lượng theo stock
    if (newQuantity >= 1) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = async () => {
    if (onAddToCart) {
      setIsAdding(true)
      try {
        await onAddToCart(product.id, quantity, selectedSize, selectedColor)
        // Reset selections
        setQuantity(1)
      } catch (error) {
        console.error('Error adding to cart:', error)
      } finally {
        setIsAdding(false)
      }
    }
  }

  const canAddToCart = () => {
    // Đã xóa điều kiện kiểm tra stock
    if (product.size && product.size.length > 0 && !selectedSize) return false
    if (product.color && product.color.length > 0 && !selectedColor) return false
    return true
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Product Images */}
      <div>
        <Card padding="none" className="overflow-hidden">
          <img
            src={product.imageUrl || 'https://via.placeholder.com/600x600?text=No+Image'}
            alt={product.name}
            className="w-full h-auto object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = 'https://via.placeholder.com/600x600?text=No+Image'
            }}
          />
        </Card>
      </div>

      {/* Product Info */}
      <div>
        <Card>
          {/* Đã xóa phần hiển thị Category */}

          {/* Product Name */}
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {product.name}
          </h1>

          {/* Price */}
          <div className="mb-6">
            <span className="text-4xl font-bold text-blue-600">
              ${product.price.toFixed(2)}
            </span>
          </div>

          {/* Đã xóa phần hiển thị Stock Status */}

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Size Selection */}
          {product.size && product.size.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Select Size {!selectedSize && <span className="text-red-500 text-sm">*</span>}
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.size.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`
                      px-4 py-2 border-2 rounded-lg font-medium transition-all
                      ${selectedSize === size
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {product.color && product.color.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Select Color {!selectedColor && <span className="text-red-500 text-sm">*</span>}
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.color.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`
                      px-4 py-2 border-2 rounded-lg font-medium transition-all capitalize
                      ${selectedColor === color
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Quantity</h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              
              <span className="text-2xl font-semibold w-12 text-center">{quantity}</span>
              
              <button
                onClick={() => handleQuantityChange(1)}
                // Đã xóa thuộc tính disabled để không giới hạn số lượng
                className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="flex gap-3">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleAddToCart}
              disabled={!canAddToCart()}
              isLoading={isAdding}
            >
              Add to Cart
            </Button>
          </div>

          {/* Helper text for required selections */}
          {!canAddToCart() && (
            <p className="mt-3 text-sm text-red-500">
              {!selectedSize && product.size && product.size.length > 0 && 'Please select a size. '}
              {!selectedColor && product.color && product.color.length > 0 && 'Please select a color.'}
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}
// src/components/products/ProductCard.tsx
import { Link } from 'react-router-dom'
import type { Product } from '../../types'

interface ProductCardProps {
  product: Product
  onAddToCart?: (productId: string) => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (onAddToCart) {
      onAddToCart(product.id)
    }
  }

  return (
    <Link to={`/products/${product.id}`}>
      <div className="group relative bg-white/70 backdrop-blur-lg rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl border border-white/20 transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"></div>
        
        {/* Product Image */}
        <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          <img
            src={product.imageUrl || 'https://via.placeholder.com/400x400?text=No+Image'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = 'https://via.placeholder.com/400x400?text=No+Image'
            }}
          />
        </div>

        {/* Product Info */}
        <div className="p-5 flex flex-col flex-grow relative z-20">
          <div className="flex-grow">
            {/* Product Name */}
            <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors duration-300">
              {product.name}
            </h3>
            
            {/* Description */}
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.description}
            </p>
          </div>

          {/* Price and Action */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-purple-100">
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ${product.price.toFixed(2)}
              </span>
            </div>
            
            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              🛒 Add
            </button>
          </div>

          {/* Available Sizes/Colors Preview */}
          {(product.size && product.size.length > 0) || (product.color && product.color.length > 0) ? (
            <div className="mt-3 pt-3 border-t border-purple-100 text-xs text-gray-500">
              {product.size && product.size.length > 0 && (
                <span>📏 Sizes: {product.size.slice(0, 3).join(', ')}</span>
              )}
              {product.size && product.size.length > 3 && <span>...</span>}
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
// src/components/products/ProductList.tsx
import type { Product } from '../../types'
import ProductCard from './ProductCard'
import { Loading } from '../common'

interface ProductListProps {
  products: Product[]
  isLoading?: boolean
  onAddToCart?: (productId: string) => void
}

export default function ProductList({ 
  products, 
  isLoading = false,
  onAddToCart 
}: ProductListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loading size="lg" text="Loading products..." />
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20">
        <svg 
          className="mx-auto h-24 w-24 text-gray-400 mb-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
          />
        </svg>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No products found
        </h3>
        <p className="text-gray-500">
          Try adjusting your search or filters
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  )
}

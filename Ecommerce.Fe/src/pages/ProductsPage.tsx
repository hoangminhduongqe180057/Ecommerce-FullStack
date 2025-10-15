// src/pages/ProductsPage.tsx
import { useState } from 'react'
import { ProductList } from '../components/products'
import { useProducts } from '../hooks'
import { useAddToCart } from '../hooks/useCart'

export default function ProductsPage() {
  const [sortBy, setSortBy] = useState('created_at:desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [currentPage] = useState(1)

  // React Query - fetch products from API
  const { data, isLoading, error } = useProducts({
    page: currentPage,
    limit: 12,
    sort: sortBy,
    search: searchQuery || undefined,
  })

  // Add to cart mutation
  const addToCart = useAddToCart()

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart.mutateAsync({ productId, quantity: 1 })
      // Success feedback handled by React Query
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(searchInput.trim())
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setSearchQuery('')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading amazing products... ✨</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20">
          <p className="text-red-600 text-lg font-semibold">⚠️ Failed to load products</p>
          <p className="text-gray-600 mt-2">{error.message}</p>
        </div>
      </div>
    )
  }

  const products = data?.items || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob pointer-events-none"></div>
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-full shadow-lg">
              🛍️ Shop Now
            </span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-3">
            Discover Products
          </h1>
          <p className="text-gray-700 text-lg">
            Find amazing products in our curated marketplace
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="🔍 Search products..."
                className="w-full px-6 py-3 pr-24 bg-white/70 backdrop-blur-lg border border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 shadow-lg hover:shadow-xl"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 shadow-md transition-all duration-300 font-medium"
                >
                  Search
                </button>
              </div>
            </div>
          </form>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-6 py-3 border border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-lg shadow-lg hover:shadow-xl transition-all duration-300 font-medium text-gray-700"
          >
            <option value="created_at:desc">✨ Newest First</option>
            <option value="created_at:asc">🕐 Oldest First</option>
            <option value="price:asc">💰 Price: Low to High</option>
            <option value="price:desc">💎 Price: High to Low</option>
            <option value="name:asc">🔤 Name: A to Z</option>
            <option value="name:desc">🔤 Name: Z to A</option>
          </select>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mb-4 p-4 bg-blue-500/80 backdrop-blur-sm border border-blue-300/50 rounded-2xl shadow-lg">
            <p className="text-white font-medium">
              🔍 Search results for: <span className="font-bold">"{searchQuery}"</span>
              {' - '}
              <span className="font-bold">{products.length}</span> product(s) found
            </p>
          </div>
        )}

        {/* Products Count */}
        <div className="mb-4 text-sm text-gray-700 font-medium">
          {!searchQuery && (
            <>
              📦 Showing <span className="font-bold text-purple-600">{products.length}</span> products
              {data?.total && data.total > products.length && (
                <span className="ml-1">(of {data.total} total)</span>
              )}
            </>
          )}
        </div>

        {/* Product List */}
        {products.length === 0 ? (
          <div className="text-center py-12 bg-white/70 backdrop-blur-lg rounded-3xl p-12 shadow-xl border border-white/20">
            <p className="text-gray-600 text-lg mb-4">
              {searchQuery ? '😔 No products found matching your search.' : '📦 No products available.'}
            </p>
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 shadow-lg transition-all duration-300 font-medium"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <ProductList products={products} onAddToCart={handleAddToCart} />
        )}
      </div>
    </div>
  )
}

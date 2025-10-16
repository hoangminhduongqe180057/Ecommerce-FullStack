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
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-sky-600 mx-auto" />
          <p className="mt-4 text-slate-700 font-medium">Loading products… ✨</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="text-center bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/30 max-w-lg">
          <p className="text-rose-600 text-lg font-semibold">⚠️ Failed to load products</p>
          <p className="text-slate-600 mt-2">{(error as any).message}</p>
        </div>
      </div>
    )
  }

  const products = data?.items || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Decorative Blue Blobs */}
      <div className="pointer-events-none absolute -top-16 -left-16 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-blob" />
      <div className="pointer-events-none absolute top-1/3 -right-10 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-blob animation-delay-2000" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-sky-600 to-indigo-600 shadow">
            🛍️ Shop Now
          </span>
          <h1 className="mt-4 text-5xl font-extrabold bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-800 bg-clip-text text-transparent">
            Discover Products
          </h1>
          <p className="mt-2 text-slate-600 text-lg">
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
                className="w-full px-6 py-3 pr-28 bg-white/80 backdrop-blur-lg border border-sky-200 rounded-2xl focus:ring-2 focus:ring-sky-200 focus:border-sky-300 transition-all shadow-sm hover:shadow"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="px-3 py-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-xl hover:from-sky-700 hover:to-indigo-700 shadow-md transition font-medium"
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
            className="px-6 py-3 border border-sky-200 rounded-2xl focus:ring-2 focus:ring-sky-200 focus:border-sky-300 bg-white/80 backdrop-blur-lg shadow-sm hover:shadow transition font-medium text-slate-700"
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
          <div className="mb-4 p-4 bg-sky-500/85 text-white rounded-2xl shadow">
            <p className="font-medium">
              🔍 Search results for: <span className="font-bold">"{searchQuery}"</span>
              {' — '}
              <span className="font-bold">{products.length}</span> product(s) found
            </p>
          </div>
        )}

        {/* Products Count */}
        <div className="mb-4 text-sm text-slate-700 font-medium">
          {!searchQuery && (
            <>
              📦 Showing{' '}
              <span className="font-bold text-sky-700">{products.length}</span> products
              {data?.total && data.total > products.length && (
                <span className="ml-1">(of {data.total} total)</span>
              )}
            </>
          )}
        </div>

        {/* Product List */}
        {products.length === 0 ? (
          <div className="text-center py-12 bg-white/80 backdrop-blur-lg rounded-3xl p-12 shadow-xl border border-white/30">
            <p className="text-slate-600 text-lg mb-4">
              {searchQuery ? '😔 No products found matching your search.' : '📦 No products available.'}
            </p>
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="px-6 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-xl hover:from-sky-700 hover:to-indigo-700 shadow-md transition font-medium"
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

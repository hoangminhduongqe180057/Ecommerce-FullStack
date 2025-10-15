// src/pages/ProductDetailPage.tsx
import { useParams, useNavigate } from 'react-router-dom'
import { ProductDetail } from '../components/products'
import { useProduct } from '../hooks'
import { useAddToCart } from '../hooks/useCart'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Fetch product from API using React Query
  const { data: product, isLoading, error } = useProduct(id || '')
  const addToCart = useAddToCart()

  const handleAddToCart = async (
    productId: string,
    quantity: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _size?: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _color?: string
  ) => {
    try {
      await addToCart.mutateAsync({ productId, quantity })
      // Success feedback is handled by React Query's onSuccess callback
      
      // Optionally redirect to cart after adding
      // navigate('/cart')
    } catch (error) {
      console.error('Failed to add to cart:', error)
      alert('Failed to add product to cart. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Loading product...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-md mx-auto">
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 text-center">
              <div className="text-6xl mb-4">😕</div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Product Not Found
              </h2>
              <p className="text-gray-600 mb-6">
                {error ? 'Failed to load product details.' : "The product you're looking for doesn't exist."}
              </p>
              <button
                onClick={() => navigate('/products')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transform transition-all duration-300"
              >
                ← Back to Products
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Breadcrumb */}
        <nav className="mb-8 text-base text-gray-600 flex items-center gap-2">
          <button onClick={() => navigate('/')} className="hover:text-purple-600 transition-colors font-semibold">
            🏠 Home
          </button>
          <span>/</span>
          <button onClick={() => navigate('/products')} className="hover:text-purple-600 transition-colors font-semibold">
            🛍️ Products
          </button>
          <span>/</span>
          <span className="text-gray-800 font-bold">{product.name}</span>
        </nav>

        {/* Product Detail Component */}
        <ProductDetail 
          product={product} 
          onAddToCart={handleAddToCart}
        />
      </div>
    </div>
  )
}

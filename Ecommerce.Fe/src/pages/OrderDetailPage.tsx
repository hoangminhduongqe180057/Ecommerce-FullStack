import { useParams, useNavigate, Link } from 'react-router-dom'
import { useOrder } from '../hooks/useOrders'
import { useCreatePayment } from '../hooks/usePayments'
import { toast } from 'react-hot-toast'
import type { OrderStatus } from '../types'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: order, isLoading, error } = useOrder(id!)
  const createPayment = useCreatePayment()

  const handlePayNow = async () => {
    if (!order) return
    
    try {
      const { checkoutUrl } = await createPayment.mutateAsync({ 
        orderId: order.id,
        provider: 'stripe' 
      })
      window.location.href = checkoutUrl
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create payment session')
    }
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
      case 'paid':
        return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
      case 'failed':
        return 'bg-gradient-to-r from-red-400 to-pink-500 text-white'
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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
                Loading order details...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-md mx-auto">
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Failed to load order
              </h2>
              <p className="text-gray-600 mb-6">{error?.message || 'Order not found'}</p>
              <button
                onClick={() => navigate('/orders')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transform transition-all duration-300"
              >
                ← Back to Orders
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
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center text-gray-600 hover:text-purple-600 mb-6 transition-colors group"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-semibold">Back to Orders</span>
          </button>
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <h1 className="text-5xl font-bold mb-2">
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  📦 Order Details
                </span>
              </h1>
              <p className="text-gray-600 text-lg">Order ID: #{order.id.substring(0, 12)}...</p>
            </div>
            <span className={`px-6 py-3 rounded-xl text-sm font-bold capitalize ${getStatusColor(order.status)} shadow-md`}>
              {order.status === 'pending' && '⏳ '}
              {order.status === 'paid' && '✅ '}
              {order.status === 'failed' && '❌ '}
              {order.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                🛒 Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div 
                    key={item.productId} 
                    className="flex gap-4 p-4 bg-white/50 rounded-2xl hover:bg-white/70 transition-all duration-300 hover:shadow-lg"
                  >
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-xl"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = 'https://via.placeholder.com/100?text=No+Image'
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <Link
                        to={`/products/${item.productId}`}
                        className="font-bold text-lg text-gray-900 hover:text-purple-600 transition-colors"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-600 mt-2">
                        Quantity: <span className="font-semibold text-gray-800">{item.quantity}</span> × 
                        <span className="font-semibold text-gray-800"> ${item.unitPrice.toLocaleString()} VND</span>
                      </p>
                      <p className="text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
                        Subtotal: ${item.lineTotal.toLocaleString()} VND
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20 sticky top-20">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                💳 Order Summary
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700 p-3 bg-white/50 rounded-xl">
                  <span className="font-semibold">📅 Order Date</span>
                  <span className="text-sm text-gray-600">{formatDate(order.createdAt)}</span>
                </div>
                
                <div className="flex justify-between text-gray-700 p-3 bg-white/50 rounded-xl">
                  <span className="font-semibold">📦 Items</span>
                  <span className="font-bold">{order.items.length}</span>
                </div>
              </div>

              <div className="border-t-2 border-gray-200 pt-6 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-700">Total</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ${order.totalAmount.toLocaleString()} VND
                  </span>
                </div>
              </div>

              {order.status === 'pending' && (
                <>
                  <button
                    onClick={handlePayNow}
                    disabled={createPayment.isPending}
                    className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mb-3"
                  >
                    {createPayment.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      '💳 Pay Now'
                    )}
                  </button>
                  <p className="text-sm text-gray-500 text-center">
                    Complete your payment to confirm this order
                  </p>
                </>
              )}

              {order.status === 'paid' && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 text-center">
                  <div className="text-6xl mb-3">✅</div>
                  <p className="text-green-800 font-bold text-lg">Payment Successful</p>
                  <p className="text-green-600 text-sm mt-2">Your order has been confirmed</p>
                </div>
              )}

              {order.status === 'failed' && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-2xl p-6 text-center">
                  <div className="text-6xl mb-3">❌</div>
                  <p className="text-red-800 font-bold text-lg">Payment Failed</p>
                  <p className="text-red-600 text-sm mt-2 mb-4">Please try again</p>
                  <button
                    onClick={handlePayNow}
                    disabled={createPayment.isPending}
                    className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transform transition-all duration-300 disabled:opacity-50"
                  >
                    {createPayment.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      '🔄 Retry Payment'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// src/pages/OrdersPage.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { OrderStatus } from '../types'
import { useOrders } from '../hooks/useOrders'
import { useCreatePayment } from '../hooks/usePayments'
import { toast } from 'react-hot-toast'

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  
  // React Query - fetch orders from API
  const { data: orders, isLoading, error } = useOrders()
  const createPayment = useCreatePayment()

  const handlePayNow = async (orderId: string) => {
    try {
      const { checkoutUrl } = await createPayment.mutateAsync({ orderId, provider: 'stripe' })
      // Redirect to Stripe checkout
      window.location.href = checkoutUrl
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create payment session')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Loading orders...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
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
                Failed to load orders
              </h2>
              <p className="text-gray-600">{(error as any)?.message ?? 'Unknown error'}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const filteredOrders = statusFilter === 'all' 
    ? (orders || [])
    : (orders?.filter(order => order.status === statusFilter) || [])

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
      case 'paid':
        return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
      // case 'failed':
      //   // ❗ Tạm ẩn trạng thái failed; bật lại khi cần
      //   return 'bg-gradient-to-r from-red-400 to-pink-500 text-white'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              📦 My Orders
            </span>
          </h1>
          <p className="text-gray-600 text-lg">Track and manage your purchases</p>
        </div>

        {/* Filter Tabs (đã ẩn 'failed') */}
        <div className="mb-8 flex flex-wrap gap-3">
          {[
            'all',
            'pending',
            'paid',
            // 'failed', // ❗ Tạm ẩn tab Failed; bật lại khi cần
          ].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as OrderStatus | 'all')}
              className={`
                px-6 py-3 rounded-xl font-semibold capitalize transition-all duration-300 transform hover:scale-105
                ${statusFilter === status
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white/70 backdrop-blur-lg text-gray-700 hover:bg-white/90 border border-white/20'
                }
              `}
            >
              {status === 'all' && '🔍 '}
              {status === 'pending' && '⏳ '}
              {status === 'paid' && '✅ '}
              {/* {status === 'failed' && '❌ '} */}
              {status}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-12 shadow-xl border border-white/20">
            <div className="text-center">
              <div className="text-8xl mb-6">📭</div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                No orders found
              </h3>
              <p className="text-gray-600 text-lg mb-8">You haven't placed any orders yet</p>
              <Link to="/products">
                <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transform transition-all duration-300">
                  🛍️ Start Shopping →
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div 
                key={order.id}
                className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between mb-6 pb-6 border-b border-gray-200">
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                      Order #{order.id.substring(0, 8)}...
                    </h3>
                    <p className="text-sm text-gray-600">
                      📅 {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-2 rounded-xl text-sm font-bold capitalize ${getStatusColor(order.status)} shadow-md`}>
                      {order.status}
                    </span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {order.items.map((item) => (
                    <div 
                      key={item.productId} 
                      className="flex gap-4 p-4 bg-white/50 rounded-2xl hover:bg-white/70 transition-colors"
                    >
                      <div className="flex-grow">
                        <Link 
                          to={`/products/${item.productId}`}
                          className="text-gray-800 hover:text-purple-600 font-semibold text-lg transition-colors"
                        >
                          🛒 {item.name || `Product #${item.productId.substring(0, 8)}...`}
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">
                          Quantity: <span className="font-semibold">{item.quantity}</span> × 
                          <span className="font-semibold"> ${item.unitPrice.toFixed(2)}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Actions */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handlePayNow(order.id)}
                      disabled={createPayment.isPending}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                  )}
                  <Link to={`/orders/${order.id}`} className="flex-1">
                    <button className="w-full px-6 py-4 bg-white/70 backdrop-blur-lg text-gray-700 rounded-xl font-semibold hover:bg-white hover:shadow-lg hover:scale-105 transform transition-all duration-300 border border-white/20">
                      📄 View Details
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

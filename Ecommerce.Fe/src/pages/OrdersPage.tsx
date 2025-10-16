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
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Soft blue blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply blur-3xl opacity-50 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply blur-3xl opacity-50 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply blur-3xl opacity-50 animate-blob animation-delay-4000" />
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium bg-gradient-to-r from-sky-700 to-indigo-800 bg-clip-text text-transparent">
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
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply blur-3xl opacity-50 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply blur-3xl opacity-50 animate-blob animation-delay-2000" />
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-md mx-auto">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/30 text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Failed to load orders
              </h2>
              <p className="text-slate-600">{(error as any)?.message ?? 'Unknown error'}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Soft blue blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply blur-3xl opacity-50 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply blur-3xl opacity-50 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply blur-3xl opacity-50 animate-blob animation-delay-4000" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-sky-600 to-indigo-600 shadow">
            📦 My Orders
          </span>
          <h1 className="mt-4 text-5xl font-extrabold bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-800 bg-clip-text text-transparent">
            Track & Manage Purchases
          </h1>
          <p className="mt-2 text-slate-600 text-lg">View your order history and complete pending payments</p>
        </div>

        {/* Layout: Sidebar (filter) + Content (orders) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/30 sticky top-24">
              <h2 className="text-xl font-extrabold bg-gradient-to-r from-sky-700 to-indigo-800 bg-clip-text text-transparent mb-4">
                Filters
              </h2>
              <div className="space-y-2">
                {(['all', 'pending', 'paid'] as Array<OrderStatus | 'all'>).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`w-full text-left px-4 py-3 rounded-xl font-semibold capitalize transition ${
                      statusFilter === status
                        ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow'
                        : 'bg-white/70 border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {status === 'all' && '🔎 '}
                    {status === 'pending' && '⏳ '}
                    {status === 'paid' && '✅ '}
                    {status}
                  </button>
                ))}
                {/* <button className="w-full text-left px-4 py-3 rounded-xl font-semibold capitalize bg-white/70 border border-slate-200 text-slate-400 cursor-not-allowed">
                  ❌ failed (hidden)
                </button> */}
              </div>

              {/* Small summary */}
              <div className="mt-6 p-4 rounded-2xl bg-sky-50 border border-sky-100">
                <p className="text-sm text-slate-600">
                  Showing <span className="font-bold text-sky-700">{filteredOrders.length}</span> order(s)
                </p>
              </div>

              <Link to="/products">
                <button className="mt-4 w-full px-4 py-3 border-2 border-sky-300 text-sky-700 hover:bg-sky-50 rounded-xl font-semibold transition">
                  Continue Shopping →
                </button>
              </Link>
            </div>
          </aside>

          {/* Content */}
          <section className="lg:col-span-9">
            {filteredOrders.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-12 shadow-xl border border-white/30">
                <div className="text-center">
                  <div className="text-8xl mb-6">📭</div>
                  <h3 className="text-3xl font-extrabold bg-gradient-to-r from-sky-700 to-indigo-800 bg-clip-text text-transparent mb-3">
                    No orders found
                  </h3>
                  <p className="text-slate-600 text-lg mb-8">You haven't placed any orders yet</p>
                  <Link to="/products">
                    <button className="px-8 py-4 bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition">
                      🛍️ Start Shopping →
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                {filteredOrders.map((order) => (
                  <div 
                    key={order.id}
                    className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/30 hover:shadow-2xl hover:-translate-y-0.5 transition"
                  >
                    {/* Card header */}
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900">
                          Order <span className="bg-gradient-to-r from-sky-700 to-indigo-800 bg-clip-text text-transparent">#{order.id.substring(0, 8)}...</span>
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">📅 {formatDate(order.createdAt)}</p>
                      </div>
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize ${getStatusColor(order.status)} shadow`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Items preview */}
                    <div className="space-y-2 mb-4">
                      {order.items.slice(0, 2).map((item) => (
                        <div 
                          key={item.productId} 
                          className="flex items-center justify-between gap-3 p-3 bg-white/60 rounded-xl"
                        >
                          <Link 
                            to={`/products/${item.productId}`}
                            className="text-slate-800 hover:text-sky-700 font-semibold line-clamp-1"
                          >
                            🛒 {item.name || `Product #${item.productId.substring(0, 8)}...`}
                          </Link>
                          <span className="text-sm text-slate-600 whitespace-nowrap">
                            x{item.quantity} · ${item.unitPrice.toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="text-xs text-slate-500 px-1">+ {order.items.length - 2} more item(s)</div>
                      )}
                    </div>

                    {/* Totals */}
                    <div className="flex items-center justify-between py-3 border-t border-slate-200">
                      <span className="text-sm font-medium text-slate-600">Total</span>
                      <span className="text-2xl font-extrabold bg-gradient-to-r from-sky-700 to-indigo-800 bg-clip-text text-transparent">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <Link to={`/orders/${order.id}`}>
                        <button className="w-full px-4 py-3 bg-white/80 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-white hover:shadow transition">
                          📄 Details
                        </button>
                      </Link>
                      {order.status === 'pending' ? (
                        <button
                          onClick={() => handlePayNow(order.id)}
                          disabled={createPayment.isPending}
                          className="w-full px-4 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-md hover:-translate-y-0.5 transition disabled:opacity-50"
                        >
                          {createPayment.isPending ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Processing...
                            </span>
                          ) : (
                            '💳 Pay Now'
                          )}
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-400 rounded-xl font-semibold cursor-not-allowed"
                        >
                          Paid
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

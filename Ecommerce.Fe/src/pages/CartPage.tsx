// src/pages/CartPage.tsx
import { Link } from 'react-router-dom'
import { useCart, useUpdateCartItem, useRemoveFromCart, useClearCart } from '../hooks/useCart'
import { useCreateOrder } from '../hooks/useOrders'
import { useCreatePayment } from '../hooks/usePayments'
import { toast } from 'react-hot-toast'
import { useState } from 'react'

export default function CartPage() {
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  
  // React Query hooks
  const { data: cart, isLoading, error } = useCart()
  const updateCartItem = useUpdateCartItem()
  const removeFromCart = useRemoveFromCart()
  const clearCart = useClearCart()
  const createOrder = useCreateOrder()
  const createPayment = useCreatePayment()

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    
    try {
      await updateCartItem.mutateAsync({ productId, quantity: newQuantity })
    } catch (error) {
      console.error('Failed to update quantity:', error)
      alert('Failed to update quantity. Please try again.')
    }
  }

  const handleRemoveItem = async (productId: string) => {
    if (!confirm('Are you sure you want to remove this item?')) return
    
    try {
      await removeFromCart.mutateAsync(productId)
    } catch (error) {
      console.error('Failed to remove item:', error)
      alert('Failed to remove item. Please try again.')
    }
  }

  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return
    
    try {
      await clearCart.mutateAsync()
    } catch (error) {
      console.error('Failed to clear cart:', error)
      alert('Failed to clear cart. Please try again.')
    }
  }

  const handleCheckout = async () => {
    setIsCheckingOut(true)
    try {
      // Step 1: Create order with items from cart
      const orderItems = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
      
      const order = await createOrder.mutateAsync({ items: orderItems })
      
      // Step 2: Create payment session for the order
      const { checkoutUrl } = await createPayment.mutateAsync({ 
        orderId: order.id,
        provider: 'stripe' 
      })
      
      // Step 3: Redirect to Stripe checkout
      window.location.href = checkoutUrl
    } catch (error: any) {
      setIsCheckingOut(false)
      toast.error(error?.response?.data?.message || 'Failed to proceed to checkout')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading your cart... 🛒</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20">
          <p className="text-red-600 text-lg font-semibold">⚠️ Failed to load cart</p>
          <p className="text-gray-600 mt-2">{error.message}</p>
        </div>
      </div>
    )
  }

  const cartItems = cart?.items || []

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center px-4">
        <div className="text-center bg-white/70 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/20 max-w-md">
          <svg 
            className="mx-auto h-24 w-24 text-purple-400 mb-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
            />
          </svg>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-8 text-lg">Add some amazing products to get started! 🛍️</p>
          <Link to="/products">
            <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const calculateTax = () => {
    return (cart?.totalAmount || 0) * 0.1 // 10% tax
  }

  const calculateTotal = () => {
    return (cart?.totalAmount || 0) + calculateTax()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob pointer-events-none"></div>
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Shopping Cart 🛒
            </h1>
            <p className="text-gray-600">Review and checkout your items</p>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              disabled={clearCart.isPending}
              className="px-4 py-2 border-2 border-red-400 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
            >
              🗑️ Clear Cart
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.productId} className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <img
                    src={item.imageUrl || 'https://via.placeholder.com/200'}
                    alt={item.name}
                    className="w-28 h-28 object-cover rounded-2xl shadow-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'https://via.placeholder.com/200?text=No+Image'
                    }}
                  />

                  {/* Product Info */}
                  <div className="flex-grow">
                    <Link 
                      to={`/products/${item.productId}`}
                      className="text-xl font-bold text-gray-800 hover:text-purple-600 transition-colors duration-300"
                    >
                      {item.name}
                    </Link>
                    
                    <div className="text-sm text-gray-600 mt-2 space-y-1">
                      <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-3">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      disabled={removeFromCart.isPending}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50 hover:bg-red-50 p-2 rounded-lg transition-all duration-300"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                    <div className="flex items-center space-x-3 bg-purple-50 rounded-xl p-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                        disabled={updateCartItem.isPending || item.quantity <= 1}
                        className="w-10 h-10 rounded-xl border-2 border-purple-300 flex items-center justify-center hover:bg-purple-100 disabled:opacity-50 font-bold text-purple-600 transition-all duration-300"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-bold text-lg text-purple-600">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                        disabled={updateCartItem.isPending}
                        className="w-10 h-10 rounded-xl border-2 border-purple-300 flex items-center justify-center hover:bg-purple-100 font-bold text-purple-600 transition-all duration-300"
                      >
                        +
                      </button>
                    </div>

                    <p className="text-2xl font-bold text-gray-800 mt-2">
                      ${item.lineTotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 sticky top-20">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                💳 Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">Subtotal ({cartItems.length} items)</span>
                  <span className="font-bold">${(cart?.totalAmount || 0).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">Tax (10%)</span>
                  <span className="font-bold">${calculateTax().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">Shipping</span>
                  <span className="text-green-600 font-bold">FREE 🎉</span>
                </div>
              </div>

              <div className="border-t-2 border-purple-200 pt-4 mb-6">
                <div className="flex justify-between text-2xl font-bold text-gray-800">
                  <span>Total</span>
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-3"
              >
                {isCheckingOut ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  '🚀 Proceed to Checkout'
                )}
              </button>

              <Link to="/products">
                <button className="w-full border-2 border-purple-300 text-purple-600 hover:bg-purple-50 font-semibold py-3 px-6 rounded-2xl transition-all duration-300">
                  ← Continue Shopping
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

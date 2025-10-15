// src/api/cart.ts
import { apiClient } from './client'
import type { Cart, CartItem, ApiResponse } from '../types'

export const cartApi = {
  // Get user's cart
  get: async () => {
    const response = await apiClient.get<ApiResponse<Cart>>('/cart')
    return response.data
  },

  // Add item to cart
  addItem: async (productId: string, quantity: number, size?: string, color?: string) => {
    const response = await apiClient.post<ApiResponse<Cart>>('/cart/items', {
      productId,
      quantity,
      size,
      color,
    })
    return response.data
  },

  // Update cart item quantity
  updateItem: async (itemId: string, quantity: number) => {
    const response = await apiClient.put<ApiResponse<CartItem>>(`/cart/items/${itemId}`, {
      quantity,
    })
    return response.data
  },

  // Remove item from cart
  removeItem: async (itemId: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/cart/items/${itemId}`)
    return response.data
  },

  // Clear entire cart
  clear: async () => {
    const response = await apiClient.delete<ApiResponse<void>>('/cart')
    return response.data
  },
}

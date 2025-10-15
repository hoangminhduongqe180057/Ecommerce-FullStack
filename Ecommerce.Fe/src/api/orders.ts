// src/api/orders.ts
import { apiClient } from './client'
import type { Order, ShippingAddress, ApiResponse, PaginatedResponse } from '../types'

export const ordersApi = {
  // Get all orders for current user
  getAll: async (page = 1, pageSize = 10) => {
    const response = await apiClient.get<PaginatedResponse<Order>>(
      `/orders?page=${page}&pageSize=${pageSize}`
    )
    return response.data
  },

  // Get single order by ID
  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`)
    return response.data
  },

  // Create new order (checkout)
  create: async (shippingAddress: ShippingAddress) => {
    const response = await apiClient.post<ApiResponse<Order>>('/orders', {
      shippingAddress,
    })
    return response.data
  },

  // Cancel order
  cancel: async (id: string) => {
    const response = await apiClient.patch<ApiResponse<Order>>(`/orders/${id}/cancel`)
    return response.data
  },

  // Admin: Get all orders
  getAllAdmin: async (page = 1, pageSize = 20, status?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    })
    if (status) params.append('status', status)

    const response = await apiClient.get<PaginatedResponse<Order>>(
      `/admin/orders?${params}`
    )
    return response.data
  },

  // Admin: Update order status
  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.patch<ApiResponse<Order>>(`/admin/orders/${id}/status`, {
      status,
    })
    return response.data
  },
}

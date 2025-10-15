// src/hooks/useOrders.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/client'
import type { Order } from '../types'

// Query key factory
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters?: OrderFilters) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
}

interface OrderFilters {
  status?: string
  page?: number
  pageSize?: number
}

interface CreateOrderDto {
  items?: Array<{
    productId: string
    quantity: number
  }>
  shippingAddress?: {
    fullName: string
    phone: string
    address: string
    city: string
    postalCode: string
    country: string
  }
}

// Query hook for getting user's orders
export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: async () => {
      const { data } = await apiClient.get<Order[]>('/orders', {
        params: filters,
      })
      return data
    },
    staleTime: 1000 * 60 * 3, // 3 minutes
  })
}

// Query hook for single order with polling for pending status
export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<Order>(`/orders/${id}`)
      return data
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 3, // 3 minutes
    refetchInterval: (query) => {
      // Poll every 3 seconds if order is pending (waiting for payment)
      const order = query.state.data
      return order?.status === 'pending' ? 3000 : false
    },
  })
}

// Mutation hook for creating order from cart
export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderData?: CreateOrderDto) => {
      const { data } = await apiClient.post<Order>('/orders', orderData)
      return data
    },
    onSuccess: () => {
      // Invalidate orders list and cart
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}

// Mutation hook for canceling order (only if status is pending)
export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderId: string) => {
      await apiClient.delete(`/orders/${orderId}`)
      return orderId
    },
    onSuccess: (orderId) => {
      // Invalidate orders list and specific order
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      queryClient.removeQueries({ queryKey: orderKeys.detail(orderId) })
    },
  })
}

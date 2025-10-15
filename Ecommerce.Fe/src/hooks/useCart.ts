// src/hooks/useCart.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/client'
import type { Cart, CartItem } from '../types'
import { toast } from 'react-hot-toast'

// Query key factory
export const cartKeys = {
  all: ['cart'] as const,
  detail: () => [...cartKeys.all, 'detail'] as const,
}

interface AddToCartDto {
  productId: string
  quantity: number
}

interface UpdateCartItemDto {
  productId: string
  quantity: number
}

// Query hook for getting user's cart
export function useCart() {
  return useQuery({
    queryKey: cartKeys.detail(),
    queryFn: async () => {
      const { data } = await apiClient.get<Cart>('/cart')
      return data
    },
    staleTime: 1000 * 60 * 2, // 2 minutes (cart data needs to be fresher)
  })
}

// Mutation hook for adding item to cart
export function useAddToCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (item: AddToCartDto) => {
      const { data } = await apiClient.post<CartItem>('/cart/items', item)
      return data
    },
    onSuccess: () => {
      // Show success toast
      toast.success('🛒 Product added to cart!', {
        duration: 3000,
        position: 'top-right',
      })
      
      // Invalidate cart to trigger refetch
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() })
    },
    // Optimistic update (optional)
    onMutate: async (_newItem) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: cartKeys.detail() })

      // Snapshot previous value
      const previousCart = queryClient.getQueryData<Cart>(cartKeys.detail())

      // Optimistically update to new value (simplified)
      if (previousCart) {
        queryClient.setQueryData<Cart>(cartKeys.detail(), {
          ...previousCart,
          // We don't have full product info here, so we'll just trigger refetch
        })
      }

      return { previousCart }
    },
    onError: (error: any, _newItem, context) => {
      // Show error toast
      toast.error(error?.response?.data?.message || 'Failed to add to cart', {
        duration: 4000,
        position: 'top-right',
      })
      
      // Rollback on error
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.detail(), context.previousCart)
      }
    },
  })
}

// Mutation hook for updating cart item quantity
export function useUpdateCartItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ productId, quantity }: UpdateCartItemDto) => {
      const { data } = await apiClient.put<CartItem>(`/cart/items/${productId}`, { quantity })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() })
    },
  })
}

// Mutation hook for removing item from cart
export function useRemoveFromCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productId: string) => {
      await apiClient.delete(`/cart/items/${productId}`)
      return productId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() })
    },
  })
}

// Mutation hook for clearing entire cart
export function useClearCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await apiClient.delete('/cart')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() })
    },
  })
}

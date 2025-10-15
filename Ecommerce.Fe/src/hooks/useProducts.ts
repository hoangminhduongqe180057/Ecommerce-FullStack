// src/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/client'
import type { Product, PaginatedResponse } from '../types'

// Query key factory for better organization
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params?: ProductQueryParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
}

interface ProductQueryParams {
  page?: number
  limit?: number
  sort?: string
  search?: string
}

// Query hook for listing products with pagination
export function useProducts(params?: ProductQueryParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: async () => {
      // Default sort: created_at:desc
      const sort = params?.sort || 'created_at:desc'

      const { data } = await apiClient.get<PaginatedResponse<Product>>('/products', {
        params: {
          sort,
          page: params?.page || 1,
          limit: params?.limit || 12,
          search: params?.search,
        },
      })
      
      return data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Query hook for single product
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<Product>(`/products/${id}`)
      return data
    },
    enabled: !!id, // Only run if id exists
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Mutation: Create Product (Admin only)
export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data } = await apiClient.post<Product>('/products', product);
      return data;
    },
    onSuccess: () => {
      // Invalidate products list to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Mutation: Update Product (Admin only)
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...product }: Partial<Product> & { id: string }) => {
      const { data } = await apiClient.put<Product>(`/products/${id}`, product);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', data.id] });
    },
  });
}

// Mutation: Delete Product (Admin only)
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/products/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

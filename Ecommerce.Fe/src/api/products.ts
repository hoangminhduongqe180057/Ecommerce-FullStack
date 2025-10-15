// src/api/products.ts
import { apiClient } from './client'
import type { Product, PaginatedResponse, ApiResponse, ProductFormData } from '../types'

export const productsApi = {
  // Get all products with pagination
  getAll: async (page = 1, pageSize = 12, category?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    })
    if (category) params.append('category', category)
    
    const response = await apiClient.get<PaginatedResponse<Product>>(`/products?${params}`)
    return response.data
  },

  // Get single product by ID
  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`)
    return response.data
  },

  // Create new product (Admin only)
  create: async (data: ProductFormData) => {
    const response = await apiClient.post<ApiResponse<Product>>('/products', data)
    return response.data
  },

  // Update product (Admin only)
  update: async (id: string, data: Partial<ProductFormData>) => {
    const response = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, data)
    return response.data
  },

  // Delete product (Admin only)
  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/products/${id}`)
    return response.data
  },

  // Search products
  search: async (query: string) => {
    const response = await apiClient.get<ApiResponse<Product[]>>(`/products/search?q=${query}`)
    return response.data
  },
}


// src/types/index.ts

// User types
export interface User {
  id: string
  email: string
  name?: string
  role: 'customer' | 'admin'
  createdAt?: string
}

// Product types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string | null
  size?: string[]
  color?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface ProductFormData {
  name: string
  description: string
  price: number
  imageUrl: string
}

// Cart types (matching backend API structure)
export interface CartItem {
  productId: string
  name: string
  imageUrl: string | null
  price: number
  quantity: number
  lineTotal: number
}

export interface Cart {
  items: CartItem[]
  totalAmount: number
}

// Order types (matching backend API structure)
export type OrderStatus = 'pending' | 'paid' | 'failed'

export interface OrderItem {
  productId: string
  name: string
  unitPrice: number
  quantity: number
  lineTotal: number
  imageUrl: string | null
}

export interface Order {
  id: string
  userId: string
  totalAmount: number
  status: OrderStatus
  items: OrderItem[]
  createdAt: string
}

export interface ShippingAddress {
  fullName: string
  phone: string
  address: string
  city: string
  postalCode: string
  country: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  limit: number
  total: number
}


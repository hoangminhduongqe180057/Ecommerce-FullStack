import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '../api/client'

interface CreatePaymentRequest {
  orderId: string
  provider?: string
}

interface CreatePaymentResponse {
  paymentId: string
  checkoutUrl: string
}

interface Payment {
  id: string
  orderId: string
  provider: string
  providerPaymentId: string
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'failed'
  checkoutUrl: string
  createdAt: string
  updatedAt: string
}

// Create payment checkout session
export function useCreatePayment() {
  return useMutation({
    mutationFn: async (data: CreatePaymentRequest) => {
      const response = await apiClient.post<CreatePaymentResponse>('/payments/create', data)
      return response.data
    },
  })
}

// Get payment details
export function usePayment(paymentId: string, enabled = true) {
  return useQuery({
    queryKey: ['payments', paymentId],
    queryFn: async () => {
      const response = await apiClient.get<Payment>(`/payments/${paymentId}`)
      return response.data
    },
    enabled: enabled && !!paymentId,
    refetchInterval: (query) => {
      // Poll every 3 seconds if payment is pending
      return query.state.data?.status === 'pending' ? 3000 : false
    },
  })
}

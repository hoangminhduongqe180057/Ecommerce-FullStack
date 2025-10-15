// src/pages/admin/AdminDashboard.tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const navigate = useNavigate()

  // Auto redirect to products page
  useEffect(() => {
    navigate('/admin/products', { replace: true })
  }, [navigate])

  return null
}

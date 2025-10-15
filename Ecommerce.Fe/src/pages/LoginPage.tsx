// src/pages/LoginPage.tsx
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  // Trang đích trước khi bị chặn
  const from = (location.state as any)?.from?.pathname || '/products'
  
  // Get success message from registration if any
  const successMessage = (location.state as any)?.message
  const messageType = (location.state as any)?.type

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await login(formData.email, formData.password)
      navigate(from, { replace: true })
    } catch (err: any) {
      setError(err?.message || 'Failed to login. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // nhẹ nhàng: nếu bạn có toast thì gọi toast.success('Copied') ở đây
    } catch {}
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      {/* Container rộng hơn + grid 2 cột */}
      <div className="w-full max-w-5xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-full shadow-lg">
              🔐 Secure Login
            </span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-3">
            Welcome Back!
          </h1>
          <p className="text-gray-700 text-lg">Sign in to your account to continue</p>
        </div>

        {/* 2 cột: trái = form, phải = demo credentials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Login Card */}
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
            <form onSubmit={handleSubmit} className="space-y-5">
              {successMessage && messageType === 'success' && (
                <div className="bg-green-50/90 backdrop-blur-sm border border-green-200 text-green-700 px-4 py-3 rounded-2xl">
                  <p className="text-sm">✅ {successMessage}</p>
                </div>
              )}
              {error && (
                <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-2xl">
                  <p className="text-sm">⚠️ {error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300"
                />
              </div>

              <div className="text-right">
                {/* <Link
                  to="/forgot-password"
                  className="text-sm text-purple-600 hover:text-pink-600 font-medium transition-colors duration-300"
                >
                  Forgot password?
                </Link> */}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  '🚀 Sign In'
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/70 backdrop-blur-sm text-gray-600 font-medium rounded-full">
                    Or
                  </span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-700">
                  Don&apos;t have an account?{' '}
                  <Link
                    to="/register"
                    className="text-purple-600 hover:text-pink-600 font-semibold transition-colors duration-300"
                  >
                    Sign up for free →
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Demo Credentials Card (ngang với Login Card) */}
          <div className="bg-gradient-to-br from-blue-500/90 to-purple-500/90 text-white rounded-3xl p-8 shadow-2xl border border-white/20 flex flex-col justify-between">
            <div>
              <p className="text-base mb-2 font-semibold">💡 Demo Credentials:</p>
              <p className="text-sm text-blue-50 mb-4">
                Đây là tài khoản demo để bạn thử nghiệm (Role: <b>Admin</b>, có quyền CRUD Product).
              </p>

              <div className="space-y-3">
                <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                  <div className="text-sm">
                    <div className="text-blue-100/90">Email</div>
                    <div className="font-semibold">admin@test.com</div>
                  </div>
                  <button
                    onClick={() => copy('admin@test.com')}
                    className="px-3 py-2 rounded-lg bg-white/15 hover:bg-white/25 transition text-sm"
                    type="button"
                  >
                    Copy
                  </button>
                </div>

                <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                  <div className="text-sm">
                    <div className="text-blue-100/90">Password</div>
                    <div className="font-semibold">123456</div>
                  </div>
                  <button
                    onClick={() => copy('123456')}
                    className="px-3 py-2 rounded-lg bg-white/15 hover:bg-white/25 transition text-sm"
                    type="button"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            {/* Prefill nhanh form (tuỳ chọn) */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setFormData({ email: 'admin@test.com', password: '123456' })}
                className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-xl transition"
              >
                Điền sẵn thông tin & dùng thử
              </button>
              <p className="text-xs text-blue-50 mt-2">
                * Bấm để tự động điền vào form bên trái, sau đó nhấn “Sign In”.
              </p>
            </div>
          </div>
        </div>
        {/* /grid */}
      </div>
    </div>
  )
}

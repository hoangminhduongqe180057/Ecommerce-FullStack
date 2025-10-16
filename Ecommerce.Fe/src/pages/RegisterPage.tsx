// src/pages/RegisterPage.tsx
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [showPw2, setShowPw2] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }))
    setError('')
  }

  const passwordsMatch = useMemo(
    () => formData.password.length > 0 && formData.password === formData.confirmPassword,
    [formData.password, formData.confirmPassword]
  )

  const validateForm = () => {
    if (formData.name.trim().length < 2) {
      setError('Please enter your full name.')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validateForm()) return

    setIsLoading(true)
    try {
      await signup(formData.email, formData.password, formData.name)
      navigate('/login', {
        state: {
          message: 'Account created successfully! Please login with your credentials.',
          type: 'success',
        },
        replace: true,
      })
    } catch (err: any) {
      setError(err?.message || 'Failed to create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Soft animated blobs (xanh nhạt) */}
      <div className="pointer-events-none absolute -top-16 -left-16 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply blur-3xl opacity-40 animate-blob" />
      <div className="pointer-events-none absolute -bottom-24 -right-10 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply blur-3xl opacity-40 animate-blob animation-delay-2000" />
      <div className="pointer-events-none absolute top-1/3 -left-10 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-blob animation-delay-4000" />

      <div className="container mx-auto px-4 py-10 relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow">
            ✨ Join Us Today
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight">
            <span className="bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-800 bg-clip-text text-transparent">
              Create Account
            </span>
          </h1>
          <p className="mt-2 text-slate-600">Sign up to start shopping</p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Left panel: perks/why-join */}
          <section className="rounded-3xl p-8 lg:p-10 bg-white/70 backdrop-blur-lg border border-white/20 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-md">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden="true">
                  <path d="M12 2a5 5 0 00-5 5v1H6a3 3 0 00-3 3v7a4 4 0 004 4h10a4 4 0 004-4v-7a3 3 0 00-3-3h-1V7a5 5 0 00-5-5zm3 6V7a3 3 0 10-6 0v1h6z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Welcome to a smoother checkout</h2>
                <p className="mt-1 text-slate-600">
                  Lưu địa chỉ giao hàng, lịch sử đơn, wishlist, và đồng bộ trên mọi thiết bị.
                </p>
              </div>
            </div>

            <ul className="mt-6 space-y-3 text-slate-700">
              <li className="flex items-center gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-sm">✓</span>
                Đăng ký nhanh, xác thực bảo mật
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-sm">✓</span>
                Nhận ưu đãi & thông báo sớm
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-sm">✓</span>
                Quản lý đơn hàng & đổi trả tiện lợi
              </li>
            </ul>

            <div className="mt-8 rounded-2xl p-5 bg-gradient-to-br from-sky-500/90 to-indigo-600/90 text-white border border-white/20 shadow-lg">
              <p className="font-semibold">Mẹo:</p>
              <p className="text-white/90 text-sm mt-1">
                Dùng mật khẩu mạnh (≥ 6 ký tự). Bạn sẽ nhận thông báo xác nhận (nếu hệ thống bật).
              </p>
            </div>
          </section>

          {/* Right panel: form */}
          <section className="rounded-3xl p-8 lg:p-10 bg-white/80 backdrop-blur-xl border border-white/30 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error */}
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl">
                  <p className="text-sm">⚠️ {error}</p>
                </div>
              )}

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/60 border border-sky-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl bg-white/60 border border-sky-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white/60 border border-sky-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute inset-y-0 right-3 my-auto px-2 rounded-md text-slate-500 hover:text-slate-700"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">Must be at least 6 characters</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showPw2 ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    className={`w-full px-4 py-3 pr-12 rounded-xl bg-white/60 border ${
                      passwordsMatch || formData.confirmPassword.length === 0
                        ? 'border-sky-200'
                        : 'border-rose-300'
                    } focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw2((s) => !s)}
                    className="absolute inset-y-0 right-3 my-auto px-2 rounded-md text-slate-500 hover:text-slate-700"
                    aria-label={showPw2 ? 'Hide password' : 'Show password'}
                  >
                    {showPw2 ? '🙈' : '👁️'}
                  </button>
                </div>
                {!passwordsMatch && formData.confirmPassword.length > 0 && (
                  <p className="text-xs text-rose-600 mt-1">Passwords do not match.</p>
                )}
              </div>

              {/* (Optional) Terms */}
              {/* <div className="flex items-start gap-2">
                <input type="checkbox" id="terms" className="mt-1 h-4 w-4 text-sky-600 border-slate-300 rounded" required />
                <label htmlFor="terms" className="text-sm text-slate-700">
                  I agree to the
                  {' '}
                  <Link to="/terms" className="text-sky-700 hover:text-indigo-700 font-medium">Terms</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-sky-700 hover:text-indigo-700 font-medium">Privacy Policy</Link>.
                </label>
              </div> */}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition disabled:opacity-50 disabled:transform-none"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0a12 12 0 00-12 12h4z" />
                    </svg>
                    Creating account…
                  </span>
                ) : (
                  '🎉 Create Account'
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white/80 backdrop-blur-sm text-slate-600 font-medium rounded-full">
                    Or
                  </span>
                </div>
              </div>

              {/* Link to Login */}
              <p className="text-center text-slate-700">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-sky-700 hover:text-indigo-700 transition-colors">
                  Sign in →
                </Link>
              </p>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}
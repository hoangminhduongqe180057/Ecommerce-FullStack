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
  // Message sau khi đăng ký
  const successMessage = (location.state as any)?.message as string | undefined
  const messageType = (location.state as any)?.type as string | undefined

  // Remember me (chỉ lưu EMAIL, không lưu password)
  const rememberDefault = typeof window !== 'undefined' && localStorage.getItem('remember') === '1'
  const rememberedEmail =
    typeof window !== 'undefined' && rememberDefault ? localStorage.getItem('rememberEmail') || '' : ''

  const [formData, setFormData] = useState({ email: rememberedEmail, password: '' })
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(rememberDefault)
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
      // ✅ login chỉ 2 tham số
      await login(formData.email, formData.password)

      // Lưu lựa chọn Remember me
      if (remember) {
        localStorage.setItem('remember', '1')
        localStorage.setItem('rememberEmail', formData.email)
      } else {
        localStorage.removeItem('remember')
        localStorage.removeItem('rememberEmail')
      }

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
    } catch {}
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
            🔐 Secure Login
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight">
            <span className="bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-800 bg-clip-text text-transparent">
              Welcome Back
            </span>
            <span className="text-slate-900">!</span>
          </h1>
          <p className="mt-2 text-slate-600">Sign in to continue your shopping experience</p>
        </div>

        {/* Content Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Intro Panel (trái) */}
          <section className="rounded-3xl p-8 lg:p-10 bg-white/70 backdrop-blur-lg border border-white/20 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-md">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden="true">
                  <path d="M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v9a3 3 0 003 3h10a3 3 0 003-3v-9a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm3 8V6a3 3 0 10-6 0v3h6z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Sign in faster, shop smarter</h2>
                <p className="mt-1 text-slate-600">
                  Quản trị đơn hàng, theo dõi trạng thái, và đồng bộ giỏ hàng giữa các thiết bị.
                </p>
              </div>
            </div>

            <ul className="mt-6 space-y-3 text-slate-700">
              <li className="flex items-center gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-sm">✓</span>
                Bảo mật bằng JWT & Supabase Auth
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-sm">✓</span>
                Tự động ghi nhớ phiên (Remember me)
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-sm">✓</span>
                Điều hướng lại trang bạn đang xem
              </li>
            </ul>

            {/* Demo Credentials */}
            <div className="mt-8 rounded-2xl p-5 bg-gradient-to-br from-sky-500/90 to-indigo-600/90 text-white border border-white/20 shadow-lg">
              <p className="font-semibold">💡 Demo Credentials:</p>
              <p className="text-white/90 text-sm mt-1">
                Tài khoản demo để thử (Role: <b>Admin</b>, có quyền CRUD Product).
              </p>

              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                  <div className="text-sm">
                    <div className="text-white/80">Email</div>
                    <div className="font-semibold">admin@gmail.com</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copy('admin@gmail.com')}
                    className="px-3 py-2 rounded-lg bg-white/15 hover:bg-white/25 transition text-sm"
                  >
                    Copy
                  </button>
                </div>
                <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                  <div className="text-sm">
                    <div className="text-white/80">Password</div>
                    <div className="font-semibold">123456</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copy('123456')}
                    className="px-3 py-2 rounded-lg bg-white/15 hover:bg-white/25 transition text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFormData({ email: 'admin@gmail.com', password: '123456' })}
                className="mt-5 w-full py-3 rounded-xl bg-white/20 hover:bg-white/30 font-semibold transition"
              >
                Điền sẵn thông tin & dùng thử
              </button>
              <p className="text-xs text-white/80 mt-2">
                * Bấm để tự động điền form đăng nhập, sau đó nhấn “Sign In”.
              </p>
            </div>
          </section>

          {/* Form Panel (phải) */}
          <section className="rounded-3xl p-8 lg:p-10 bg-white/80 backdrop-blur-xl border border-white/30 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {successMessage && messageType === 'success' && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl">
                  <p className="text-sm">✅ {successMessage}</p>
                </div>
              )}
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl">
                  <p className="text-sm">⚠️ {error}</p>
                </div>
              )}

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
                    autoComplete="current-password"
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
              </div>

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 select-none">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span className="text-sm text-slate-700">Remember me</span>
                </label>

                {/* <Link to="/forgot-password" className="text-sm font-medium text-sky-700 hover:text-indigo-700">
                  Forgot password?
                </Link> */}
              </div>

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
                    Signing in…
                  </span>
                ) : (
                  '🚀 Sign In'
                )}
              </button>

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

              <p className="text-center text-slate-700">
                Don&apos;t have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-sky-700 hover:text-indigo-700 transition-colors"
                >
                  Sign up for free →
                </Link>
              </p>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

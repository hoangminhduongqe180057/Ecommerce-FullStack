// src/pages/HomePage.tsx
import { Link } from 'react-router-dom'
import { Button } from '../components/common'
import { useAuth } from '../contexts/AuthContext'

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      {/* Hero Section - Glass / Blue accents */}
      <div className="relative overflow-hidden">
        {/* Soft Blue Blobs */}
        <div className="pointer-events-none absolute -top-24 -left-16 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply blur-3xl opacity-40 animate-blob" />
        <div className="pointer-events-none absolute -top-10 right-0 w-[28rem] h-[28rem] bg-indigo-200 rounded-full mix-blend-multiply blur-3xl opacity-40 animate-blob animation-delay-2000" />
        <div className="pointer-events-none absolute -bottom-16 left-24 w-[26rem] h-[26rem] bg-blue-200 rounded-full mix-blend-multiply blur-3xl opacity-30 animate-blob animation-delay-4000" />

        <div className="relative container mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-sky-600 to-indigo-600 shadow">
              ✨ Fresh picks every week
            </span>

            <h1 className="mt-6 text-6xl md:text-7xl font-extrabold leading-tight">
              <span className="bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-800 bg-clip-text text-transparent">
                Discover Your Style
              </span>
            </h1>

            <p className="mt-4 text-xl md:text-2xl text-slate-700 max-w-2xl mx-auto">
              Shop the latest trends with{' '}
              <span className="font-semibold text-sky-700">exclusive deals</span> and
              lightning-fast delivery 🚀
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/products">
                <Button
                  size="lg"
                  className="group relative overflow-hidden bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 px-8 py-4 text-lg"
                >
                  <span className="relative z-10">🛍️ Start Shopping</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-sky-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </Link>

              {user ? (
                <Link to="/orders">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-sky-600 text-sky-700 hover:bg-sky-50 px-8 py-4 text-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                  >
                    📦 My Orders →
                  </Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-sky-600 text-sky-700 hover:bg-sky-50 px-8 py-4 text-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                  >
                    Sign Up Free →
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section – blue cards */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-3">Why Choose Us?</h2>
          <p className="text-slate-600 text-lg">Experience shopping like never before</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group relative bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-white/30">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-sky-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-slate-900">Premium Quality</h3>
              <p className="text-slate-600 leading-relaxed">
                Curated collection from top brands. Every product verified for authenticity and quality.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="group relative bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-white/30">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400/10 to-sky-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-slate-900">Best Prices</h3>
              <p className="text-slate-600 leading-relaxed">
                Unbeatable deals and exclusive discounts. Save more on every purchase.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="group relative bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-white/30">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-sky-400/10 to-blue-300/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-slate-900">Fast Shipping</h3>
              <p className="text-slate-600 leading-relaxed">
                Express delivery to your door. Track your order in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section – blue gradient */}
      <div className="container mx-auto px-4 py-16">
        <div className="rounded-3xl p-12 shadow-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl md:text-5xl font-extrabold mb-1">50K+</div>
              <div className="text-sky-100">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold mb-1">10K+</div>
              <div className="text-sky-100">Products</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold mb-1">99%</div>
              <div className="text-sky-100">Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold mb-1">24/7</div>
              <div className="text-sky-100">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section – glass with blue accents */}
      <div className="container mx-auto px-4 py-20">
        <div className="relative bg-white/70 backdrop-blur-lg rounded-3xl p-12 md:p-16 shadow-2xl border border-white/30 overflow-hidden">
          <div className="pointer-events-none absolute -top-10 -right-6 w-64 h-64 bg-gradient-to-br from-sky-400 to-indigo-400 rounded-full blur-3xl opacity-20" />
          <div className="pointer-events-none absolute -bottom-10 -left-6 w-64 h-64 bg-gradient-to-br from-blue-400 to-sky-300 rounded-full blur-3xl opacity-20" />

          <div className="relative text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-sky-700 to-indigo-800 bg-clip-text text-transparent">
                Ready to Transform Your Shopping?
              </span>
            </h2>
            <p className="text-xl text-slate-700 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers and discover the future of online shopping today! 🎉
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Link to="/cart">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 px-10 py-4 text-lg"
                    >
                      🛒 Go to Cart
                    </Button>
                  </Link>
                  <Link to="/products">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-2 border-sky-600 text-sky-700 hover:bg-sky-50 px-10 py-4 text-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                    >
                      Explore Products
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 px-10 py-4 text-lg"
                    >
                      Get Started Free
                    </Button>
                  </Link>
                  <Link to="/products">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-2 border-sky-600 text-sky-700 hover:bg-sky-50 px-10 py-4 text-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                    >
                      Explore Products
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

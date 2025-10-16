// src/components/common/Navbar.tsx
import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Button from './Button'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Styles: nhẹ nhàng, sáng, chỉ điểm xuyết xanh khi hover/active
  const linkBase =
    'relative px-3 py-1.5 rounded-md text-sm font-medium text-slate-700 transition-colors'
  const linkInactive =
    'hover:text-sky-700 hover:bg-sky-50'
  const linkActive =
    'text-sky-700 bg-sky-50 ring-1 ring-inset ring-sky-100'

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 shadow-[0_2px_12px_rgba(15,23,42,0.06)]">
      <div className="container mx-auto px-4">
        {/* Top row */}
        <div className="h-16 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-400 text-white shadow-sm ring-1 ring-black/5">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </span>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Marketplace
            </span>
          </Link>

          {/* Desktop nav center */}
          <div className="hidden md:flex items-center gap-1.5">
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              Products
            </NavLink>

            {user && (
              <>
                <NavLink
                  to="/cart"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : linkInactive}`
                  }
                >
                  <span className="inline-flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Cart
                  </span>
                </NavLink>

                <NavLink
                  to="/orders"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : linkInactive}`
                  }
                >
                  Orders
                </NavLink>

                {user.role === 'admin' && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `${linkBase} ${isActive ? linkActive : linkInactive}`
                    }
                  >
                    Admin
                  </NavLink>
                )}
              </>
            )}
          </div>

          {/* Desktop right area */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-slate-600">
                  Hi, <span className="font-semibold text-slate-800">{user.name || user.email}</span>
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-700 hover:border-sky-300 hover:text-sky-700 transition"
            onClick={() => setIsMobileOpen((s) => !s)}
            aria-label="Toggle navigation"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-[max-height] duration-300 ${isMobileOpen ? 'max-h-96' : 'max-h-0'}`}
        >
          <div className="py-3 border-t border-slate-200">
            <div className="flex flex-col gap-1.5">
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? 'text-sky-700 bg-sky-50 ring-1 ring-inset ring-sky-100' : 'hover:text-sky-700 hover:bg-sky-50'}`
                }
                onClick={() => setIsMobileOpen(false)}
              >
                Products
              </NavLink>

              {user ? (
                <>
                  <NavLink
                    to="/cart"
                    className={({ isActive }) =>
                      `${linkBase} ${isActive ? 'text-sky-700 bg-sky-50 ring-1 ring-inset ring-sky-100' : 'hover:text-sky-700 hover:bg-sky-50'}`
                    }
                    onClick={() => setIsMobileOpen(false)}
                  >
                    Cart
                  </NavLink>
                  <NavLink
                    to="/orders"
                    className={({ isActive }) =>
                      `${linkBase} ${isActive ? 'text-sky-700 bg-sky-50 ring-1 ring-inset ring-sky-100' : 'hover:text-sky-700 hover:bg-sky-50'}`
                    }
                    onClick={() => setIsMobileOpen(false)}
                  >
                    Orders
                  </NavLink>

                  {user.role === 'admin' && (
                    <NavLink
                      to="/admin"
                      className={({ isActive }) =>
                        `${linkBase} ${isActive ? 'text-sky-700 bg-sky-50 ring-1 ring-inset ring-sky-100' : 'hover:text-sky-700 hover:bg-sky-50'}`
                      }
                      onClick={() => setIsMobileOpen(false)}
                    >
                      Admin
                    </NavLink>
                  )}

                  <div className="pt-2 mt-1 border-t border-slate-200">
                    <p className="text-sm text-slate-600 mb-2">
                      Hi, <span className="font-semibold text-slate-800">{user.name || user.email}</span>
                    </p>
                    <Button variant="outline" size="sm" onClick={handleLogout} fullWidth>
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <Link to="/login" onClick={() => setIsMobileOpen(false)}>
                    <Button variant="outline" size="sm" fullWidth>
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileOpen(false)}>
                    <Button variant="primary" size="sm" fullWidth>
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* /Mobile menu */}
      </div>
    </nav>
  )
}

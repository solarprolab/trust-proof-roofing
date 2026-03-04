import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/testimonials', label: 'Reviews' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <nav className="bg-[#1B3A6B] shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
              <span className="text-[#1B3A6B] font-black text-lg leading-none">TR</span>
            </div>
            <div className="text-white">
              <div className="font-bold text-base leading-tight">Trust Proof</div>
              <div className="text-blue-200 text-xs leading-tight tracking-wider uppercase">Roofing</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`text-sm font-medium transition-colors ${
                  pathname === to
                    ? 'text-white border-b-2 border-yellow-400 pb-0.5'
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
            <Link
              to="/quote"
              className="ml-2 bg-yellow-400 hover:bg-yellow-300 text-[#1B3A6B] font-bold text-sm px-4 py-2 rounded-full transition-colors"
            >
              Free Quote
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#122a52] border-t border-blue-800 px-4 py-3 space-y-2">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={`block py-2 text-sm font-medium ${
                pathname === to ? 'text-yellow-400' : 'text-blue-200 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            to="/quote"
            onClick={() => setOpen(false)}
            className="block mt-2 bg-yellow-400 text-[#1B3A6B] font-bold text-sm px-4 py-2 rounded-full text-center"
          >
            Free Quote
          </Link>
        </div>
      )}
    </nav>
  )
}

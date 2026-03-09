import { Link } from 'react-router-dom'
import WarrantyBadge from './WarrantyBadge'

export default function Footer() {
  return (
    <footer className="bg-[#122a52] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
                <span className="text-[#1B3A6B] font-black text-lg">TR</span>
              </div>
              <div>
                <div className="font-bold">Trust Proof Roofing</div>
                <div className="text-blue-300 text-xs">Suffield, Connecticut</div>
              </div>
            </div>
            <p className="text-blue-300 text-sm leading-relaxed">
              Connecticut's most trusted roofing company. Serving Suffield and surrounding communities.
            </p>
            <div className="mt-4">
              <WarrantyBadge small />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-blue-300 mb-3">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/services', label: 'Services' },
                { to: '/about', label: 'About Us' },
                { to: '/testimonials', label: 'Reviews' },
                { to: '/quote', label: 'Free Quote' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-blue-200 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-blue-300 mb-3">Services</h3>
            <ul className="space-y-2 text-sm text-blue-200">
              <li>Roof Installation</li>
              <li>Roof Repair</li>
              <li>Roof Replacement</li>
              <li>Gutter Services</li>
              <li>Roof Inspections</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-blue-300 mb-3">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-blue-200">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+19593338569" className="hover:text-white">(959) 333-8569</a>
              </li>
              <li className="flex items-start gap-2 text-blue-200">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:tenzin@trustproofroofing.com" className="hover:text-white">tenzin@trustproofroofing.com</a>
              </li>
              <li className="flex items-start gap-2 text-blue-200">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Suffield, CT 06078</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-blue-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-blue-400">
          <span>&copy; {new Date().getFullYear()} Trust Proof Roofing LLC. All rights reserved.</span>
          <span>Licensed &amp; Insured &bull; CT License #HIC.0678432</span>
        </div>
      </div>
    </footer>
  )
}

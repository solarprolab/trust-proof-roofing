import Link from 'next/link';
import { SITE } from '@/lib/config';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-brand-800 shadow-lg">
      {/* Top bar */}
      <div className="bg-brand-900 text-brand-200 text-sm py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span>Serving all of Connecticut — Licensed &amp; Insured | {SITE.license}</span>
          <a href={`tel:${SITE.phone.replace(/\D/g, '')}`} className="font-semibold text-accent-400 hover:text-accent-300 transition-colors">
            {SITE.phone}
          </a>
        </div>
      </div>

      {/* Main nav */}
      <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,5 95,40 95,95 5,95 5,40" fill="#1e3a5f" stroke="none"/>
            <polygon points="50,15 85,43 85,85 15,85 15,43" fill="none" stroke="#f5c518" strokeWidth="4"/>
            <polyline points="28,60 44,76 72,42" stroke="#f5c518" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <div>
            <div className="text-white font-bold text-xl leading-tight font-heading">{SITE.name}</div>
            <div className="text-brand-300 text-xs">{SITE.tagline}</div>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/services" className="text-brand-100 hover:text-white transition-colors font-medium">
            Services
          </Link>
          <Link href="/about" className="text-brand-100 hover:text-white transition-colors font-medium">
            About
          </Link>
          <Link href="/contact" className="text-brand-100 hover:text-white transition-colors font-medium">
            Contact
          </Link>
          <a
            href={`tel:${SITE.phone.replace(/\D/g, '')}`}
            className="bg-accent-400 hover:bg-accent-500 text-gray-900 font-bold px-5 py-2.5 rounded-lg transition-colors"
          >
            Free Estimate
          </a>
        </div>

        {/* Mobile CTA */}
        <a
          href={`tel:${SITE.phone.replace(/\D/g, '')}`}
          className="md:hidden bg-accent-400 hover:bg-accent-500 text-gray-900 font-bold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Call Now
        </a>
      </nav>
    </header>
  );
}

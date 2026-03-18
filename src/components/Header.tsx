'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SITE } from '@/lib/config';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#F8FAFC] border-b border-[#E2E8F0]">
      {/* Top bar */}
      <div className="bg-[#F1F5F9] text-[#64748B] text-sm py-1.5 border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span className="hidden sm:block">Based in Suffield, CT — Licensed &amp; Insured | {SITE.license}</span>
          <a href={`tel:${SITE.phone.replace(/\D/g, '')}`} className="font-semibold text-[#1B3A6B] hover:text-[#1B3A6B]/70 transition-colors">
            {SITE.phone}
          </a>
        </div>
      </div>

      {/* Main nav */}
      <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="Trust Proof Roofing logo"
            width={48}
            height={38}
            style={{objectFit: 'contain', filter: 'brightness(0) saturate(100%) invert(18%) sepia(49%) saturate(800%) hue-rotate(190deg) brightness(90%)'}}
          />
          <div className="text-[#1B3A6B] font-black text-lg tracking-wide font-heading">{SITE.name}</div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/services" className="text-[#1B3A6B] hover:text-[#1B3A6B]/70 transition-colors font-medium">
            Services
          </Link>
          <Link href="/about" className="text-[#1B3A6B] hover:text-[#1B3A6B]/70 transition-colors font-medium">
            About
          </Link>
          <Link href="/contact" className="text-[#1B3A6B] hover:text-[#1B3A6B]/70 transition-colors font-medium">
            Contact
          </Link>
          <a
            href={`tel:${SITE.phone.replace(/\D/g, '')}`}
            className="bg-accent-400 hover:bg-accent-500 text-white font-bold px-5 py-2.5 rounded-lg transition-colors"
          >
            Free Estimate
          </a>
        </div>

        {/* Hamburger button — mobile only */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="md:hidden text-[#1B3A6B] p-2 rounded-lg hover:bg-[#E2E8F0] transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="md:hidden bg-[#F8FAFC] border-t border-[#E2E8F0] px-4 py-6">
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setMenuOpen(false)}
              className="text-[#64748B] hover:text-[#1B3A6B] p-1 rounded transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-4">
            <Link href="/services" onClick={() => setMenuOpen(false)} className="text-[#1B3A6B] text-lg font-medium py-2 block border-b border-[#E2E8F0]">
              Services
            </Link>
            <Link href="/about" onClick={() => setMenuOpen(false)} className="text-[#1B3A6B] text-lg font-medium py-2 block border-b border-[#E2E8F0]">
              About
            </Link>
            <Link href="/contact" onClick={() => setMenuOpen(false)} className="text-[#1B3A6B] text-lg font-medium py-2 block border-b border-[#E2E8F0]">
              Contact
            </Link>
            <a
              href={`tel:${SITE.phone.replace(/\D/g, '')}`}
              className="block w-full bg-accent-400 text-white font-bold py-3 rounded-lg text-center"
            >
              Free Estimate — Call {SITE.phone}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

import Link from 'next/link';
import { SITE, SERVICES } from '@/lib/config';
import { CT_CITIES } from '@/data/cityPages';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand + NAP */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg width="36" height="32" viewBox="0 0 110 95" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="5,50 55,5 105,50" stroke="#FACC15" strokeWidth="8" strokeLinecap="square" strokeLinejoin="miter" fill="none"/>
                <polyline points="18,50 18,90" stroke="#FACC15" strokeWidth="8" strokeLinecap="square" fill="none"/>
                <polygon points="10,52 18,38 26,52" fill="#FACC15"/>
                <polyline points="92,50 92,90" stroke="#FACC15" strokeWidth="8" strokeLinecap="square" fill="none"/>
                <polygon points="84,52 92,38 100,52" fill="#FACC15"/>
                <polyline points="32,62 48,78 82,44" stroke="#FACC15" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              <span className="text-white font-bold text-lg font-heading">{SITE.name}</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">{SITE.tagline}</p>
            <address className="not-italic text-sm space-y-1 text-gray-400">
              {SITE.address.street && <div>{SITE.address.street}</div>}
              <div>{SITE.address.city}, {SITE.address.state} {SITE.address.zip}</div>
              <div>
                <a href={`tel:${SITE.phone.replace(/\D/g, '')}`} className="hover:text-white transition-colors">
                  {SITE.phone}
                </a>
              </div>
              <div>
                <a href={`mailto:${SITE.email}`} className="hover:text-white transition-colors">
                  {SITE.email}
                </a>
              </div>
              <div className="pt-1 text-gray-500">CT License #{SITE.license}</div>
            </address>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              {SERVICES.map((service) => (
                <li key={service.slug}>
                  <Link href={`/services/${service.slug}`} className="hover:text-white transition-colors">
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="text-white font-semibold mb-4">Service Areas</h3>
            <ul className="space-y-2 text-sm">
              {CT_CITIES.map((city) => (
                <li key={city.slug}>
                  <Link href={`/roofing/ct/${city.slug}`} className="hover:text-white transition-colors">
                    {city.city}, CT
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm mb-6">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">All Services</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Free Estimate</Link></li>
            </ul>
            <a
              href={`tel:${SITE.phone.replace(/\D/g, '')}`}
              className="inline-block bg-accent-400 hover:bg-accent-500 text-gray-900 font-bold px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              {SITE.phone}
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-gray-500">
          <p>© {currentYear} {SITE.name}. All rights reserved. CT License #{SITE.license}</p>
          <p>Proudly serving all of Connecticut — Hartford, Fairfield, New Haven &amp; Tolland Counties</p>
        </div>
      </div>
      <Link href="/admin" className="fixed bottom-4 right-4 text-xs text-gray-600 hover:text-gray-400 transition-colors z-50 opacity-40 hover:opacity-100">
        Admin
      </Link>
    </footer>
  );
}

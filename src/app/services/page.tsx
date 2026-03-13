import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE, SERVICES } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Roofing Services in Connecticut',
  description: 'Complete roofing services across Connecticut: replacement, repair, inspection, emergency roofing, commercial, gutters, and storm damage. Licensed & insured.',
  alternates: { canonical: `${SITE.url}/services` },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
    { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE.url}/services` },
  ],
};

export default function ServicesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero */}
      <section className="bg-brand-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="text-brand-300 text-sm mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">›</span>
            <span>Services</span>
          </nav>
          <h1 className="font-heading text-5xl font-bold mb-4">Roofing Services in Connecticut</h1>
          <p className="text-brand-200 text-xl max-w-2xl">
            Licensed, insured, and committed to honest work. We handle every roofing need for CT homeowners and businesses.
          </p>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SERVICES.map((service) => (
              <div key={service.slug} className="border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <span className="text-4xl">{service.icon}</span>
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-brand-800">{service.name}</h2>
                    <p className="text-gray-600 mt-1">{service.description}</p>
                  </div>
                </div>
                <ul className="space-y-2 mb-6">
                  {service.features.slice(0, 4).map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-brand-500 mt-0.5 flex-shrink-0">✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/services/${service.slug}`}
                  className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
                >
                  Learn About {service.shortName} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free inspection CTA */}
      <section className="py-16 bg-brand-50 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-heading text-3xl font-bold text-brand-800 mb-4">Free Roof Inspection — Zero Obligation</h2>
          <p className="text-gray-600 mb-8">We inspect your roof and tell you exactly what it needs. No upselling, no pressure. Just an honest professional assessment.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:9593338569" className="bg-accent-400 hover:bg-accent-500 text-gray-900 font-bold px-8 py-4 rounded-lg text-lg transition-colors">
              Call (959) 333-8569
            </a>
            <Link href="/contact" className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-4 rounded-lg text-lg transition-colors">
              Request Free Estimate
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

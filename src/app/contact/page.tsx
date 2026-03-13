import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/config';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Trust Proof Roofing | Free Estimate',
  description: 'Contact Trust Proof Roofing for a free roof inspection and estimate in Connecticut. Call (959) 333-8569 or fill out our quick form.',
  alternates: { canonical: `${SITE.url}/contact` },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
    { '@type': 'ListItem', position: 2, name: 'Contact', item: `${SITE.url}/contact` },
  ],
};

export default function ContactPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero */}
      <section className="bg-brand-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="text-brand-300 text-sm mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">›</span>
            <span>Contact</span>
          </nav>
          <h1 className="font-heading text-4xl font-bold mb-2">Get a Free Roof Estimate</h1>
          <p className="text-brand-200 text-lg">Fill out the form or call us directly — we respond within 1 business day.</p>
        </div>
      </section>

      {/* Main content */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="font-heading text-2xl font-bold text-brand-800 mb-6">Request Your Free Estimate</h2>
              <ContactForm />
            </div>

            {/* Contact info */}
            <div className="space-y-6">
              {/* Phone */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">📞</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                    <a href={`tel:${SITE.phone.replace(/\D/g, '')}`} className="text-2xl font-bold text-brand-600 hover:text-brand-700">
                      {SITE.phone}
                    </a>
                    <p className="text-sm text-gray-500 mt-1">Mon–Sat: 7am–6pm · Emergency: 7 days</p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">✉️</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <a href={`mailto:${SITE.email}`} className="text-brand-600 hover:text-brand-700 font-medium">
                      {SITE.email}
                    </a>
                    <p className="text-sm text-gray-500 mt-1">We respond within 1 business day</p>
                  </div>
                </div>
              </div>

              {/* Service area */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">📍</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Service Area</h3>
                    <p className="text-gray-700">All of Connecticut</p>
                    <p className="text-sm text-gray-500 mt-1">Hartford, Fairfield, New Haven &amp; Tolland Counties</p>
                  </div>
                </div>
              </div>

              {/* License */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">🏅</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Licensed &amp; Insured</h3>
                    <p className="text-gray-700">CT License #{SITE.license}</p>
                    <p className="text-sm text-gray-500 mt-1">Full liability &amp; workers&apos; comp insurance</p>
                  </div>
                </div>
              </div>

              {/* Emergency */}
              <div className="bg-accent-50 border border-accent-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">⚡</span>
                  <div>
                    <h3 className="font-semibold text-accent-900 mb-1">Roofing Emergency?</h3>
                    <p className="text-accent-800 text-sm mb-3">Storm damage, active leak, fallen tree — we respond 7 days a week.</p>
                    <a
                      href={`tel:${SITE.phone.replace(/\D/g, '')}`}
                      className="inline-block bg-accent-400 hover:bg-accent-500 text-gray-900 font-bold px-5 py-2.5 rounded-lg text-sm transition-colors"
                    >
                      Call Now: {SITE.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

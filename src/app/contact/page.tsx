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
                  <span className="text-brand-600 flex-shrink-0">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" /></svg>
                  </span>
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
                  <span className="text-brand-600 flex-shrink-0">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" /><path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" /></svg>
                  </span>
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
                  <span className="text-brand-600 flex-shrink-0">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.327a8 8 0 10-16 0c0 3.63 1.556 6.324 3.5 8.327a19.58 19.58 0 002.683 2.282 16.975 16.975 0 001.144.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                  </span>
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
                  <span className="text-brand-600 flex-shrink-0">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.741-3.08zm3.099 8.869a.75.75 0 00-1.22-.872l-3.236 4.53L9.53 13.17a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.093l3.75-5.25z" clipRule="evenodd" /></svg>
                  </span>
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
                  <span className="text-accent-700 flex-shrink-0">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" /></svg>
                  </span>
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

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SITE, SERVICES, getServiceBySlug } from '@/lib/config';

export async function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const service = getServiceBySlug(params.slug);
  if (!service) return {};
  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: { canonical: `${SITE.url}/services/${service.slug}` },
  };
}

export default function ServicePage({ params }: { params: { slug: string } }) {
  const service = getServiceBySlug(params.slug);
  if (!service) notFound();

  const related = SERVICES.filter((s) => s.slug !== service.slug).slice(0, 3);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE.url}/services` },
      { '@type': 'ListItem', position: 3, name: service.name, item: `${SITE.url}/services/${service.slug}` },
    ],
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: {
      '@type': 'RoofingContractor',
      name: SITE.name,
      telephone: SITE.phone,
      url: SITE.url,
    },
    areaServed: { '@type': 'State', name: 'Connecticut' },
    url: `${SITE.url}/services/${service.slug}`,
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: service.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Hero */}
      <section className="bg-brand-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="text-brand-300 text-sm mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/services" className="hover:text-white">Services</Link>
            <span className="mx-2">›</span>
            <span>{service.name}</span>
          </nav>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{service.icon}</span>
            <h1 className="font-heading text-5xl font-bold">{service.name} in Connecticut</h1>
          </div>
          <p className="text-brand-200 text-xl max-w-2xl">{service.description}</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-heading text-3xl font-bold text-brand-800 mb-8">What&apos;s Included</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {service.features.map((feat) => (
              <div key={feat} className="flex items-start gap-3 bg-brand-50 rounded-lg p-4">
                <span className="text-brand-500 font-bold text-lg mt-0.5 flex-shrink-0">✓</span>
                <span className="text-gray-800">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content sections */}
      {service.sections.map((section, i) => (
        <section key={section.heading} className={`py-14 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="font-heading text-2xl font-bold text-brand-800 mb-5">{section.heading}</h2>
            {section.body && (
              <p className="text-gray-700 leading-relaxed text-lg">{section.body}</p>
            )}
            {section.items && (
              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-brand-500 font-bold mt-1 flex-shrink-0">✓</span>
                    <span className="text-gray-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ))}

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-heading text-3xl font-bold text-brand-800 mb-8">{service.name} — Frequently Asked Questions</h2>
          <div className="space-y-3">
            {service.faq.map((item) => (
              <details key={item.q} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <summary className="flex justify-between items-center px-6 py-4 font-semibold text-gray-900 hover:text-brand-700">
                  {item.q}
                  <span className="faq-chevron text-brand-500 ml-4 flex-shrink-0">▼</span>
                </summary>
                <div className="px-6 pb-5 text-gray-600 leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-800 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-heading text-3xl font-bold mb-4">Get a Free {service.shortName} Estimate</h2>
          <p className="text-brand-200 mb-8">Licensed, insured, and honest. We tell you exactly what your roof needs.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={`tel:${SITE.phone.replace(/\D/g, '')}`} className="bg-accent-400 hover:bg-accent-500 text-gray-900 font-bold px-8 py-4 rounded-lg text-lg transition-colors">
              Call {SITE.phone}
            </a>
            <Link href="/contact" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-8 py-4 rounded-lg text-lg transition-colors">
              Request Estimate Online
            </Link>
          </div>
        </div>
      </section>

      {/* Related services */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-heading text-2xl font-bold text-brand-800 mb-6">Other Roofing Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="flex items-center gap-3 border border-gray-200 rounded-lg p-4 hover:border-brand-400 hover:shadow-sm transition-all">
                <span className="text-2xl">{s.icon}</span>
                <span className="font-medium text-gray-800 hover:text-brand-700">{s.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

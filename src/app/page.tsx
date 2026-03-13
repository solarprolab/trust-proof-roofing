import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE, SERVICES } from '@/lib/config';
import { CT_CITIES } from '@/data/cityPages';

export const metadata: Metadata = {
  title: `${SITE.name} | Connecticut Roofing Contractor`,
  description: SITE.description,
  alternates: { canonical: SITE.url },
};

const faqItems = [
  { q: 'How do I know if I need a new roof?', a: 'Look for missing or curling shingles, granules in your gutters, daylight in the attic, water stains on ceilings, or a roof over 20 years old. A free inspection from Trust Proof Roofing will give you a clear, honest answer.' },
  { q: 'How much does a roof replacement cost in Connecticut?', a: 'Most CT homeowners pay $8,000–$25,000 for a full roof replacement, depending on size, pitch, and materials. We provide free, detailed written estimates with no obligation.' },
  { q: 'How long does a roof last in Connecticut?', a: 'Architectural asphalt shingles last 25–30 years in CT conditions. Metal roofing lasts 40–70 years. Factors like attic ventilation, tree coverage, and coastal exposure all affect lifespan.' },
  { q: 'Do you offer any warranty?', a: 'Yes. We provide a 20-year leak warranty on all roof replacements and a 1-year warranty on repairs, plus manufacturer warranties up to 50 years on qualifying shingle products. Both are transferable to new owners.' },
  { q: 'Are you licensed and insured in Connecticut?', a: `Yes. We hold CT Home Improvement Contractor license ${SITE.license} and carry full general liability and workers\' compensation insurance. We can provide certificates on request.` },
  { q: 'How long does a roof replacement take?', a: 'Most residential replacements in CT are completed in 1–3 days. We give you a firm timeline upfront and keep you updated throughout.' },
  { q: 'Do you offer free estimates?', a: 'Yes, always. We provide free roof inspections and written estimates with no sales pressure. We tell you what your roof actually needs — even if that\'s just a repair.' },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Hero */}
      <section className="relative bg-brand-800 min-h-[70vh] flex items-center">
        <div className="hero-gradient absolute inset-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-24 text-white">
          <h1 className="font-heading text-5xl md:text-6xl font-bold leading-tight mb-6">
            Roofing You Can Trust<br />
            <span className="text-accent-400">Backed by Proof</span>
          </h1>
          <p className="text-xl text-brand-100 max-w-2xl mb-8">
            Connecticut&apos;s honest roofing contractor. We inspect your roof and tell you exactly what it needs — no upselling, no pressure. Licensed, insured, and committed to quality work that lasts.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href={`tel:${SITE.phone.replace(/\D/g, '')}`}
              className="bg-accent-500 hover:bg-accent-600 text-white font-bold px-8 py-4 rounded-lg text-lg transition-colors"
            >
              Call {SITE.phone}
            </a>
            <Link
              href="/services"
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-8 py-4 rounded-lg text-lg transition-colors"
            >
              View Services
            </Link>
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="bg-brand-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: '🏅', label: 'Licensed & Insured', sub: `CT ${SITE.license}` },
              { icon: '🔍', label: 'Free Inspections', sub: '$0 — No Obligation' },
              { icon: '🛡️', label: 'Warranty', sub: '20-Year Leak Warranty' },
              { icon: '📍', label: 'CT Experts', sub: 'Serving All of Connecticut' },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-3xl mb-1">{item.icon}</div>
                <div className="font-bold">{item.label}</div>
                <div className="text-brand-200 text-sm">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-20 bg-white" id="services">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-heading text-4xl font-bold text-brand-800 text-center mb-4">Roofing Services in Connecticut</h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
            From complete roof replacements to emergency repairs, we handle every aspect of residential and commercial roofing across CT.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group border border-gray-200 rounded-xl p-6 hover:border-brand-400 hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-3">{service.icon}</div>
                <h3 className="font-heading text-xl font-bold text-brand-800 group-hover:text-brand-600 mb-2">{service.name}</h3>
                <p className="text-gray-600 text-sm">{service.description}</p>
                <span className="inline-block mt-3 text-brand-600 font-medium text-sm group-hover:underline">Learn more →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-brand-50" id="why-us">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-heading text-4xl font-bold text-brand-800 text-center mb-12">Why CT Homeowners Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '✅', title: 'Honest Assessments', desc: 'We tell you what your roof actually needs — even when that means recommending a repair instead of a replacement. No upselling, no pressure, no fear tactics.' },
              { icon: '🔨', title: 'Quality You Can See', desc: 'We use premium materials, follow manufacturer installation specs precisely, and back our work with a 20-year leak warranty on roof replacements. Details matter.' },
              { icon: '📍', title: 'Local & Accountable', desc: "We're a Connecticut company. When a question comes up six months after installation, you can reach us. We stand behind our work because our reputation here is everything." },
            ].map((card) => (
              <div key={card.title} className="bg-white rounded-xl p-8 shadow-sm border border-brand-100">
                <div className="text-4xl mb-4">{card.icon}</div>
                <h3 className="font-heading text-xl font-bold text-brand-800 mb-3">{card.title}</h3>
                <p className="text-gray-600">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-20 bg-white" id="areas">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-heading text-4xl font-bold text-brand-800 text-center mb-4">We Serve All of Connecticut</h2>
          <p className="text-center text-gray-600 mb-10">Click your city for local pricing, common roof issues, and neighborhood-specific information.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {CT_CITIES.map((city) => (
              <Link
                key={city.slug}
                href={`/roofing/ct/${city.slug}`}
                className="bg-brand-50 hover:bg-brand-100 text-brand-700 font-medium px-5 py-2.5 rounded-full border border-brand-200 hover:border-brand-400 transition-colors"
              >
                {city.city}, CT
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50" id="faq">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-heading text-4xl font-bold text-brand-800 text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <details key={item.q} className="bg-white border border-gray-200 rounded-xl overflow-hidden group">
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
      <section className="py-20 bg-brand-800 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-heading text-4xl font-bold mb-4">Ready for an Honest Roof Assessment?</h2>
          <p className="text-brand-200 text-lg mb-8">Free inspection, free estimate. No sales pressure. We tell you what your roof actually needs.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={`tel:${SITE.phone.replace(/\D/g, '')}`} className="bg-accent-500 hover:bg-accent-600 text-white font-bold px-8 py-4 rounded-lg text-lg transition-colors">
              Call {SITE.phone}
            </a>
            <Link href="/contact" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-8 py-4 rounded-lg text-lg transition-colors">
              Send a Message
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

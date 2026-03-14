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
  { q: 'Are you licensed and insured in Connecticut?', a: `Yes. We hold CT Home Improvement Contractor license ${SITE.license} and carry full general liability insurance. We can provide certificates on request.` },
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

// SVG icon map for services by slug
const serviceIcons: Record<string, React.ReactNode> = {
  'roof-replacement': (
    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" /><path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" /></svg>
  ),
  'roof-repair': (
    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 6.75a5.25 5.25 0 016.775-5.025.75.75 0 01.313 1.248l-3.32 3.319c.063.475.276.934.641 1.299.365.365.824.578 1.3.641l3.318-3.319a.75.75 0 011.248.313 5.25 5.25 0 01-5.472 6.756c-1.018-.086-1.87.1-2.309.634L7.344 21.3A3.298 3.298 0 112.7 16.657l8.684-7.151c.533-.44.72-1.291.634-2.309A5.342 5.342 0 0112 6.75zM4.117 19.125a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008z" clipRule="evenodd" /></svg>
  ),
  'roof-inspection': (
    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" /></svg>
  ),
  'emergency-roofing': (
    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" /></svg>
  ),
  'storm-damage': (
    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M4.5 9.75a6 6 0 0111.573-2.226 3.75 3.75 0 014.133 4.303A4.5 4.5 0 0118 20.25H6.75a5.25 5.25 0 01-2.23-10.004 6.072 6.072 0 01-.02-.496z" clipRule="evenodd" /></svg>
  ),
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 min-h-[70vh] flex items-center">
        <div className="hero-gradient absolute inset-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-accent-400 text-gray-900 font-bold px-5 py-2 rounded-full mb-6">
                <span className="text-lg">✓</span>
                <div>
                  <div className="text-sm font-extrabold tracking-wide">20-YEAR LEAK WARRANTY</div>
                  <div className="text-xs font-medium opacity-80">INDUSTRY LEADING PROTECTION</div>
                </div>
              </div>
              <h1 className="font-heading text-5xl md:text-6xl font-bold leading-tight mb-6">
                Connecticut&apos;s Most Trusted<br />
                <span className="text-accent-400">Roofing Company</span>
              </h1>
              <p className="text-xl text-brand-100 max-w-2xl mb-8">
                Proudly serving Suffield, CT and surrounding communities. Quality roofing backed by our industry-leading 20-year leak warranty.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="bg-accent-400 hover:bg-accent-500 text-gray-900 font-bold px-8 py-4 rounded-lg text-lg transition-colors"
                >
                  Get Your Free Quote
                </Link>
                <a
                  href={`tel:${SITE.phone.replace(/\D/g, '')}`}
                  className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-8 py-4 rounded-lg text-lg transition-colors"
                >
                  Call {SITE.phone}
                </a>
              </div>
            </div>

            {/* Right: Trust stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '20-Year', label: 'Leak Warranty', sub: 'Transferable' },
                { value: 'Free', label: 'Inspections', sub: 'No Obligation' },
                { value: 'CT', label: 'Licensed & Insured', sub: SITE.license },
                { value: 'Local', label: 'Accountable', sub: 'We Answer When You Call' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 text-white text-center">
                  <div className="text-3xl font-bold font-heading text-accent-400">{stat.value}</div>
                  <div className="font-semibold mt-1">{stat.label}</div>
                  <div className="text-brand-300 text-sm mt-0.5">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="bg-brand-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              {
                icon: <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.741-3.08zm3.099 8.869a.75.75 0 00-1.22-.872l-3.236 4.53L9.53 13.17a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.093l3.75-5.25z" clipRule="evenodd" /></svg>,
                label: 'Licensed & Insured', sub: `CT ${SITE.license}`,
              },
              {
                icon: <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" /></svg>,
                label: 'Free Inspections', sub: '$0 — No Obligation',
              },
              {
                icon: <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.741-3.08z" clipRule="evenodd" /></svg>,
                label: 'Warranty', sub: '20-Year Leak Warranty',
              },
              {
                icon: <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.327a8 8 0 10-16 0c0 3.63 1.556 6.324 3.5 8.327a19.58 19.58 0 002.683 2.282 16.975 16.975 0 001.144.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>,
                label: 'CT Experts', sub: 'Serving All of Connecticut',
              },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-1">{item.icon}</div>
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
          <div className="flex flex-wrap justify-center gap-6">
            {SERVICES.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group border border-gray-200 rounded-xl p-6 hover:border-brand-400 hover:shadow-lg transition-all w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
              >
                <div className="text-brand-600 mb-3">{serviceIcons[service.slug]}</div>
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
              {
                icon: <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>,
                title: 'Honest Assessments',
                desc: 'We tell you what your roof actually needs — even when that means recommending a repair instead of a replacement. No upselling, no pressure, no fear tactics.',
              },
              {
                icon: <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 6.75a5.25 5.25 0 016.775-5.025.75.75 0 01.313 1.248l-3.32 3.319c.063.475.276.934.641 1.299.365.365.824.578 1.3.641l3.318-3.319a.75.75 0 011.248.313 5.25 5.25 0 01-5.472 6.756c-1.018-.086-1.87.1-2.309.634L7.344 21.3A3.298 3.298 0 112.7 16.657l8.684-7.151c.533-.44.72-1.291.634-2.309A5.342 5.342 0 0112 6.75zM4.117 19.125a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008z" clipRule="evenodd" /></svg>,
                title: 'Quality You Can See',
                desc: 'We use premium materials, follow manufacturer installation specs precisely, and back our work with a 20-year leak warranty on roof replacements. Details matter.',
              },
              {
                icon: <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.327a8 8 0 10-16 0c0 3.63 1.556 6.324 3.5 8.327a19.58 19.58 0 002.683 2.282 16.975 16.975 0 001.144.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>,
                title: 'Local & Accountable',
                desc: "We're a Connecticut company. When a question comes up six months after installation, you can reach us. We stand behind our work because our reputation here is everything.",
              },
            ].map((card) => (
              <div key={card.title} className="bg-white rounded-xl p-8 shadow-sm border border-brand-100">
                <div className="text-brand-600 mb-4">{card.icon}</div>
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
                className="bg-white hover:bg-brand-50 text-brand-800 font-medium px-5 py-3 rounded-xl border border-gray-200 hover:border-brand-400 hover:shadow-sm transition-all text-sm"
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
            <a href={`tel:${SITE.phone.replace(/\D/g, '')}`} className="bg-accent-400 hover:bg-accent-500 text-gray-900 font-bold px-8 py-4 rounded-lg text-lg transition-colors">
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

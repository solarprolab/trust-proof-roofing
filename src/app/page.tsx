import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE, SERVICES } from '@/lib/config';
import { CT_CITIES } from '@/data/cityPages';
import InstantQuoteTrigger from '@/components/InstantQuoteTrigger';

export const metadata: Metadata = {
  title: `${SITE.name} | Connecticut's Roofing Tech Company`,
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
  { q: 'Do you offer free estimates?', a: "Yes, always. We provide free roof inspections and written estimates with no sales pressure. We tell you what your roof actually needs — even if that's just a repair." },
];

const steps = [
  { n: '01', title: 'Enter Your Address', desc: 'Get a real price range based on your actual roof — measured to your property, not estimated from a zip code.' },
  { n: '02', title: 'We Come To You', desc: 'Full roof assessment, documented in detail. Drone footage, photos, written findings. You see exactly what we see.' },
  { n: '03', title: 'See Everything In Writing', desc: 'Itemized proposal within 24 hours. Materials, scope, payment schedule, start date. No verbal estimates.' },
  { n: '04', title: 'Work Begins', desc: '20-year leak warranty on every replacement, in writing. Manufacturer warranties up to 50 years. Both transferable.' },
];

const placeholderReviews = [
  { name: 'Homeowner in Suffield, CT', text: 'Review coming soon — leave us a Google review and we\'ll feature it here.' },
  { name: 'Homeowner in Enfield, CT', text: 'Review coming soon — leave us a Google review and we\'ll feature it here.' },
  { name: 'Homeowner in Windsor, CT', text: 'Review coming soon — leave us a Google review and we\'ll feature it here.' },
  { name: 'Homeowner in Simsbury, CT', text: 'Review coming soon — leave us a Google review and we\'ll feature it here.' },
  { name: 'Homeowner in West Hartford, CT', text: 'Review coming soon — leave us a Google review and we\'ll feature it here.' },
];

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Trust Proof Roofing LLC',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Suffield',
    addressRegion: 'CT',
    postalCode: '06078',
    addressCountry: 'US',
  },
  telephone: SITE.phone,
  url: SITE.url,
  license: SITE.license,
  areaServed: { '@type': 'State', name: 'Connecticut' },
};

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="bg-[#0a1f3d] text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy + CTA */}
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
              Know Your Roof. Know Your Price.<br />
              <span className="text-yellow-400">20-Year Guarantee.</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-xl">
              Enter your address and get a real price range in 60 seconds — measured from your actual roof, not made up. We show you everything before we start, put it all in writing, and back every replacement with a 20-year leak warranty.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#quote"
                  className="inline-block bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black px-8 py-4 rounded-xl text-lg transition-colors text-center"
              >
                Get Your Instant Estimate
              </a>
              <a
                href={`tel:${SITE.phone.replace(/\D/g, '')}`}
                className="inline-block bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors text-center"
              >
                Call {SITE.phone}
              </a>
            </div>
          </div>

          {/* Right: founder placeholder + pull quote */}
          <div className="flex flex-col items-center lg:items-end gap-6">
            <div className="w-full max-w-xs">
              {/* Headshot placeholder */}
              <div className="bg-[#1e3a5f] rounded-2xl w-full aspect-[3/4] flex flex-col items-center justify-center border border-white/10">
                <div className="w-20 h-20 rounded-full bg-white/10 mb-4" />
                <p className="text-white font-bold text-lg">Tenzin, Founder</p>
                <p className="text-white/50 text-sm mt-1">CT HIC #{SITE.license}</p>
              </div>
              {/* Pull quote */}
              <div className="mt-4 bg-yellow-400/10 border border-yellow-400/30 rounded-xl px-5 py-4 text-center">
                <p className="text-yellow-300 font-bold text-lg italic">&ldquo;I put my name on every job.&rdquo;</p>
                <p className="text-white/50 text-sm mt-1">— Tenzin, Owner</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-3">How It Works</h2>
          <p className="text-center text-gray-500 mb-12">Four steps. No surprises. Everything in writing.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div key={step.n} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="text-4xl font-black text-yellow-400 mb-3">{step.n}</div>
                <h3 className="text-lg font-black text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRANSPARENCY CALLOUT ──────────────────────────────── */}
      <section className="bg-[#0a1f3d] py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">We Show You Everything.</h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Most roofers say call for pricing. We give you a real number before you ever pick up the phone. Itemized proposals. Full photo documentation. A 20-year leak warranty in writing. No surprises, no pressure — just proof.
          </p>
        </div>
      </section>

      {/* ── QUOTE WIDGET ──────────────────────────────────────── */}
      <section className="py-20 bg-gray-50" id="quote">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-3">See Your Real Price Range</h2>
          <InstantQuoteTrigger />
        </div>
      </section>

      {/* ── REVIEW STRIP ──────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-3">What CT Homeowners Are Saying</h2>
          <p className="text-center text-gray-500 mb-10">Real reviews from homeowners across Connecticut.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {placeholderReviews.map((r) => (
              <div key={r.name} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col gap-3">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <svg key={s} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-400 text-sm italic leading-relaxed flex-1">{r.text}</p>
                <p className="text-gray-500 text-xs font-semibold">{r.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES GRID ─────────────────────────────────────── */}
      <section className="py-20 bg-gray-50" id="services">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-4">Roofing Services in Connecticut</h2>
          <p className="text-center text-gray-500 max-w-2xl mx-auto mb-12">
            From complete roof replacements to emergency repairs — every service backed by our 20-year warranty.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-yellow-400 hover:shadow-lg transition-all"
              >
                <h3 className="text-xl font-black text-gray-900 group-hover:text-[#0a1f3d] mb-2">{service.name}</h3>
                <p className="text-gray-500 text-sm mb-3">{service.description}</p>
                <span className="text-[#0a1f3d] font-semibold text-sm group-hover:underline">Learn more →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICE AREAS ─────────────────────────────────────── */}
      <section className="py-20 bg-white" id="areas">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-4">We Serve All of Connecticut</h2>
          <p className="text-center text-gray-500 mb-10">Click your city for local pricing, common roof issues, and neighborhood-specific information.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[...CT_CITIES].sort((a, b) => a.city.localeCompare(b.city)).map((city) => (
              <Link
                key={city.slug}
                href={`/roofing/ct/${city.slug}`}
                className={
                  city.slug === 'suffield'
                    ? 'w-[calc(50%-6px)] sm:w-[calc(25%-9px)] bg-[#0a1f3d] text-white font-semibold px-5 py-3 rounded-xl border border-[#0a1f3d] hover:bg-[#0f2d52] transition-all text-sm text-center'
                    : 'w-[calc(50%-6px)] sm:w-[calc(25%-9px)] bg-white text-gray-800 font-medium px-5 py-3 rounded-xl border border-gray-200 hover:border-[#0a1f3d] hover:bg-gray-50 transition-all text-sm text-center'
                }
              >
                {city.city}, CT
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50" id="faq">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <details key={item.q} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <summary className="flex justify-between items-center px-6 py-4 font-semibold text-gray-900 hover:text-[#0a1f3d] cursor-pointer">
                  {item.q}
                  <span className="faq-chevron text-gray-400 ml-4 flex-shrink-0">▼</span>
                </summary>
                <div className="px-6 pb-5 text-gray-600 leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ────────────────────────────────────────── */}
      <section className="bg-[#0a1f3d] py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Get Your Free Roof Assessment
          </h2>
          <p className="text-white/70 text-lg mb-10">
            We inspect your roof, tell you exactly what it needs — even if that means you don&apos;t need us. No pressure, ever.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black rounded-xl text-lg transition-colors"
            >
              Request Free Estimate
            </Link>
            <a
              href={`tel:${SITE.phone.replace(/\D/g, '')}`}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold rounded-xl text-lg transition-colors"
            >
              Call {SITE.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

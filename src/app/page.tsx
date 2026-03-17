import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE, SERVICES } from '@/lib/config';
import { CT_CITIES } from '@/data/cityPages';
import InstantQuote from '@/components/InstantQuote';

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a1f3d] via-[#0f2d52] to-[#1e3a5f]">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
        <div className="relative border-b border-white/10 py-3">
          <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center">
            {['✓ CT HIC Licensed & Insured','✓ 20-Year Leak Warranty','✓ Free Drone Assessment','✓ Response Within 2 Hours'].map(t => (
              <span key={t} className="text-white/70 text-xs font-medium tracking-wide">{t}</span>
            ))}
          </div>
        </div>
        <div className="relative max-w-5xl mx-auto px-6 pt-14 pb-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-yellow-400/15 border border-yellow-400/30 text-yellow-300 text-xs font-bold px-4 py-1.5 rounded-full mb-5 tracking-widest uppercase">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/></svg>
              Get a Real Number — Not 'Call for Pricing'
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
              See Your Roof. Know Your Price.<br />
              <span className="text-yellow-400">20-Year Guarantee.</span>
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Proudly serving Suffield, CT and surrounding communities. Quality roofing backed by our industry-leading 20-year leak warranty.
            </p>
          </div>
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute -inset-4 bg-yellow-400/10 rounded-3xl blur-2xl" />
            <div className="relative flex justify-center mb-3">
              <div className="inline-flex items-center gap-2.5 bg-yellow-400 text-gray-900 text-sm font-black px-5 py-2 rounded-full shadow-lg">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
                Get a Real Number — Not 'Call for Pricing'
              </div>
            </div>
            <div className="relative">
              <InstantQuote />
            </div>
            <div className="relative mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {icon:'🛰️',label:'Your Roof, Measured',sub:'We size it to your actual property — not a guess'},
                {icon:'💰',label:'Real Price Range',sub:'Not a "call for pricing" runaround'},
                {icon:'🚁',label:'Free Drone Followup',sub:'Exact price confirmed on-site'},
              ].map(p => (
                <div key={p.label} className="bg-white/[0.08] border border-white/10 rounded-xl p-3 text-center">
                  <div className="text-xl mb-1">{p.icon}</div>
                  <div className="text-white text-xs font-semibold leading-tight">{p.label}</div>
                  <div className="text-white/50 text-[10px] mt-0.5">{p.sub}</div>
                </div>
              ))}
            </div>
            <div className="relative mt-5 text-center">
              <span className="text-white/40 text-sm">Prefer to talk? </span>
              <a href="tel:9593338569" className="text-yellow-400 font-bold text-sm hover:text-yellow-300 transition-colors">Call (959) 333-8569 →</a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="bg-[#1e3a5f] text-white py-6">
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
                <div className="text-white/60 text-sm">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manufacturer logos */}
      <section className="py-10 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-8">Materials We Install</p>
          <div className="flex flex-wrap items-center justify-center gap-10">
            {['GAF', 'Owens Corning', 'CertainTeed', 'IKO', 'Atlas'].map((brand) => (
              <div key={brand} className="text-gray-300 hover:text-gray-500 transition-colors">
                <span className="text-2xl font-black tracking-tight">{brand}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-20 bg-white" id="services">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-4">Roofing Services in Connecticut</h2>
          <p className="text-center text-gray-500 max-w-2xl mx-auto mb-12">
            From complete roof replacements to emergency repairs, we handle every aspect of residential and commercial roofing across CT.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {SERVICES.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group border border-gray-200 rounded-2xl p-6 hover:border-yellow-400 hover:shadow-lg transition-all duration-300 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
              >
                <div className="text-[#1e3a5f] mb-3">{serviceIcons[service.slug]}</div>
                <h3 className="text-xl font-black text-gray-900 group-hover:text-[#1e3a5f] mb-2">{service.name}</h3>
                <p className="text-gray-500 text-sm">{service.description}</p>
                <span className="inline-block mt-3 text-[#1e3a5f] font-semibold text-sm group-hover:underline">Learn more →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-yellow-500 font-semibold text-sm uppercase tracking-widest mb-2">Simple Process</p>
            <h2 className="text-4xl font-black text-gray-900">How It Works</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">No surprises, no pressure. Just a straightforward process from first call to finished roof.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line on desktop */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-yellow-200 z-0" />
            {[
              {
                step: '01',
                title: 'Free Inspection',
                desc: 'We come to you, inspect your roof, and give you an honest assessment — no sales pressure, no obligation.',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                ),
              },
              {
                step: '02',
                title: 'Clear Quote',
                desc: 'You get a written quote with everything included — materials, labor, cleanup. No hidden fees, ever.',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                ),
              },
              {
                step: '03',
                title: 'Work Gets Done',
                desc: 'Our crew shows up on time, completes the job cleanly, and we do a full walkthrough before final payment.',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ),
              },
            ].map((item) => (
              <div key={item.step} className="relative bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-yellow-300 hover:shadow-lg transition-all duration-300 z-10">
                <div className="w-14 h-14 bg-[#1e3a5f] text-white rounded-xl flex items-center justify-center mb-5">
                  {item.icon}
                </div>
                <div className="text-xs font-black text-yellow-500 uppercase tracking-widest mb-2">Step {item.step}</div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50" id="why-us">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-12">Why CT Homeowners Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>,
                title: 'Honest Assessments',
                desc: 'We tell you what your roof actually needs — even when that means recommending a repair instead of a replacement. No upselling, no pressure, no fear tactics.',
              },
              {
                icon: <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 6.75a5.25 5.25 0 016.775-5.025.75.75 0 01.313 1.248l-3.32 3.319c.063.475.276.934.641 1.299.365.365.824.578 1.3.641l3.318-3.319a.75.75 0 011.248.313 5.25 5.25 0 01-5.472 6.756c-1.018-.086-1.87.1-2.309.634L7.344 21.3A3.298 3.298 0 112.7 16.657l8.684-7.151c.533-.44.72-1.291.634-2.309A5.342 5.342 0 0112 6.75zM4.117 19.125a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008z" clipRule="evenodd" /></svg>,
                title: 'Quality You Can See',
                desc: 'We use premium materials, follow manufacturer installation specs precisely, and back our work with a 20-year leak warranty on roof replacements. Details matter.',
              },
              {
                icon: <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.327a8 8 0 10-16 0c0 3.63 1.556 6.324 3.5 8.327a19.58 19.58 0 002.683 2.282 16.975 16.975 0 001.144.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>,
                title: 'Local & Accountable',
                desc: "We're a Connecticut company. When a question comes up six months after installation, you can reach us. We stand behind our work because our reputation here is everything.",
              },
            ].map((card, index) => (
              <div key={card.title} className="bg-white rounded-2xl p-8 border border-gray-100 border-l-4 border-l-yellow-400 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
                    {card.icon}
                  </div>
                  <span className="text-4xl font-black text-gray-100">0{index + 1}</span>
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{card.title}</h3>
                <p className="text-gray-500">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-20 bg-white" id="areas">
        <div className="max-w-7xl mx-auto px-4">
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

      {/* FAQ */}
      <section className="py-20 bg-gray-50" id="faq">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <details key={item.q} className="bg-white border border-gray-200 rounded-xl overflow-hidden group">
                <summary className="flex justify-between items-center px-6 py-4 font-semibold text-gray-900 hover:text-[#1e3a5f]">
                  {item.q}
                  <span className="faq-chevron text-gray-400 ml-4 flex-shrink-0">▼</span>
                </summary>
                <div className="px-6 pb-5 text-gray-600 leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80"
            alt="Connecticut roofing"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0f2340]/88" />
        </div>
        {/* Diagonal top cut */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gray-50" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 0)' }} />
        {/* Diagonal bottom cut */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-50" style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }} />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/30 rounded-full px-4 py-1.5 mb-6">
            <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <span className="text-yellow-400 text-xs font-semibold uppercase tracking-wider">Free — No Obligation</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
            Get Your Free<br /><span className="text-yellow-400">Roof Assessment</span>
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
            We inspect your roof, tell you exactly what it needs — even if that means you don&apos;t need us. No pressure, ever.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold rounded-xl text-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5">
              Request Free Estimate
            </Link>
            <a href={`tel:${SITE.phone.replace(/\D/g, '')}`} className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold rounded-xl text-lg transition-all duration-200 backdrop-blur-sm">
              Call {SITE.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

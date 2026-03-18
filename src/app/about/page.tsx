import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/config';

export const metadata: Metadata = {
  title: 'About Trust Proof Roofing | Connecticut Roofer',
  description: 'Learn why Trust Proof Roofing was founded — to give CT homeowners an honest roofing contractor they can actually trust. Licensed, insured, locally accountable.',
  alternates: { canonical: `${SITE.url}/about` },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
    { '@type': 'ListItem', position: 2, name: 'About', item: `${SITE.url}/about` },
  ],
};

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero */}
      <section className="bg-brand-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="text-brand-300 text-sm mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">›</span>
            <span>About</span>
          </nav>
          <h1 className="font-heading text-5xl font-bold mb-4">About Trust Proof Roofing</h1>
          <p className="text-brand-200 text-xl max-w-2xl">Founded to give Connecticut homeowners a roofing contractor they can actually trust.</p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          {/* Founder card */}
          <div className="flex flex-col md:flex-row gap-10 items-center mb-16 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <div className="flex-shrink-0">
              <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e] flex items-center justify-center text-white text-5xl font-black shadow-lg">
                T
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">Tenzin</h2>
              <p className="text-[#38BDF8] font-semibold text-sm mb-3">Founder &amp; Managing Member — Trust Proof Roofing LLC</p>
              <p className="text-gray-600 leading-relaxed">Connecticut-licensed home improvement contractor (HIC.0703927) serving homeowners across the state. I started Trust Proof Roofing because I believe every homeowner deserves honest advice about their roof — whether that means a full replacement or just a minor repair. No upselling. No pressure. Just straight talk and quality work.</p>
            </div>
          </div>

          <h2 className="font-heading text-3xl font-bold text-brand-800 mb-6">Why We Started Trust Proof Roofing</h2>
          <div className="prose prose-lg text-gray-700 space-y-5">
            <p>
              Too many Connecticut homeowners are getting burned by roofing contractors. The pattern is familiar: a storm rolls through, a door-knocking crew appears the next day, and before the homeowner has time to think, they&apos;ve signed a contract for a full replacement they may not have needed — at a price that bears no relationship to the actual work.
            </p>
            <p>
              Trust Proof Roofing was founded on a different premise. Our approach starts with an inspection, not a sales pitch. We go on your roof, we document what we find, and we tell you honestly what it needs. Sometimes that&apos;s a full replacement. Often it&apos;s a repair. Occasionally it&apos;s nothing at all — just peace of mind that your roof is sound.
            </p>
            <p>
              We believe that doing the honest thing, consistently, is the only way to build a company worth building. A homeowner who gets a fair assessment becomes a customer for life — and tells their neighbors. That&apos;s the model we&apos;re building: one honest inspection at a time.
            </p>
            <p>
              We hold CT Home Improvement Contractor license {SITE.license}, carry full liability insurance, and back all our roof replacements with a 20-year leak warranty. Every estimate is written, itemized, and explained — no surprises at the end of the job.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-brand-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-heading text-3xl font-bold text-brand-800 text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>,
                title: 'Honesty First',
                desc: "We tell you what your roof needs, even when that means recommending a $400 repair instead of a $15,000 replacement. Short-term honesty builds long-term relationships.",
              },
              {
                icon: <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 6.75a5.25 5.25 0 016.775-5.025.75.75 0 01.313 1.248l-3.32 3.319c.063.475.276.934.641 1.299.365.365.824.578 1.3.641l3.318-3.319a.75.75 0 011.248.313 5.25 5.25 0 01-5.472 6.756c-1.018-.086-1.87.1-2.309.634L7.344 21.3A3.298 3.298 0 112.7 16.657l8.684-7.151c.533-.44.72-1.291.634-2.309A5.342 5.342 0 0112 6.75zM4.117 19.125a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008z" clipRule="evenodd" /></svg>,
                title: 'Quality Materials',
                desc: "We install premium products — GAF and Owens Corning shingles, proper ice-and-water shield, quality underlayment. We don't cut corners on materials to win on price.",
              },
              {
                icon: <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.741-3.08zm3.099 8.869a.75.75 0 00-1.22-.872l-3.236 4.53L9.53 13.17a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.093l3.75-5.25z" clipRule="evenodd" /></svg>,
                title: 'Licensed & Insured',
                desc: `CT License ${SITE.license}. Full general liability insurance. We pull permits and follow code. No shortcuts.`,
              },
              {
                icon: <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.327a8 8 0 10-16 0c0 3.63 1.556 6.324 3.5 8.327a19.58 19.58 0 002.683 2.282 16.975 16.975 0 001.144.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>,
                title: 'Local Accountability',
                desc: "We live and work in Connecticut. When you call six months after we finished your roof, we answer. Our reputation here is everything — that's real accountability.",
              },
            ].map((card) => (
              <div key={card.title} className="bg-white rounded-xl p-6 shadow-sm border border-brand-100">
                <div className="text-brand-600 mb-4">{card.icon}</div>
                <h3 className="font-heading text-xl font-bold text-brand-800 mb-2">{card.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-800 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-heading text-3xl font-bold mb-4">Ready to Work with a Roofer You Can Trust?</h2>
          <p className="text-brand-200 mb-8">Free inspection, honest assessment, written estimate. No pressure, no games.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={`tel:${SITE.phone.replace(/\D/g, '')}`} className="bg-accent-400 hover:bg-accent-500 text-white font-bold px-8 py-4 rounded-lg text-lg transition-colors">
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

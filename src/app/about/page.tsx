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
              We hold CT Home Improvement Contractor license {SITE.license}, carry full liability and workers&apos; compensation insurance, and back all our roof replacements with a 20-year leak warranty. Every estimate is written, itemized, and explained — no surprises at the end of the job.
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
              { icon: '✅', title: 'Honesty First', desc: "We tell you what your roof needs, even when that means recommending a $400 repair instead of a $15,000 replacement. Short-term honesty builds long-term relationships." },
              { icon: '🔨', title: 'Quality Materials', desc: 'We install premium products — GAF and Owens Corning shingles, proper ice-and-water shield, quality underlayment. We don\'t cut corners on materials to win on price.' },
              { icon: '🏅', title: 'Licensed & Insured', desc: `CT License ${SITE.license}. Full general liability and workers' compensation insurance. We pull permits and follow code. No shortcuts.` },
              { icon: '📍', title: 'Local Accountability', desc: "We live and work in Connecticut. When you call six months after we finished your roof, we answer. Our reputation here is everything — that's real accountability." },
            ].map((card) => (
              <div key={card.title} className="bg-white rounded-xl p-6 shadow-sm border border-brand-100">
                <div className="text-4xl mb-4">{card.icon}</div>
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

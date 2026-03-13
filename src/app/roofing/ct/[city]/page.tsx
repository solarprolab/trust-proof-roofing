import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SITE, SERVICES } from '@/lib/config';
import { CT_CITIES, getCityBySlug } from '@/data/cityPages';

export async function generateStaticParams() {
  return CT_CITIES.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const city = getCityBySlug(params.city);
  if (!city) return {};
  return {
    title: `Roofing Contractor in ${city.city}, CT | ${SITE.name}`,
    description: `Trusted roofing contractor in ${city.city}, Connecticut. Roof replacement ($${city.avgRoofReplacementCost}), repair, inspection & emergency service. Licensed & insured. Free estimate.`,
    alternates: { canonical: `${SITE.url}/roofing/ct/${city.slug}` },
  };
}

export default function CityPage({ params }: { params: { city: string } }) {
  const city = getCityBySlug(params.city);
  if (!city) notFound();

  const otherCities = CT_CITIES.filter((c) => c.slug !== city.slug);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
      { '@type': 'ListItem', position: 2, name: 'Connecticut Roofing', item: `${SITE.url}/roofing/ct` },
      { '@type': 'ListItem', position: 3, name: `${city.city} Roofing`, item: `${SITE.url}/roofing/ct/${city.slug}` },
    ],
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Roofing Contractor in ${city.city}, CT`,
    description: `Professional roofing services in ${city.city}, Connecticut including roof replacement, repair, inspection, and emergency roofing.`,
    provider: {
      '@type': 'RoofingContractor',
      name: SITE.name,
      telephone: SITE.phone,
      url: SITE.url,
    },
    areaServed: {
      '@type': 'City',
      name: city.city,
      containedInPlace: { '@type': 'State', name: 'Connecticut' },
    },
    url: `${SITE.url}/roofing/ct/${city.slug}`,
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: city.faq.map((item) => ({
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
            <span className="hover:text-white">Connecticut</span>
            <span className="mx-2">›</span>
            <span>{city.city}</span>
          </nav>
          <h1 className="font-heading text-5xl font-bold mb-4">Roofing Contractor in {city.city}, Connecticut</h1>
          <p className="text-brand-200 text-xl max-w-2xl">
            Licensed, insured, and locally accountable. Serving {city.city} homeowners with honest assessments and quality roofing work.
          </p>
        </div>
      </section>

      {/* Quick stats */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Avg. Replacement Cost', value: city.avgRoofReplacementCost },
              { label: 'Median Home Value', value: `$${city.medianHomeValue.toLocaleString()}` },
              { label: 'Most Common Roof Type', value: city.commonRoofType },
              { label: 'Avg. Roof Age', value: `${city.avgRoofAge} years` },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-brand-700">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local angle */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-heading text-3xl font-bold text-brand-800 mb-6">Roofing in {city.city}: What You Need to Know</h2>
              <p className="text-gray-700 leading-relaxed text-lg">{city.localAngle}</p>
            </div>
            <div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-amber-900 mb-2">🍂 Seasonal Tip for {city.city}</h3>
                <p className="text-amber-800 text-sm leading-relaxed">{city.seasonalNote}</p>
              </div>

              <div className="bg-brand-50 rounded-xl p-6">
                <h3 className="font-semibold text-brand-800 mb-3">Common Weather Challenges</h3>
                <ul className="space-y-2">
                  {city.weatherChallenges.map((challenge) => (
                    <li key={challenge} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-brand-500 mt-0.5">⚠</span>
                      {challenge}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Neighborhoods + zip codes */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-brand-800 mb-3">Neighborhoods We Serve in {city.city}</h3>
              <div className="flex flex-wrap gap-2">
                {city.neighborhoods.map((n) => (
                  <span key={n} className="bg-brand-50 text-brand-700 text-sm px-3 py-1 rounded-full border border-brand-200">{n}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-brand-800 mb-3">Zip Codes Served</h3>
              <div className="flex flex-wrap gap-2">
                {city.zipCodes.map((z) => (
                  <span key={z} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full font-mono">{z}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-heading text-3xl font-bold text-brand-800 mb-8">Roofing Services in {city.city}, CT</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-4 hover:border-brand-400 hover:shadow-sm transition-all"
              >
                <span className="text-2xl">{service.icon}</span>
                <div>
                  <div className="font-medium text-gray-900">{service.name}</div>
                  <div className="text-xs text-gray-500">{service.shortName} in {city.city}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-heading text-3xl font-bold text-brand-800 mb-8">Roofing in {city.city} — Common Questions</h2>
          <div className="space-y-3">
            {city.faq.map((item) => (
              <details key={item.q} className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
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
          <h2 className="font-heading text-3xl font-bold mb-4">Free Roof Inspection in {city.city}</h2>
          <p className="text-brand-200 mb-8">Honest assessment, written estimate, zero obligation. Serving {city.city} and all of {city.county} County.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={`tel:${SITE.phone.replace(/\D/g, '')}`} className="bg-accent-500 hover:bg-accent-600 text-white font-bold px-8 py-4 rounded-lg text-lg transition-colors">
              Call {SITE.phone}
            </a>
            <Link href="/contact" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-8 py-4 rounded-lg text-lg transition-colors">
              Request Estimate Online
            </Link>
          </div>
        </div>
      </section>

      {/* Nearby cities + all cities */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-brand-800 mb-4">Nearby Cities We Serve</h3>
              <div className="flex flex-wrap gap-3">
                {city.nearbyCity.map((nc) => (
                  <Link key={nc.slug} href={`/roofing/ct/${nc.slug}`} className="bg-brand-50 hover:bg-brand-100 text-brand-700 font-medium px-4 py-2 rounded-full border border-brand-200 transition-colors text-sm">
                    {nc.city}, CT →
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-brand-800 mb-4">All Connecticut Service Areas</h3>
              <div className="flex flex-wrap gap-2">
                {otherCities.map((c) => (
                  <Link key={c.slug} href={`/roofing/ct/${c.slug}`} className="text-brand-600 hover:underline text-sm">{c.city}</Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

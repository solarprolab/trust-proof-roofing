import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import WarrantyBadge from '../components/WarrantyBadge'

const services = [
  {
    title: 'Roof Installation',
    icon: '🏠',
    description:
      'Whether you\'re building a new home or your current roof has reached the end of its life, Trust Proof Roofing delivers expert installation using only premium materials. We work with asphalt shingles, architectural shingles, metal roofing, and more — all backed by our 20-year leak warranty.',
    features: [
      'Premium asphalt & architectural shingles',
      'Metal roofing systems',
      'Proper ventilation & underlayment',
      'Code-compliant installation',
      '20-year leak warranty included',
    ],
  },
  {
    title: 'Roof Repair',
    icon: '🔧',
    description:
      'Don\'t let a small leak turn into a major problem. Our certified technicians diagnose and repair any roofing issue quickly — from missing or cracked shingles to flashing failures and structural damage from storms.',
    features: [
      'Emergency leak repairs',
      'Storm & wind damage repair',
      'Missing/damaged shingle replacement',
      'Flashing & chimney repair',
      'Skylight leak repair',
    ],
  },
  {
    title: 'Roof Replacement',
    icon: '🔄',
    description:
      'When repairs are no longer cost-effective, a full roof replacement is the smartest investment you can make. We handle everything from tear-off to final inspection, with minimal disruption to your daily life.',
    features: [
      'Complete tear-off & disposal',
      'Deck inspection & repair',
      'Ice & water shield installation',
      'Energy-efficient shingle options',
      'Same-day starts available',
    ],
  },
  {
    title: 'Gutter Services',
    icon: '💧',
    description:
      'Gutters are your roof\'s best defense against water damage to your foundation, siding, and landscaping. We install, repair, and clean gutters to keep your home protected year-round through Connecticut\'s harsh winters.',
    features: [
      'Seamless gutter installation',
      'Gutter cleaning & flushing',
      'Downspout repair & extension',
      'Gutter guard installation',
      'Fascia board repair',
    ],
  },
  {
    title: 'Roof Inspections',
    icon: '🔍',
    description:
      'A comprehensive roof inspection can save you thousands. We provide detailed written inspection reports — ideal for home buyers, sellers, or annual maintenance. No pressure, no upselling, just honest expertise.',
    features: [
      'Full written inspection report',
      'Photo documentation',
      'Estimated remaining lifespan',
      'Priority repair recommendations',
      'Insurance claim assistance',
    ],
  },
]

export default function Services() {
  return (
    <>
      <PageHero
        title="Roofing Services"
        subtitle="Full-service roofing for Connecticut homeowners — from emergency repairs to complete replacements."
      />

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {services.map(({ title, icon, description, features }, idx) => (
            <div
              key={title}
              className={`flex flex-col md:flex-row gap-8 items-start ${
                idx % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Icon card */}
              <div className="w-full md:w-56 shrink-0 bg-[#1B3A6B] rounded-2xl p-8 flex flex-col items-center text-center">
                <div className="text-5xl mb-3">{icon}</div>
                <h3 className="text-white font-black text-lg">{title}</h3>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h2 className="text-2xl font-black text-[#1B3A6B] mb-3">{title}</h2>
                <p className="text-gray-600 leading-relaxed mb-4">{description}</p>
                <ul className="space-y-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-gray-700 text-sm">
                      <svg className="w-4 h-4 text-[#1B3A6B] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1B3A6B] py-14 text-center px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center mb-4">
            <WarrantyBadge />
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Every Service Backed by Our 20-Year Warranty</h2>
          <p className="text-blue-200 mb-6">Get a free estimate with no obligation. We'll come to you.</p>
          <Link
            to="/quote"
            className="inline-block bg-yellow-400 hover:bg-yellow-300 text-[#1B3A6B] font-black px-8 py-4 rounded-full transition-colors text-lg"
          >
            Get Your Free Quote
          </Link>
        </div>
      </section>
    </>
  )
}

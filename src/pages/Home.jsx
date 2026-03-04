import { Link } from 'react-router-dom'
import WarrantyBadge from '../components/WarrantyBadge'
import StarRating from '../components/StarRating'

const trustBadges = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    label: 'Licensed & Insured',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    label: '20+ Years Experience',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: 'Local CT Team',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: 'Free Estimates',
  },
]

const services = [
  {
    title: 'Roof Installation',
    desc: 'New construction or full replacement — we install roofs built to last the New England climate.',
    icon: '🏠',
  },
  {
    title: 'Roof Repair',
    desc: 'Leaks, missing shingles, storm damage — fast, reliable repairs that stop water intrusion.',
    icon: '🔧',
  },
  {
    title: 'Gutter Services',
    desc: 'Installation, cleaning, and repair of gutters to protect your home\'s foundation.',
    icon: '💧',
  },
  {
    title: 'Free Inspections',
    desc: 'Comprehensive roof inspections with a written report — no pressure, no surprises.',
    icon: '🔍',
  },
]

const reviews = [
  {
    name: 'Maria S.',
    location: 'Suffield, CT',
    text: 'Trust Proof replaced our entire roof in two days. The crew was professional and the cleanup was spotless. Couldn\'t be happier!',
    rating: 5,
  },
  {
    name: 'Jim K.',
    location: 'Windsor, CT',
    text: 'After the storm took off a section of our roof, they were out the next morning. Fair price and excellent work. Highly recommend.',
    rating: 5,
  },
  {
    name: 'Denise T.',
    location: 'Enfield, CT',
    text: 'The 20-year warranty sealed the deal for us. Five years later, not a single leak. These guys are the real deal.',
    rating: 5,
  },
]

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section
        className="relative bg-[#1B3A6B] text-white overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(135deg, #1B3A6B 0%, #122a52 60%, #1B3A6B 100%)',
        }}
      >
        {/* Decorative roof shape */}
        <div className="absolute inset-0 opacity-5">
          <svg viewBox="0 0 1440 600" preserveAspectRatio="none" className="w-full h-full">
            <polygon points="720,40 1440,350 0,350" fill="white" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <div className="flex justify-center mb-6">
            <WarrantyBadge />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-5 max-w-3xl mx-auto">
            Connecticut's Most Trusted Roofing Company
          </h1>
          <p className="text-blue-200 text-lg sm:text-xl max-w-2xl mx-auto mb-8">
            Proudly serving Suffield, CT and surrounding communities. Quality roofing backed by our industry-leading 20-year leak warranty.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/quote"
              className="bg-yellow-400 hover:bg-yellow-300 text-[#1B3A6B] font-black text-lg px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Get Your Free Quote
            </Link>
            <a
              href="tel:+18605550192"
              className="border-2 border-white hover:bg-white hover:text-[#1B3A6B] text-white font-bold text-lg px-8 py-4 rounded-full transition-all"
            >
              Call (860) 555-0192
            </a>
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { value: '20+', label: 'Years Serving CT' },
              { value: '1,500+', label: 'Roofs Installed' },
              { value: '4.9★', label: 'Average Rating' },
              { value: '20yr', label: 'Leak Warranty' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-black text-yellow-400">{value}</div>
                <div className="text-blue-300 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 30C1200 60 960 0 720 30C480 60 240 0 0 30L0 60Z" fill="white" />
          </svg>
        </div>
        <div className="h-12" />
      </section>

      {/* Trust Badges */}
      <section className="py-10 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map(({ icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#f5f6f8] text-[#1B3A6B]">
                <div className="text-[#1B3A6B]">{icon}</div>
                <span className="font-semibold text-sm text-center">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-[#1B3A6B] mb-3">Our Roofing Services</h2>
            <p className="text-gray-600 max-w-xl mx-auto">From repairs to full replacements, we handle every aspect of your roof with expert care.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map(({ title, desc, icon }) => (
              <div key={title} className="bg-[#f5f6f8] rounded-2xl p-6 hover:shadow-md transition-shadow group">
                <div className="text-4xl mb-3">{icon}</div>
                <h3 className="font-bold text-[#1B3A6B] text-lg mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/services" className="inline-block bg-[#1B3A6B] hover:bg-[#122a52] text-white font-bold px-7 py-3 rounded-full transition-colors">
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* Warranty Callout */}
      <section className="bg-[#1B3A6B] py-14 text-white text-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-4">
            <WarrantyBadge />
          </div>
          <h2 className="text-3xl font-black mb-3">We Stand Behind Every Roof We Install</h2>
          <p className="text-blue-200 text-lg mb-6">
            Our 20-year leak warranty is the best in Connecticut. If your roof leaks within 20 years of installation, we fix it — free of charge.
          </p>
          <Link
            to="/quote"
            className="inline-block bg-yellow-400 hover:bg-yellow-300 text-[#1B3A6B] font-black px-8 py-4 rounded-full transition-colors text-lg"
          >
            Get a Free Estimate Today
          </Link>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16 bg-[#f5f6f8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-[#1B3A6B] mb-2">What Our Customers Say</h2>
            <p className="text-gray-600">Hundreds of satisfied homeowners across Connecticut</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map(({ name, location, text, rating }) => (
              <div key={name} className="bg-white rounded-2xl p-6 shadow-sm">
                <StarRating rating={rating} />
                <p className="text-gray-700 text-sm leading-relaxed mt-3 mb-4">"{text}"</p>
                <div className="font-semibold text-[#1B3A6B] text-sm">{name}</div>
                <div className="text-gray-400 text-xs">{location}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/testimonials" className="text-[#1B3A6B] font-semibold hover:underline">
              Read more reviews →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-yellow-400 py-12 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-[#1B3A6B] mb-3">
            Ready for a New Roof?
          </h2>
          <p className="text-[#1B3A6B] opacity-80 mb-6">Get a free, no-obligation estimate from Connecticut's most trusted roofers.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/quote"
              className="bg-[#1B3A6B] hover:bg-[#122a52] text-white font-bold px-8 py-3 rounded-full transition-colors"
            >
              Calculate My Quote
            </Link>
            <a
              href="tel:+18605550192"
              className="border-2 border-[#1B3A6B] hover:bg-[#1B3A6B] hover:text-white text-[#1B3A6B] font-bold px-8 py-3 rounded-full transition-all"
            >
              Call Us Now
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import StarRating from '../components/StarRating'

const reviews = [
  {
    name: 'Maria S.',
    location: 'Suffield, CT',
    service: 'Full Roof Replacement',
    date: 'October 2024',
    text: 'Trust Proof replaced our entire roof in two days and you\'d never know they were there — yard was spotless. The crew was professional, respectful of our property, and answered every question I had. The 20-year warranty was the deciding factor and I\'m so glad we chose them.',
    rating: 5,
  },
  {
    name: 'Jim K.',
    location: 'Windsor, CT',
    service: 'Storm Damage Repair',
    date: 'September 2024',
    text: 'After a storm took off a section of our roof, they were out the next morning. Fair, transparent pricing and excellent work. No pressure to do more than was needed. Highly recommend to any homeowner in the Hartford area.',
    rating: 5,
  },
  {
    name: 'Denise T.',
    location: 'Enfield, CT',
    service: 'Roof Installation',
    date: 'August 2024',
    text: 'The 20-year warranty sealed the deal for us. Five years later, not a single leak. These guys are the real deal. Robert came out personally to walk us through our options and was incredibly knowledgeable without being pushy.',
    rating: 5,
  },
  {
    name: 'Frank M.',
    location: 'Granby, CT',
    service: 'Gutter Installation',
    date: 'July 2024',
    text: 'Had seamless gutters installed after our old ones fell off during an ice storm. Great price, great crew, done in a day. Already recommended them to three neighbors.',
    rating: 5,
  },
  {
    name: 'Linda C.',
    location: 'East Windsor, CT',
    service: 'Roof Inspection',
    date: 'June 2024',
    text: 'Got a pre-sale roof inspection before listing our house. The report was detailed, professional, and helped us price the home accurately. The inspector was thorough and explained everything clearly. Worth every penny.',
    rating: 5,
  },
  {
    name: 'Paul R.',
    location: 'Suffield, CT',
    service: 'Emergency Leak Repair',
    date: 'May 2024',
    text: 'Called on a Sunday evening about a leak over our bedroom. They had someone out Monday morning. Diagnosed and repaired the issue same day. Fair price and no nonsense. That\'s why I\'ve used them three times now.',
    rating: 5,
  },
  {
    name: 'Helen A.',
    location: 'Bloomfield, CT',
    service: 'Roof Replacement',
    date: 'April 2024',
    text: 'From estimate to completion, the whole process was smooth and stress-free. The project manager kept me updated daily. Love the new shingles — the house looks 10 years younger.',
    rating: 5,
  },
  {
    name: 'George W.',
    location: 'Windsor Locks, CT',
    service: 'Roof Repair',
    date: 'March 2024',
    text: 'Had a tricky flashing issue around our chimney that two other companies couldn\'t figure out. Trust Proof found the problem in 20 minutes and fixed it properly. No more leaks. Great company.',
    rating: 5,
  },
  {
    name: 'Carol B.',
    location: 'Suffield, CT',
    service: 'Full Roof Replacement',
    date: 'February 2024',
    text: 'I was nervous about the cost of a full replacement but they worked with our budget and the financing options were helpful. The finished product is beautiful and the crew cleaned up every nail in our yard. So professional.',
    rating: 4,
  },
]

export default function Testimonials() {
  return (
    <>
      <PageHero
        title="Customer Reviews"
        subtitle="Don't take our word for it — hear from Connecticut homeowners who've trusted us with their roofs."
      />

      {/* Rating summary */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
            <div className="text-center">
              <div className="text-6xl font-black text-[#1B3A6B]">4.9</div>
              <div className="flex justify-center mt-1">
                <StarRating rating={5} />
              </div>
              <div className="text-gray-500 text-sm mt-1">Average Rating</div>
            </div>
            <div className="hidden sm:block w-px h-16 bg-gray-200" />
            <div className="grid grid-cols-3 gap-6 text-center">
              {[
                { value: '200+', label: 'Reviews' },
                { value: '98%', label: 'Recommend Us' },
                { value: '4.9★', label: 'Google Rating' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div className="text-2xl font-black text-[#1B3A6B]">{value}</div>
                  <div className="text-gray-500 text-xs mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Review grid */}
      <section className="py-16 bg-[#f5f6f8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map(({ name, location, service, date, text, rating }) => (
              <div key={name} className="bg-white rounded-2xl p-6 shadow-sm flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <StarRating rating={rating} />
                    <div className="font-bold text-[#1B3A6B] mt-1.5">{name}</div>
                    <div className="text-gray-400 text-xs">{location}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-yellow-600 font-semibold bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200">{service}</div>
                    <div className="text-gray-400 text-xs mt-1">{date}</div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed flex-1">"{text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1B3A6B] py-14 text-center px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-black text-white mb-3">Ready to Join Our Happy Customers?</h2>
          <p className="text-blue-200 mb-6">Get a free quote and experience the Trust Proof difference.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/quote"
              className="bg-yellow-400 hover:bg-yellow-300 text-[#1B3A6B] font-bold px-8 py-3 rounded-full transition-colors"
            >
              Get Free Quote
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white hover:bg-white hover:text-[#1B3A6B] text-white font-bold px-8 py-3 rounded-full transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

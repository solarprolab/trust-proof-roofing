import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import WarrantyBadge from '../components/WarrantyBadge'

const values = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Honesty First',
    desc: 'We give you straight answers and fair prices. No hidden fees, no upselling repairs you don\'t need.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    title: 'Craftsmanship',
    desc: 'Our crews are trained, certified, and take pride in every nail driven and every shingle laid.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Community Roots',
    desc: 'We live here too. When you hire Trust Proof, you\'re supporting a local Connecticut family business.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'On Time, Every Time',
    desc: 'We show up when we say we will and finish on schedule. Your time matters.',
  },
]

const credentials = [
  'CT Home Improvement Contractor #HIC.0678432',
  'Fully Insured — General Liability & Workers\' Comp',
  'GAF Certified Roofing Contractor',
  'Better Business Bureau A+ Rated',
  'OSHA Safety Certified Crew Members',
]

const teamMembers = [
  {
    name: 'Robert DiMaggio',
    role: 'Founder & Master Roofer',
    years: '20+ years',
    bio: 'Born and raised in Suffield, Robert founded Trust Proof Roofing with one truck and a commitment to honest, quality work. He personally oversees every major project.',
  },
  {
    name: 'Kevin Patel',
    role: 'Lead Installation Crew Chief',
    years: '14 years',
    bio: 'Kevin leads our installation team with precision and attention to detail. His crews hold the highest completion and quality scores in the company.',
  },
  {
    name: 'Sandra Torres',
    role: 'Customer Relations Manager',
    years: '9 years',
    bio: 'Sandra ensures every homeowner has a smooth, stress-free experience from first call to final walkthrough. She\'s the reason our reviews are so consistently glowing.',
  },
]

export default function About() {
  return (
    <>
      <PageHero
        title="About Trust Proof Roofing"
        subtitle="A local Connecticut company built on integrity, craftsmanship, and community."
      />

      {/* Story */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-black text-[#1B3A6B] mb-4">Our Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Trust Proof Roofing was founded by Robert DiMaggio, a Suffield native who grew up watching his father repair roofs on weekends. What started as a one-man operation serving neighbors in Hartford County has grown into one of Connecticut's most respected roofing companies.
                </p>
                <p>
                  We've installed and repaired over 1,500 roofs across Suffield, Windsor, Enfield, Granby, and the greater Hartford area. Through every New England winter, nor'easter, and summer storm, our work has held up — and our warranty makes sure it stays that way.
                </p>
                <p>
                  We're not a franchise or a national chain. Every crew member on your roof is a Trust Proof employee, not a subcontractor. That means accountability, quality control, and pride in the work.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-[#f5f6f8] rounded-2xl p-8 grid grid-cols-2 gap-6">
              {[
                { value: '10+', label: 'Years Experience' },
                { value: '1,500+', label: 'Roofs Completed' },
                { value: '4.9/5', label: 'Customer Rating' },
                { value: '20yr', label: 'Leak Warranty' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-3xl font-black text-[#1B3A6B]">{value}</div>
                  <div className="text-gray-500 text-sm mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-14 bg-[#f5f6f8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-[#1B3A6B] text-center mb-8">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-6 flex gap-4">
                <div className="w-10 h-10 bg-[#1B3A6B] text-white rounded-lg flex items-center justify-center shrink-0">
                  {icon}
                </div>
                <div>
                  <h3 className="font-bold text-[#1B3A6B] mb-1">{title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-[#1B3A6B] text-center mb-8">Meet the Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teamMembers.map(({ name, role, years, bio }) => (
              <div key={name} className="bg-[#f5f6f8] rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-[#1B3A6B] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-black text-xl">
                    {name.split(' ').map((n) => n[0]).join('')}
                  </span>
                </div>
                <h3 className="font-bold text-[#1B3A6B] text-lg">{name}</h3>
                <p className="text-sm text-yellow-600 font-semibold mb-1">{role}</p>
                <p className="text-xs text-gray-400 mb-3">{years} experience</p>
                <p className="text-gray-600 text-sm leading-relaxed">{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="py-14 bg-[#1B3A6B]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-5">
            <WarrantyBadge />
          </div>
          <h2 className="text-2xl font-black text-white mb-6">Licensed, Insured & Certified</h2>
          <ul className="space-y-3 text-left inline-block">
            {credentials.map((c) => (
              <li key={c} className="flex items-center gap-3 text-blue-200 text-sm">
                <svg className="w-5 h-5 text-yellow-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {c}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link
              to="/quote"
              className="inline-block bg-yellow-400 hover:bg-yellow-300 text-[#1B3A6B] font-black px-8 py-4 rounded-full transition-colors"
            >
              Get a Free Estimate
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

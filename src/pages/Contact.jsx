import { useState } from 'react'
import PageHero from '../components/PageHero'

const contactInfo = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    label: 'Phone',
    value: '(959) 333-8569',
    href: 'tel:+19593338569',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Email',
    value: 'tenzin@trustproofroofing.com',
    href: 'mailto:tenzin@trustproofroofing.com',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: 'Address',
    value: 'Suffield, CT 06078',
    href: null,
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: 'Hours',
    value: 'Mon–Sat: 7am–6pm | Emergency: 24/7',
    href: null,
  },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    const subject = encodeURIComponent('Contact Form — Trust Proof Roofing')
    const body = encodeURIComponent(
      `Name: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email}\nService: ${form.service}\nMessage: ${form.message}`
    )
    window.location.href = `mailto:tenzin@trustproofroofing.com?subject=${subject}&body=${body}`
    setSubmitted(true)
  }

  return (
    <>
      <PageHero
        title="Contact Us"
        subtitle="Reach out for a free estimate, an emergency repair, or any roofing question. We respond fast."
      />

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Contact info */}
            <div>
              <h2 className="text-2xl font-black text-[#1B3A6B] mb-6">Get in Touch</h2>
              <div className="space-y-5 mb-8">
                {contactInfo.map(({ icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#1B3A6B] text-white rounded-lg flex items-center justify-center shrink-0">
                      {icon}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</div>
                      {href ? (
                        <a href={href} className="text-[#1B3A6B] font-semibold hover:underline">
                          {value}
                        </a>
                      ) : (
                        <span className="text-gray-700 font-medium">{value}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Service area */}
              <div className="bg-[#f5f6f8] rounded-xl p-5">
                <h3 className="font-bold text-[#1B3A6B] mb-2">Service Area</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We proudly serve Suffield, Windsor, Enfield, Granby, East Windsor, Windsor Locks, Bloomfield, Simsbury, and all surrounding Hartford County communities.
                </p>
              </div>
            </div>

            {/* Form */}
            <div>
              <h2 className="text-2xl font-black text-[#1B3A6B] mb-6">Send Us a Message</h2>

              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                  <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="font-bold text-green-800 text-lg mb-2">Message Received!</h3>
                  <p className="text-green-700 text-sm">We'll be in touch within one business day. For urgent needs, please call us directly at (959) 333-8569.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                      <input
                        required
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent"
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        type="tel"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent"
                        placeholder="(860) 555-0000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address *</label>
                    <input
                      required
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      type="email"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Service Needed</label>
                    <select
                      name="service"
                      value={form.service}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent bg-white"
                    >
                      <option value="">Select a service...</option>
                      <option>Roof Installation</option>
                      <option>Roof Repair</option>
                      <option>Roof Replacement</option>
                      <option>Gutter Services</option>
                      <option>Roof Inspection</option>
                      <option>Emergency Repair</option>
                      <option>Not Sure / Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Message *</label>
                    <textarea
                      required
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent resize-none"
                      placeholder="Tell us about your roofing needs..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1B3A6B] hover:bg-[#122a52] text-white font-bold py-3 rounded-lg transition-colors"
                  >
                    Send Message
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    We typically respond within a few hours during business hours.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

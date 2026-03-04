import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import WarrantyBadge from '../components/WarrantyBadge'

const SHINGLE_TYPES = [
  { id: '3tab', label: '3-Tab Asphalt', pricePerSqFt: 3.5, desc: 'Budget-friendly, 20-year lifespan' },
  { id: 'architectural', label: 'Architectural Shingles', pricePerSqFt: 4.75, desc: 'Most popular, 30-year lifespan' },
  { id: 'premium', label: 'Premium Designer', pricePerSqFt: 7.0, desc: 'High-end look, 50-year lifespan' },
  { id: 'metal', label: 'Metal Roofing', pricePerSqFt: 9.5, desc: 'Lifetime durability, energy efficient' },
]

const PITCH_MULTIPLIERS = [
  { id: 'low', label: 'Low Pitch (4/12 or less)', multiplier: 1.0 },
  { id: 'medium', label: 'Medium Pitch (5/12–8/12)', multiplier: 1.15 },
  { id: 'steep', label: 'Steep Pitch (9/12+)', multiplier: 1.35 },
]

const ADD_ONS = [
  { id: 'gutters', label: 'Gutter Replacement', price: 1200 },
  { id: 'inspection', label: 'Post-Install Inspection Report', price: 0, note: 'Free' },
  { id: 'icewater', label: 'Ice & Water Shield Upgrade', price: 450 },
  { id: 'ventilation', label: 'Ridge Vent Ventilation', price: 350 },
]

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export default function Quote() {
  const [sqft, setSqft] = useState('')
  const [shingle, setShingle] = useState('architectural')
  const [pitch, setPitch] = useState('medium')
  const [addOns, setAddOns] = useState([])
  const [showResult, setShowResult] = useState(false)

  function toggleAddOn(id) {
    setAddOns((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id])
  }

  const selectedShingle = SHINGLE_TYPES.find((s) => s.id === shingle)
  const selectedPitch = PITCH_MULTIPLIERS.find((p) => p.id === pitch)
  const sqftNum = parseFloat(sqft) || 0

  const basePrice = sqftNum * selectedShingle.pricePerSqFt * selectedPitch.multiplier
  const addOnTotal = ADD_ONS.filter((a) => addOns.includes(a.id)).reduce((sum, a) => sum + a.price, 0)
  const totalLow = Math.max(0, basePrice * 0.9 + addOnTotal)
  const totalHigh = Math.max(0, basePrice * 1.1 + addOnTotal)

  function handleCalculate(e) {
    e.preventDefault()
    if (sqftNum > 0) setShowResult(true)
  }

  return (
    <>
      <PageHero
        title="Free Instant Quote"
        subtitle="Get a ballpark estimate in seconds. No personal info required to see your range."
      />

      <section className="py-16 bg-[#f5f6f8]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-xl font-black text-[#1B3A6B] mb-1">Calculate Your Estimate</h2>
            <p className="text-gray-500 text-sm mb-6">
              This calculator provides an estimated range. Contact us for a precise quote — always free.
            </p>

            <form onSubmit={handleCalculate} className="space-y-6">
              {/* Square footage */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Home Square Footage (living area)
                </label>
                <div className="relative">
                  <input
                    required
                    type="number"
                    min="200"
                    max="15000"
                    value={sqft}
                    onChange={(e) => { setSqft(e.target.value); setShowResult(false) }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent pr-16"
                    placeholder="e.g. 2000"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">sq ft</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Roof area is typically 1.3–1.6× your home's square footage depending on pitch.
                </p>
              </div>

              {/* Shingle type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Shingle / Material Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SHINGLE_TYPES.map(({ id, label, pricePerSqFt, desc }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => { setShingle(id); setShowResult(false) }}
                      className={`text-left p-3 rounded-xl border-2 transition-all ${
                        shingle === id
                          ? 'border-[#1B3A6B] bg-[#1B3A6B] text-white'
                          : 'border-gray-200 hover:border-[#1B3A6B]'
                      }`}
                    >
                      <div className="font-semibold text-sm">{label}</div>
                      <div className={`text-xs mt-0.5 ${shingle === id ? 'text-blue-200' : 'text-gray-400'}`}>{desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Roof pitch */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Roof Pitch (steepness)</label>
                <div className="space-y-2">
                  {PITCH_MULTIPLIERS.map(({ id, label }) => (
                    <label
                      key={id}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        pitch === id ? 'border-[#1B3A6B] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="pitch"
                        value={id}
                        checked={pitch === id}
                        onChange={() => { setPitch(id); setShowResult(false) }}
                        className="accent-[#1B3A6B]"
                      />
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Add-ons */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Optional Add-Ons</label>
                <div className="space-y-2">
                  {ADD_ONS.map(({ id, label, price, note }) => (
                    <label
                      key={id}
                      className={`flex items-center justify-between gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        addOns.includes(id) ? 'border-[#1B3A6B] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={addOns.includes(id)}
                          onChange={() => { toggleAddOn(id); setShowResult(false) }}
                          className="accent-[#1B3A6B] w-4 h-4"
                        />
                        <span className="text-sm font-medium text-gray-700">{label}</span>
                      </div>
                      <span className="text-sm font-semibold text-[#1B3A6B] shrink-0">
                        {note || `+${formatCurrency(price)}`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1B3A6B] hover:bg-[#122a52] text-white font-black py-4 rounded-full transition-colors text-lg"
              >
                Calculate My Estimate
              </button>
            </form>

            {/* Result */}
            {showResult && sqftNum > 0 && (
              <div className="mt-8 border-t border-gray-100 pt-8">
                <div className="bg-[#1B3A6B] rounded-2xl p-6 text-white text-center mb-6">
                  <div className="text-sm text-blue-300 mb-1">Estimated Project Range</div>
                  <div className="text-4xl font-black text-yellow-400 mb-1">
                    {formatCurrency(totalLow)} – {formatCurrency(totalHigh)}
                  </div>
                  <div className="text-blue-200 text-sm">
                    Based on {sqftNum.toLocaleString()} sq ft &bull; {selectedShingle.label} &bull; {PITCH_MULTIPLIERS.find(p=>p.id===pitch).label}
                  </div>
                </div>

                <div className="flex justify-center mb-5">
                  <WarrantyBadge />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800 mb-6">
                  <strong>Note:</strong> This is a rough estimate based on average material and labor costs in Connecticut. Actual pricing depends on site conditions, material availability, and other factors. A free on-site estimate is always more accurate.
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/contact"
                    className="flex-1 bg-[#1B3A6B] hover:bg-[#122a52] text-white font-bold py-3 rounded-full text-center transition-colors"
                  >
                    Get an Exact Free Quote
                  </Link>
                  <a
                    href="tel:+18605550192"
                    className="flex-1 border-2 border-[#1B3A6B] text-[#1B3A6B] hover:bg-[#1B3A6B] hover:text-white font-bold py-3 rounded-full text-center transition-all"
                  >
                    Call (860) 555-0192
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {[
              { icon: '📋', title: 'Free On-Site Estimate', desc: 'An expert visits your home for an accurate, no-obligation quote.' },
              { icon: '⚡', title: 'Fast Response', desc: 'We respond to quote requests within one business day.' },
              { icon: '🛡️', title: '20-Year Warranty', desc: 'Every project backed by our industry-leading leak warranty.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-5 text-center shadow-sm">
                <div className="text-3xl mb-2">{icon}</div>
                <div className="font-bold text-[#1B3A6B] text-sm mb-1">{title}</div>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

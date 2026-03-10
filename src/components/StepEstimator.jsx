import { useState } from 'react'

const BASE_RATE = 7 // $/sqft — internal only, never displayed

const SERVICE_OPTIONS = [
  { id: 'installation', label: 'New Roof Installation', mult: 1.0 },
  { id: 'replacement', label: 'Roof Replacement', mult: 1.0 },
  { id: 'repair', label: 'Roof Repair', mult: 0.25 },
  { id: 'inspection', label: 'Roof Inspection', mult: 0.08 },
  { id: 'notsure', label: 'Not Sure', mult: 1.0 },
]

const SIZE_OPTIONS = [
  { id: 'small', label: 'Small (under 1,500 sq ft)', sqft: 1200 },
  { id: 'medium', label: 'Medium (1,500–2,500 sq ft)', sqft: 2000 },
  { id: 'large', label: 'Large (over 2,500 sq ft)', sqft: 3000 },
  { id: 'notsure', label: 'Not Sure', sqft: 1800 },
]

const MATERIAL_OPTIONS = [
  { id: '3tab', label: '3-Tab Asphalt', mult: 0.5, desc: 'Budget-friendly' },
  { id: 'architectural', label: 'Architectural Shingles', mult: 0.68, desc: 'Most popular' },
  { id: 'premium', label: 'Premium Designer', mult: 1.0, desc: 'High-end look' },
  { id: 'metal', label: 'Metal Roofing', mult: 1.36, desc: 'Lifetime durability' },
  { id: 'notsure', label: 'Not Sure', mult: 0.68, desc: "We'll help you choose" },
]

const PITCH_OPTIONS = [
  { id: 'low', label: 'Low Pitch (4/12 or less)', mult: 1.0 },
  { id: 'medium', label: 'Medium Pitch (5/12–8/12)', mult: 1.15 },
  { id: 'steep', label: 'Steep Pitch (9/12+)', mult: 1.35 },
  { id: 'notsure', label: 'Not Sure', mult: 1.15 },
]

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export default function StepEstimator({ variant = 'homepage' }) {
  const isQuote = variant === 'quote'
  // homepage: Address → Service → Size → Result (4 steps)
  // quote:    Address → Size → Material → Pitch → Result (5 steps)
  const totalSteps = isQuote ? 5 : 4

  const [step, setStep] = useState(1)
  const [address, setAddress] = useState('')
  const [service, setService] = useState('')
  const [size, setSize] = useState('')
  const [material, setMaterial] = useState('')
  const [pitch, setPitch] = useState('')

  const sizeData = SIZE_OPTIONS.find((s) => s.id === size)
  const materialData = MATERIAL_OPTIONS.find((m) => m.id === material)
  const pitchData = PITCH_OPTIONS.find((p) => p.id === pitch)
  const serviceData = SERVICE_OPTIONS.find((s) => s.id === service)

  function calcEstimate() {
    const sqft = sizeData?.sqft ?? 1800
    const matMult = isQuote ? (materialData?.mult ?? 0.68) : 0.68
    const pitchMult = isQuote ? (pitchData?.mult ?? 1.15) : 1.15
    const servMult = !isQuote ? (serviceData?.mult ?? 1.0) : 1.0
    const base = sqft * BASE_RATE * matMult * pitchMult * servMult
    return { low: Math.round(base * 0.85), high: Math.round(base * 1.15) }
  }

  function buildMailtoHref() {
    const { low, high } = calcEstimate()
    const subject = encodeURIComponent('Roof Estimate Request — Trust Proof Roofing')
    const serviceLabel = serviceData?.label ?? service ?? 'N/A'
    const sizeLabel = sizeData?.label ?? size ?? 'N/A'
    const materialLabel = materialData?.label ?? material ?? 'N/A'
    const pitchLabel = pitchData?.label ?? pitch ?? 'N/A'
    const body = encodeURIComponent(
      `New estimate request from website:\n\nAddress: ${address}\nService: ${serviceLabel}\nRoof Size: ${sizeLabel}\nMaterial: ${materialLabel}\nRoof Pitch: ${pitchLabel}\nEstimate Range: ${formatCurrency(low)} – ${formatCurrency(high)}\n\nPlease contact me to discuss further.`
    )
    return `mailto:info@trustproofroofing.com?subject=${subject}&body=${body}`
  }

  function canNext() {
    if (step === 1) return address.trim().length > 0
    if (isQuote) {
      if (step === 2) return size !== ''
      if (step === 3) return material !== ''
      if (step === 4) return pitch !== ''
    } else {
      if (step === 2) return service !== ''
      if (step === 3) return size !== ''
    }
    return true
  }

  const isResultStep = step === totalSteps
  const estimate = isResultStep ? calcEstimate() : { low: 0, high: 0 }

  function reset() {
    setStep(1)
    setAddress('')
    setService('')
    setSize('')
    setMaterial('')
    setPitch('')
  }

  function StepDots() {
    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all ${
              i + 1 === step
                ? 'w-6 bg-[#1B3A6B]'
                : i + 1 < step
                ? 'w-2 bg-[#1B3A6B] opacity-40'
                : 'w-2 bg-gray-200'
            }`}
          />
        ))}
      </div>
    )
  }

  function OptionButton({ selected, onClick, children }) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`w-full text-left px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
          selected
            ? 'border-[#1B3A6B] bg-[#1B3A6B] text-white'
            : 'border-gray-200 text-gray-700 hover:border-[#1B3A6B]'
        }`}
      >
        {children}
      </button>
    )
  }

  return (
    <section className={`py-16 ${variant === 'homepage' ? 'bg-[#f5f6f8]' : 'bg-[#f5f6f8]'}`}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {variant === 'homepage' && (
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-[#1B3A6B] mb-2">Get Your Free Estimate</h2>
            <p className="text-gray-500">Answer a few quick questions — no commitment required.</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <StepDots />

          {/* Step 1 — Address */}
          {step === 1 && (
            <div>
              <h3 className="text-xl font-black text-[#1B3A6B] mb-1">What's your address?</h3>
              <p className="text-gray-400 text-sm mb-5">
                We serve Suffield, Windsor, Enfield, Granby, and surrounding Hartford County.
              </p>
              <input
                autoComplete="off"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent"
                placeholder="e.g. 45 Main St, Suffield, CT"
              />
            </div>
          )}

          {/* Step 2 homepage — Service */}
          {!isQuote && step === 2 && (
            <div>
              <h3 className="text-xl font-black text-[#1B3A6B] mb-1">What service do you need?</h3>
              <p className="text-gray-400 text-sm mb-5">Select the option that best fits your situation.</p>
              <div className="space-y-2">
                {SERVICE_OPTIONS.map(({ id, label }) => (
                  <OptionButton key={id} selected={service === id} onClick={() => setService(id)}>
                    {label}
                  </OptionButton>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 homepage / Step 2 quote — Roof Size */}
          {((!isQuote && step === 3) || (isQuote && step === 2)) && (
            <div>
              <h3 className="text-xl font-black text-[#1B3A6B] mb-1">How big is your home?</h3>
              <p className="text-gray-400 text-sm mb-5">Based on living area square footage.</p>
              <div className="space-y-2">
                {SIZE_OPTIONS.map(({ id, label }) => (
                  <OptionButton key={id} selected={size === id} onClick={() => setSize(id)}>
                    {label}
                  </OptionButton>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 quote — Material */}
          {isQuote && step === 3 && (
            <div>
              <h3 className="text-xl font-black text-[#1B3A6B] mb-1">What material are you considering?</h3>
              <p className="text-gray-400 text-sm mb-5">
                Not sure? We'll help you choose during your free on-site estimate.
              </p>
              <div className="space-y-2">
                {MATERIAL_OPTIONS.map(({ id, label, desc }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMaterial(id)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                      material === id
                        ? 'border-[#1B3A6B] bg-[#1B3A6B] text-white'
                        : 'border-gray-200 hover:border-[#1B3A6B]'
                    }`}
                  >
                    <div className={`font-semibold text-sm ${material === id ? 'text-white' : 'text-gray-700'}`}>
                      {label}
                    </div>
                    <div className={`text-xs ${material === id ? 'text-blue-200' : 'text-gray-400'}`}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 quote — Pitch */}
          {isQuote && step === 4 && (
            <div>
              <h3 className="text-xl font-black text-[#1B3A6B] mb-1">What's your roof pitch?</h3>
              <p className="text-gray-400 text-sm mb-5">
                Steeper roofs require more labor. Not sure? Pick "Not Sure."
              </p>
              <div className="space-y-2">
                {PITCH_OPTIONS.map(({ id, label }) => (
                  <OptionButton key={id} selected={pitch === id} onClick={() => setPitch(id)}>
                    {label}
                  </OptionButton>
                ))}
              </div>
            </div>
          )}

          {/* Result Step */}
          {isResultStep && (
            <div className="text-center">
              <h3 className="text-xl font-black text-[#1B3A6B] mb-1">Your Estimate Range</h3>
              <p className="text-gray-400 text-sm mb-6">
                Based on your answers. A free on-site quote gives you an exact number.
              </p>

              <div className="bg-[#1B3A6B] rounded-2xl p-6 text-white mb-5">
                <div className="text-sm text-blue-300 mb-1">Estimated Project Range</div>
                <div className="text-4xl font-black text-yellow-400 mb-2">
                  {formatCurrency(estimate.low)} – {formatCurrency(estimate.high)}
                </div>
                <div className="text-blue-200 text-sm">{sizeData?.label ?? ''}</div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800 mb-6 text-left">
                <strong>Note:</strong> This is a ballpark estimate. Actual pricing depends on site conditions,
                material availability, and other factors. A free on-site inspection is always more accurate.
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={buildMailtoHref()}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-[#1B3A6B] font-black py-3 rounded-full text-center transition-colors"
                >
                  Email My Estimate
                </a>
                <a
                  href="tel:+19593338569"
                  className="flex-1 border-2 border-[#1B3A6B] text-[#1B3A6B] hover:bg-[#1B3A6B] hover:text-white font-bold py-3 rounded-full text-center transition-all"
                >
                  Call (959) 333-8569
                </a>
              </div>

              <button
                type="button"
                onClick={reset}
                className="mt-4 text-sm text-gray-400 hover:text-gray-600 w-full text-center transition-colors"
              >
                Start Over
              </button>
            </div>
          )}

          {/* Navigation */}
          {!isResultStep && (
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="px-6 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-full hover:border-gray-300 transition-colors"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                disabled={!canNext()}
                onClick={() => setStep((s) => s + 1)}
                className="flex-1 bg-[#1B3A6B] hover:bg-[#122a52] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-full transition-colors"
              >
                {step === totalSteps - 1 ? 'See My Estimate' : 'Next →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

'use client';

import { useState } from 'react';

type ProjectType = 'replacement' | 'repair' | 'inspection';
type Material = 'standard' | 'premium';

interface QuoteFormData {
  address: string;
  projectType: ProjectType | null;
  material: Material | null;
  addOns: string[];
  name: string;
  phone: string;
  email: string;
}

const ADDON_RANGES: Record<string, [number, number]> = {
  ridge: [300, 300],
  gutters: [0, 0],
};

function fmt(n: number) { return '$' + n.toLocaleString(); }

function calcRange(form: QuoteFormData, sqft: number | null, surcharge: number): [number, number] | null {
  if (form.projectType === 'inspection') return null;
  if (form.projectType === 'repair') return [350, 2500];
  if (!sqft) return null;
  const base = Math.round(sqft * 1.1 * (7 + surcharge));
  return [base - 1000, base + 1000];
}

const STEPS = ['Property', 'Project', 'Materials', 'Add-ons', 'Estimate'];

function CheckIcon({ cls }: { cls?: string }) {
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ChevronRight({ cls }: { cls?: string }) {
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function InstantQuote() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<QuoteFormData>({
    address: '', projectType: null,
    material: null, addOns: [], name: '', phone: '', email: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [roofSqft, setRoofSqft] = useState<number | null>(null);
  const [pitchSurcharge, setPitchSurcharge] = useState<number>(0);
  const [lookingUp, setLookingUp] = useState<boolean>(false);
  const [lookupError, setLookupError] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const toggleAddon = (id: string) =>
    setForm(f => ({
      ...f,
      addOns: f.addOns.includes(id) ? f.addOns.filter(a => a !== id) : [...f.addOns, id],
    }));

  const canNext = () => {
    if (step === 1) return form.address.length > 5;
    if (step === 2) return form.projectType !== null;
    if (step === 3) return form.projectType !== 'replacement' || form.material !== null;
    return true;
  };

  const lookupRoofSize = async (address: string) => {
    if (!address || address.length < 10) return;
    setLookingUp(true);
    setLookupError('');
    try {
      const geocodeRes = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_SOLAR_API_KEY}`
      );
      const geocodeData = await geocodeRes.json();
      if (!geocodeData.results?.[0]) { setLookupError('Address not found — we will measure during your on-site inspection.'); setLookingUp(false); return; }
      const { lat, lng } = geocodeData.results[0].geometry.location;
      const solarRes = await fetch(
        `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&requiredQuality=LOW&key=${process.env.NEXT_PUBLIC_GOOGLE_SOLAR_API_KEY}`
      );
      const solarData = await solarRes.json();
      const sqm = solarData?.solarPotential?.wholeRoofStats?.areaMeters2;
      if (!sqm) { setLookupError('Roof data unavailable — we will measure during your on-site inspection.'); setLookingUp(false); return; }
      const sqft = Math.round(sqm * 10.764);
      setRoofSqft(sqft);

      // Calculate weighted average pitch from roof segments
      const segments = solarData?.solarPotential?.roofSegmentStats ?? [];
      let totalArea = 0;
      let weightedPitchDeg = 0;
      segments.forEach((seg: { pitchDegrees?: number; stats?: { areaMeters2?: number } }) => {
        const area = seg?.stats?.areaMeters2 ?? 0;
        const pitch = seg?.pitchDegrees ?? 0;
        totalArea += area;
        weightedPitchDeg += pitch * area;
      });
      const avgPitchDeg = totalArea > 0 ? weightedPitchDeg / totalArea : 0;

      // Convert degrees to rise/run equivalent and assign surcharge
      // 18.4deg = 4/12, 26.6deg = 6/12, 30.3deg = 7/12, 45deg = 12/12
      let surcharge = 0;
      if (avgPitchDeg >= 30.3) surcharge = 1.0;
      else if (avgPitchDeg >= 18.4) surcharge = 0.5;
      setPitchSurcharge(surcharge);
    } catch {
      setLookupError('Could not auto-detect roof — we will measure during your on-site inspection.');
    } finally {
      setLookingUp(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.email) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    try {
      const range = calcRange(form, roofSqft, pitchSurcharge);
      const res = await fetch('/api/instant-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, estimatedRange: range, sqft: roofSqft, pitchSurcharge }),
      });
      if (!res.ok) throw new Error('failed');
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please call us at (959) 333-8569.');
    } finally {
      setLoading(false);
    }
  };

  const range = calcRange(form, roofSqft, pitchSurcharge);

  const navyBtn = 'bg-[#1B3C6B] hover:bg-[#122947] text-white font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
  const card = (sel: boolean) =>
    `border-2 rounded-xl p-3.5 cursor-pointer transition-all text-left ${sel ? 'border-[#1B3C6B] bg-[#1B3C6B]/5' : 'border-gray-200 hover:border-[#1B3C6B]/40'}`;

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
          <CheckIcon cls="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-[#1B3C6B] mb-2">You&apos;re all set!</h3>
        <p className="text-gray-500 text-sm mb-5">Tenzin will personally review your info and reach out within 2 hours during business hours.</p>
        {range && range[0] > 0 && (
          <div className="bg-[#1B3C6B] text-white rounded-xl p-4 mb-4">
            <p className="text-xs opacity-70 mb-1">Your estimated range</p>
            <p className="text-2xl font-bold">{fmt(range[0])} – {fmt(range[1])}</p>
            <p className="text-xs opacity-60 mt-1">Final price confirmed after free on-site inspection</p>
          </div>
        )}
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-[#1B3C6B]">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          20-Year Leak Warranty on All Replacements
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
      {/* Progress */}
      <div className="bg-[#1B3C6B] px-6 pt-5 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white font-black text-base">Instant Quote Calculator</p>
            <p className="text-white/50 text-[11px]">Measured to your actual roof · Real price range · No obligation</p>
          </div>
          <span className="bg-yellow-400 text-gray-900 text-[10px] font-black px-2 py-1 rounded-md tracking-wide uppercase flex-shrink-0">FREE</span>
        </div>
        <div className="flex justify-between mb-3">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const isDone = n < step, isActive = n === step;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${isDone ? 'bg-green-400 text-white' : isActive ? 'bg-white text-[#1B3C6B]' : 'bg-white/20 text-white/40'}`}>
                  {isDone ? <CheckIcon cls="w-3.5 h-3.5" /> : n}
                </div>
                <span className={`text-[10px] hidden sm:block ${isActive ? 'text-white font-semibold' : 'text-white/40'}`}>{label}</span>
              </div>
            );
          })}
        </div>
        <div className="w-full bg-white/20 rounded-full h-1.5">
          <div className="bg-white rounded-full h-1.5 transition-all duration-500" style={{ width: `${((step - 1) / 4) * 100}%` }} />
        </div>
      </div>

      <div className="p-4 sm:p-6">

        {/* Step 1 */}
        {step === 1 && (
          <div>
            <h3 className="text-lg font-bold text-[#1B3C6B] mb-1">Let&apos;s start with your property</h3>
            <p className="text-sm text-gray-500 mb-4">We&apos;ll use this to size your estimate.</p>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Property address</label>
            <div className="relative mb-4">
              <input
                type="text"
                value={form.address}
                onChange={async (e) => {
                  const val = e.target.value;
                  setForm(f => ({ ...f, address: val }));
                  setRoofSqft(null);
                  setPitchSurcharge(0);
                  setLookupError('');
                  if (val.length < 4) { setSuggestions([]); return; }
                  try {
                    const res = await fetch(`/api/autocomplete?input=${encodeURIComponent(val)}`);
                    const data = await res.json();
                    setSuggestions(data.predictions?.map((p: {description: string}) => p.description) ?? []);
                  } catch { setSuggestions([]); }
                }}
                onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                placeholder="123 Main St, Hartford, CT"
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3C6B]/30 focus:border-[#1B3C6B]"
              />
              {suggestions.length > 0 && (
                <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg overflow-hidden">
                  {suggestions.map((s, i) => (
                    <li key={i}
                      className="px-3.5 py-2.5 text-sm cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      onMouseDown={() => {
                        setForm(f => ({ ...f, address: s }));
                        setSuggestions([]);
                        lookupRoofSize(s);
                      }}>
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {lookingUp && (
              <p className="text-xs text-[#1B3C6B] flex items-center gap-1.5 mb-3">
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                Detecting roof size...
              </p>
            )}
            {roofSqft && !lookingUp && (
              <p className="text-xs text-green-600 font-medium mb-3 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                Roof detected: ~{roofSqft.toLocaleString()} sq ft{pitchSurcharge > 0 ? ` · ${pitchSurcharge === 1 ? 'steep' : 'moderate'} pitch` : ''}
              </p>
            )}
            {lookupError && !lookingUp && (
              <p className="text-xs text-amber-600 mb-3">{lookupError}</p>
            )}
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <h3 className="text-lg font-bold text-[#1B3C6B] mb-1">What do you need?</h3>
            <p className="text-sm text-gray-500 mb-4">Select the option that fits your situation.</p>
            <div className="space-y-2.5">
              {([
                ['replacement','Full roof replacement','Remove old roof, install new shingles','20-yr warranty','bg-green-100 text-green-700'],
                ['repair','Roof repair','Fix a leak, patch damage, or an isolated issue','1-yr warranty','bg-blue-100 text-blue-700'],
                ['inspection','Free roof inspection',"See exactly what's on your roof — no obligation",'No cost','bg-amber-100 text-amber-700'],
              ] as const).map(([id, label, sub, badge, badgeCls]) => (
                <button key={id} onClick={() => setForm(f => ({ ...f, projectType: id }))} className={`w-full ${card(form.projectType === id)} flex items-start justify-between gap-3`}>
                  <div>
                    <div className="font-semibold text-sm text-gray-800">{label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{sub}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${badgeCls}`}>{badge}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div>
            {form.projectType === 'replacement' ? (
              <>
                <h3 className="text-lg font-bold text-[#1B3C6B] mb-1">Choose your materials</h3>
                <p className="text-sm text-gray-500 mb-4">Both options include our full 20-year workmanship warranty.</p>
                <div className="space-y-2.5">
                  {([
                    ['standard','Standard asphalt','GAF Timberline HDZ or equivalent — most popular in CT. 30-yr manufacturer warranty.'],
                    ['premium','Premium asphalt','GAF Timberline UHDZ or OC Duration — enhanced durability & curb appeal. 50-yr manufacturer warranty.'],
                  ] as const).map(([id, label, sub]) => (
                    <button key={id} onClick={() => setForm(f => ({ ...f, material: id }))} className={`w-full ${card(form.material === id)}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-sm text-gray-800">{label}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{sub}</div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 ${form.material === id ? 'border-[#1B3C6B] bg-[#1B3C6B]' : 'border-gray-300'}`}>
                          {form.material === id && <CheckIcon cls="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">{form.projectType === 'repair' ? '🔧' : '🔍'}</div>
                <h3 className="text-lg font-bold text-[#1B3C6B] mb-2">{form.projectType === 'repair' ? 'Repair selected' : 'Free roof inspection'}</h3>
                <p className="text-sm text-gray-500">
                  {form.projectType === 'repair'
                    ? "We'll assess the exact damage before recommending the most cost-effective repair — no upsell."
                    : "We'll do a full assessment of your roof so you can see exactly what you're dealing with."}
                </p>
                <p className="text-[#1B3C6B] text-sm font-semibold mt-3">Continue to optional add-ons →</p>
              </div>
            )}
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div>
            <h3 className="text-lg font-bold text-[#1B3C6B] mb-1">Any add-ons?</h3>
            <p className="text-sm text-gray-500 mb-3">Optional — select anything you&apos;d like included.</p>
            <div className="bg-green-50 border border-green-200 rounded-lg px-3.5 py-2.5 mb-4">
              <p className="text-xs font-semibold text-green-700 mb-1">Already included in your price:</p>
              <p className="text-xs text-green-600">✓ Full ice &amp; water shield &nbsp;·&nbsp; ✓ Fascia &amp; drip edge</p>
            </div>
            <div className="space-y-2">
              {([
                ['ridge', 'Ridge vent upgrade', '+$300 — improves attic ventilation and extends shingle life', false],
                ['gutters', 'Gutter inspection', 'Complimentary — we\'ll check gutters while we\'re there', true],
              ] as const).map(([id, label, sub, free]) => {
                const checked = form.addOns.includes(id);
                return (
                  <button key={id} onClick={() => toggleAddon(id)} className={`w-full ${card(checked)} flex items-start gap-3`}>
                    <div className={`mt-0.5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${checked ? 'bg-[#1B3C6B] border-[#1B3C6B]' : 'border-gray-300'}`} style={{width:'18px',height:'18px'}}>
                      {checked && <CheckIcon cls="w-2.5 h-2.5 text-white" />}
                    </div>
                    <div>
                      <div className="flex items-center flex-wrap gap-1.5">
                        <span className="font-semibold text-sm text-gray-800">{label}</span>
                        {free && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Complimentary</span>}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5 */}
        {step === 5 && (
          <div>
            <h3 className="text-lg font-bold text-[#1B3C6B] mb-1">Your estimate is ready</h3>
            <p className="text-sm text-gray-500 mb-4">Enter your info to see your range and get your exact quote.</p>
            {form.projectType === 'inspection' ? (
              <div className="bg-[#1B3C6B] text-white rounded-xl p-4 mb-4 text-center">
                <p className="text-lg font-bold">Free Roof Inspection</p>
                <p className="text-xs opacity-70 mt-1">No charge · No obligation · Full written report</p>
              </div>
            ) : range && (
              <div className="bg-[#1B3C6B] text-white rounded-xl p-4 mb-4">
                <p className="text-xs opacity-70 mb-0.5">Estimated project range</p>
                <p className="text-2xl font-bold">{fmt(range[0])} – {fmt(range[1])}</p>
                <p className="text-xs opacity-60 mt-1">Exact price confirmed after free on-site inspection</p>
              </div>
            )}
            <div className="space-y-3">
              {([['name','Your name','text','Jane Smith','fname'] as const,['phone','Phone number','tel','(860) 555-0123','fphone'] as const,['email','Email address','email','jane@email.com','femail'] as const]).map(([field, label, type, ph]) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                  <input type={type} value={form[field as 'name'|'phone'|'email']} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} placeholder={ph}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3C6B]/30 focus:border-[#1B3C6B]" />
                </div>
              ))}
            </div>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            <div className="flex items-start gap-2.5 mt-4 mb-4 bg-gray-50 rounded-lg p-3">
              <svg className="w-4 h-4 text-[#1B3C6B] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-gray-600"><strong>20-year leak warranty</strong> on all replacements. If it leaks due to workmanship, we fix it free — in writing.</p>
            </div>
            <button onClick={handleSubmit} disabled={loading}
              className={`w-full ${navyBtn} py-3.5 rounded-xl text-sm`}>
              {loading ? 'Sending...' : 'Get my exact quote →'}
            </button>
            <p className="text-xs text-gray-400 text-center mt-2.5">Tenzin responds within 2 hours during business hours. No spam, ever.</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-5">
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors">← Back</button>
          ) : <div />}
          {step < 5 && (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
              className={`flex items-center gap-1.5 ${navyBtn} px-5 py-2.5 rounded-lg text-sm`}>
              {step === 4 ? 'See my estimate' : 'Continue'} <ChevronRight cls="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

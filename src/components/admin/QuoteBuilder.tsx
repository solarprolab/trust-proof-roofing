'use client';

import { useEffect, useState } from 'react';

interface RoofSegment {
  pitchDegrees: number;
  azimuthDegrees: number;
  stats: { areaMeters2: number };
}

interface Lead {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface Props {
  lead: Lead;
  leadId: string;
}

function azimuthToDirection(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(((deg % 360) + 360) % 360 / 45) % 8];
}

function pitchCategory(deg: number): { label: string; surcharge: number; color: string } {
  if (deg >= 30) return { label: 'Steep', surcharge: 1.0, color: 'bg-red-500/20 text-red-400 border-red-500/30' };
  if (deg >= 18) return { label: 'Moderate', surcharge: 0.5, color: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30' };
  return { label: 'Flat / Low', surcharge: 0, color: 'bg-green-500/20 text-green-400 border-green-500/30' };
}

function fmt(n: number) {
  return '$' + Math.round(n).toLocaleString();
}

export default function QuoteBuilder({ lead, leadId }: Props) {
  const [segments, setSegments] = useState<RoofSegment[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [solarError, setSolarError] = useState(false);
  const [manualSqft, setManualSqft] = useState('');
  const [material, setMaterial] = useState<'standard' | 'premium'>('standard');
  const [ridgeVent, setRidgeVent] = useState(false);
  const [layers, setLayers] = useState<1 | 2>(1);
  const [scopeNotes, setScopeNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentBanner, setSentBanner] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!lead.address) { setSolarError(true); setLoading(false); return; }
    (async () => {
      try {
        const geocodeRes = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(lead.address!)}&key=${process.env.NEXT_PUBLIC_GOOGLE_SOLAR_API_KEY}`
        );
        const geocodeData = await geocodeRes.json();
        if (!geocodeData.results?.[0]) throw new Error('no geocode');
        const { lat, lng } = geocodeData.results[0].geometry.location;
        const solarRes = await fetch(
          `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&requiredQuality=LOW&key=${process.env.NEXT_PUBLIC_GOOGLE_SOLAR_API_KEY}`
        );
        const solarData = await solarRes.json();
        const segs: RoofSegment[] = solarData?.solarPotential?.roofSegmentStats ?? [];
        if (!segs.length) throw new Error('no segments');
        setSegments(segs);
        setSelectedSegments(new Set(segs.map((_, i) => i)));
      } catch {
        setSolarError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [lead.address]);

  const toggleSegment = (i: number) => {
    setSelectedSegments(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const selectedSegs = segments.filter((_, i) => selectedSegments.has(i));
  const autoSqft = selectedSegs.reduce((sum, s) => sum + Math.round(s.stats.areaMeters2 * 10.764), 0);
  const sqft = manualSqft ? parseInt(manualSqft) : autoSqft;

  const totalArea = selectedSegs.reduce((sum, s) => sum + s.stats.areaMeters2, 0);
  const weightedPitch = totalArea > 0
    ? selectedSegs.reduce((sum, s) => sum + s.pitchDegrees * s.stats.areaMeters2, 0) / totalArea
    : 0;
  const pitch = pitchCategory(weightedPitch);

  const baseRate = material === 'premium' ? 8 : 7;
  const base = sqft ? Math.round(sqft * 1.1 * (baseRate + pitch.surcharge)) : 0;
  const low = base - 1000 + (ridgeVent ? 300 : 0) + (layers === 2 ? 500 : 0);
  const high = base + 1000 + (ridgeVent ? 300 : 0) + (layers === 2 ? 500 : 0);
  const midpoint = Math.round((low + high) / 2);

  const encodedAddress = lead.address ? encodeURIComponent(lead.address) : '';
  const satelliteUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodedAddress}&zoom=19&size=600x400&maptype=satellite&key=${process.env.NEXT_PUBLIC_GOOGLE_SOLAR_API_KEY}`;

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote_amount: midpoint, roof_size: String(sqft) }),
      });
      const summary = [
        `=== Quote Builder Summary ===`,
        `Roof Area: ${sqft.toLocaleString()} sq ft`,
        `Material: ${material === 'premium' ? 'Premium (GAF Timberline UHDZ, 50-yr)' : 'Standard (GAF Timberline HDZ, 30-yr)'}`,
        `Pitch: ${pitch.label}${pitch.surcharge > 0 ? ` (+$${pitch.surcharge}/sqft surcharge)` : ''}`,
        `Ridge Vent: ${ridgeVent ? 'Yes (+$300)' : 'No'}`,
        `Gutter Inspection: Complimentary`,
        `Layers to Remove: ${layers}${layers === 2 ? ' (+$500)' : ' (included)'}`,
        `Price Range: ${fmt(low)} – ${fmt(high)}`,
        scopeNotes ? `Notes: ${scopeNotes}` : null,
      ].filter(Boolean).join('\n');
      await fetch(`/api/admin/leads/${leadId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: summary }),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handleSendQuote() {
    setSending(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/send-quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          address: lead.address,
          sqft,
          material,
          pitchCategory: pitch.label,
          addOns: [ridgeVent ? 'Ridge Vent Upgrade (+$300)' : null, 'Gutter Inspection (Complimentary)'].filter(Boolean),
          layers,
          priceRange: [low, high],
          scopeNotes,
          leadId,
        }),
      });
      if (res.ok) {
        setSentBanner(true);
        setTimeout(() => setSentBanner(false), 5000);
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* LEFT COLUMN */}
      <div className="lg:w-[60%] space-y-4">
        {/* Satellite image */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-gray-300">Satellite View</h3>
            {lead.address && <p className="text-xs text-gray-500 mt-0.5">{lead.address}</p>}
          </div>
          {lead.address && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={satelliteUrl}
              alt="Satellite view of property"
              className="w-full object-cover"
              style={{ maxHeight: '320px' }}
            />
          )}
        </div>

        {/* Roof segments */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-300">Roof Segments</h3>
            {!loading && !solarError && segments.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedSegments(new Set(segments.map((_, i) => i)))}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Select All
                </button>
                <span className="text-gray-600">·</span>
                <button
                  onClick={() => setSelectedSegments(new Set())}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Deselect All
                </button>
              </div>
            )}
          </div>

          {loading && (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-800 rounded-lg animate-pulse" />
              ))}
              <p className="text-xs text-gray-500 text-center pt-1">Loading roof data...</p>
            </div>
          )}

          {!loading && solarError && (
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-sm text-amber-400 mb-3">Could not auto-detect roof — enter sq ft manually</p>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Total Sq Ft</label>
                <input
                  type="number"
                  value={manualSqft}
                  onChange={e => setManualSqft(e.target.value)}
                  placeholder="e.g. 2400"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {!loading && !solarError && segments.length > 0 && (
            <div className="space-y-2">
              {segments.map((seg, i) => {
                const sqftSeg = Math.round(seg.stats.areaMeters2 * 10.764);
                const selected = selectedSegments.has(i);
                const dir = azimuthToDirection(seg.azimuthDegrees);
                return (
                  <button
                    key={i}
                    onClick={() => toggleSegment(i)}
                    className={`w-full text-left rounded-lg border px-3 py-2.5 transition-all ${
                      selected
                        ? 'bg-blue-600/15 border-blue-500/50 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          selected ? 'bg-blue-500 border-blue-500' : 'border-gray-600'
                        }`}>
                          {selected && (
                            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span className="text-xs font-medium">Segment {i + 1}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className={selected ? 'text-blue-300' : 'text-gray-500'}>{sqftSeg.toLocaleString()} sq ft</span>
                        <span className={selected ? 'text-gray-300' : 'text-gray-600'}>{Math.round(seg.pitchDegrees)}° pitch</span>
                        <span className={`font-medium ${selected ? 'text-blue-400' : 'text-gray-500'}`}>{dir}</span>
                      </div>
                    </div>
                  </button>
                );
              })}

              <div className="pt-2 border-t border-gray-800">
                <label className="block text-xs text-gray-400 mb-1">Override total sq ft</label>
                <input
                  type="number"
                  value={manualSqft}
                  onChange={e => setManualSqft(e.target.value)}
                  placeholder={`Auto: ${autoSqft.toLocaleString()} sq ft`}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="lg:w-[40%] space-y-4">
        {/* Total sq ft display */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Total Roof Area</span>
            <span className="text-2xl font-black text-white">
              {sqft ? sqft.toLocaleString() : '—'} <span className="text-sm font-normal text-gray-400">sq ft</span>
            </span>
          </div>
          {manualSqft && (
            <p className="text-xs text-yellow-400 mt-1">Manual override active</p>
          )}
        </div>

        {/* Material */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Material</h3>
          <div className="space-y-2">
            {([
              ['standard', 'Standard Asphalt', 'GAF Timberline HDZ', '30-yr mfr warranty'],
              ['premium', 'Premium Asphalt', 'GAF Timberline UHDZ', '50-yr mfr warranty'],
            ] as const).map(([id, label, product, warranty]) => (
              <button
                key={id}
                onClick={() => setMaterial(id)}
                className={`w-full text-left rounded-lg border px-3 py-2.5 transition-all ${
                  material === id
                    ? 'bg-blue-600/15 border-blue-500/50'
                    : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-semibold ${material === id ? 'text-white' : 'text-gray-300'}`}>{label}</p>
                    <p className="text-xs text-gray-500">{product} · {warranty}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                    material === id ? 'bg-blue-500 border-blue-500' : 'border-gray-600'
                  }`} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Pitch */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pitch</h3>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${pitch.color}`}>
              {pitch.label}{pitch.surcharge > 0 ? ` +$${pitch.surcharge}/sqft` : ' — no surcharge'}
            </span>
          </div>
        </div>

        {/* Add-ons */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Add-ons</h3>
          <div className="space-y-2">
            <button
              onClick={() => setRidgeVent(v => !v)}
              className={`w-full text-left rounded-lg border px-3 py-2.5 transition-all ${
                ridgeVent ? 'bg-blue-600/15 border-blue-500/50' : 'bg-gray-800 border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${ridgeVent ? 'text-white' : 'text-gray-300'}`}>Ridge Vent Upgrade</p>
                  <p className="text-xs text-gray-500">+$300 — improves attic ventilation</p>
                </div>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  ridgeVent ? 'bg-blue-500 border-blue-500' : 'border-gray-600'
                }`}>
                  {ridgeVent && (
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
            <div className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-300">Gutter Inspection</p>
                  <p className="text-xs text-gray-500">Complimentary — always included</p>
                </div>
                <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">Free</span>
              </div>
            </div>
          </div>
        </div>

        {/* Layers */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Layers to Remove</h3>
          <div className="flex gap-2">
            {([1, 2] as const).map(n => (
              <button
                key={n}
                onClick={() => setLayers(n)}
                className={`flex-1 rounded-lg border py-2.5 text-sm font-semibold transition-all ${
                  layers === n
                    ? 'bg-blue-600/15 border-blue-500/50 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                {n} layer{n === 2 && <span className="block text-xs font-normal text-gray-400">+$500</span>}
                {n === 1 && <span className="block text-xs font-normal text-gray-400">included</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Price range */}
        <div className="bg-[#0f1e3b] rounded-xl border border-blue-900/50 p-5">
          <p className="text-xs text-blue-300/70 mb-1">Estimated Project Range</p>
          <p className="text-3xl font-black text-white mb-1">
            {sqft ? `${fmt(low)} – ${fmt(high)}` : '—'}
          </p>
          <p className="text-xs text-blue-300/50">Exact price confirmed after free drone assessment</p>
        </div>

        {/* Scope notes */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Scope Notes
          </label>
          <textarea
            value={scopeNotes}
            onChange={e => setScopeNotes(e.target.value)}
            placeholder="Internal notes for this quote (not sent to homeowner)"
            rows={3}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          {saveSuccess && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2 text-sm text-green-400">
              Saved to lead successfully.
            </div>
          )}
          {sentBanner && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2 text-sm text-green-400">
              Quote sent to {lead.email}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !sqft}
            className="w-full py-2.5 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {saving ? 'Saving...' : 'Save to Lead'}
          </button>
          <button
            onClick={handleSendQuote}
            disabled={sending || !sqft || !lead.email}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:text-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {sending ? 'Sending...' : 'Send Quote Email →'}
          </button>
        </div>
      </div>
    </div>
  );
}

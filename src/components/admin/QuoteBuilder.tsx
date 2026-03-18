'use client';

import { useEffect, useRef, useState } from 'react';

/* ─── Types ─────────────────────────────────────────── */
interface RoofSegment {
  pitchDegrees: number;
  azimuthDegrees: number;
  stats: { areaMeters2: number };
}

interface DrawnShape {
  id: number;
  sqft: number;
  color: string;
  overlay: google.maps.Polygon | google.maps.Rectangle;
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

/* ─── Constants ─────────────────────────────────────── */
const SHAPE_COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4','#84CC16'];

/* ─── Helpers ───────────────────────────────────────── */
function azimuthToDirection(deg: number): string {
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(((deg % 360) + 360) % 360 / 45) % 8];
}

function pitchCategory(deg: number): { label: string; surcharge: number; color: string } {
  if (deg >= 30) return { label: 'Steep',     surcharge: 1.0, color: 'bg-red-500/20 text-red-400 border-red-500/30' };
  if (deg >= 18) return { label: 'Moderate',  surcharge: 0.5, color: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30' };
  return               { label: 'Flat / Low', surcharge: 0,   color: 'bg-green-500/20 text-green-400 border-green-500/30' };
}

function fmt(n: number) { return '$' + Math.round(n).toLocaleString(); }

/* ─── Component ─────────────────────────────────────── */
export default function QuoteBuilder({ lead, leadId }: Props) {
  /* Map refs */
  const mapDivRef   = useRef<HTMLDivElement>(null);
  const mapRef      = useRef<google.maps.Map | null>(null);
  const dmRef       = useRef<google.maps.drawing.DrawingManager | null>(null);
  const shapesRef   = useRef<DrawnShape[]>([]);
  const counterRef  = useRef(0);

  /* Map state */
  const [mapsReady,   setMapsReady]   = useState(false);
  const [mapsFailed,  setMapsFailed]  = useState(false);
  const [geocodedLoc, setGeocodedLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [drawnShapes, setDrawnShapes] = useState<DrawnShape[]>([]);
  const [drawMode,    setDrawMode]    = useState<'polygon' | 'rectangle' | null>('polygon');
  const [segmentsOpen, setSegmentsOpen] = useState(false);

  /* Solar API state */
  const [segments,         setSegments]         = useState<RoofSegment[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<Set<number>>(new Set());
  const [solarLoading,     setSolarLoading]     = useState(true);

  /* Right-column state */
  const [manualSqft,  setManualSqft]  = useState('');
  const [material,    setMaterial]    = useState<'standard' | 'premium'>('standard');
  const [ridgeVent,   setRidgeVent]   = useState(false);
  const [layers,      setLayers]      = useState<1 | 2>(1);
  const [scopeNotes,  setScopeNotes]  = useState('');
  const [saving,      setSaving]      = useState(false);
  const [sending,     setSending]     = useState(false);
  const [sentBanner,  setSentBanner]  = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  /* ── 1. Load Google Maps JS API ──────────────────── */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Already loaded
    if ((window as any).google?.maps?.drawing) { setMapsReady(true); return; }

    const cbName = '_qbMapsCallback';
    (window as any)[cbName] = () => {
      setMapsReady(true);
      delete (window as any)[cbName];
    };

    // Avoid injecting duplicate script
    if (document.querySelector('script[data-qb-maps]')) return;

    const s = document.createElement('script');
    s.dataset.qbMaps = '1';
    s.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_SOLAR_API_KEY}&libraries=drawing,geometry&callback=${cbName}`;
    s.async = true;
    s.defer = true;
    s.onerror = () => { setMapsFailed(true); delete (window as any)[cbName]; };
    document.head.appendChild(s);
  }, []);

  /* ── 2. Geocode + Solar API ──────────────────────── */
  useEffect(() => {
    if (!lead.address) { setSolarLoading(false); return; }
    (async () => {
      try {
        const gr = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(lead.address!)}&key=${process.env.NEXT_PUBLIC_GOOGLE_SOLAR_API_KEY}`
        );
        const gd = await gr.json();
        if (!gd.results?.[0]) throw new Error('no geocode');
        const { lat, lng } = gd.results[0].geometry.location;
        setGeocodedLoc({ lat, lng });

        const sr = await fetch(
          `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&requiredQuality=LOW&key=${process.env.NEXT_PUBLIC_GOOGLE_SOLAR_API_KEY}`
        );
        const sd = await sr.json();
        const segs: RoofSegment[] = sd?.solarPotential?.roofSegmentStats ?? [];
        if (segs.length) {
          setSegments(segs);
          setSelectedSegments(new Set(segs.map((_, i) => i)));
        }
      } catch {
        // geocode failed — map won't init, segments unavailable
      } finally {
        setSolarLoading(false);
      }
    })();
  }, [lead.address]);

  /* ── 3. Init map once both Maps API + geocode ready ─ */
  useEffect(() => {
    if (!mapsReady || !geocodedLoc || !mapDivRef.current || mapRef.current) return;

    const map = new google.maps.Map(mapDivRef.current, {
      center: geocodedLoc,
      zoom: 19,
      mapTypeId: 'satellite',
      tilt: 0,
    });
    mapRef.current = map;

    const dm = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: false,
      polygonOptions:   { fillOpacity: 0.35, strokeWeight: 2, editable: true, draggable: false },
      rectangleOptions: { fillOpacity: 0.35, strokeWeight: 2, editable: true, draggable: false },
    });
    dm.setMap(map);
    dmRef.current = dm;

    google.maps.event.addListener(dm, 'overlaycomplete', (e: google.maps.drawing.OverlayCompleteEvent) => {
      const idx   = counterRef.current;
      const color = SHAPE_COLORS[idx % SHAPE_COLORS.length];
      let sqft    = 0;
      let overlay: google.maps.Polygon | google.maps.Rectangle;

      if (e.type === google.maps.drawing.OverlayType.POLYGON) {
        const poly = e.overlay as google.maps.Polygon;
        poly.setOptions({ fillColor: color, strokeColor: color });
        sqft    = Math.round(google.maps.geometry.spherical.computeArea(poly.getPath()) * 10.764);
        overlay = poly;
      } else {
        const rect = e.overlay as google.maps.Rectangle;
        rect.setOptions({ fillColor: color, strokeColor: color });
        const b  = rect.getBounds()!;
        const ne = b.getNorthEast(), sw = b.getSouthWest();
        const path = [ne, new google.maps.LatLng(ne.lat(), sw.lng()), sw, new google.maps.LatLng(sw.lat(), ne.lng())];
        sqft    = Math.round(google.maps.geometry.spherical.computeArea(path) * 10.764);
        overlay = rect;
      }

      counterRef.current += 1;
      const shape: DrawnShape = { id: idx, sqft, color, overlay };
      shapesRef.current = [...shapesRef.current, shape];
      setDrawnShapes([...shapesRef.current]);

      // Return to hand mode after drawing
      dm.setDrawingMode(null);
      setDrawMode(null);
    });
  }, [mapsReady, geocodedLoc]);

  /* ── 4. Sync draw mode → DrawingManager ────────────── */
  useEffect(() => {
    if (!dmRef.current) return;
    if (drawMode === 'polygon')   dmRef.current.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    else if (drawMode === 'rectangle') dmRef.current.setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE);
    else dmRef.current.setDrawingMode(null);
  }, [drawMode]);

  /* ── Shape management ───────────────────────────────── */
  function deleteShape(id: number) {
    const s = shapesRef.current.find(x => x.id === id);
    if (s) s.overlay.setMap(null);
    shapesRef.current = shapesRef.current.filter(x => x.id !== id);
    setDrawnShapes([...shapesRef.current]);
  }

  function clearAll() {
    shapesRef.current.forEach(s => s.overlay.setMap(null));
    shapesRef.current = [];
    setDrawnShapes([]);
  }

  /* ── Area calculations ──────────────────────────────── */
  const drawnTotal  = drawnShapes.reduce((sum, s) => sum + s.sqft, 0);
  const selectedSegs = segments.filter((_, i) => selectedSegments.has(i));
  const autoSqft    = selectedSegs.reduce((sum, s) => sum + Math.round(s.stats.areaMeters2 * 10.764), 0);
  const sqft = manualSqft
    ? parseInt(manualSqft, 10)
    : drawnTotal > 0 ? drawnTotal : autoSqft;

  const totalArea = selectedSegs.reduce((sum, s) => sum + s.stats.areaMeters2, 0);
  const weightedPitch = totalArea > 0
    ? selectedSegs.reduce((sum, s) => sum + s.pitchDegrees * s.stats.areaMeters2, 0) / totalArea : 0;
  const pitch = pitchCategory(weightedPitch);

  const baseRate = material === 'premium' ? 8 : 7;
  const base     = sqft ? Math.round(sqft * 1.1 * (baseRate + pitch.surcharge)) : 0;
  const low      = base - 1000 + (ridgeVent ? 300 : 0) + (layers === 2 ? 500 : 0);
  const high     = base + 1000 + (ridgeVent ? 300 : 0) + (layers === 2 ? 500 : 0);
  const midpoint = Math.round((low + high) / 2);

  /* Fallback static satellite image */
  const encodedAddr = lead.address ? encodeURIComponent(lead.address) : '';
  const fallbackImg = `https://maps.googleapis.com/maps/api/staticmap?center=${encodedAddr}&zoom=19&size=600x400&maptype=satellite&key=${process.env.NEXT_PUBLIC_GOOGLE_SOLAR_API_KEY}`;

  /* ── Save / Send handlers ───────────────────────────── */
  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote_amount: midpoint, roof_size: String(sqft) }),
      });
      const summary = [
        '=== Quote Builder Summary ===',
        `Roof Area: ${sqft.toLocaleString()} sq ft${drawnTotal > 0 ? ' (drawn on map)' : ''}`,
        `Material: ${material === 'premium' ? 'Premium (GAF Timberline UHDZ, 50-yr)' : 'Standard (GAF Timberline HDZ, 30-yr)'}`,
        `Pitch: ${pitch.label}${pitch.surcharge > 0 ? ` (+$${pitch.surcharge}/sqft)` : ''}`,
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
          name: lead.name, email: lead.email, phone: lead.phone, address: lead.address,
          sqft, material,
          pitchCategory: pitch.label,
          addOns: [ridgeVent ? 'Ridge Vent Upgrade (+$300)' : null, 'Gutter Inspection (Complimentary)'].filter(Boolean),
          layers, priceRange: [low, high], scopeNotes, leadId,
        }),
      });
      if (res.ok) { setSentBanner(true); setTimeout(() => setSentBanner(false), 5000); }
    } finally {
      setSending(false);
    }
  }

  /* ── Render ─────────────────────────────────────────── */
  const showInteractiveMap = mapsReady && !!geocodedLoc && !mapsFailed;
  const showFallbackImg    = !showInteractiveMap && !!lead.address;

  const toolbarBtn = (active: boolean) =>
    `px-3 py-1.5 rounded text-xs font-semibold transition-all ${
      active ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }`;

  return (
    <div className="flex flex-col lg:flex-row gap-6">

      {/* ══ LEFT COLUMN ══════════════════════════════════ */}
      <div className="lg:w-[60%] space-y-4">

        {/* Map / Satellite panel */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-gray-300">Roof Drawing Tool</h3>
            {lead.address && <p className="text-xs text-gray-500 mt-0.5">{lead.address}</p>}
          </div>

          {/* Toolbar */}
          {showInteractiveMap && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 border-b border-gray-700 flex-wrap">
              <button onClick={() => setDrawMode('polygon')}   className={toolbarBtn(drawMode === 'polygon')}>Draw Polygon</button>
              <button onClick={() => setDrawMode('rectangle')} className={toolbarBtn(drawMode === 'rectangle')}>Draw Rectangle</button>
              <button onClick={() => setDrawMode(null)}        className={toolbarBtn(drawMode === null)}>
                <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3" /></svg>
                Select
              </button>
              <button onClick={clearAll} className="px-3 py-1.5 rounded text-xs font-semibold bg-red-900/40 text-red-400 hover:bg-red-900/70 transition-all">
                Clear All
              </button>
              <span className="text-xs text-gray-500 ml-1 hidden sm:block">Click to draw roof sections directly on the satellite view</span>
            </div>
          )}

          {/* Map container */}
          {!mapsFailed && (
            <div
              ref={mapDivRef}
              style={{ height: '420px', width: '100%', display: showInteractiveMap ? 'block' : 'none' }}
            />
          )}

          {/* Loading spinner (waiting for Maps API or geocode) */}
          {!showInteractiveMap && !mapsFailed && !solarLoading && (
            <div className="h-[420px] flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <svg className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                <p className="text-xs text-gray-400">Loading interactive map…</p>
              </div>
            </div>
          )}
          {solarLoading && !showInteractiveMap && (
            <div className="h-[420px] flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <svg className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                <p className="text-xs text-gray-400">Locating property…</p>
              </div>
            </div>
          )}

          {/* Fallback static image */}
          {showFallbackImg && mapsFailed && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fallbackImg} alt="Satellite view" className="w-full object-cover" style={{ maxHeight: '420px' }} />
          )}
        </div>

        {/* Drawn shapes list */}
        {drawnShapes.length > 0 && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Drawn Sections ({drawnShapes.length})</h3>
            <div className="space-y-2">
              {drawnShapes.map((shape, idx) => (
                <div key={shape.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: shape.color }} />
                    <span className="text-xs font-medium text-gray-300">Section {idx + 1}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-blue-300 font-medium">{shape.sqft.toLocaleString()} sq ft</span>
                    <button
                      onClick={() => deleteShape(shape.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-1 border-t border-gray-700">
                <span className="text-xs text-gray-400">Total drawn area</span>
                <span className="text-xs font-bold text-white">{drawnTotal.toLocaleString()} sq ft</span>
              </div>
            </div>
          </div>
        )}

        {/* Detected roof segments (collapsible) */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <button
            onClick={() => setSegmentsOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-800/50 transition-colors"
          >
            <span className="text-sm font-semibold text-gray-400">
              {solarLoading ? 'Loading detected roof segments…' : segments.length > 0 ? `Show detected roof segments (${segments.length})` : 'No roof segments detected'}
            </span>
            <svg className={`w-4 h-4 text-gray-500 transition-transform ${segmentsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {segmentsOpen && (
            <div className="px-4 pb-4 border-t border-gray-800">
              {solarLoading && (
                <div className="space-y-2 pt-3">
                  {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-800 rounded animate-pulse" />)}
                </div>
              )}
              {!solarLoading && segments.length === 0 && (
                <p className="text-xs text-amber-400 pt-3">Solar API could not detect segments for this address.</p>
              )}
              {!solarLoading && segments.length > 0 && (
                <div className="space-y-1.5 pt-3">
                  <div className="flex gap-2 mb-2">
                    <button onClick={() => setSelectedSegments(new Set(segments.map((_,i)=>i)))} className="text-xs text-blue-400 hover:text-blue-300">Select All</button>
                    <span className="text-gray-600">·</span>
                    <button onClick={() => setSelectedSegments(new Set())} className="text-xs text-gray-400 hover:text-white">Deselect All</button>
                    {drawnTotal > 0 && <span className="text-xs text-yellow-400 ml-2">(drawn shapes take priority)</span>}
                  </div>
                  {segments.map((seg, i) => {
                    const sqftSeg = Math.round(seg.stats.areaMeters2 * 10.764);
                    const sel = selectedSegments.has(i);
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedSegments(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; })}
                        className={`w-full text-left rounded-lg border px-3 py-2 transition-all ${sel ? 'bg-blue-600/15 border-blue-500/50 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center ${sel ? 'bg-blue-500 border-blue-500' : 'border-gray-600'}`}>
                              {sel && <svg className="w-2 h-2 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                            </div>
                            <span className="font-medium">Seg {i + 1}</span>
                          </div>
                          <div className="flex gap-3">
                            <span className={sel ? 'text-blue-300' : 'text-gray-500'}>{sqftSeg.toLocaleString()} sq ft</span>
                            <span className={sel ? 'text-gray-300' : 'text-gray-600'}>{Math.round(seg.pitchDegrees)}°</span>
                            <span className={sel ? 'text-blue-400' : 'text-gray-500'}>{azimuthToDirection(seg.azimuthDegrees)}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Manual override inside segments panel */}
              <div className="pt-3 border-t border-gray-800 mt-3">
                <label className="block text-xs text-gray-400 mb-1">Override total sq ft</label>
                <input
                  type="number"
                  value={manualSqft}
                  onChange={e => setManualSqft(e.target.value)}
                  placeholder={`Auto: ${(drawnTotal || autoSqft).toLocaleString()} sq ft`}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ RIGHT COLUMN ════════════════════════════════ */}
      <div className="lg:w-[40%] space-y-4">

        {/* Total sq ft */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Total Roof Area</span>
            <span className="text-2xl font-black text-white">
              {sqft ? sqft.toLocaleString() : '—'}
              <span className="text-sm font-normal text-gray-400 ml-1">sq ft</span>
            </span>
          </div>
          {drawnTotal > 0 && !manualSqft && <p className="text-xs text-blue-400 mt-1">From drawn shapes on map</p>}
          {manualSqft && <p className="text-xs text-yellow-400 mt-1">Manual override active</p>}
          {!drawnTotal && !manualSqft && autoSqft > 0 && <p className="text-xs text-gray-500 mt-1">From Solar API segments</p>}
        </div>

        {/* Material */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Material</h3>
          <div className="space-y-2">
            {([
              ['standard', 'Standard Asphalt', 'GAF Timberline HDZ', '30-yr mfr warranty'],
              ['premium',  'Premium Asphalt',  'GAF Timberline UHDZ','50-yr mfr warranty'],
            ] as const).map(([id, label, product, warranty]) => (
              <button key={id} onClick={() => setMaterial(id)}
                className={`w-full text-left rounded-lg border px-3 py-2.5 transition-all ${material === id ? 'bg-blue-600/15 border-blue-500/50' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-semibold ${material === id ? 'text-white' : 'text-gray-300'}`}>{label}</p>
                    <p className="text-xs text-gray-500">{product} · {warranty}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${material === id ? 'bg-blue-500 border-blue-500' : 'border-gray-600'}`} />
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
            <button onClick={() => setRidgeVent(v => !v)}
              className={`w-full text-left rounded-lg border px-3 py-2.5 transition-all ${ridgeVent ? 'bg-blue-600/15 border-blue-500/50' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${ridgeVent ? 'text-white' : 'text-gray-300'}`}>Ridge Vent Upgrade</p>
                  <p className="text-xs text-gray-500">+$300 — improves attic ventilation</p>
                </div>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${ridgeVent ? 'bg-blue-500 border-blue-500' : 'border-gray-600'}`}>
                  {ridgeVent && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>}
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
              <button key={n} onClick={() => setLayers(n)}
                className={`flex-1 rounded-lg border py-2.5 text-sm font-semibold transition-all ${layers === n ? 'bg-blue-600/15 border-blue-500/50 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}`}
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
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Scope Notes</label>
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
              Proposal sent to {lead.email}
            </div>
          )}
          <button onClick={handleSave} disabled={saving || !sqft}
            className="w-full py-2.5 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {saving ? 'Saving…' : 'Save to Lead'}
          </button>
          <button onClick={handleSendQuote} disabled={sending || !sqft || !lead.email}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:text-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {sending ? 'Generating PDF & Sending…' : 'Send Quote Email →'}
          </button>
        </div>
      </div>
    </div>
  );
}

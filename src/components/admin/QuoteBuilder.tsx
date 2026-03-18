'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

/* ═══════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════ */
type WorkType = 'replace' | 'repair';
type DrawMode = 'polygon' | 'rectangle' | null;
type MapType  = 'satellite' | 'hybrid' | 'roadmap';

interface Section {
  id: number;
  name: string;
  sqft: number;
  pitch: number;
  workType: WorkType;
  layers: 1 | 2;
  wasteFactor: number; // percentage e.g. 12
  color: string;
  centroidLat: number;
  centroidLng: number;
}

interface LinearMeasurements {
  ridge: number;
  valley: number;
  rake: number;
  eave: number;
}

interface AddOnsState {
  ridgeVent: boolean;
  gutterInspection: boolean;
  iceWaterFull: boolean;
  dripEdgeUpgrade: boolean;
  skylights: number;
  chimneys: number;
}

interface PendingShape {
  id: number;
  sqft: number;
  color: string;
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

/* ═══════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════ */
const SHAPE_COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6','#F97316'];

const COMMON_PITCHES = [
  { label: '3/12', deg: 14 },
  { label: '4/12', deg: 18 },
  { label: '6/12', deg: 27 },
  { label: '8/12', deg: 34 },
  { label: '10/12', deg: 40 },
  { label: '12/12', deg: 45 },
];

/* ═══════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════ */
function getPitchSurcharge(deg: number): number {
  if (deg >= 40) return 1.75;
  if (deg >= 30) return 1.00;
  if (deg >= 18) return 0.50;
  return 0;
}

function getPitchLabel(deg: number): { label: string; badge: string } {
  if (deg >= 40) return { label: 'Very Steep (40°+)',  badge: 'bg-red-500/20 text-red-400 border-red-500/30' };
  if (deg >= 30) return { label: 'Steep (30–40°)',     badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
  if (deg >= 18) return { label: 'Moderate (18–30°)',  badge: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30' };
  return               { label: 'Low (under 18°)',     badge: 'bg-green-500/20 text-green-400 border-green-500/30' };
}

function suggestWaste(pitchDeg: number): number {
  if (pitchDeg > 40) return 18;
  if (pitchDeg > 30) return 15;
  return 12;
}

function sqftWithWaste(sqft: number, pct: number): number {
  return Math.round(sqft * (1 + pct / 100));
}

function fmtMoney(n: number): string {
  return '$' + Math.round(n).toLocaleString();
}

/* ═══════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════ */
export default function QuoteBuilder({ lead, leadId }: Props) {

  /* ── Map refs ──────────────────────────────────────── */
  const mapDivRef      = useRef<HTMLDivElement>(null);
  const svDivRef       = useRef<HTMLDivElement>(null);
  const mapRef         = useRef<google.maps.Map | null>(null);
  const dmRef          = useRef<google.maps.drawing.DrawingManager | null>(null);
  const LabelClassRef  = useRef<any>(null);
  const overlaysRef    = useRef<Map<number, { shape: google.maps.Polygon | google.maps.Rectangle; label: any }>>(new Map());
  const pendingOvRef   = useRef<google.maps.Polygon | google.maps.Rectangle | null>(null);
  const counterRef     = useRef(0);

  /* ── Map state ─────────────────────────────────────── */
  const [mapsReady,    setMapsReady]    = useState(false);
  const [mapsFailed,   setMapsFailed]   = useState(false);
  const [geocodedLoc,  setGeocodedLoc]  = useState<{ lat: number; lng: number } | null>(null);
  const [drawMode,     setDrawMode]     = useState<DrawMode>(null);
  const [editMode,     setEditMode]     = useState(false);
  const [mapType,      setMapType]      = useState<MapType>('satellite');
  const [zoomLevel,    setZoomLevel]    = useState(20);
  const [streetView,   setStreetView]   = useState(false);
  const [pendingShape, setPendingShape] = useState<PendingShape | null>(null);
  const [pendingName,  setPendingName]  = useState('');
  const [clearConfirm, setClearConfirm] = useState(false);

  /* ── Section state ─────────────────────────────────── */
  const [sections,    setSections]    = useState<Section[]>([]);
  const [manualSqft,  setManualSqft]  = useState('');
  const [showManual,  setShowManual]  = useState(false);
  const [renamingId,  setRenamingId]  = useState<number | null>(null);
  const [renameVal,   setRenameVal]   = useState('');

  /* ── Quote state ───────────────────────────────────── */
  const [material, setMaterial] = useState<'standard' | 'premium'>('standard');
  const [linear, setLinear]     = useState<LinearMeasurements>({ ridge: 0, valley: 0, rake: 0, eave: 0 });
  const [addOns, setAddOns]     = useState<AddOnsState>({
    ridgeVent: false, gutterInspection: false, iceWaterFull: false,
    dripEdgeUpgrade: false, skylights: 0, chimneys: 0,
  });
  const [scopeNotes,  setScopeNotes]  = useState('');
  const [saving,      setSaving]      = useState(false);
  const [sending,     setSending]     = useState(false);
  const [sentBanner,  setSentBanner]  = useState(false);
  const [sendError,   setSendError]   = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  /* ── 1. Load Google Maps JS API ────────────────────── */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).google?.maps?.drawing) { setMapsReady(true); return; }
    const cb = '_qbInit';
    (window as any)[cb] = () => { setMapsReady(true); delete (window as any)[cb]; };
    if (document.querySelector('script[data-qb]')) return;
    const s = document.createElement('script');
    s.dataset.qb = '1';
    s.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_SOLAR_API_KEY}&libraries=drawing,geometry,places&callback=${cb}`;
    s.async = true; s.defer = true;
    s.onerror = () => { setMapsFailed(true); delete (window as any)[cb]; };
    document.head.appendChild(s);
  }, []);

  /* ── 2. Geocode address ────────────────────────────── */
  useEffect(() => {
    if (!lead.address) return;
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(lead.address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_SOLAR_API_KEY}`)
      .then(r => r.json())
      .then(d => {
        if (d.results?.[0]) {
          const { lat, lng } = d.results[0].geometry.location;
          setGeocodedLoc({ lat, lng });
        }
      })
      .catch(() => {});
  }, [lead.address]);

  /* ── 3. Init map ───────────────────────────────────── */
  useEffect(() => {
    if (!mapsReady || !geocodedLoc || !mapDivRef.current || mapRef.current) return;

    /* Label overlay class */
    class LabelOverlay extends google.maps.OverlayView {
      private div: HTMLDivElement | null = null;
      constructor(private pos: google.maps.LatLng, private html: string) {
        super();
      }
      onAdd() {
        const d = document.createElement('div');
        d.style.cssText = 'position:absolute;background:rgba(0,0,0,0.82);color:#fff;padding:3px 8px;border-radius:5px;font-size:10px;font-family:sans-serif;white-space:nowrap;pointer-events:none;transform:translate(-50%,-100%);margin-top:-6px;line-height:1.5;text-align:center;border:1px solid rgba(255,255,255,0.15)';
        d.innerHTML = this.html;
        this.div = d;
        this.getPanes()!.overlayMouseTarget.appendChild(d);
      }
      draw() {
        if (!this.div) return;
        const proj = this.getProjection();
        const pt = proj?.fromLatLngToDivPixel(this.pos);
        if (pt) { this.div.style.left = `${pt.x}px`; this.div.style.top = `${pt.y}px`; }
      }
      onRemove() {
        this.div?.parentNode?.removeChild(this.div); this.div = null;
      }
      update(html: string, pos?: google.maps.LatLng) {
        this.html = html;
        if (pos) this.pos = pos;
        if (this.div) this.div.innerHTML = html;
        this.draw();
      }
    }
    LabelClassRef.current = LabelOverlay;

    const map = new google.maps.Map(mapDivRef.current, {
      center: geocodedLoc, zoom: 20, mapTypeId: 'satellite',
      tilt: 0, maxZoom: 22, minZoom: 15,
    });
    mapRef.current = map;

    map.addListener('zoom_changed', () => setZoomLevel(map.getZoom() ?? 20));

    const dm = new google.maps.drawing.DrawingManager({
      drawingMode: null, drawingControl: false,
      polygonOptions:   { strokeWeight: 2, fillOpacity: 0.3, editable: false, draggable: false },
      rectangleOptions: { strokeWeight: 2, fillOpacity: 0.3, editable: false, draggable: false },
    });
    dm.setMap(map);
    dmRef.current = dm;

    google.maps.event.addListener(dm, 'overlaycomplete', (e: google.maps.drawing.OverlayCompleteEvent) => {
      const idx   = counterRef.current;
      const color = SHAPE_COLORS[idx % SHAPE_COLORS.length];
      let sqft = 0;
      let centroid: google.maps.LatLng;
      let overlay: google.maps.Polygon | google.maps.Rectangle;

      if (e.type === google.maps.drawing.OverlayType.POLYGON) {
        const poly = e.overlay as google.maps.Polygon;
        poly.setOptions({ fillColor: color, strokeColor: color });
        const path = poly.getPath();
        sqft = Math.round(google.maps.geometry.spherical.computeArea(path) * 10.764);
        let lat = 0, lng = 0;
        path.forEach(pt => { lat += pt.lat(); lng += pt.lng(); });
        centroid = new google.maps.LatLng(lat / path.getLength(), lng / path.getLength());
        overlay = poly;
      } else {
        const rect = e.overlay as google.maps.Rectangle;
        rect.setOptions({ fillColor: color, strokeColor: color });
        const b = rect.getBounds()!;
        const ne = b.getNorthEast(), sw = b.getSouthWest();
        const path = [ne, new google.maps.LatLng(ne.lat(), sw.lng()), sw, new google.maps.LatLng(sw.lat(), ne.lng())];
        sqft = Math.round(google.maps.geometry.spherical.computeArea(path) * 10.764);
        centroid = b.getCenter();
        overlay = rect;
      }

      counterRef.current += 1;
      pendingOvRef.current = overlay;

      // Cancel any existing pending shape
      if (pendingOvRef.current && pendingShape) {
        pendingOvRef.current.setMap(null);
      }

      setPendingShape({ id: idx, sqft, color });
      setPendingName(`Section ${idx + 1}`);

      // Return to hand mode
      dm.setDrawingMode(null);
      setDrawMode(null);

      // Store centroid on overlay for later use
      (overlay as any)._centroid = centroid;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapsReady, geocodedLoc]);

  /* ── 4. Sync draw mode ─────────────────────────────── */
  useEffect(() => {
    if (!dmRef.current || !mapsReady) return;
    if (drawMode === 'polygon')   dmRef.current.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    else if (drawMode === 'rectangle') dmRef.current.setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE);
    else dmRef.current.setDrawingMode(null);
  }, [drawMode, mapsReady]);

  /* ── 5. Sync edit mode ─────────────────────────────── */
  useEffect(() => {
    overlaysRef.current.forEach(({ shape }) => {
      shape.setOptions({ editable: editMode, draggable: editMode });
    });
  }, [editMode]);

  /* ── 6. Sync map type ──────────────────────────────── */
  useEffect(() => {
    mapRef.current?.setMapTypeId(mapType);
  }, [mapType]);

  /* ── 7. Street View ─────────────────────────────────── */
  useEffect(() => {
    if (!streetView || !geocodedLoc || !svDivRef.current || !mapsReady) return;
    new google.maps.StreetViewPanorama(svDivRef.current, {
      position: geocodedLoc,
      pov: { heading: 0, pitch: 0 },
      zoom: 1,
      addressControl: true,
    });
  }, [streetView, geocodedLoc, mapsReady]);

  /* ── 8. Update labels when sections change ─────────── */
  useEffect(() => {
    sections.forEach(s => {
      const entry = overlaysRef.current.get(s.id);
      if (entry?.label) {
        entry.label.update(`<strong>${s.name}</strong><br>${s.sqft.toLocaleString()} sqft`);
      }
    });
  }, [sections]);

  /* ═══════════════ MAP HANDLERS ═══════════════════════ */

  function confirmName() {
    if (!pendingOvRef.current || !pendingShape) return;
    const name = pendingName.trim() || `Section ${pendingShape.id + 1}`;
    const overlay = pendingOvRef.current;
    const centroid = (overlay as any)._centroid as google.maps.LatLng;
    const suggestedWaste = 12;

    // Create label overlay
    let labelOverlay: any = null;
    if (LabelClassRef.current && mapRef.current) {
      labelOverlay = new LabelClassRef.current(
        centroid,
        `<strong>${name}</strong><br>${pendingShape.sqft.toLocaleString()} sqft`
      );
      labelOverlay.setMap(mapRef.current);
    }

    overlaysRef.current.set(pendingShape.id, { shape: overlay, label: labelOverlay });

    const newSection: Section = {
      id: pendingShape.id,
      name,
      sqft: pendingShape.sqft,
      pitch: 18,
      workType: 'replace',
      layers: 1,
      wasteFactor: suggestedWaste,
      color: pendingShape.color,
      centroidLat: centroid?.lat() ?? 0,
      centroidLng: centroid?.lng() ?? 0,
    };

    setSections(prev => [...prev, newSection]);
    setPendingShape(null);
    setPendingName('');
    pendingOvRef.current = null;
  }

  function cancelPending() {
    pendingOvRef.current?.setMap(null);
    pendingOvRef.current = null;
    setPendingShape(null);
    setPendingName('');
    counterRef.current = Math.max(0, counterRef.current - 1);
  }

  function deleteSection(id: number) {
    const entry = overlaysRef.current.get(id);
    if (entry) {
      entry.shape.setMap(null);
      entry.label?.setMap(null);
      overlaysRef.current.delete(id);
    }
    setSections(prev => prev.filter(s => s.id !== id));
  }

  function undoLast() {
    if (pendingShape) { cancelPending(); return; }
    if (sections.length === 0) return;
    const last = sections[sections.length - 1];
    deleteSection(last.id);
  }

  function clearAll() {
    if (pendingShape) cancelPending();
    sections.forEach(s => {
      const entry = overlaysRef.current.get(s.id);
      entry?.shape.setMap(null);
      entry?.label?.setMap(null);
    });
    overlaysRef.current.clear();
    setSections([]);
    setClearConfirm(false);
    counterRef.current = 0;
  }

  function updateSection(id: number, patch: Partial<Section>) {
    setSections(prev => prev.map(s => {
      if (s.id !== id) return s;
      const updated = { ...s, ...patch };
      // Auto-suggest waste if pitch changed
      if (patch.pitch !== undefined && !('wasteFactor' in patch)) {
        updated.wasteFactor = suggestWaste(patch.pitch);
      }
      return updated;
    }));
  }

  function zoomIn()  { if (mapRef.current) { const z = (mapRef.current.getZoom() ?? 20) + 1; mapRef.current.setZoom(Math.min(22, z)); } }
  function zoomOut() { if (mapRef.current) { const z = (mapRef.current.getZoom() ?? 20) - 1; mapRef.current.setZoom(Math.max(15, z)); } }

  /* ═══════════════ PRICE CALCULATION ═════════════════ */
  const priceCalc = useMemo(() => {
    const baseRate = material === 'premium' ? 8 : 7;
    const replaceSections = sections.filter(s => s.workType === 'replace');
    const repairSections  = sections.filter(s => s.workType === 'repair');
    const totalSqftWaste  = replaceSections.reduce((sum, s) => sum + sqftWithWaste(s.sqft, s.wasteFactor), 0);

    const lineItems: { label: string; amount: number; isRange?: boolean }[] = [];

    replaceSections.forEach(s => {
      const sw = sqftWithWaste(s.sqft, s.wasteFactor);
      const surcharge = getPitchSurcharge(s.pitch);
      const rate = baseRate + surcharge;
      lineItems.push({ label: `${s.name} — ${sw.toLocaleString()} sqft × $${rate.toFixed(2)}/sqft`, amount: Math.round(sw * rate) });
      if (s.layers === 2) lineItems.push({ label: `${s.name} — 2-layer tearoff surcharge`, amount: 500 });
    });

    repairSections.forEach(s => {
      lineItems.push({ label: `${s.name} — Repair estimate ($350–$2,500)`, amount: 1425, isRange: true });
    });

    const linearTotal = linear.ridge * 8 + linear.valley * 12 + linear.rake * 5 + linear.eave * 4;
    if (linearTotal > 0) {
      const parts = [
        linear.ridge  > 0 && `${linear.ridge}lf ridge×$8`,
        linear.valley > 0 && `${linear.valley}lf valley×$12`,
        linear.rake   > 0 && `${linear.rake}lf rake×$5`,
        linear.eave   > 0 && `${linear.eave}lf eave×$4`,
      ].filter(Boolean).join(', ');
      lineItems.push({ label: `Linear items (${parts})`, amount: linearTotal });
    }

    if (addOns.ridgeVent)    lineItems.push({ label: 'Ridge Vent Upgrade', amount: 300 });
    if (addOns.iceWaterFull && totalSqftWaste > 0) lineItems.push({ label: `Full Ice & Water Shield (${Math.round(totalSqftWaste).toLocaleString()} sqft × $0.85)`, amount: Math.round(totalSqftWaste * 0.85) });
    if (addOns.dripEdgeUpgrade && linear.eave > 0) lineItems.push({ label: `Drip Edge Upgrade (${linear.eave}lf × $2.50)`, amount: Math.round(linear.eave * 2.5) });
    if (addOns.skylights > 0)  lineItems.push({ label: `Skylight Flashing (${addOns.skylights} × $250)`, amount: addOns.skylights * 250 });
    if (addOns.chimneys  > 0)  lineItems.push({ label: `Chimney Flashing (${addOns.chimneys} × $400)`, amount: addOns.chimneys * 400 });

    const overrideSqft = showManual && manualSqft ? parseInt(manualSqft, 10) : null;
    const displayTotal = overrideSqft ?? (sections.length > 0 ? replaceSections.reduce((sum, s) => sum + s.sqft, 0) : 0);

    const subtotal = lineItems.reduce((sum, li) => sum + li.amount, 0);
    const rangeMin = Math.max(0, subtotal - 1000);
    const rangeMax = subtotal + 1000;

    return { lineItems, subtotal, rangeMin, rangeMax, midpoint: subtotal, totalSqftWaste, displayTotal };
  }, [sections, material, linear, addOns, manualSqft, showManual]);

  /* ═══════════════ PITCH SUMMARY ══════════════════════ */
  const pitchSummary = useMemo(() => {
    if (sections.length === 0) return null;
    const replSecs = sections.filter(s => s.workType === 'replace');
    if (replSecs.length === 0) return null;
    const totalArea = replSecs.reduce((sum, s) => sum + s.sqft, 0);
    const avgPitch  = totalArea > 0
      ? replSecs.reduce((sum, s) => sum + s.pitch * s.sqft, 0) / totalArea : 0;
    return { avgPitch, sections: replSecs.map(s => ({ name: s.name, pitch: s.pitch, surcharge: getPitchSurcharge(s.pitch) })) };
  }, [sections]);

  /* ═══════════════ SAVE / SEND ════════════════════════ */
  async function handleSave() {
    setSaving(true);
    try {
      const totalSqft = sections.reduce((sum, s) => sum + s.sqft, 0) || parseInt(manualSqft || '0', 10);
      await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote_amount: priceCalc.midpoint, roof_size: String(totalSqft) }),
      });
      const sectionLines = sections.map(s =>
        `  • ${s.name}: ${s.sqft.toLocaleString()} sqft | ${s.workType} | pitch ${s.pitch}° | waste ${s.wasteFactor}% | ${s.layers === 2 ? '2 layers' : '1 layer'}`
      ).join('\n');
      const summary = [
        '=== Quote Builder ===',
        sections.length > 0 ? `Sections:\n${sectionLines}` : `Manual sqft: ${manualSqft}`,
        `Material: ${material === 'premium' ? 'Premium (UHDZ, 50-yr)' : 'Standard (HDZ, 30-yr)'}`,
        linear.ridge || linear.valley || linear.rake || linear.eave
          ? `Linear: ridge ${linear.ridge}lf | valley ${linear.valley}lf | rake ${linear.rake}lf | eave ${linear.eave}lf` : null,
        `Price range: ${fmtMoney(priceCalc.rangeMin)} – ${fmtMoney(priceCalc.rangeMax)}`,
        scopeNotes ? `Notes: ${scopeNotes}` : null,
      ].filter(Boolean).join('\n');
      await fetch(`/api/admin/leads/${leadId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: summary }),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally { setSaving(false); }
  }

  async function handleSend() {
    setSending(true); setSendError('');
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/send-quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: lead.name, email: lead.email, phone: lead.phone, address: lead.address,
          sections: sections.map(s => ({
            name: s.name, sqft: s.sqft,
            sqftWithWaste: sqftWithWaste(s.sqft, s.wasteFactor),
            pitch: s.pitch, workType: s.workType,
            layers: s.layers, wasteFactor: s.wasteFactor,
          })),
          linearMeasurements: linear,
          material,
          addOns: [
            addOns.ridgeVent && 'Ridge Vent Upgrade (+$300)',
            addOns.iceWaterFull && 'Full Ice & Water Shield (+$0.85/sqft)',
            addOns.dripEdgeUpgrade && linear.eave > 0 && `Drip Edge Upgrade (${linear.eave}lf × $2.50)`,
            addOns.gutterInspection && 'Gutter Inspection (Complimentary)',
          ].filter(Boolean) as string[],
          skylights: addOns.skylights,
          chimneys: addOns.chimneys,
          priceBreakdown: {
            lineItems: priceCalc.lineItems,
            subtotal: priceCalc.subtotal,
            rangeMin: priceCalc.rangeMin,
            rangeMax: priceCalc.rangeMax,
          },
          scopeNotes,
          leadId,
        }),
      });
      if (res.ok) { setSentBanner(true); setTimeout(() => setSentBanner(false), 5000); }
      else { const d = await res.json(); setSendError(d.error || 'Send failed'); }
    } catch { setSendError('Network error — check connection'); }
    finally { setSending(false); }
  }

  /* ═══════════════ RENDER HELPERS ══════════════════════ */
  const showMap = mapsReady && !!geocodedLoc && !mapsFailed;

  const tbBtn = (active?: boolean, danger?: boolean) =>
    `flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all ${
      danger   ? 'bg-red-900/40 text-red-400 hover:bg-red-900/60' :
      active   ? 'bg-blue-600 text-white' :
                 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
    }`;

  const mapTypeBtns: MapType[] = ['satellite', 'hybrid', 'roadmap'];

  /* ═══════════════ JSX ══════════════════════════════════ */
  return (
    <div className="flex flex-col lg:flex-row bg-gray-950" style={{ height: 'calc(100vh - 118px)', minHeight: 600 }}>

      {/* ══════════════ LEFT PANEL ══════════════════════ */}
      <div className="lg:w-[55%] flex flex-col border-r border-gray-800 overflow-hidden">

        {/* ── Toolbar row 1: drawing tools ──────────── */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 border-b border-gray-800 flex-wrap">
          <button onClick={() => setDrawMode(d => d === 'polygon' ? null : 'polygon')} className={tbBtn(drawMode === 'polygon')}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6.5-6.5a2 2 0 012.828 2.828L11 15H9v-2l6.5-6.5z" /></svg>
            Draw Section
          </button>
          <button onClick={() => setDrawMode(d => d === 'rectangle' ? null : 'rectangle')} className={tbBtn(drawMode === 'rectangle')}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="1" strokeWidth={2} /></svg>
            Draw Rectangle
          </button>
          <button onClick={() => setEditMode(e => !e)} className={tbBtn(editMode)}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            Edit Shapes {editMode && <span className="text-[10px] opacity-70">(ON)</span>}
          </button>
          <button onClick={undoLast} className={tbBtn()}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
            Undo
          </button>
          {clearConfirm ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-red-400">Clear all?</span>
              <button onClick={clearAll} className="px-2 py-1 rounded text-xs bg-red-600 text-white">Yes</button>
              <button onClick={() => setClearConfirm(false)} className="px-2 py-1 rounded text-xs bg-gray-700 text-gray-300">No</button>
            </div>
          ) : (
            <button onClick={() => setClearConfirm(true)} className={tbBtn(false, true)}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Clear All
            </button>
          )}
        </div>

        {/* ── Toolbar row 2: view controls ──────────── */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 border-b border-gray-700 flex-wrap">
          <div className="flex rounded overflow-hidden border border-gray-700">
            {mapTypeBtns.map(t => (
              <button key={t} onClick={() => setMapType(t)}
                className={`px-2.5 py-1.5 text-xs font-medium transition-all capitalize ${mapType === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                {t}
              </button>
            ))}
          </div>
          <button onClick={() => setStreetView(true)} className={tbBtn()}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3" strokeWidth={2}/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
            Street View
          </button>
          <div className="flex items-center gap-1.5 ml-auto">
            <button onClick={zoomOut} className={tbBtn()}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
            </button>
            <span className="text-xs text-gray-400 w-10 text-center">z{zoomLevel}</span>
            <button onClick={zoomIn} className={tbBtn()}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
        </div>

        {/* ── Map ───────────────────────────────────── */}
        <div className="relative flex-shrink-0" style={{ height: 480 }}>
          <div ref={mapDivRef} style={{ height: '100%', width: '100%', display: showMap ? 'block' : 'none' }} />

          {/* Crosshair in drawing mode */}
          {drawMode && showMap && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32">
                <line x1="16" y1="2" x2="16" y2="30" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
                <line x1="2" y1="16" x2="30" y2="16" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
                <circle cx="16" cy="16" r="4" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
              </svg>
            </div>
          )}

          {/* Loading state */}
          {!showMap && !mapsFailed && (
            <div className="h-full bg-gray-800 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-7 h-7 animate-spin text-blue-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                <p className="text-xs text-gray-400">{mapsReady ? 'Locating property…' : 'Loading map…'}</p>
              </div>
            </div>
          )}
          {mapsFailed && (
            <div className="h-full bg-gray-800 flex items-center justify-center">
              <p className="text-sm text-amber-400">Map failed to load — check API key</p>
            </div>
          )}

          {/* Section naming card */}
          {pendingShape && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-gray-900 border border-blue-500 rounded-xl p-4 shadow-2xl w-72">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: pendingShape.color }} />
                <p className="text-sm font-semibold text-white">Name this section</p>
                <span className="text-xs text-gray-400 ml-auto">{pendingShape.sqft.toLocaleString()} sqft</span>
              </div>
              <input
                autoFocus
                value={pendingName}
                onChange={e => setPendingName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && confirmName()}
                placeholder="e.g. Front Main, Garage, Dormer"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 mb-3"
              />
              <div className="flex gap-2">
                <button onClick={confirmName} className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg">Save</button>
                <button onClick={cancelPending} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-lg">Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* ── Section list ──────────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-gray-950 p-3 space-y-2">
          {sections.length === 0 && !pendingShape && (
            <div className="text-center py-8 text-gray-600">
              <p className="text-sm">No sections drawn yet.</p>
              <p className="text-xs mt-1">Use the tools above to draw roof sections on the map.</p>
            </div>
          )}

          {sections.map(s => {
            const sw = sqftWithWaste(s.sqft, s.wasteFactor);
            const { label: pLabel, badge: pBadge } = getPitchLabel(s.pitch);
            const isRenaming = renamingId === s.id;
            return (
              <div key={s.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                {/* Header row */}
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
                  {isRenaming ? (
                    <input autoFocus value={renameVal} onChange={e => setRenameVal(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { updateSection(s.id, { name: renameVal.trim() || s.name }); setRenamingId(null); } if (e.key === 'Escape') setRenamingId(null); }}
                      onBlur={() => { updateSection(s.id, { name: renameVal.trim() || s.name }); setRenamingId(null); }}
                      className="flex-1 px-2 py-0.5 bg-gray-800 border border-blue-500 rounded text-white text-sm focus:outline-none"
                    />
                  ) : (
                    <button onClick={() => { setRenamingId(s.id); setRenameVal(s.name); }}
                      className="flex-1 text-left text-sm font-semibold text-white hover:text-blue-400 transition-colors truncate">
                      {s.name}
                    </button>
                  )}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-blue-300 font-medium">{s.sqft.toLocaleString()} sqft</span>
                    <span className="text-xs text-gray-500">→ {sw.toLocaleString()} w/waste</span>
                    <button onClick={() => deleteSection(s.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>

                {/* Details row */}
                <div className="px-3 pb-3 grid grid-cols-2 gap-3 border-t border-gray-800 pt-2.5">
                  {/* Pitch */}
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1">Pitch (degrees)</label>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <input type="number" min={0} max={90} value={s.pitch}
                        onChange={e => updateSection(s.id, { pitch: Number(e.target.value) })}
                        className="w-16 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${pBadge}`}>{pLabel.split(' ')[0]}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {COMMON_PITCHES.map(p => (
                        <button key={p.label} onClick={() => updateSection(s.id, { pitch: p.deg })}
                          className={`px-1.5 py-0.5 rounded text-[10px] transition-all ${s.pitch === p.deg ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right side controls */}
                  <div className="space-y-2">
                    {/* Work type */}
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">Work Type</label>
                      <div className="flex rounded overflow-hidden border border-gray-700">
                        {(['replace','repair'] as const).map(t => (
                          <button key={t} onClick={() => updateSection(s.id, { workType: t })}
                            className={`flex-1 py-1 text-[11px] font-medium capitalize transition-all ${s.workType === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Layers (replace only) */}
                    {s.workType === 'replace' && (
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1">Layers to Remove</label>
                        <div className="flex rounded overflow-hidden border border-gray-700">
                          {([1,2] as const).map(n => (
                            <button key={n} onClick={() => updateSection(s.id, { layers: n })}
                              className={`flex-1 py-1 text-[11px] font-medium transition-all ${s.layers === n ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                              {n} layer{n === 2 && <span className="text-[9px] opacity-70"> +$500</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Waste factor */}
                    {s.workType === 'replace' && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] text-gray-500">Waste Factor</label>
                          <span className="text-[10px] text-blue-400 font-medium">{s.wasteFactor}%</span>
                        </div>
                        <input type="range" min={10} max={25} value={s.wasteFactor}
                          onChange={e => updateSection(s.id, { wasteFactor: Number(e.target.value) })}
                          className="w-full h-1.5 accent-blue-500"
                        />
                        {s.wasteFactor >= 15 && (
                          <p className="text-[9px] text-gray-500 mt-0.5">Hip/Complex roofs need more waste</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Total area display */}
          {sections.length > 0 && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-3 mt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Area Summary</span>
              </div>
              <table className="w-full text-xs">
                <thead><tr className="text-gray-500"><th className="text-left py-0.5">Section</th><th className="text-right">Net</th><th className="text-right">+Waste</th></tr></thead>
                <tbody>
                  {sections.map(s => (
                    <tr key={s.id} className="border-t border-gray-800">
                      <td className="py-1 text-gray-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-sm inline-block flex-shrink-0" style={{ backgroundColor: s.color }} />
                        {s.name}
                      </td>
                      <td className="text-right text-gray-300">{s.sqft.toLocaleString()}</td>
                      <td className="text-right text-blue-300">{sqftWithWaste(s.sqft, s.wasteFactor).toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-700 font-semibold">
                    <td className="py-1 text-white">Total</td>
                    <td className="text-right text-white">{sections.reduce((s,x) => s+x.sqft, 0).toLocaleString()}</td>
                    <td className="text-right text-blue-400">{sections.reduce((s,x) => s + sqftWithWaste(x.sqft,x.wasteFactor), 0).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Manual override */}
          {sections.length === 0 && (
            <div className="mt-2">
              {!showManual ? (
                <button onClick={() => setShowManual(true)} className="text-xs text-gray-500 hover:text-gray-300 underline transition-colors">
                  Enter manually instead
                </button>
              ) : (
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-3">
                  <label className="block text-xs text-gray-400 mb-1.5">Manual sq ft override</label>
                  <input type="number" value={manualSqft} onChange={e => setManualSqft(e.target.value)}
                    placeholder="e.g. 2400" autoFocus
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════ RIGHT PANEL ═════════════════════ */}
      <div className="lg:w-[45%] overflow-y-auto bg-gray-950 p-4 space-y-4">

        {/* MATERIAL */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Material</h3>
          <div className="space-y-2">
            {([
              ['standard','Standard Asphalt','GAF Timberline HDZ','30-yr mfr warranty'],
              ['premium', 'Premium Asphalt', 'GAF Timberline UHDZ','50-yr mfr warranty'],
            ] as const).map(([id, label, product, warranty]) => (
              <button key={id} onClick={() => setMaterial(id)}
                className={`w-full text-left rounded-lg border px-3 py-2.5 transition-all ${material === id ? 'bg-blue-600/15 border-blue-500/50' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}>
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

        {/* LINEAR MEASUREMENTS */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Linear Measurements</h3>
          <div className="grid grid-cols-2 gap-3">
            {([
              ['ridge',  'Ridge / Hip (lf)',  '$8/lf',  'Measure the peak lines of the roof'],
              ['valley', 'Valley (lf)',        '$12/lf', 'The V-shaped valleys where planes meet'],
              ['rake',   'Rake (lf)',          '$5/lf',  'The sloped edges at the gable ends'],
              ['eave',   'Eave (lf)',          '$4/lf',  'The horizontal bottom edges'],
            ] as const).map(([key, label, rate, tip]) => (
              <div key={key}>
                <div className="flex items-center gap-1 mb-1">
                  <label className="text-xs text-gray-400">{label}</label>
                  <span className="text-[10px] text-gray-600 bg-gray-800 px-1 rounded">{rate}</span>
                  <span title={tip} className="text-[10px] text-gray-600 cursor-help">ⓘ</span>
                </div>
                <input type="number" min={0} value={linear[key]}
                  onChange={e => setLinear(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                  className="w-full px-2.5 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}
          </div>
          {(linear.ridge + linear.valley + linear.rake + linear.eave) > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Linear subtotal: <span className="text-white font-medium">{fmtMoney(linear.ridge*8 + linear.valley*12 + linear.rake*5 + linear.eave*4)}</span>
            </p>
          )}
        </div>

        {/* ADD-ONS */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Add-ons</h3>
          <div className="space-y-2">
            {([
              ['ridgeVent',     'Ridge Vent Upgrade',      '+$300',     'Improves attic ventilation and extends shingle life'],
              ['iceWaterFull',  'Full Ice & Water Shield', '+$0.85/sqft','Recommended for CT winters — whole roof, not just eaves'],
              ['dripEdgeUpgrade','Drip Edge Upgrade (alum)','$2.50/eave lf','Auto-calculated from eave measurement above'],
              ['gutterInspection','Gutter Inspection',     'Complimentary','Included while on-site'],
            ] as const).map(([key, label, price, note]) => {
              const active = addOns[key as keyof AddOnsState] as boolean;
              return (
                <button key={key} onClick={() => setAddOns(prev => ({ ...prev, [key]: !prev[key as keyof AddOnsState] }))}
                  className={`w-full text-left rounded-lg border px-3 py-2 transition-all ${active ? 'bg-blue-600/15 border-blue-500/50' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs font-semibold ${active ? 'text-white' : 'text-gray-300'}`}>{label}</p>
                      <p className="text-[10px] text-gray-500">{note}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400">{price}</span>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${active ? 'bg-blue-500 border-blue-500' : 'border-gray-600'}`}>
                        {active && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
            {/* Skylights stepper */}
            <div className="flex items-center justify-between bg-gray-800 rounded-lg border border-gray-700 px-3 py-2">
              <div>
                <p className="text-xs font-semibold text-gray-300">Skylight Flashing</p>
                <p className="text-[10px] text-gray-500">$250 per unit</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setAddOns(p => ({ ...p, skylights: Math.max(0, p.skylights - 1) }))} className="w-6 h-6 rounded bg-gray-700 text-white text-sm flex items-center justify-center hover:bg-gray-600">−</button>
                <span className="w-5 text-center text-sm text-white">{addOns.skylights}</span>
                <button onClick={() => setAddOns(p => ({ ...p, skylights: Math.min(5, p.skylights + 1) }))} className="w-6 h-6 rounded bg-gray-700 text-white text-sm flex items-center justify-center hover:bg-gray-600">+</button>
              </div>
            </div>
            {/* Chimneys stepper */}
            <div className="flex items-center justify-between bg-gray-800 rounded-lg border border-gray-700 px-3 py-2">
              <div>
                <p className="text-xs font-semibold text-gray-300">Chimney Flashing</p>
                <p className="text-[10px] text-gray-500">$400 per chimney</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setAddOns(p => ({ ...p, chimneys: Math.max(0, p.chimneys - 1) }))} className="w-6 h-6 rounded bg-gray-700 text-white text-sm flex items-center justify-center hover:bg-gray-600">−</button>
                <span className="w-5 text-center text-sm text-white">{addOns.chimneys}</span>
                <button onClick={() => setAddOns(p => ({ ...p, chimneys: Math.min(3, p.chimneys + 1) }))} className="w-6 h-6 rounded bg-gray-700 text-white text-sm flex items-center justify-center hover:bg-gray-600">+</button>
              </div>
            </div>
          </div>
        </div>

        {/* PITCH SUMMARY */}
        {pitchSummary && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Pitch Summary</h3>
            {pitchSummary.sections.length === 1 ? (
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full border ${getPitchLabel(pitchSummary.avgPitch).badge}`}>
                  {getPitchLabel(pitchSummary.avgPitch).label}
                </span>
                <span className="text-xs text-gray-400">
                  Surcharge: <span className="text-white font-medium">+${getPitchSurcharge(pitchSummary.avgPitch).toFixed(2)}/sqft</span>
                </span>
              </div>
            ) : (
              <div className="space-y-1.5">
                {pitchSummary.sections.map(s => {
                  const pl = getPitchLabel(s.pitch);
                  return (
                    <div key={s.name} className="flex items-center justify-between text-xs">
                      <span className="text-gray-300">{s.name}</span>
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] ${pl.badge}`}>{pl.label}</span>
                      <span className="text-gray-400">+${s.surcharge.toFixed(2)}/sqft</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PRICE BREAKDOWN */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Price Breakdown</h3>
          {priceCalc.lineItems.length === 0 ? (
            <p className="text-xs text-gray-600">Draw sections or enter measurements to see pricing.</p>
          ) : (
            <div className="space-y-1.5">
              {priceCalc.lineItems.map((item, i) => (
                <div key={i} className="flex items-start justify-between text-xs gap-3">
                  <span className={`text-gray-400 leading-relaxed ${item.isRange ? 'italic' : ''}`}>{item.label}</span>
                  <span className="text-gray-300 flex-shrink-0 font-medium">{item.isRange ? '~' : ''}{fmtMoney(item.amount)}</span>
                </div>
              ))}
              <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between text-xs">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white font-semibold">{fmtMoney(priceCalc.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Range adjustment</span>
                <span>−$1,000 / +$1,000</span>
              </div>
            </div>
          )}

          {/* Price range box */}
          <div className="bg-[#0f1e3b] rounded-xl border border-blue-900/40 p-4 mt-4">
            <p className="text-xs text-blue-300/60 mb-1">Estimated Project Range</p>
            <p className="text-2xl font-black text-white">
              {priceCalc.subtotal > 0 ? `${fmtMoney(priceCalc.rangeMin)} – ${fmtMoney(priceCalc.rangeMax)}` : '—'}
            </p>
            <p className="text-xs text-blue-300/40 mt-1">Exact price confirmed after free drone assessment</p>
          </div>
        </div>

        {/* SCOPE NOTES */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Scope Notes</label>
          <textarea value={scopeNotes} onChange={e => setScopeNotes(e.target.value)}
            placeholder="Internal notes (not sent to homeowner) — access issues, existing damage, special conditions, permits needed..."
            rows={4}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* ACTIONS */}
        <div className="space-y-2 pb-4">
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
          {sendError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-400">
              {sendError}
            </div>
          )}
          <button onClick={handleSave} disabled={saving || (sections.length === 0 && !manualSqft)}
            className="w-full py-2.5 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm font-semibold rounded-lg transition-colors">
            {saving ? 'Saving…' : 'Save to Lead'}
          </button>
          <button onClick={handleSend} disabled={sending || (sections.length === 0 && !manualSqft) || !lead.email}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:text-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
            {sending ? (
              <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Generating PDF & Sending…</>
            ) : 'Send Proposal Email →'}
          </button>
        </div>
      </div>

      {/* ══════════════ STREET VIEW MODAL ═══════════════ */}
      {streetView && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl overflow-hidden w-full max-w-3xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <p className="text-sm font-semibold text-white">Street View — {lead.address}</p>
              <button onClick={() => setStreetView(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div ref={svDivRef} style={{ height: 480, width: '100%' }} />
          </div>
        </div>
      )}
    </div>
  );
}

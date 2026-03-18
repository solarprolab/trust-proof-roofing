'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

/* ═══════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════ */
type WorkType = 'replace' | 'repair';
type DrawMode = 'polygon' | 'rectangle' | null;
type MapType  = 'satellite' | 'hybrid' | 'roadmap';

interface Section {
  id: number; name: string; sqft: number; pitch: number;
  workType: WorkType; layers: 1 | 2; wasteFactor: number;
  color: string; centroidLat: number; centroidLng: number;
}

interface LinearMeasurements { ridge: number; valley: number; rake: number; eave: number; }

interface AddOnsState {
  ridgeVent: boolean; gutterInspection: boolean; iceWaterFull: boolean;
  dripEdgeUpgrade: boolean; skylights: number; chimneys: number;
}

interface PendingShape { id: number; sqft: number; color: string; }

interface Lead { id?: string; name?: string; email?: string; phone?: string; address?: string; }

interface Props { lead: Lead; leadId: string; }

/* ═══════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════ */
const SHAPE_COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6','#F97316'];
const SEG_COLORS   = ['#60A5FA','#34D399','#FCD34D','#F87171','#A78BFA','#F472B6','#2DD4BF','#FB923C'];
const ZOOM_LEVELS  = [14, 16, 18, 19, 20, 21, 22];

const COMMON_PITCHES = [
  { label: '3/12', deg: 14 }, { label: '4/12', deg: 18 },
  { label: '6/12', deg: 27 }, { label: '8/12', deg: 34 },
  { label: '10/12', deg: 40 }, { label: '12/12', deg: 45 },
];

const PITCH_OVERRIDE_OPTIONS = [
  { label: '— No override —',       value: '' },
  { label: 'Low (under 18°)',        value: 'low',        surcharge: 0 },
  { label: 'Moderate (18–30°)',      value: 'moderate',   surcharge: 0.50 },
  { label: 'Steep (30–40°)',         value: 'steep',      surcharge: 1.00 },
  { label: 'Very Steep (40°+)',      value: 'very_steep', surcharge: 1.75 },
];

const PITCH_SURCHARGE_MAP: Record<string, number> = {
  low: 0, moderate: 0.50, steep: 1.00, very_steep: 1.75,
};

/* ═══════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════ */
function getPitchSurcharge(deg: number): number {
  if (deg >= 40) return 1.75; if (deg >= 30) return 1.00; if (deg >= 18) return 0.50; return 0;
}
function getPitchLabel(deg: number): { label: string; badge: string } {
  if (deg >= 40) return { label: 'Very Steep (40°+)',  badge: 'bg-red-500/20 text-red-400 border-red-500/30' };
  if (deg >= 30) return { label: 'Steep (30–40°)',     badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
  if (deg >= 18) return { label: 'Moderate (18–30°)',  badge: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30' };
  return               { label: 'Low (under 18°)',     badge: 'bg-green-500/20 text-green-400 border-green-500/30' };
}
function suggestWaste(pitchDeg: number): number {
  if (pitchDeg > 40) return 18; if (pitchDeg > 30) return 15; return 12;
}
function sqftWithWaste(sqft: number, pct: number): number {
  return Math.round(sqft * (1 + pct / 100));
}
function fmtMoney(n: number): string { return '$' + Math.round(n).toLocaleString(); }
function azimuthToCompass(az: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(((az % 360) + 360) % 360 / 45) % 8];
}

/* ═══════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════ */
export default function QuoteBuilder({ lead, leadId }: Props) {

  /* ── Map refs ──────────────────────────────────────── */
  const mapDivRef       = useRef<HTMLDivElement>(null);
  const svDivRef        = useRef<HTMLDivElement>(null);
  const mapRef          = useRef<google.maps.Map | null>(null);
  const dmRef           = useRef<google.maps.drawing.DrawingManager | null>(null);
  const LabelClassRef   = useRef<any>(null);
  const overlaysRef     = useRef<Map<number, { shape: google.maps.Polygon | google.maps.Rectangle; label: any }>>(new Map());
  const pendingOvRef    = useRef<google.maps.Polygon | google.maps.Rectangle | null>(null);
  const counterRef      = useRef(0);
  const segmentPolysRef = useRef<Map<number, google.maps.Polygon>>(new Map());

  /* ── Map state ─────────────────────────────────────── */
  const [mapsReady,      setMapsReady]      = useState(false);
  const [mapsFailed,     setMapsFailed]     = useState(false);
  const [geocodedLoc,    setGeocodedLoc]    = useState<{ lat: number; lng: number } | null>(null);
  const [drawMode,       setDrawMode]       = useState<DrawMode>(null);
  const [editMode,       setEditMode]       = useState(false);
  const [mapType,        setMapType]        = useState<MapType>('satellite');
  const [zoomLevel,      setZoomLevel]      = useState(20);
  const [streetView,     setStreetView]     = useState(false);
  const [pendingShape,   setPendingShape]   = useState<PendingShape | null>(null);
  const [pendingName,    setPendingName]    = useState('');
  const [clearConfirm,   setClearConfirm]   = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);

  /* ── Solar / Street View state ─────────────────────── */
  const [solarSegments,    setSolarSegments]    = useState<any[]>([]);
  const [excludedSegIds,   setExcludedSegIds]   = useState<Set<number>>(new Set());
  const [svAvailable,      setSvAvailable]      = useState<boolean | null>(null);
  const [useDrawnOverSolar, setUseDrawnOverSolar] = useState(false);

  /* ── Section state ─────────────────────────────────── */
  const [sections,   setSections]   = useState<Section[]>([]);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameVal,  setRenameVal]  = useState('');

  /* ── Override state ────────────────────────────────── */
  const [manualSqft,      setManualSqft]      = useState('');
  const [overridePitch,   setOverridePitch]   = useState('');
  const [overrideWaste,   setOverrideWaste]   = useState('');
  const [linear,          setLinear]          = useState<LinearMeasurements>({ ridge: 0, valley: 0, rake: 0, eave: 0 });
  const [overridesOpen,   setOverridesOpen]   = useState(true);

  /* ── Quote state ───────────────────────────────────── */
  const [material,    setMaterial]    = useState<'standard' | 'premium'>('standard');
  const [addOns,      setAddOns]      = useState<AddOnsState>({
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

    class LabelOverlay extends google.maps.OverlayView {
      private div: HTMLDivElement | null = null;
      constructor(private pos: google.maps.LatLng, private html: string) { super(); }
      onAdd() {
        const d = document.createElement('div');
        d.style.cssText = 'position:absolute;background:rgba(0,0,0,0.82);color:#fff;padding:3px 8px;border-radius:5px;font-size:10px;font-family:sans-serif;white-space:nowrap;pointer-events:none;transform:translate(-50%,-100%);margin-top:-6px;line-height:1.5;text-align:center;border:1px solid rgba(255,255,255,0.15)';
        d.innerHTML = this.html; this.div = d;
        this.getPanes()!.overlayMouseTarget.appendChild(d);
      }
      draw() {
        if (!this.div) return;
        const pt = this.getProjection()?.fromLatLngToDivPixel(this.pos);
        if (pt) { this.div.style.left = `${pt.x}px`; this.div.style.top = `${pt.y}px`; }
      }
      onRemove() { this.div?.parentNode?.removeChild(this.div); this.div = null; }
      update(html: string, pos?: google.maps.LatLng) {
        this.html = html; if (pos) this.pos = pos;
        if (this.div) this.div.innerHTML = html; this.draw();
      }
    }
    LabelClassRef.current = LabelOverlay;

    const map = new google.maps.Map(mapDivRef.current, {
      center: geocodedLoc, zoom: 20, mapTypeId: 'satellite',
      tilt: 0, maxZoom: 22, minZoom: 14, rotateControl: false,
      scrollwheel: true, disableDoubleClickZoom: false,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_RIGHT,
        mapTypeIds: ['satellite', 'hybrid', 'roadmap'],
      },
    });
    mapRef.current = map;

    map.addListener('zoom_changed', () => setZoomLevel(map.getZoom() ?? 20));
    map.addListener('maptypeid_changed', () => {
      const id = map.getMapTypeId() as MapType;
      if (['satellite', 'hybrid', 'roadmap'].includes(id)) setMapType(id as MapType);
    });

    const dm = new google.maps.drawing.DrawingManager({
      drawingMode: null, drawingControl: false,
      polygonOptions:   { strokeWeight: 2, fillOpacity: 0.3, editable: false, draggable: false },
      rectangleOptions: { strokeWeight: 2, fillOpacity: 0.3, editable: false, draggable: false },
    });
    dm.setMap(map);
    dmRef.current = dm;

    google.maps.event.addListener(dm, 'overlaycomplete', (e: google.maps.drawing.OverlayCompleteEvent) => {
      const idx = counterRef.current;
      const color = SHAPE_COLORS[idx % SHAPE_COLORS.length];
      let sqft = 0, centroid: google.maps.LatLng;
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
        sqft = Math.round(google.maps.geometry.spherical.computeArea(
          [ne, new google.maps.LatLng(ne.lat(), sw.lng()), sw, new google.maps.LatLng(sw.lat(), ne.lng())]
        ) * 10.764);
        centroid = b.getCenter();
        overlay = rect;
      }

      counterRef.current += 1;
      pendingOvRef.current = overlay;
      setPendingShape({ id: idx, sqft, color });
      setPendingName(`Section ${idx + 1}`);
      dm.setDrawingMode(null);
      setDrawMode(null);
      (overlay as any)._centroid = centroid;
    });

    setMapInitialized(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapsReady, geocodedLoc]);

  /* ── 3a. Solar API fetch + pre-populate sqft ────────── */
  useEffect(() => {
    if (!geocodedLoc) return;
    fetch(`https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${geocodedLoc.lat}&location.longitude=${geocodedLoc.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_SOLAR_API_KEY}`)
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d.roofSegmentStats)) {
          setSolarSegments(d.roofSegmentStats);
        }
      })
      .catch(() => {});
  }, [geocodedLoc]);

  /* ── 3b. Draw Solar segment polygons ───────────────── */
  useEffect(() => {
    if (!mapInitialized || !mapRef.current || solarSegments.length === 0) return;
    segmentPolysRef.current.forEach(p => p.setMap(null));
    segmentPolysRef.current.clear();
    solarSegments.forEach((seg, i) => {
      const color = SEG_COLORS[i % SEG_COLORS.length];
      let path: google.maps.LatLng[];
      const bb = seg.boundingBox;
      if (bb?.sw && bb?.ne) {
        path = [
          new google.maps.LatLng(bb.sw.latitude, bb.sw.longitude),
          new google.maps.LatLng(bb.sw.latitude, bb.ne.longitude),
          new google.maps.LatLng(bb.ne.latitude, bb.ne.longitude),
          new google.maps.LatLng(bb.ne.latitude, bb.sw.longitude),
        ];
      } else if (seg.center) {
        const c = seg.center;
        const side = Math.sqrt(seg.stats?.areaMeters2 ?? 16) / 2;
        const dlat = side / 111000;
        const dlng = side / (111000 * Math.cos(c.latitude * Math.PI / 180));
        path = [
          new google.maps.LatLng(c.latitude - dlat, c.longitude - dlng),
          new google.maps.LatLng(c.latitude - dlat, c.longitude + dlng),
          new google.maps.LatLng(c.latitude + dlat, c.longitude + dlng),
          new google.maps.LatLng(c.latitude + dlat, c.longitude - dlng),
        ];
      } else { return; }
      const poly = new google.maps.Polygon({
        paths: path, strokeColor: color, strokeWeight: 1.5,
        fillColor: color, fillOpacity: 0.25, clickable: true, zIndex: 1,
      });
      poly.setMap(mapRef.current);
      poly.addListener('click', () => {
        setExcludedSegIds(prev => {
          const next = new Set(prev);
          if (next.has(i)) { next.delete(i); poly.setOptions({ fillOpacity: 0.35, strokeOpacity: 1 }); }
          else             { next.add(i);    poly.setOptions({ fillOpacity: 0.08, strokeOpacity: 0.4 }); }
          return next;
        });
      });
      segmentPolysRef.current.set(i, poly);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInitialized, solarSegments]);

  /* ── 4. Sync draw mode ─────────────────────────────── */
  useEffect(() => {
    if (!dmRef.current || !mapsReady) return;
    if (drawMode === 'polygon')        dmRef.current.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    else if (drawMode === 'rectangle') dmRef.current.setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE);
    else                               dmRef.current.setDrawingMode(null);
  }, [drawMode, mapsReady]);

  /* ── 5. Sync edit mode ─────────────────────────────── */
  useEffect(() => {
    overlaysRef.current.forEach(({ shape }) => shape.setOptions({ editable: editMode, draggable: editMode }));
  }, [editMode]);

  /* ── 6. Sync map type ──────────────────────────────── */
  useEffect(() => { mapRef.current?.setMapTypeId(mapType); }, [mapType]);

  /* ── 7. Street View — compute heading toward house ─── */
  useEffect(() => {
    if (!streetView || !geocodedLoc || !mapsReady) return;
    const svc = new google.maps.StreetViewService();
    svc.getPanorama({ location: geocodedLoc, radius: 100 }, (data, status) => {
      if (status === google.maps.StreetViewStatus.OK) {
        setSvAvailable(true);
        if (svDivRef.current) {
          // Compute bearing from the Street View pano position toward the house
          const panoLatLng = data?.location?.latLng ?? new google.maps.LatLng(geocodedLoc.lat, geocodedLoc.lng);
          const houseLatLng = new google.maps.LatLng(geocodedLoc.lat, geocodedLoc.lng);
          const heading = google.maps.geometry.spherical.computeHeading(panoLatLng, houseLatLng);
          new google.maps.StreetViewPanorama(svDivRef.current, {
            position: geocodedLoc,
            pov: { heading, pitch: 10, zoom: 1 },
            addressControl: true,
          });
        }
      } else {
        setSvAvailable(false);
      }
    });
  }, [streetView, geocodedLoc, mapsReady]);

  /* ── 8. Update labels when sections change ─────────── */
  useEffect(() => {
    sections.forEach(s => {
      const entry = overlaysRef.current.get(s.id);
      if (entry?.label) entry.label.update(`<strong>${s.name}</strong><br>${s.sqft.toLocaleString()} sqft`);
    });
  }, [sections]);

  /* ═══════════════ MAP HANDLERS ═══════════════════════ */

  function confirmName() {
    if (!pendingOvRef.current || !pendingShape) return;
    const name = pendingName.trim() || `Section ${pendingShape.id + 1}`;
    const overlay = pendingOvRef.current;
    const centroid = (overlay as any)._centroid as google.maps.LatLng;
    let labelOverlay: any = null;
    if (LabelClassRef.current && mapRef.current) {
      labelOverlay = new LabelClassRef.current(centroid, `<strong>${name}</strong><br>${pendingShape.sqft.toLocaleString()} sqft`);
      labelOverlay.setMap(mapRef.current);
    }
    overlaysRef.current.set(pendingShape.id, { shape: overlay, label: labelOverlay });
    setSections(prev => [...prev, {
      id: pendingShape.id, name, sqft: pendingShape.sqft, pitch: 18, workType: 'replace',
      layers: 1, wasteFactor: 12, color: pendingShape.color,
      centroidLat: centroid?.lat() ?? 0, centroidLng: centroid?.lng() ?? 0,
    }]);
    setPendingShape(null); setPendingName(''); pendingOvRef.current = null;
  }

  function cancelPending() {
    pendingOvRef.current?.setMap(null); pendingOvRef.current = null;
    setPendingShape(null); setPendingName('');
    counterRef.current = Math.max(0, counterRef.current - 1);
  }

  function deleteSection(id: number) {
    const e = overlaysRef.current.get(id);
    if (e) { e.shape.setMap(null); e.label?.setMap(null); overlaysRef.current.delete(id); }
    setSections(prev => prev.filter(s => s.id !== id));
  }

  function undoLast() {
    if (pendingShape) { cancelPending(); return; }
    if (sections.length === 0) return;
    deleteSection(sections[sections.length - 1].id);
  }

  function clearAll() {
    if (pendingShape) cancelPending();
    sections.forEach(s => { const e = overlaysRef.current.get(s.id); e?.shape.setMap(null); e?.label?.setMap(null); });
    overlaysRef.current.clear(); setSections([]); setClearConfirm(false); counterRef.current = 0;
  }

  function updateSection(id: number, patch: Partial<Section>) {
    setSections(prev => prev.map(s => {
      if (s.id !== id) return s;
      const updated = { ...s, ...patch };
      if (patch.pitch !== undefined && !('wasteFactor' in patch)) updated.wasteFactor = suggestWaste(patch.pitch);
      return updated;
    }));
  }

  function clearAllOverrides() {
    setManualSqft(''); setOverridePitch(''); setOverrideWaste('');
    setLinear({ ridge: 0, valley: 0, rake: 0, eave: 0 });
  }

  function snapZoom(z: number) { mapRef.current?.setZoom(z); }
  function zoomIn()  { if (mapRef.current) mapRef.current.setZoom(Math.min(22, (mapRef.current.getZoom() ?? 20) + 1)); }
  function zoomOut() { if (mapRef.current) mapRef.current.setZoom(Math.max(14, (mapRef.current.getZoom() ?? 20) - 1)); }

  /* ═══════════════ PRICE CALCULATION ═════════════════ */
  const priceCalc = useMemo(() => {
    const baseRate        = material === 'premium' ? 8 : 7;
    const replaceSections = sections.filter(s => s.workType === 'replace');
    const repairSections  = sections.filter(s => s.workType === 'repair');

    // ── Priority order for sqft ──────────────────────
    const manualVal = manualSqft ? parseInt(manualSqft, 10) : 0;
    const drawnTotal = replaceSections.reduce((sum, s) => sum + s.sqft, 0);
    const solarIncluded = Math.round(solarSegments.reduce((sum: number, seg: any, i: number) =>
      excludedSegIds.has(i) ? sum : sum + (seg.stats?.areaMeters2 ?? 0) * 10.764, 0));
    let effectiveSqft: number;
    let sqftSource: string;
    const usePerSection = replaceSections.length > 0 && !(manualSqft && manualVal > 0) && (useDrawnOverSolar || solarIncluded === 0);

    if (manualSqft && !isNaN(manualVal) && manualVal > 0) {
      effectiveSqft = manualVal;
      sqftSource = 'Manual override';
    } else if (drawnTotal > 0 && (useDrawnOverSolar || solarIncluded === 0)) {
      effectiveSqft = drawnTotal;
      sqftSource = `Drawn sections (${replaceSections.length})`;
    } else if (solarIncluded > 0) {
      effectiveSqft = solarIncluded;
      sqftSource = 'Google Solar API';
    } else if (drawnTotal > 0) {
      effectiveSqft = drawnTotal;
      sqftSource = `Drawn sections (${replaceSections.length})`;
    } else {
      effectiveSqft = 0;
      sqftSource = '';
    }

    // ── Override values ─────────────────────────────
    const pitchSurchOverride = overridePitch ? (PITCH_SURCHARGE_MAP[overridePitch] ?? 0) : null;
    const wasteOverrideVal   = overrideWaste ? parseInt(overrideWaste, 10) : null;

    const lineItems: { label: string; homeownerLabel?: string; amount: number; isRange?: boolean }[] = [];

    // ── Area pricing (110% material factor, always) ──
    if (usePerSection) {
      replaceSections.forEach(s => {
        const adjustedSqft = Math.round(s.sqft * 1.1);
        const rate  = baseRate + (pitchSurchOverride ?? getPitchSurcharge(s.pitch));
        lineItems.push({
          label: `${s.name} — ${s.sqft.toLocaleString()} sq ft × 110% = ${adjustedSqft.toLocaleString()} sq ft × $${rate.toFixed(2)}/sq ft`,
          homeownerLabel: s.name,
          amount: Math.round(adjustedSqft * rate),
        });
        if (s.layers === 2) lineItems.push({ label: `${s.name} — 2-layer tearoff surcharge`, amount: 500 });
      });
      repairSections.forEach(s => {
        lineItems.push({ label: `${s.name} — Repair estimate ($350–$2,500)`, amount: 1425, isRange: true });
      });
    } else if (effectiveSqft > 0) {
      const adjustedSqft = Math.round(effectiveSqft * 1.1);
      const rate  = baseRate + (pitchSurchOverride ?? 0);
      lineItems.push({
        label: `Total area — ${effectiveSqft.toLocaleString()} sq ft × 110% = ${adjustedSqft.toLocaleString()} sq ft × $${rate.toFixed(2)}/sq ft`,
        homeownerLabel: 'Roof Replacement',
        amount: Math.round(adjustedSqft * rate),
      });
    }

    // ── Linear ───────────────────────────────────────
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

    // ── Add-ons ──────────────────────────────────────
    const totalSqftWaste = usePerSection
      ? replaceSections.reduce((sum, s) => sum + Math.round(s.sqft * 1.1), 0)
      : Math.round(effectiveSqft * 1.1);

    if (addOns.ridgeVent) lineItems.push({ label: 'Ridge Vent Upgrade', amount: 300 });
    if (addOns.iceWaterFull && totalSqftWaste > 0)
      lineItems.push({ label: `Full Ice & Water Shield (${totalSqftWaste.toLocaleString()} sqft × $0.85)`, amount: Math.round(totalSqftWaste * 0.85) });
    if (addOns.dripEdgeUpgrade && linear.eave > 0)
      lineItems.push({ label: `Drip Edge Upgrade (${linear.eave}lf × $2.50)`, amount: Math.round(linear.eave * 2.5) });
    if (addOns.skylights > 0) lineItems.push({ label: `Skylight Flashing (${addOns.skylights} × $250)`, amount: addOns.skylights * 250 });
    if (addOns.chimneys  > 0) lineItems.push({ label: `Chimney Flashing (${addOns.chimneys} × $400)`,   amount: addOns.chimneys * 400 });

    const subtotal = lineItems.reduce((sum, li) => sum + li.amount, 0);
    return {
      lineItems, subtotal, totalSqftWaste,
      rangeMin: Math.max(0, subtotal - 1000), rangeMax: subtotal + 1000, midpoint: subtotal,
      effectiveSqft, sqftSource,
    };
  }, [sections, material, linear, addOns, manualSqft, solarSegments, excludedSegIds, useDrawnOverSolar, overridePitch, overrideWaste]);

  /* ═══════════════ DERIVED ════════════════════════════ */
  const includedSolarSqft = useMemo(() =>
    Math.round(solarSegments.reduce((sum: number, seg: any, i: number) =>
      excludedSegIds.has(i) ? sum : sum + (seg.stats?.areaMeters2 ?? 0) * 10.764, 0)),
  [solarSegments, excludedSegIds]);

  const buildingGroups = useMemo<number[]>(() => {
    if (solarSegments.length === 0) return [];
    const indexed = solarSegments.map((seg: any, i: number) => ({ i, az: seg.azimuthDegrees ?? 0 }));
    indexed.sort((a: any, b: any) => a.az - b.az);
    const groups = new Array(solarSegments.length).fill(0);
    let cur = 0;
    groups[indexed[0].i] = 0;
    for (let k = 1; k < indexed.length; k++) {
      if (indexed[k].az - indexed[k - 1].az > 90) cur++;
      groups[indexed[k].i] = cur;
    }
    return groups;
  }, [solarSegments]);

  const segmentDisplayOrder = useMemo(() =>
    solarSegments.map((_: any, i: number) => i).sort((a: number, b: number) =>
      (buildingGroups[a] ?? 0) - (buildingGroups[b] ?? 0)),
  [solarSegments, buildingGroups]);

  const pitchSummary = useMemo(() => {
    const replSecs = sections.filter(s => s.workType === 'replace');
    if (replSecs.length === 0) return null;
    const totalArea = replSecs.reduce((sum, s) => sum + s.sqft, 0);
    const avgPitch  = totalArea > 0 ? replSecs.reduce((sum, s) => sum + s.pitch * s.sqft, 0) / totalArea : 0;
    return { avgPitch, sections: replSecs.map(s => ({ name: s.name, pitch: s.pitch, surcharge: getPitchSurcharge(s.pitch) })) };
  }, [sections]);

  // Whether any override is active (for "Clear all" button visibility)
  const anyOverride = !!(manualSqft || overridePitch || overrideWaste || linear.ridge || linear.valley || linear.rake || linear.eave);

  /* ═══════════════ SAVE / SEND ════════════════════════ */
  async function handleSave() {
    setSaving(true);
    try {
      const totalSqft = priceCalc.effectiveSqft || parseInt(manualSqft || '0', 10);
      await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote_amount: priceCalc.midpoint, roof_size: String(totalSqft) }),
      });
      const sectionLines = sections.map(s =>
        `  • ${s.name}: ${s.sqft.toLocaleString()} sqft | ${s.workType} | pitch ${s.pitch}° | waste ${s.wasteFactor}% | ${s.layers === 2 ? '2 layers' : '1 layer'}`
      ).join('\n');
      const overrideLines = [
        manualSqft    && `Manual sqft override: ${manualSqft}`,
        overridePitch && `Pitch override: ${overridePitch}`,
        overrideWaste && `Waste override: ${overrideWaste}%`,
      ].filter(Boolean).join(' | ');
      const summary = [
        '=== Quote Builder ===',
        sections.length > 0 ? `Sections:\n${sectionLines}` : `Area source: ${priceCalc.sqftSource || 'none'} (${totalSqft} sqft)`,
        overrideLines || null,
        `Material: ${material === 'premium' ? 'Premium (UHDZ, 50-yr)' : 'Standard (HDZ, 30-yr)'}`,
        linear.ridge || linear.valley || linear.rake || linear.eave
          ? `Linear: ridge ${linear.ridge}lf | valley ${linear.valley}lf | rake ${linear.rake}lf | eave ${linear.eave}lf` : null,
        `Price range: ${fmtMoney(priceCalc.rangeMin)} – ${fmtMoney(priceCalc.rangeMax)}`,
        scopeNotes ? `Notes: ${scopeNotes}` : null,
      ].filter(Boolean).join('\n');
      await fetch(`/api/admin/leads/${leadId}/notes`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: summary }),
      });
      setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000);
    } finally { setSaving(false); }
  }

  async function handleSend() {
    setSending(true); setSendError('');
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/send-quote`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: lead.name, email: lead.email, phone: lead.phone, address: lead.address,
          sections: sections.map(s => ({
            name: s.name, sqft: s.sqft,
            sqftWithWaste: sqftWithWaste(s.sqft, parseInt(overrideWaste || '0') || s.wasteFactor),
            pitch: s.pitch, workType: s.workType, layers: s.layers,
            wastePercent: parseInt(overrideWaste || '0') || s.wasteFactor,
          })),
          linearMeasurements: linear, material,
          addOns: [
            addOns.ridgeVent        && 'Ridge Vent Upgrade (+$300)',
            addOns.iceWaterFull     && 'Full Ice & Water Shield (+$0.85/sqft)',
            addOns.dripEdgeUpgrade  && linear.eave > 0 && `Drip Edge Upgrade (${linear.eave}lf × $2.50)`,
            addOns.gutterInspection && 'Gutter Inspection (Complimentary)',
          ].filter(Boolean) as string[],
          skylights: addOns.skylights, chimneys: addOns.chimneys,
          priceBreakdown: {
            lineItems: priceCalc.lineItems.map(li => ({ label: li.homeownerLabel ?? li.label, amount: li.amount })),
            subtotal: priceCalc.subtotal, rangeMin: priceCalc.rangeMin, rangeMax: priceCalc.rangeMax,
          },
          scopeNotes, leadId,
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
      danger ? 'bg-red-900/40 text-red-400 hover:bg-red-900/60' :
      active ? 'bg-blue-600 text-white' :
               'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
    }`;
  const ovBadge = 'text-[9px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-1.5 py-0.5 rounded-full font-medium ml-auto';

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

        {/* ── Toolbar row 2: view + zoom controls ───── */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 border-b border-gray-700 flex-wrap">
          <div className="flex rounded overflow-hidden border border-gray-700">
            {(['satellite','hybrid','roadmap'] as MapType[]).map(t => (
              <button key={t} onClick={() => setMapType(t)}
                className={`px-2.5 py-1.5 text-xs font-medium transition-all capitalize ${mapType === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                {t}
              </button>
            ))}
          </div>
          <button onClick={() => { setSvAvailable(null); setStreetView(true); }} className={tbBtn()}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth={2}/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 12h20M12 2c-2.5 4-4 6.5-4 10s1.5 6 4 10M12 2c2.5 4 4 6.5 4 10s-1.5 6-4 10"/>
            </svg>
            360 View
          </button>
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-[10px] text-gray-500 mr-0.5">Zoom:</span>
            <div className="flex rounded overflow-hidden border border-gray-700">
              {ZOOM_LEVELS.map(z => (
                <button key={z} onClick={() => snapZoom(z)}
                  className={`px-1.5 py-1 text-[10px] font-medium transition-all ${zoomLevel === z ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                  {z}
                </button>
              ))}
            </div>
            <button onClick={zoomOut} className={`ml-1 ${tbBtn()}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
            </button>
            <button onClick={zoomIn} className={tbBtn()}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
        </div>

        {/* ── Map ───────────────────────────────────── */}
        <div className="relative flex-shrink-0" style={{ height: 480 }}>
          <div ref={mapDivRef} style={{ height: '100%', width: '100%', display: showMap ? 'block' : 'none' }} />
          {drawMode && showMap && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32">
                <line x1="16" y1="2" x2="16" y2="30" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
                <line x1="2" y1="16" x2="30" y2="16" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
                <circle cx="16" cy="16" r="4" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
              </svg>
            </div>
          )}
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
          {pendingShape && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-gray-900 border border-blue-500 rounded-xl p-4 shadow-2xl w-72">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: pendingShape.color }} />
                <p className="text-sm font-semibold text-white">Name this section</p>
                <span className="text-xs text-gray-400 ml-auto">{pendingShape.sqft.toLocaleString()} sqft</span>
              </div>
              <input autoFocus value={pendingName} onChange={e => setPendingName(e.target.value)}
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

          {/* Empty state — only if both drawn AND solar are empty */}
          {sections.length === 0 && solarSegments.length === 0 && !pendingShape && (
            <div className="py-6 px-3">
              <p className="text-sm text-gray-500 text-center mb-1">Could not detect roof automatically.</p>
              <p className="text-xs text-gray-600 text-center mb-3">Use the drawing tools above to trace the roof, or enter sq ft below.</p>
              <div className="flex gap-2">
                <input type="number" value={manualSqft} onChange={e => setManualSqft(e.target.value)}
                  placeholder="Enter sq ft manually"
                  className={`flex-1 px-3 py-2 bg-gray-800 border rounded-lg text-white text-sm focus:outline-none ${manualSqft ? 'border-yellow-500/50' : 'border-gray-700 focus:border-blue-500'}`}
                />
                {manualSqft && (
                  <button onClick={() => setManualSqft('')} className="px-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors">✕</button>
                )}
              </div>
            </div>
          )}

          {/* Drawn sections */}
          {sections.map(s => {
            const sw = Math.round(s.sqft * 1.1);
            const { label: pLabel, badge: pBadge } = getPitchLabel(s.pitch);
            const isRenaming = renamingId === s.id;
            return (
              <div key={s.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-[9px] bg-green-500/20 text-green-400 border border-green-500/30 px-1.5 py-0.5 rounded font-medium flex-shrink-0">DRAWN</span>
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
                    <span className="text-xs text-gray-500">→ {sw.toLocaleString()} adj</span>
                    <button onClick={() => deleteSection(s.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
                <div className="px-3 pb-3 grid grid-cols-2 gap-3 border-t border-gray-800 pt-2.5">
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
                  <div className="space-y-2">
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
                    {s.workType === 'replace' && !overrideWaste && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] text-gray-500">Waste Factor</label>
                          <span className="text-[10px] text-blue-400 font-medium">{s.wasteFactor}%</span>
                        </div>
                        <input type="range" min={10} max={25} value={s.wasteFactor}
                          onChange={e => updateSection(s.id, { wasteFactor: Number(e.target.value) })}
                          className="w-full h-1.5 accent-blue-500"
                        />
                        {s.wasteFactor >= 15 && <p className="text-[9px] text-gray-500 mt-0.5">Hip/Complex roofs need more waste</p>}
                      </div>
                    )}
                    {overrideWaste && s.workType === 'replace' && (
                      <p className="text-[10px] text-yellow-400">Waste overridden: {overrideWaste}%</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Solar API detected segments — shown immediately, before drawing */}
          {solarSegments.length > 0 && (() => {
            const numGroups = new Set(buildingGroups).size;
            return segmentDisplayOrder.map((i, displayIdx) => {
              const seg = solarSegments[i];
              const excluded = excludedSegIds.has(i);
              const sqft    = Math.round((seg.stats?.areaMeters2 ?? 0) * 10.764);
              const pitch   = Math.round(seg.pitchDegrees ?? 0);
              const az      = Math.round(seg.azimuthDegrees ?? 0);
              const compass = azimuthToCompass(az);
              const color   = SEG_COLORS[i % SEG_COLORS.length];
              const group   = buildingGroups[i] ?? 0;
              const prevGroup = displayIdx > 0 ? (buildingGroups[segmentDisplayOrder[displayIdx - 1]] ?? 0) : group;
              const showGroupHeader = numGroups > 1 && group !== prevGroup;
              const groupLabel = String.fromCharCode(65 + group);
              return (
                <div key={`solar-${i}`}>
                  {showGroupHeader && (
                    <div className="flex items-center gap-2 my-1">
                      <div className="flex-1 h-px bg-gray-800" />
                      <span className="text-[10px] text-gray-500 font-medium px-1">Building {groupLabel}</span>
                      <div className="flex-1 h-px bg-gray-800" />
                    </div>
                  )}
                  {numGroups > 1 && displayIdx === 0 && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-px bg-gray-800" />
                      <span className="text-[10px] text-gray-500 font-medium px-1">Building A</span>
                      <div className="flex-1 h-px bg-gray-800" />
                    </div>
                  )}
                  <div className={`bg-gray-900 rounded-xl border overflow-hidden transition-opacity ${excluded ? 'border-gray-800 opacity-50' : 'border-gray-700'}`}>
                    <div className="flex items-center gap-2 px-3 py-2.5">
                      <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-semibold text-white">Roof Plane {i + 1}</span>
                          <span className="text-[9px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded font-medium">DETECTED</span>
                          {numGroups > 1 && <span className="text-[9px] bg-gray-700 text-gray-400 border border-gray-600 px-1.5 py-0.5 rounded font-medium">Bldg {groupLabel}</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-blue-300 font-medium">{sqft.toLocaleString()} sq ft</span>
                          <span className="text-xs text-gray-500">{pitch}° pitch</span>
                          <span className="text-xs text-gray-500">{compass}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setExcludedSegIds(prev => {
                            const next = new Set(prev);
                            const poly = segmentPolysRef.current.get(i);
                            if (next.has(i)) { next.delete(i); poly?.setOptions({ fillOpacity: 0.35, strokeOpacity: 1 }); }
                            else             { next.add(i);    poly?.setOptions({ fillOpacity: 0.08, strokeOpacity: 0.4 }); }
                            return next;
                          });
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${
                          excluded
                            ? 'bg-gray-700 text-gray-500 border border-gray-600 hover:bg-gray-600 hover:text-gray-300'
                            : 'bg-green-600/20 text-green-400 border border-green-500/40 hover:bg-green-600/30'
                        }`}
                      >
                        {excluded ? (
                          <>✕ EXCLUDED</>
                        ) : (
                          <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg> INCLUDE</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            });
          })()}

          {/* Total area display + manual override */}
          {(sections.length > 0 || solarSegments.length > 0 || (manualSqft && parseInt(manualSqft, 10) > 0)) && (() => {
            const drawnTotal = sections.filter(s => s.workType === 'replace').reduce((sum, s) => sum + s.sqft, 0);
            const manualVal  = manualSqft ? parseInt(manualSqft, 10) : 0;
            const hasManual  = !!(manualSqft && !isNaN(manualVal) && manualVal > 0);
            const hasSolar   = includedSolarSqft > 0;
            const hasDrawn   = drawnTotal > 0;
            const includedCount = solarSegments.length - excludedSegIds.size;

            let displaySqft: number;
            let source: 'manual' | 'solar' | 'drawn';
            if (hasManual) {
              displaySqft = manualVal; source = 'manual';
            } else if (hasDrawn && (useDrawnOverSolar || !hasSolar)) {
              displaySqft = drawnTotal; source = 'drawn';
            } else if (hasSolar) {
              displaySqft = includedSolarSqft; source = 'solar';
            } else {
              displaySqft = 0; source = 'drawn';
            }

            return (
              <div className="bg-gray-900 rounded-xl border border-gray-700 p-3 mt-1">
                {/* Big number */}
                <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                  <span className="text-2xl font-black text-white">{displaySqft > 0 ? displaySqft.toLocaleString() : '—'}</span>
                  {displaySqft > 0 && <span className="text-sm text-white font-medium">sq ft</span>}
                  {hasManual && <span className="text-[9px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-1.5 py-0.5 rounded-full font-medium ml-auto">Manual override active</span>}
                </div>

                {/* Segment count */}
                {solarSegments.length > 0 && !hasManual && (
                  <p className="text-xs text-gray-500 mb-2">
                    {includedCount} segment{includedCount !== 1 ? 's' : ''} included of {solarSegments.length} total
                    {excludedSegIds.size > 0 && <span className="text-gray-600 ml-1">({excludedSegIds.size} excluded)</span>}
                  </p>
                )}

                {/* Source badge + drawn/solar toggle */}
                <div className="flex items-center gap-2 flex-wrap">
                  {hasManual && <span className="text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full font-medium">Source: Manual override</span>}
                  {!hasManual && source === 'solar' && <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-medium">Source: Google Solar API</span>}
                  {!hasManual && source === 'drawn' && <span className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-medium">Source: Drawn sections</span>}
                  {!hasManual && hasDrawn && hasSolar && (
                    <div className="flex rounded overflow-hidden border border-gray-700 ml-auto">
                      <button onClick={() => setUseDrawnOverSolar(false)}
                        className={`px-2 py-0.5 text-[10px] font-medium transition-all ${!useDrawnOverSolar ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                        Detected
                      </button>
                      <button onClick={() => setUseDrawnOverSolar(true)}
                        className={`px-2 py-0.5 text-[10px] font-medium transition-all ${useDrawnOverSolar ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                        Drawn
                      </button>
                    </div>
                  )}
                </div>

                {/* Manual override input — always visible here */}
                <div className="mt-3 pt-3 border-t border-gray-800">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-gray-500 flex-shrink-0">Manual sq ft:</label>
                    <input type="number" value={manualSqft} onChange={e => setManualSqft(e.target.value)}
                      placeholder={displaySqft > 0 ? `${displaySqft.toLocaleString()} (auto)` : 'Override…'}
                      className={`flex-1 px-2 py-1 bg-gray-800 border rounded text-white text-xs focus:outline-none ${manualSqft ? 'border-yellow-500/50 focus:border-yellow-400' : 'border-gray-700 focus:border-blue-500'}`}
                    />
                    {manualSqft && (
                      <button onClick={() => setManualSqft('')} className="text-gray-500 hover:text-white transition-colors text-xs px-1">✕</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
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

        {/* MANUAL OVERRIDES */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <button
            onClick={() => setOverridesOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/50 transition-colors">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Manual Overrides</h3>
              {anyOverride && (
                <span className="text-[9px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-1.5 py-0.5 rounded-full font-medium">Active</span>
              )}
            </div>
            <svg className={`w-4 h-4 text-gray-500 transition-transform ${overridesOpen ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
          </button>

          {overridesOpen && (
            <div className="px-4 pb-4 space-y-3 border-t border-gray-800 pt-3">

              {/* Total sq ft */}
              <div>
                <div className="flex items-center mb-1">
                  <label className="text-xs text-gray-400">Total sq ft</label>
                  {manualSqft && <span className={ovBadge}>Override</span>}
                </div>
                <div className="flex gap-2">
                  <input type="number" value={manualSqft} onChange={e => setManualSqft(e.target.value)}
                    placeholder={includedSolarSqft > 0 ? `${includedSolarSqft.toLocaleString()} (from Solar API)` : 'e.g. 2400'}
                    className={`flex-1 px-3 py-2 bg-gray-800 border rounded-lg text-white text-sm focus:outline-none ${manualSqft ? 'border-yellow-500/50 focus:border-yellow-400' : 'border-gray-700 focus:border-blue-500'}`}
                  />
                  {manualSqft && (
                    <button onClick={() => setManualSqft('')} className="px-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors">✕</button>
                  )}
                </div>
              </div>

              {/* Pitch category */}
              <div>
                <div className="flex items-center mb-1">
                  <label className="text-xs text-gray-400">Pitch category</label>
                  {overridePitch && <span className={ovBadge}>Override</span>}
                </div>
                <select value={overridePitch} onChange={e => setOverridePitch(e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white text-sm focus:outline-none ${overridePitch ? 'border-yellow-500/50' : 'border-gray-700 focus:border-blue-500'}`}>
                  {PITCH_OVERRIDE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>
                      {o.label}{o.value ? ` (+$${(o as any).surcharge.toFixed(2)}/sqft)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Waste factor */}
              <div>
                <div className="flex items-center mb-1">
                  <label className="text-xs text-gray-400">Waste factor % (overrides all sections)</label>
                  {overrideWaste && <span className={ovBadge}>Override</span>}
                </div>
                <div className="flex gap-2">
                  <input type="number" min={5} max={30} value={overrideWaste} onChange={e => setOverrideWaste(e.target.value)}
                    placeholder="e.g. 15 (per-section if blank)"
                    className={`flex-1 px-3 py-2 bg-gray-800 border rounded-lg text-white text-sm focus:outline-none ${overrideWaste ? 'border-yellow-500/50 focus:border-yellow-400' : 'border-gray-700 focus:border-blue-500'}`}
                  />
                  {overrideWaste && (
                    <button onClick={() => setOverrideWaste('')} className="px-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors">✕</button>
                  )}
                </div>
              </div>

              {/* Linear measurements */}
              <div className="grid grid-cols-2 gap-2.5">
                {([
                  ['ridge',  'Ridge / Hip (lf)',  '$8/lf',  'Measure the peak lines of the roof'],
                  ['valley', 'Valley (lf)',        '$12/lf', 'V-shaped valleys where planes meet'],
                  ['rake',   'Rake (lf)',          '$5/lf',  'Sloped edges at the gable ends'],
                  ['eave',   'Eave (lf)',          '$4/lf',  'Horizontal bottom edges'],
                ] as const).map(([key, label, rate, tip]) => (
                  <div key={key}>
                    <div className="flex items-center gap-1 mb-1">
                      <label className="text-xs text-gray-400">{label}</label>
                      <span className="text-[9px] text-gray-600 bg-gray-800 px-1 rounded">{rate}</span>
                      <span title={tip} className="text-[10px] text-gray-600 cursor-help">ⓘ</span>
                      {linear[key] > 0 && <span className={ovBadge}>Override</span>}
                    </div>
                    <input type="number" min={0} value={linear[key]}
                      onChange={e => setLinear(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                      className={`w-full px-2.5 py-1.5 bg-gray-800 border rounded-lg text-white text-sm focus:outline-none ${linear[key] > 0 ? 'border-yellow-500/50' : 'border-gray-700 focus:border-blue-500'}`}
                    />
                  </div>
                ))}
              </div>
              {(linear.ridge + linear.valley + linear.rake + linear.eave) > 0 && (
                <p className="text-xs text-gray-500">
                  Linear subtotal: <span className="text-white font-medium">{fmtMoney(linear.ridge*8 + linear.valley*12 + linear.rake*5 + linear.eave*4)}</span>
                </p>
              )}

              {/* Clear all */}
              {anyOverride && (
                <button onClick={clearAllOverrides}
                  className="w-full py-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-semibold rounded-lg hover:bg-yellow-500/20 transition-colors">
                  Clear all overrides
                </button>
              )}
            </div>
          )}
        </div>

        {/* ADD-ONS */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Add-ons</h3>
          <div className="space-y-2">
            {([
              ['ridgeVent',      'Ridge Vent Upgrade',       '+$300',         'Improves attic ventilation and extends shingle life'],
              ['iceWaterFull',   'Full Ice & Water Shield',  '+$0.85/sqft',   'Recommended for CT winters — whole roof, not just eaves'],
              ['dripEdgeUpgrade','Drip Edge Upgrade (alum)', '$2.50/eave lf', 'Auto-calculated from eave measurement above'],
              ['gutterInspection','Gutter Inspection',       'Complimentary', 'Included while on-site'],
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
            <div className="flex items-center justify-between bg-gray-800 rounded-lg border border-gray-700 px-3 py-2">
              <div><p className="text-xs font-semibold text-gray-300">Skylight Flashing</p><p className="text-[10px] text-gray-500">$250 per unit</p></div>
              <div className="flex items-center gap-2">
                <button onClick={() => setAddOns(p => ({ ...p, skylights: Math.max(0, p.skylights - 1) }))} className="w-6 h-6 rounded bg-gray-700 text-white text-sm flex items-center justify-center hover:bg-gray-600">−</button>
                <span className="w-5 text-center text-sm text-white">{addOns.skylights}</span>
                <button onClick={() => setAddOns(p => ({ ...p, skylights: Math.min(5, p.skylights + 1) }))} className="w-6 h-6 rounded bg-gray-700 text-white text-sm flex items-center justify-center hover:bg-gray-600">+</button>
              </div>
            </div>
            <div className="flex items-center justify-between bg-gray-800 rounded-lg border border-gray-700 px-3 py-2">
              <div><p className="text-xs font-semibold text-gray-300">Chimney Flashing</p><p className="text-[10px] text-gray-500">$400 per chimney</p></div>
              <div className="flex items-center gap-2">
                <button onClick={() => setAddOns(p => ({ ...p, chimneys: Math.max(0, p.chimneys - 1) }))} className="w-6 h-6 rounded bg-gray-700 text-white text-sm flex items-center justify-center hover:bg-gray-600">−</button>
                <span className="w-5 text-center text-sm text-white">{addOns.chimneys}</span>
                <button onClick={() => setAddOns(p => ({ ...p, chimneys: Math.min(3, p.chimneys + 1) }))} className="w-6 h-6 rounded bg-gray-700 text-white text-sm flex items-center justify-center hover:bg-gray-600">+</button>
              </div>
            </div>
          </div>
        </div>

        {/* PITCH SUMMARY */}
        {pitchSummary && !overridePitch && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Pitch Summary</h3>
            {pitchSummary.sections.length === 1 ? (
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full border ${getPitchLabel(pitchSummary.avgPitch).badge}`}>
                  {getPitchLabel(pitchSummary.avgPitch).label}
                </span>
                <span className="text-xs text-gray-400">Surcharge: <span className="text-white font-medium">+${getPitchSurcharge(pitchSummary.avgPitch).toFixed(2)}/sqft</span></span>
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
                <span>Range adjustment</span><span>−$1,000 / +$1,000</span>
              </div>
            </div>
          )}
          <div className="bg-[#0f1e3b] rounded-xl border border-blue-900/40 p-4 mt-4">
            <p className="text-xs text-blue-300/60 mb-1">Estimated Project Range</p>
            <p className="text-2xl font-black text-white">
              {priceCalc.subtotal > 0 ? `${fmtMoney(priceCalc.rangeMin)} – ${fmtMoney(priceCalc.rangeMax)}` : '—'}
            </p>
            {priceCalc.sqftSource && (
              <p className="text-[10px] text-blue-300/40 mt-1.5">
                Using: <span className="text-blue-300/70">{priceCalc.sqftSource}</span>
                {priceCalc.effectiveSqft > 0 && ` · ${priceCalc.effectiveSqft.toLocaleString()} sq ft`}
              </p>
            )}
            <p className="text-xs text-blue-300/30 mt-0.5">Exact price confirmed after free drone assessment</p>
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
          {saveSuccess && <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2 text-sm text-green-400">Saved to lead successfully.</div>}
          {sentBanner  && <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2 text-sm text-green-400">Proposal sent to {lead.email}</div>}
          {sendError   && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-400">{sendError}</div>}
          <button onClick={handleSave} disabled={saving || priceCalc.effectiveSqft === 0}
            className="w-full py-2.5 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm font-semibold rounded-lg transition-colors">
            {saving ? 'Saving…' : 'Save to Lead'}
          </button>
          <button onClick={handleSend} disabled={sending || priceCalc.effectiveSqft === 0 || !lead.email}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:text-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
            {sending ? (
              <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Generating PDF & Sending…</>
            ) : 'Send Proposal Email →'}
          </button>
        </div>
      </div>

      {/* ══════════════ STREET VIEW MODAL (full screen) ══ */}
      {streetView && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-900/95 border-b border-gray-800 flex-shrink-0">
            <p className="text-sm font-semibold text-white">360° Street View — {lead.address}</p>
            <button onClick={() => { setStreetView(false); setSvAvailable(null); }} className="text-gray-400 hover:text-white transition-colors p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex-1 relative">
            {svAvailable === null && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-950 z-10">
                <svg className="w-7 h-7 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
              </div>
            )}
            {svAvailable === false && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-950 z-10">
                <div className="text-center">
                  <svg className="w-10 h-10 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
                  <p className="text-sm text-gray-400">Street View not available for this address — try a nearby street</p>
                  <p className="text-xs text-gray-600 mt-1">Use satellite view on the map instead</p>
                </div>
              </div>
            )}
            <div ref={svDivRef} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>
      )}
    </div>
  );
}

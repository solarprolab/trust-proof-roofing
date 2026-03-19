'use client';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Distributor {
  id: string;
  name: string;
  contact_name?: string;
  email?: string;
  account_number?: string;
}

interface MaterialItem {
  item: string;
  brand: string;
  color: string;
  unit: string;
  qty: number;
}

interface DeliveryInfo {
  deliveryAddress: string;
  deliveryDate: string;
  timeWindow: string;
  onSite: boolean;
  dropInstructions: string;
  truckRestrictions: string;
  specialInstructions: string;
}

interface OrderData {
  materials: MaterialItem[];
  delivery: DeliveryInfo;
  backorderHandling: 'hold' | 'substitute';
  substitutionApproval: 'required' | 'not_required';
  deliveryReceiptRequired: boolean;
}

const DEFAULT_MATERIAL_ITEMS: string[] = [
  'Architectural Shingles',
  'Starter Strip',
  'Ridge Cap',
  'Ice & Water Shield',
  'Synthetic Underlayment',
  'Drip Edge',
  'Pipe Boots',
  'Ridge Vent',
  'Roofing Nails',
  'Flashing',
];

// Maps material row item name → distributor_catalog category value
const ITEM_CATEGORY_MAP: Record<string, string> = {
  'Architectural Shingles': 'shingles',
  'Starter Strip':          'shingles',
  'Ridge Cap':              'shingles',
  'Ice & Water Shield':     'ice_water_shield',
  'Synthetic Underlayment': 'underlayment',
  'Drip Edge':              'flashing',
  'Pipe Boots':             'accessories',
  'Ridge Vent':             'ventilation',
  'Roofing Nails':          'fasteners',
  'Flashing':               'flashing',
};

const UNITS: Record<string, string> = {
  'Architectural Shingles': 'square',
  'Starter Strip': 'bundle',
  'Ridge Cap': 'bundle',
  'Ice & Water Shield': 'roll',
  'Synthetic Underlayment': 'roll',
  'Drip Edge': 'piece',
  'Pipe Boots': 'ea',
  'Ridge Vent': 'linear ft',
  'Roofing Nails': 'box',
  'Flashing': 'piece',
};

function calcDefaultMaterials(sqft: number): MaterialItem[] {
  const adjusted = sqft * 1.10;
  const squares = adjusted / 100;
  return [
    { item: 'Architectural Shingles', brand: '', color: '', unit: 'square', qty: Math.ceil(squares) },
    { item: 'Starter Strip', brand: '', color: '', unit: 'bundle', qty: Math.ceil(squares * 0.5) },
    { item: 'Ridge Cap', brand: '', color: '', unit: 'bundle', qty: Math.ceil(squares * 0.1) },
    { item: 'Ice & Water Shield', brand: '', color: '', unit: 'roll', qty: Math.ceil(adjusted / 200) },
    { item: 'Synthetic Underlayment', brand: '', color: '', unit: 'roll', qty: Math.ceil(adjusted / 1000) },
    { item: 'Drip Edge', brand: '', color: '', unit: 'piece', qty: 0 },
    { item: 'Pipe Boots', brand: '', color: '', unit: 'ea', qty: 0 },
    { item: 'Ridge Vent', brand: '', color: '', unit: 'linear ft', qty: 0 },
    { item: 'Roofing Nails', brand: '', color: '', unit: 'box', qty: Math.ceil(squares / 4) },
    { item: 'Flashing', brand: '', color: '', unit: 'piece', qty: 0 },
  ];
}

function defaultDelivery(address: string): DeliveryInfo {
  return {
    deliveryAddress: address || '',
    deliveryDate: '',
    timeWindow: '',
    onSite: true,
    dropInstructions: '',
    truckRestrictions: '',
    specialInstructions: '',
  };
}

export default function MaterialOrderTab({ lead, leadId }: { lead: any; leadId: string }) {
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [order, setOrder] = useState<any>(null);
  const [distributorId, setDistributorId] = useState('');
  const [orderData, setOrderData] = useState<OrderData>({
    materials: [],
    delivery: defaultDelivery(lead?.address || ''),
    backorderHandling: 'hold',
    substitutionApproval: 'required',
    deliveryReceiptRequired: true,
  });
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [sentMsg, setSentMsg] = useState('');

  // Catalog popover state
  const [popoverIdx, setPopoverIdx] = useState<number | null>(null);
  const [catalogResults, setCatalogResults] = useState<any[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const sqft = Number(lead?.roof_size) || 0;

  useEffect(() => {
    fetch('/api/admin/distributors').then(r => r.json()).then(data => {
      setDistributors(Array.isArray(data) ? data : []);
    });
    fetch(`/api/admin/leads/${leadId}/material-order`).then(r => r.json()).then(data => {
      if (data && data.id) {
        setOrder(data);
        setDistributorId(data.distributor_id || '');
        const od = data.order_data || {};
        setOrderData({
          materials: od.materials && od.materials.length > 0 ? od.materials : calcDefaultMaterials(sqft),
          delivery: od.delivery || defaultDelivery(lead?.address || ''),
          backorderHandling: od.backorderHandling || 'hold',
          substitutionApproval: od.substitutionApproval || 'required',
          deliveryReceiptRequired: od.deliveryReceiptRequired !== undefined ? od.deliveryReceiptRequired : true,
        });
      } else {
        setOrderData(prev => ({ ...prev, materials: calcDefaultMaterials(sqft) }));
      }
    });
  }, [leadId, sqft]);

  // Close popover on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverIdx(null);
      }
    }
    if (popoverIdx !== null) document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [popoverIdx]);

  async function handleBrandFocus(idx: number, itemName: string) {
    setPopoverIdx(idx);
    setCatalogLoading(true);
    setCatalogResults([]);
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const category = ITEM_CATEGORY_MAP[itemName];
      let query = supabase.from('distributor_catalog').select('*');
      if (category) {
        query = query.eq('category', category);
      } else {
        query = query.ilike('product_name', `%${itemName}%`);
      }
      const { data } = await query.order('product_name').limit(30);
      setCatalogResults(data || []);
    } catch {
      setCatalogResults([]);
    } finally {
      setCatalogLoading(false);
    }
  }

  function selectCatalogItem(idx: number, item: any) {
    const brandStr = [item.brand, item.sku ? `(${item.sku})` : ''].filter(Boolean).join(' ') || item.product_name;
    updateMaterial(idx, 'brand', brandStr);
    if (item.color) updateMaterial(idx, 'color', item.color);
    setPopoverIdx(null);
  }

  function updateMaterial(idx: number, field: keyof MaterialItem, value: string | number) {
    setOrderData(prev => {
      const mats = [...prev.materials];
      mats[idx] = { ...mats[idx], [field]: field === 'qty' ? Number(value) : value };
      return { ...prev, materials: mats };
    });
  }

  function updateDelivery(field: keyof DeliveryInfo, value: string | boolean) {
    setOrderData(prev => ({ ...prev, delivery: { ...prev.delivery, [field]: value } }));
  }

  async function handleSave() {
    setSaving(true);
    setSavedMsg('');
    const poNumber = order?.po_number || `TPR-${leadId.slice(0, 6).toUpperCase()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}`;
    const body = {
      distributor_id: distributorId || null,
      po_number: poNumber,
      order_data: orderData,
    };
    const res = await fetch(`/api/admin/leads/${leadId}/material-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const saved = await res.json();
    setOrder(saved);
    setSaving(false);
    setSavedMsg('Order saved');
    setTimeout(() => setSavedMsg(''), 3000);
  }

  async function handleSend() {
    if (!order?.id) {
      alert('Save the order first before sending.');
      return;
    }
    if (!distributorId) {
      alert('Select a distributor before sending.');
      return;
    }
    setSending(true);
    setSentMsg('');
    const res = await fetch(`/api/admin/leads/${leadId}/material-order/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id }),
    });
    const result = await res.json();
    setSending(false);
    if (result.success) {
      setSentMsg(`Order sent to ${result.distributorName}`);
      setOrder((prev: any) => ({ ...prev, status: 'sent' }));
    } else {
      setSentMsg(`Error: ${result.error}`);
    }
  }

  const selectedDist = distributors.find(d => d.id === distributorId);

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">

      {/* Section A: Job Summary */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Job Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500 text-xs mb-1">Customer</p>
            <p className="text-white font-medium">{lead?.name || '—'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1">Address</p>
            <p className="text-white">{lead?.address || '—'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1">Roof Size</p>
            <p className="text-white">{sqft ? `${sqft.toLocaleString()} sq ft` : '—'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1">Adjusted (+10%)</p>
            <p className="text-white">{sqft ? `${Math.round(sqft * 1.10).toLocaleString()} sq ft` : '—'}</p>
          </div>
        </div>
        {order && (
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs text-gray-500 font-mono">PO: {order.po_number}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.status === 'sent' ? 'bg-green-900/50 text-green-300' : 'bg-gray-800 text-gray-400'}`}>
              {order.status === 'sent' ? 'Sent' : 'Draft'}
            </span>
          </div>
        )}
      </div>

      {/* Section B: Material Quantities */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Material Quantities</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase border-b border-gray-800">
                <th className="text-left py-2 pr-4 font-medium">Item</th>
                <th className="text-left py-2 pr-4 font-medium">Brand / Spec</th>
                <th className="text-left py-2 pr-4 font-medium">Color / Style</th>
                <th className="text-left py-2 pr-4 font-medium">Unit</th>
                <th className="text-right py-2 font-medium">Qty</th>
              </tr>
            </thead>
            <tbody>
              {orderData.materials.map((m, idx) => (
                <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="py-2 pr-4 font-medium text-white">{m.item}</td>
                  <td className="py-2 pr-4 relative">
                    <input
                      type="text"
                      value={m.brand}
                      onChange={e => updateMaterial(idx, 'brand', e.target.value)}
                      onFocus={() => handleBrandFocus(idx, m.item)}
                      placeholder="—"
                      className="w-full bg-transparent border-b border-gray-700 focus:border-blue-500 text-gray-300 text-sm focus:outline-none px-0 py-0.5"
                    />
                    {popoverIdx === idx && (
                      <div
                        ref={popoverRef}
                        className="absolute z-50 top-full left-0 mt-1 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl overflow-hidden"
                      >
                        {catalogLoading ? (
                          <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400">
                            <svg className="w-4 h-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            Searching catalog...
                          </div>
                        ) : catalogResults.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500">No catalog items found</div>
                        ) : (
                          <div className="max-h-64 overflow-y-auto">
                            {/* Group by distributor_id */}
                            {Array.from(new Set(catalogResults.map(r => r.distributor_id))).map(distId => {
                              const distName = distributors.find(d => d.id === distId)?.name ?? 'Unknown';
                              const items = catalogResults.filter(r => r.distributor_id === distId);
                              return (
                                <div key={distId}>
                                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-900/60 sticky top-0">
                                    {distName}
                                  </div>
                                  {items.map(item => (
                                    <button
                                      key={item.id}
                                      type="button"
                                      onMouseDown={() => selectCatalogItem(idx, item)}
                                      className="w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors flex items-start justify-between gap-2"
                                    >
                                      <div className="min-w-0">
                                        <p className="text-sm text-white truncate">{item.product_name}</p>
                                        <p className="text-xs text-gray-400 truncate">
                                          {[item.brand, item.sku ? `SKU: ${item.sku}` : '', item.color].filter(Boolean).join(' · ')}
                                        </p>
                                      </div>
                                      <div className="text-right flex-shrink-0">
                                        {item.unit_price != null && (
                                          <p className="text-sm text-green-400 font-medium">${Number(item.unit_price).toFixed(2)}</p>
                                        )}
                                        {item.unit && (
                                          <p className="text-xs text-gray-500">{item.unit}</p>
                                        )}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    <input
                      type="text"
                      value={m.color}
                      onChange={e => updateMaterial(idx, 'color', e.target.value)}
                      placeholder="—"
                      className="w-full bg-transparent border-b border-gray-700 focus:border-blue-500 text-gray-300 text-sm focus:outline-none px-0 py-0.5"
                    />
                  </td>
                  <td className="py-2 pr-4 text-gray-400">{m.unit}</td>
                  <td className="py-2 text-right">
                    <input
                      type="number"
                      value={m.qty}
                      min={0}
                      onChange={e => updateMaterial(idx, 'qty', e.target.value)}
                      className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-0.5 text-right text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section C: Delivery Details */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Delivery Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Delivery Address</label>
            <input
              type="text"
              value={orderData.delivery.deliveryAddress}
              onChange={e => updateDelivery('deliveryAddress', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Delivery Date</label>
            <input
              type="date"
              value={orderData.delivery.deliveryDate}
              onChange={e => updateDelivery('deliveryDate', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Time Window</label>
            <input
              type="text"
              value={orderData.delivery.timeWindow}
              onChange={e => updateDelivery('timeWindow', e.target.value)}
              placeholder="e.g. 7am–10am"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Truck Restrictions</label>
            <input
              type="text"
              value={orderData.delivery.truckRestrictions}
              onChange={e => updateDelivery('truckRestrictions', e.target.value)}
              placeholder="e.g. No semi trucks"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Special Instructions</label>
            <textarea
              value={orderData.delivery.specialInstructions}
              onChange={e => updateDelivery('specialInstructions', e.target.value)}
              rows={2}
              placeholder="Gate codes, drop location details, etc."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={orderData.delivery.onSite}
                onChange={e => updateDelivery('onSite', e.target.checked)}
                className="w-4 h-4 accent-blue-500"
              />
              <span className="text-sm text-gray-300">Someone on site during delivery</span>
            </label>
          </div>
          {!orderData.delivery.onSite && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Drop Instructions</label>
              <input
                type="text"
                value={orderData.delivery.dropInstructions}
                onChange={e => updateDelivery('dropInstructions', e.target.value)}
                placeholder="Where to leave materials"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Section D: Distributor & Order Terms */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Distributor & Order Terms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Select Distributor</label>
            <select
              value={distributorId}
              onChange={e => setDistributorId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">— Select distributor —</option>
              {distributors.map(d => (
                <option key={d.id} value={d.id}>{d.name}{d.account_number ? ` (Acct: ${d.account_number})` : ''}</option>
              ))}
            </select>
            {selectedDist && (
              <div className="mt-2 text-xs text-gray-500 flex gap-4">
                {selectedDist.contact_name && <span>{selectedDist.contact_name}</span>}
                {selectedDist.email && <span>{selectedDist.email}</span>}
              </div>
            )}
            {distributors.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                No distributors added yet. <a href="/admin/distributors" className="text-blue-400 hover:underline">Add one →</a>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-2">Back-order Handling</label>
            <div className="flex gap-3">
              {(['hold', 'substitute'] as const).map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="backorder"
                    checked={orderData.backorderHandling === opt}
                    onChange={() => setOrderData(prev => ({ ...prev, backorderHandling: opt }))}
                    className="accent-blue-500"
                  />
                  <span className="text-sm text-gray-300 capitalize">{opt === 'hold' ? 'Hold for original' : 'Substitute equiv.'}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-2">Substitution Approval</label>
            <div className="flex gap-3">
              {(['required', 'not_required'] as const).map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="subapproval"
                    checked={orderData.substitutionApproval === opt}
                    onChange={() => setOrderData(prev => ({ ...prev, substitutionApproval: opt }))}
                    className="accent-blue-500"
                  />
                  <span className="text-sm text-gray-300">{opt === 'required' ? 'Required' : 'Not required'}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={orderData.deliveryReceiptRequired}
                onChange={e => setOrderData(prev => ({ ...prev, deliveryReceiptRequired: e.target.checked }))}
                className="w-4 h-4 accent-blue-500"
              />
              <span className="text-sm text-gray-300">Delivery receipt required</span>
            </label>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 border border-gray-600 rounded-lg text-sm font-semibold transition-colors"
        >
          {saving ? 'Saving...' : 'Save Order'}
        </button>
        <button
          onClick={handleSend}
          disabled={sending || !order?.id || !distributorId}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-60 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          {sending ? 'Sending...' : 'Send to Distributor'}
        </button>
        {savedMsg && <span className="text-sm text-green-400">{savedMsg}</span>}
        {sentMsg && <span className={`text-sm ${sentMsg.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>{sentMsg}</span>}
        {!order?.id && (
          <span className="text-xs text-gray-500">Save first to enable sending</span>
        )}
        {order?.id && !distributorId && (
          <span className="text-xs text-gray-500">Select a distributor to enable sending</span>
        )}
      </div>
    </div>
  );
}

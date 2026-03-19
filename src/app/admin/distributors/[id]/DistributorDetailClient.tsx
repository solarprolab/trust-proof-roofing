'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { CatalogItem } from '@/lib/catalogParser';

interface Distributor {
  id: string;
  name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  account_number?: string;
  tax_exempt_number?: string;
  billing_address?: string;
  preferred_brands?: string[];
  typical_lead_time_days?: number;
  delivery_minimum?: string;
  notes?: string;
  service_area?: string;
  status?: string;
  created_at: string;
}

interface CatalogRow extends CatalogItem {
  id: string;
  last_updated: string;
}

const AVAILABILITY_LABELS: Record<string, { label: string; cls: string }> = {
  in_stock:     { label: 'In Stock',    cls: 'text-green-400 bg-green-900/30' },
  limited:      { label: 'Limited',     cls: 'text-amber-400 bg-amber-900/30' },
  out_of_stock: { label: 'Out of Stock',cls: 'text-red-400 bg-red-900/30' },
  unknown:      { label: 'Unknown',     cls: 'text-gray-400 bg-gray-800' },
};

function fmt(v: number | null | undefined) {
  return v != null ? `$${Number(v).toFixed(2)}` : '—';
}

export default function DistributorDetailClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [distributor, setDistributor] = useState<Distributor | null>(null);
  const [catalog, setCatalog] = useState<CatalogRow[]>([]);
  const [loadingDist, setLoadingDist] = useState(true);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Sync UI state
  const [rawText, setRawText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [preview, setPreview] = useState<CatalogItem[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    fetch(`/api/admin/distributors/${id}`)
      .then(r => r.json())
      .then(d => { setDistributor(d); setLoadingDist(false); });
    loadCatalog();
  }, [id]);

  async function loadCatalog() {
    setLoadingCatalog(true);
    const res = await fetch(`/api/admin/distributors/${id}/catalog`);
    const data = await res.json();
    setCatalog(Array.isArray(data) ? data : []);
    setLoadingCatalog(false);
  }

  async function handleParse() {
    if (!rawText.trim()) return;
    setParsing(true);
    setParseError('');
    setPreview(null);
    setSaveMsg('');
    try {
      const res = await fetch('/api/catalog/parse-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Parse failed');
      setPreview(data.items || []);
    } catch (err: any) {
      setParseError(err.message || 'Something went wrong');
    } finally {
      setParsing(false);
    }
  }

  async function handleConfirmSave() {
    if (!preview) return;
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch('/api/catalog/parse-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ distributorId: id, rawText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSaveMsg(`Saved — ${data.itemsAdded} added, ${data.itemsUpdated} updated`);
      setPreview(null);
      setRawText('');
      loadCatalog();
    } catch (err: any) {
      setSaveMsg(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    setPreview(null);
    setRawText('');
    setParseError('');
    setSaveMsg('');
  }

  const categories = ['all', ...Array.from(new Set(catalog.map(r => r.category || 'other').filter(Boolean))).sort()];
  const filteredCatalog = categoryFilter === 'all' ? catalog : catalog.filter(r => (r.category || 'other') === categoryFilter);

  if (loadingDist) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!distributor) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Distributor not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/distributors" className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">{distributor.name}</h1>
              {distributor.status === 'pending' && (
                <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
                  Pending
                </span>
              )}
              {(distributor.status === 'active' || !distributor.status) && (
                <span className="text-xs bg-green-900/30 text-green-400 border border-green-700/30 px-2 py-0.5 rounded-full font-medium">
                  Active
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400">Distributor detail</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">

        {/* Distributor Info */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Distributor Info</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4 text-sm">
            {[
              ['Contact', distributor.contact_name],
              ['Email', distributor.email],
              ['Phone', distributor.phone],
              ['Account #', distributor.account_number],
              ['Tax Exempt #', distributor.tax_exempt_number],
              ['Billing Address', distributor.billing_address],
              ['Service Area', distributor.service_area],
              ['Lead Time', distributor.typical_lead_time_days != null
                ? (distributor.typical_lead_time_days === 0 ? 'Same day' : `${distributor.typical_lead_time_days} days`)
                : null],
              ['Delivery Min', distributor.delivery_minimum],
            ].map(([label, value]) => value ? (
              <div key={label as string}>
                <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                <p className="text-white">{value}</p>
              </div>
            ) : null)}
          </div>
          {distributor.preferred_brands && distributor.preferred_brands.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-1.5">Preferred Brands</p>
              <div className="flex flex-wrap gap-1.5">
                {distributor.preferred_brands.map(b => (
                  <span key={b} className="text-xs bg-blue-950/60 text-blue-300 border border-blue-900/50 px-2 py-0.5 rounded-full">{b}</span>
                ))}
              </div>
            </div>
          )}
          {distributor.notes && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-0.5">Notes</p>
              <p className="text-sm text-gray-300 italic">{distributor.notes}</p>
            </div>
          )}
        </div>

        {/* Sync Price Sheet */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Sync Price Sheet</h2>

          {preview === null ? (
            <>
              <textarea
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                rows={8}
                placeholder="Paste price sheet email or text here..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 resize-y font-mono"
              />
              {parseError && (
                <p className="mt-2 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">{parseError}</p>
              )}
              {saveMsg && (
                <p className={`mt-2 text-sm rounded-lg px-3 py-2 ${saveMsg.startsWith('Error') ? 'text-red-400 bg-red-900/20 border border-red-800' : 'text-green-400 bg-green-900/20 border border-green-800'}`}>
                  {saveMsg}
                </p>
              )}
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={handleParse}
                  disabled={parsing || !rawText.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-60 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  {parsing ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Parsing...
                    </>
                  ) : 'Parse & Sync'}
                </button>
                <span className="text-xs text-gray-500">Claude will extract products — review before saving</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-white">{preview.length}</span> item{preview.length !== 1 ? 's' : ''} extracted — review below
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDiscard}
                    className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleConfirmSave}
                    disabled={saving}
                    className="px-4 py-1.5 bg-green-700 hover:bg-green-600 disabled:bg-green-900 rounded-lg text-sm text-white font-semibold transition-colors"
                  >
                    {saving ? 'Saving...' : 'Confirm & Save'}
                  </button>
                </div>
              </div>

              {preview.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-800/40 rounded-lg border border-gray-700 border-dashed">
                  No products were extracted. Try pasting a more structured price list.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-700">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-800 text-xs text-gray-400 uppercase">
                        <th className="text-left px-3 py-2.5 font-medium">Category</th>
                        <th className="text-left px-3 py-2.5 font-medium">Product</th>
                        <th className="text-left px-3 py-2.5 font-medium">Brand</th>
                        <th className="text-left px-3 py-2.5 font-medium">SKU</th>
                        <th className="text-left px-3 py-2.5 font-medium">Unit</th>
                        <th className="text-right px-3 py-2.5 font-medium">Price</th>
                        <th className="text-left px-3 py-2.5 font-medium">Availability</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((item, i) => {
                        const av = AVAILABILITY_LABELS[item.availability || 'unknown'] ?? AVAILABILITY_LABELS.unknown;
                        return (
                          <tr key={i} className="border-t border-gray-800 hover:bg-gray-800/40 transition-colors">
                            <td className="px-3 py-2 text-gray-400 capitalize">{item.category || '—'}</td>
                            <td className="px-3 py-2 font-medium text-white">{item.product_name}</td>
                            <td className="px-3 py-2 text-gray-300">{item.brand || '—'}</td>
                            <td className="px-3 py-2 text-gray-400 font-mono text-xs">{item.sku || '—'}</td>
                            <td className="px-3 py-2 text-gray-400">{item.unit || '—'}</td>
                            <td className="px-3 py-2 text-right text-white font-medium">{fmt(item.unit_price)}</td>
                            <td className="px-3 py-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${av.cls}`}>{av.label}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* Existing Catalog */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Catalog
              {catalog.length > 0 && <span className="ml-2 text-gray-600 normal-case font-normal">({catalog.length} items)</span>}
            </h2>
            {categories.length > 1 && (
              <div className="flex gap-1 flex-wrap">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors capitalize ${
                      categoryFilter === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {cat === 'all' ? `All (${catalog.length})` : cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loadingCatalog ? (
            <div className="text-center py-10 text-gray-500">Loading catalog...</div>
          ) : catalog.length === 0 ? (
            <div className="text-center py-10 text-gray-500 bg-gray-800/30 rounded-lg border border-gray-700 border-dashed">
              <p className="mb-1">No catalog items yet.</p>
              <p className="text-xs text-gray-600">Paste a price sheet above to sync products.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-800 text-xs text-gray-400 uppercase">
                    <th className="text-left px-3 py-2.5 font-medium">Category</th>
                    <th className="text-left px-3 py-2.5 font-medium">Product</th>
                    <th className="text-left px-3 py-2.5 font-medium">Brand</th>
                    <th className="text-left px-3 py-2.5 font-medium">SKU</th>
                    <th className="text-left px-3 py-2.5 font-medium">Unit</th>
                    <th className="text-right px-3 py-2.5 font-medium">Price</th>
                    <th className="text-left px-3 py-2.5 font-medium">Availability</th>
                    <th className="text-left px-3 py-2.5 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCatalog.map(item => {
                    const av = AVAILABILITY_LABELS[item.availability || 'unknown'] ?? AVAILABILITY_LABELS.unknown;
                    return (
                      <tr key={item.id} className="border-t border-gray-800 hover:bg-gray-800/40 transition-colors">
                        <td className="px-3 py-2 text-gray-400 capitalize">{item.category || '—'}</td>
                        <td className="px-3 py-2 font-medium text-white">{item.product_name}</td>
                        <td className="px-3 py-2 text-gray-300">{item.brand || '—'}</td>
                        <td className="px-3 py-2 text-gray-400 font-mono text-xs">{item.sku || '—'}</td>
                        <td className="px-3 py-2 text-gray-400">{item.unit || '—'}</td>
                        <td className="px-3 py-2 text-right text-white font-medium">{fmt(item.unit_price)}</td>
                        <td className="px-3 py-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${av.cls}`}>{av.label}</span>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-500">
                          {new Date(item.last_updated).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

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
  created_at: string;
}

const EMPTY: Omit<Distributor, 'id' | 'created_at'> = {
  name: '',
  contact_name: '',
  phone: '',
  email: '',
  account_number: '',
  tax_exempt_number: '',
  billing_address: '',
  preferred_brands: [],
  typical_lead_time_days: undefined,
  delivery_minimum: '',
  notes: '',
};

export default function DistributorsClient() {
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Distributor | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [brandsInput, setBrandsInput] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/distributors');
    const data = await res.json();
    setDistributors(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY });
    setBrandsInput('');
    setShowModal(true);
  }

  function openEdit(d: Distributor) {
    setEditing(d);
    setForm({
      name: d.name || '',
      contact_name: d.contact_name || '',
      phone: d.phone || '',
      email: d.email || '',
      account_number: d.account_number || '',
      tax_exempt_number: d.tax_exempt_number || '',
      billing_address: d.billing_address || '',
      preferred_brands: d.preferred_brands || [],
      typical_lead_time_days: d.typical_lead_time_days,
      delivery_minimum: d.delivery_minimum || '',
      notes: d.notes || '',
    });
    setBrandsInput((d.preferred_brands || []).join(', '));
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      ...form,
      preferred_brands: brandsInput.split(',').map(s => s.trim()).filter(Boolean),
      typical_lead_time_days: form.typical_lead_time_days ? Number(form.typical_lead_time_days) : null,
    };

    if (editing) {
      const res = await fetch(`/api/admin/distributors/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const updated = await res.json();
      setDistributors(prev => prev.map(d => d.id === editing.id ? updated : d));
    } else {
      const res = await fetch('/api/admin/distributors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const created = await res.json();
      setDistributors(prev => [created, ...prev]);
    }
    setSaving(false);
    setShowModal(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this distributor? This cannot be undone.')) return;
    await fetch(`/api/admin/distributors/${id}`, { method: 'DELETE' });
    setDistributors(prev => prev.filter(d => d.id !== id));
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Distributors</h1>
            <p className="text-sm text-gray-400">Manage material suppliers and vendors</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Distributor
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {loading && (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        )}

        {!loading && distributors.length === 0 && (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-gray-400 mb-2">No distributors yet</p>
            <p className="text-sm text-gray-600">Add your first supplier to get started</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {distributors.map(d => (
            <div key={d.id} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-lg font-semibold text-white">{d.name}</h2>
                    {d.account_number && (
                      <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full font-mono">
                        Acct: {d.account_number}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-400">
                    {d.contact_name && <span>{d.contact_name}</span>}
                    {d.phone && (
                      <a href={`tel:${d.phone}`} className="hover:text-white transition-colors">{d.phone}</a>
                    )}
                    {d.email && (
                      <a href={`mailto:${d.email}`} className="hover:text-white transition-colors">{d.email}</a>
                    )}
                  </div>
                  {(d.preferred_brands && d.preferred_brands.length > 0) && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {d.preferred_brands.map(b => (
                        <span key={b} className="text-xs bg-blue-950/60 text-blue-300 border border-blue-900/50 px-2 py-0.5 rounded-full">{b}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs text-gray-500">
                    {d.typical_lead_time_days && <span>Lead time: {d.typical_lead_time_days}d</span>}
                    {d.delivery_minimum && <span>Min delivery: {d.delivery_minimum}</span>}
                    {d.tax_exempt_number && <span>Tax exempt: {d.tax_exempt_number}</span>}
                  </div>
                  {d.notes && (
                    <p className="text-sm text-gray-500 mt-2 italic">{d.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <button
                    onClick={() => openEdit(d)}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-red-900/40 border border-gray-700 hover:border-red-700 rounded-lg text-sm text-gray-400 hover:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editing ? 'Edit Distributor' : 'Add Distributor'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Company Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. ABC Roofing Supply"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={form.contact_name}
                    onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={form.account_number}
                    onChange={e => setForm(f => ({ ...f, account_number: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Tax Exempt #</label>
                  <input
                    type="text"
                    value={form.tax_exempt_number}
                    onChange={e => setForm(f => ({ ...f, tax_exempt_number: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Billing Address</label>
                <input
                  type="text"
                  value={form.billing_address}
                  onChange={e => setForm(f => ({ ...f, billing_address: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Preferred Brands (comma-separated)</label>
                <input
                  type="text"
                  value={brandsInput}
                  onChange={e => setBrandsInput(e.target.value)}
                  placeholder="e.g. GAF, Owens Corning, CertainTeed"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Lead Time (days)</label>
                  <input
                    type="number"
                    value={form.typical_lead_time_days ?? ''}
                    onChange={e => setForm(f => ({ ...f, typical_lead_time_days: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Delivery Minimum</label>
                  <input
                    type="text"
                    value={form.delivery_minimum}
                    onChange={e => setForm(f => ({ ...f, delivery_minimum: e.target.value }))}
                    placeholder="e.g. $500, 10 squares"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  placeholder="Any special notes about this distributor..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-800 flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 rounded-lg text-sm font-semibold transition-colors"
              >
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Distributor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SERVICES = [
  'Roof Replacement',
  'Roof Repair',
  'Roof Inspection',
  'Emergency Roofing',
  'Storm Damage',
  'Other',
];
const STAGES = ['new', 'contacted', 'quoted', 'won', 'lost'];
const SOURCES = ['Website Form', 'Phone Call', 'LSA', 'Referral', 'Other'];

export default function NewLead() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    service: '',
    message: '',
    stage: 'new',
    estimated_value: '',
    source: 'Website Form',
  });

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      estimated_value: form.estimated_value ? parseFloat(form.estimated_value) : null,
    };
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://trustproofroofing.com';
    await fetch(`${baseUrl}/api/admin/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    router.push('/admin/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#0f2340] text-white">
      <div className="bg-[#1e3a5f] border-b border-[#2a4f7a] px-6 py-4 flex items-center gap-4">
        <Link href="/admin/dashboard" className="text-blue-300 hover:text-white text-sm transition-colors">
          ← Dashboard
        </Link>
        <h1 className="text-lg font-bold">Add New Lead</h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-[#1e3a5f] rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Name *" value={form.name} onChange={v => set('name', v)} required />
            <Field label="Phone *" value={form.phone} onChange={v => set('phone', v)} required />
            <Field label="Email" value={form.email} onChange={v => set('email', v)} type="email" />
            <Field label="City" value={form.city} onChange={v => set('city', v)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Service"
              value={form.service}
              onChange={v => set('service', v)}
              options={['', ...SERVICES]}
              placeholder="Select service..."
            />
            <SelectField
              label="Stage"
              value={form.stage}
              onChange={v => set('stage', v)}
              options={STAGES}
              capitalize
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Estimated Value ($)"
              value={form.estimated_value}
              onChange={v => set('estimated_value', v)}
              type="number"
            />
            <SelectField
              label="Source"
              value={form.source}
              onChange={v => set('source', v)}
              options={SOURCES}
            />
          </div>

          <div>
            <label className="block text-sm text-blue-300 mb-1">Message</label>
            <textarea
              value={form.message}
              onChange={e => set('message', e.target.value)}
              rows={3}
              className="w-full bg-[#0f2340] border border-[#2a4f7a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#f5c518]"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#f5c518] hover:bg-[#e0b315] text-[#1e3a5f] font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Lead'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-blue-300 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className="w-full bg-[#0f2340] border border-[#2a4f7a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#f5c518]"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  capitalize = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  capitalize?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-blue-300 mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-[#0f2340] border border-[#2a4f7a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#f5c518]"
      >
        {options.map(o => (
          <option key={o} value={o}>
            {o === '' ? placeholder ?? '—' : capitalize ? o.charAt(0).toUpperCase() + o.slice(1) : o}
          </option>
        ))}
      </select>
    </div>
  );
}

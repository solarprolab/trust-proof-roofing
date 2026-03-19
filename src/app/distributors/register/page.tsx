'use client';
import { useState } from 'react';
import Image from 'next/image';

const BRANDS = ['GAF', 'Owens Corning', 'CertainTeed', 'Atlas', 'IKO', 'Tamko', 'Other'];

const LEAD_TIME_OPTIONS = [
  { value: 'same-day', label: 'Same day' },
  { value: '1-2', label: '1–2 days' },
  { value: '3-5', label: '3–5 days' },
  { value: '1week+', label: '1 week+' },
];

interface FormState {
  name: string;
  contact_name: string;
  phone: string;
  email: string;
  account_number: string;
  tax_exempt_number: string;
  billing_address: string;
  preferred_brands: string[];
  lead_time: string;
  delivery_minimum: string;
  notes: string;
  service_area: string;
}

const INITIAL: FormState = {
  name: '',
  contact_name: '',
  phone: '',
  email: '',
  account_number: '',
  tax_exempt_number: '',
  billing_address: '',
  preferred_brands: [],
  lead_time: '',
  delivery_minimum: '',
  notes: '',
  service_area: '',
};

function InputField({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = 'w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30 focus:border-[#1B3A6B] bg-white placeholder-gray-400 transition';

export default function DistributorRegisterPage() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function set(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function toggleBrand(brand: string) {
    setForm(prev => ({
      ...prev,
      preferred_brands: prev.preferred_brands.includes(brand)
        ? prev.preferred_brands.filter(b => b !== brand)
        : [...prev.preferred_brands, brand],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.contact_name || !form.phone || !form.email) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/distributors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#1B3A6B] mb-3">Thank you!</h2>
          <p className="text-gray-600 text-base leading-relaxed">
            We received your information and will be in touch within 24 hours.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Questions? Call us at{' '}
            <a href="tel:9593338569" className="text-[#1B3A6B] font-medium">(959) 333-8569</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-5">
            <Image
              src="/logo-navy.png"
              alt="Trust Proof Roofing"
              width={160}
              height={56}
              className="object-contain h-14 w-auto"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-[#1B3A6B] mb-2">Become a Preferred Supplier</h1>
          <p className="text-gray-500 text-base max-w-md mx-auto">
            Join our supplier network — complete this form and we will be in touch within 24 hours.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Company Info */}
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-xs font-semibold text-[#1B3A6B] uppercase tracking-widest mb-5">Company Information</h2>
            <div className="space-y-4">
              <InputField label="Company Name" required>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="ABC Roofing Supply Co."
                  className={inputCls}
                />
              </InputField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Contact Person Name" required>
                  <input
                    type="text"
                    value={form.contact_name}
                    onChange={e => set('contact_name', e.target.value)}
                    placeholder="John Smith"
                    className={inputCls}
                  />
                </InputField>
                <InputField label="Phone" required>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    placeholder="(860) 555-0100"
                    className={inputCls}
                  />
                </InputField>
              </div>

              <InputField label="Email" required>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="orders@example.com"
                  className={inputCls}
                />
              </InputField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Existing Account Number (if applicable)">
                  <input
                    type="text"
                    value={form.account_number}
                    onChange={e => set('account_number', e.target.value)}
                    placeholder="Optional"
                    className={inputCls}
                  />
                </InputField>
                <InputField label="Tax Exempt Certificate Number">
                  <input
                    type="text"
                    value={form.tax_exempt_number}
                    onChange={e => set('tax_exempt_number', e.target.value)}
                    placeholder="Optional"
                    className={inputCls}
                  />
                </InputField>
              </div>

              <InputField label="Billing Address">
                <input
                  type="text"
                  value={form.billing_address}
                  onChange={e => set('billing_address', e.target.value)}
                  placeholder="123 Supply Ave, Hartford, CT 06101"
                  className={inputCls}
                />
              </InputField>

              <InputField label="Service Area">
                <input
                  type="text"
                  value={form.service_area}
                  onChange={e => set('service_area', e.target.value)}
                  placeholder="e.g. Hartford County, all of CT"
                  className={inputCls}
                />
              </InputField>
            </div>
          </div>

          {/* Supply Details */}
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-xs font-semibold text-[#1B3A6B] uppercase tracking-widest mb-5">Supply Details</h2>
            <div className="space-y-5">
              <InputField label="Preferred Brands Carried">
                <div className="flex flex-wrap gap-2 mt-1">
                  {BRANDS.map(brand => {
                    const checked = form.preferred_brands.includes(brand);
                    return (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => toggleBrand(brand)}
                        className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                          checked
                            ? 'bg-[#1B3A6B] text-white border-[#1B3A6B]'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-[#1B3A6B] hover:text-[#1B3A6B]'
                        }`}
                      >
                        {brand}
                      </button>
                    );
                  })}
                </div>
              </InputField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Typical Lead Time">
                  <select
                    value={form.lead_time}
                    onChange={e => set('lead_time', e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Select lead time...</option>
                    {LEAD_TIME_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </InputField>
                <InputField label="Delivery Minimum">
                  <input
                    type="text"
                    value={form.delivery_minimum}
                    onChange={e => set('delivery_minimum', e.target.value)}
                    placeholder="e.g. $500 minimum order"
                    className={inputCls}
                  />
                </InputField>
              </div>

              <InputField label="Notes / Additional Information">
                <textarea
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  rows={3}
                  placeholder="Payment terms, specialty products, anything else we should know..."
                  className={`${inputCls} resize-none`}
                />
              </InputField>
            </div>
          </div>

          {/* Submit */}
          <div className="px-8 py-6">
            {error && (
              <p className="text-sm text-red-600 mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#1B3A6B] hover:bg-[#15306B] disabled:bg-[#1B3A6B]/60 text-white font-semibold rounded-lg text-base transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Registration'}
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">
              By submitting this form you agree to be contacted by Trust Proof Roofing regarding supplier opportunities.
            </p>
          </div>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Questions? Call{' '}
          <a href="tel:9593338569" className="text-[#1B3A6B] font-medium">(959) 333-8569</a>
          {' '}or email{' '}
          <a href="mailto:info@trustproofroofing.com" className="text-[#1B3A6B] font-medium">info@trustproofroofing.com</a>
        </p>
      </div>
    </div>
  );
}

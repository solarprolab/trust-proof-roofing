'use client';

import { useState, FormEvent } from 'react';
import { SITE, SERVICES } from '@/lib/config';

interface FormState {
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
}

export default function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name: '',
    phone: '',
    email: '',
    service: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="bg-brand-50 border border-brand-200 rounded-xl p-8 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-2xl font-bold text-brand-800 mb-2">Message Received!</h3>
        <p className="text-gray-600">
          Thank you! We&apos;ll review your request and reach out within 1 business day. For urgent needs, call us directly at{' '}
          <a href={`tel:${SITE.phone.replace(/\D/g, '')}`} className="text-brand-600 font-semibold hover:underline">
            {SITE.phone}
          </a>
          .
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-red-800 mb-2">Something Went Wrong</h3>
        <p className="text-gray-600 mb-4">
          We&apos;re sorry — please try calling us directly:
        </p>
        <a
          href={`tel:${SITE.phone.replace(/\D/g, '')}`}
          className="inline-block bg-accent-500 hover:bg-accent-600 text-white font-bold px-6 py-3 rounded-lg transition-colors"
        >
          Call {SITE.phone}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="Jane Smith"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            value={form.phone}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="(959) 555-0100"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="jane@example.com"
        />
      </div>

      <div>
        <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
          Service Needed
        </label>
        <select
          id="service"
          name="service"
          value={form.service}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
        >
          <option value="">Select a service…</option>
          {SERVICES.map((s) => (
            <option key={s.slug} value={s.name}>
              {s.name}
            </option>
          ))}
          <option value="Other">Other / Not Sure</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={form.message}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
          placeholder="Tell us about your roof — age, current issues, or any questions…"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg"
      >
        {status === 'sending' ? 'Sending…' : 'Send Message'}
      </button>

      <p className="text-center text-sm text-gray-500">
        Or call us directly:{' '}
        <a href={`tel:${SITE.phone.replace(/\D/g, '')}`} className="text-brand-600 font-semibold hover:underline">
          {SITE.phone}
        </a>
      </p>
    </form>
  );
}

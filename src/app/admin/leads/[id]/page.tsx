'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

type Lead = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  service: string;
  message: string;
  stage: string;
  estimated_value: number | null;
  follow_up_date: string | null;
  source: string;
};

type Note = {
  id: string;
  content: string;
  created_at: string;
};

const STAGES = ['new', 'contacted', 'quoted', 'won', 'lost'];
const SOURCES = ['Website Form', 'Phone Call', 'LSA', 'Referral', 'Other'];

const STAGE_BADGE: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  quoted: 'bg-purple-100 text-purple-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
};

export default function LeadDetail() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [lead, setLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [savingLead, setSavingLead] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/leads/${id}`).then(r => r.json()).then(setLead);
    fetch(`/api/admin/leads/${id}/notes`).then(r => r.json()).then(data => {
      setNotes(Array.isArray(data) ? data : []);
    });
  }, [id]);

  async function saveLead(updates: Partial<Lead>) {
    setSavingLead(true);
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const updated = await res.json();
    setLead(updated);
    setSavingLead(false);
  }

  async function addNote() {
    if (!newNote.trim()) return;
    setSavingNote(true);
    const res = await fetch(`/api/admin/leads/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newNote }),
    });
    const note = await res.json();
    setNotes(n => [...n, note]);
    setNewNote('');
    setSavingNote(false);
  }

  async function deleteLead() {
    if (!confirm('Delete this lead? This cannot be undone.')) return;
    setDeleting(true);
    await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' });
    router.push('/admin/dashboard');
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-[#0f2340] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f2340] text-white">
      {/* Header */}
      <div className="bg-[#1e3a5f] border-b border-[#2a4f7a] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/admin/dashboard" className="text-blue-300 hover:text-white text-sm transition-colors flex-shrink-0">
            ← Dashboard
          </Link>
          <h1 className="text-lg font-bold truncate">{lead.name}</h1>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${STAGE_BADGE[lead.stage] ?? 'bg-gray-100 text-gray-700'}`}>
            {lead.stage.charAt(0).toUpperCase() + lead.stage.slice(1)}
          </span>
        </div>
        <button
          onClick={deleteLead}
          disabled={deleting}
          className="text-red-400 hover:text-red-300 text-sm border border-red-400/30 hover:border-red-300/50 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
        >
          {deleting ? 'Deleting...' : 'Delete Lead'}
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Contact info + Notes */}
        <div className="md:col-span-2 space-y-6">
          {/* Contact info */}
          <div className="bg-[#1e3a5f] rounded-2xl p-6">
            <h2 className="font-bold text-[#f5c518] mb-4 text-sm uppercase tracking-wide">Contact Info</h2>
            <div className="space-y-3">
              <InfoRow label="Name" value={lead.name} />
              <InfoRow label="Email" value={lead.email} href={`mailto:${lead.email}`} />
              <InfoRow label="Phone" value={lead.phone} href={`tel:${lead.phone}`} />
              <InfoRow label="City" value={lead.city} />
              <InfoRow label="Service" value={lead.service} />
              <InfoRow label="Source" value={lead.source} />
              <InfoRow label="Submitted" value={new Date(lead.created_at).toLocaleString()} />
            </div>
            {lead.message && (
              <div className="mt-4 pt-4 border-t border-[#2a4f7a]">
                <div className="text-xs text-blue-300 mb-1 uppercase tracking-wide">Message</div>
                <p className="text-sm text-gray-200 leading-relaxed">{lead.message}</p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-[#1e3a5f] rounded-2xl p-6">
            <h2 className="font-bold text-[#f5c518] mb-4 text-sm uppercase tracking-wide">Notes</h2>
            <div className="space-y-3 mb-4">
              {notes.length === 0 && (
                <p className="text-sm text-blue-300/60 italic">No notes yet.</p>
              )}
              {notes.map(note => (
                <div key={note.id} className="bg-[#0f2340] rounded-lg p-3 border border-[#2a4f7a]">
                  <p className="text-sm text-gray-200 leading-relaxed">{note.content}</p>
                  <p className="text-xs text-blue-400 mt-2">
                    {new Date(note.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <textarea
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              rows={3}
              placeholder="Add a note..."
              className="w-full bg-[#0f2340] border border-[#2a4f7a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#f5c518] placeholder-blue-300/40"
            />
            <button
              onClick={addNote}
              disabled={savingNote || !newNote.trim()}
              className="mt-2 bg-[#f5c518] hover:bg-[#e0b315] text-[#1e3a5f] font-bold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {savingNote ? 'Saving...' : 'Add Note'}
            </button>
          </div>
        </div>

        {/* Right: Lead management */}
        <div className="space-y-4">
          <div className="bg-[#1e3a5f] rounded-2xl p-6 space-y-5">
            <h2 className="font-bold text-[#f5c518] text-sm uppercase tracking-wide">Lead Details</h2>

            <div>
              <label className="block text-xs text-blue-300 mb-1.5 uppercase tracking-wide">Stage</label>
              <select
                value={lead.stage}
                onChange={e => saveLead({ stage: e.target.value })}
                className="w-full bg-[#0f2340] border border-[#2a4f7a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#f5c518]"
              >
                {STAGES.map(s => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-blue-300 mb-1.5 uppercase tracking-wide">Estimated Value ($)</label>
              <input
                type="number"
                defaultValue={lead.estimated_value ?? ''}
                onBlur={e =>
                  saveLead({ estimated_value: e.target.value ? parseFloat(e.target.value) : null })
                }
                placeholder="0"
                className="w-full bg-[#0f2340] border border-[#2a4f7a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#f5c518] placeholder-blue-300/40"
              />
            </div>

            <div>
              <label className="block text-xs text-blue-300 mb-1.5 uppercase tracking-wide">Follow-up Date</label>
              <input
                type="date"
                defaultValue={lead.follow_up_date?.split('T')[0] ?? ''}
                onBlur={e => saveLead({ follow_up_date: e.target.value || null })}
                className="w-full bg-[#0f2340] border border-[#2a4f7a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#f5c518]"
              />
            </div>

            <div>
              <label className="block text-xs text-blue-300 mb-1.5 uppercase tracking-wide">Source</label>
              <select
                value={lead.source || ''}
                onChange={e => saveLead({ source: e.target.value })}
                className="w-full bg-[#0f2340] border border-[#2a4f7a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#f5c518]"
              >
                <option value="">—</option>
                {SOURCES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {savingLead && (
              <p className="text-xs text-blue-300 text-center">Saving...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex gap-3 text-sm">
      <span className="text-blue-300 w-20 flex-shrink-0">{label}</span>
      {href ? (
        <a href={href} className="text-[#f5c518] hover:underline">
          {value}
        </a>
      ) : (
        <span className="text-gray-200">{value}</span>
      )}
    </div>
  );
}

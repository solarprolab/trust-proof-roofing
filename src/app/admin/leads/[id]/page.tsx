'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import QuoteBuilder from '@/components/admin/QuoteBuilder';

const STAGES = [
  { id: 'new', label: 'New Lead' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'estimate_scheduled', label: 'Estimate Scheduled' },
  { id: 'estimate_sent', label: 'Estimate Sent' },
  { id: 'follow_up', label: 'Follow-Up' },
  { id: 'won', label: 'Won' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'lost', label: 'Lost' },
];

const SERVICES = ['Roof Replacement', 'Roof Repair', 'Roof Inspection', 'Emergency Roofing', 'Gutters', 'Storm Damage'];

export default function LeadDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'notes' | 'files' | 'quote'>('details');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/leads/${id}`).then(r => r.json()).then(setLead);
    fetch(`/api/admin/leads/${id}/notes`).then(r => r.json()).then(data => setNotes(Array.isArray(data) ? data : []));
    fetch(`/api/admin/leads/${id}/files`).then(r => r.json()).then(data => setFiles(Array.isArray(data) ? data : []));
  }, [id]);

  async function saveLead() {
    setSaving(true);
    await fetch(`/api/admin/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    });
    setSaving(false);
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
    setNotes(prev => [note, ...prev]);
    setNewNote('');
    setSavingNote(false);
  }

  async function deleteNote(noteId: string) {
    setNotes(prev => prev.filter(n => n.id !== noteId));
    await fetch(`/api/admin/leads/${id}/notes/${noteId}`, { method: 'DELETE' });
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`/api/admin/leads/${id}/files`, { method: 'POST', body: formData });
    const newFile = await res.json();
    if (newFile.id) setFiles(prev => [newFile, ...prev]);
    setUploading(false);
  }

  async function deleteFile(fileId: string) {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    await fetch(`/api/admin/leads/${id}/files/${fileId}`, { method: 'DELETE' });
  }

  async function deleteLead() {
    if (!confirm('Delete this lead? This cannot be undone.')) return;
    await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' });
    router.push('/admin/dashboard');
  }

  if (!lead) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-gray-400">Loading...</div>
    </div>
  );

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
            <h1 className="text-xl font-bold">{lead.name}</h1>
            <p className="text-sm text-gray-400">{lead.email} · {lead.phone}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={lead.stage || 'new'}
            onChange={e => setLead({ ...lead, stage: e.target.value })}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <button
            onClick={saveLead}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 rounded-lg text-sm font-semibold transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={deleteLead}
            className="px-3 py-2 bg-gray-800 hover:bg-red-900/50 border border-gray-700 hover:border-red-700 rounded-lg text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 bg-gray-900 px-6">
        <div className="flex gap-1">
          {(['details', 'notes', 'files'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-blue-500 text-white' : 'border-transparent text-gray-400 hover:text-white'}`}
            >
              {tab}{tab === 'notes' && notes.length > 0 && ` (${notes.length})`}{tab === 'files' && files.length > 0 && ` (${files.length})`}
            </button>
          ))}
          <button
            onClick={() => setActiveTab('quote')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'quote' ? 'border-blue-500 text-white' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Quote Builder
          </button>
        </div>
      </div>

      <div className={`${activeTab === 'quote' ? 'max-w-6xl' : 'max-w-4xl'} mx-auto px-6 py-6`}>
        {/* DETAILS TAB */}
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Contact Info</h2>
              <div className="space-y-4">
                {[
                  { label: 'Full Name', key: 'name', type: 'text' },
                  { label: 'Email', key: 'email', type: 'email' },
                  { label: 'Phone', key: 'phone', type: 'tel' },
                  { label: 'Property Address', key: 'address', type: 'text' },
                  { label: 'City', key: 'city', type: 'text' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-xs text-gray-500 mb-1">{field.label}</label>
                    <input
                      type={field.type}
                      value={lead[field.key] || ''}
                      onChange={e => setLead({ ...lead, [field.key]: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Job Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Service Type</label>
                    <select
                      value={lead.service || ''}
                      onChange={e => setLead({ ...lead, service: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select service...</option>
                      {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  {[
                    { label: 'Roof Size (sq ft)', key: 'roof_size', type: 'text' },
                    { label: 'Quote Amount ($)', key: 'quote_amount', type: 'number' },
                    { label: 'Job Value ($)', key: 'job_value', type: 'number' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-xs text-gray-500 mb-1">{field.label}</label>
                      <input
                        type={field.type}
                        value={lead[field.key] || ''}
                        onChange={e => setLead({ ...lead, [field.key]: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Follow-Up Date</label>
                    <input
                      type="date"
                      value={lead.follow_up_date || ''}
                      onChange={e => setLead({ ...lead, follow_up_date: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Lead Source</label>
                    <select
                      value={lead.source || 'Website Form'}
                      onChange={e => setLead({ ...lead, source: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    >
                      {['Website Form', 'Google LSA', 'Referral', 'Door Knock', 'Yard Sign', 'Social Media', 'Other'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Customer Message</h2>
                <textarea
                  value={lead.message || ''}
                  onChange={e => setLead({ ...lead, message: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* NOTES TAB */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Add a note... (call summary, site visit observations, customer preferences, etc.)"
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 resize-none mb-3"
              />
              <button
                onClick={addNote}
                disabled={savingNote || !newNote.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 rounded-lg text-sm font-semibold transition-colors"
              >
                {savingNote ? 'Adding...' : 'Add Note'}
              </button>
            </div>
            {notes.length === 0 && (
              <div className="text-center py-12 text-gray-500">No notes yet. Add your first note above.</div>
            )}
            {notes.map(note => (
              <div key={note.id} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-white text-sm leading-relaxed">{note.content}</p>
                    <p className="text-xs text-gray-500 mt-2">{note.author} · {new Date(note.created_at).toLocaleString()}</p>
                  </div>
                  <button onClick={() => deleteNote(note.id)} className="text-gray-600 hover:text-red-400 transition-colors ml-4 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* QUOTE TAB */}
        {activeTab === 'quote' && (
          <QuoteBuilder lead={lead} leadId={id as string} />
        )}

        {/* FILES TAB */}
        {activeTab === 'files' && (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-xl border border-gray-800 border-dashed p-8 text-center">
              <svg className="w-10 h-10 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-400 text-sm mb-3">Upload roof photos, contracts, permits, insurance docs</p>
              <label className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold transition-colors inline-block">
                {uploading ? 'Uploading...' : 'Choose File'}
                <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx" />
              </label>
            </div>
            {files.length === 0 && (
              <div className="text-center py-8 text-gray-500">No files uploaded yet.</div>
            )}
            <div className="grid grid-cols-1 gap-3">
              {files.map(file => (
                <div key={file.id} className="bg-gray-900 rounded-xl border border-gray-800 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      {file.file_type?.includes('image') ? '🖼️' : file.file_type?.includes('pdf') ? '📄' : '📎'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{file.file_name}</p>
                      <p className="text-xs text-gray-500">{new Date(file.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">View</a>
                    <button onClick={() => deleteFile(file.id)} className="text-gray-600 hover:text-red-400 transition-colors ml-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

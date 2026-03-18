'use client';
import { useState } from 'react';
import Link from 'next/link';
import KanbanBoard from '../components/KanbanBoard';
import LeadsList from '../components/LeadsList';
import StatsBar from '../components/StatsBar';

const STAGES = [
  { id: 'new', label: 'New Lead', color: 'bg-slate-500' },
  { id: 'contacted', label: 'Contacted', color: 'bg-blue-500' },
  { id: 'estimate_scheduled', label: 'Estimate Scheduled', color: 'bg-violet-500' },
  { id: 'estimate_sent', label: 'Estimate Sent', color: 'bg-yellow-500' },
  { id: 'follow_up', label: 'Follow-Up', color: 'bg-orange-500' },
  { id: 'won', label: 'Won', color: 'bg-green-500' },
  { id: 'completed', label: 'Completed', color: 'bg-emerald-600' },
  { id: 'lost', label: 'Lost', color: 'bg-red-500' },
];

export default function DashboardClient({ leads: initialLeads }: { leads: any[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');

  const filtered = leads.filter(l =>
    l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.email?.toLowerCase().includes(search.toLowerCase()) ||
    l.phone?.includes(search) ||
    l.address?.toLowerCase().includes(search.toLowerCase())
  );

  async function moveStage(leadId: string, newStage: string) {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage } : l));
    await fetch(`/api/admin/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStage }),
    });
  }

  async function deleteLead(leadId: string) {
    if (!confirm('Delete this lead? This cannot be undone.')) return;
    setLeads(prev => prev.filter(l => l.id !== leadId));
    await fetch(`/api/admin/leads/${leadId}`, { method: 'DELETE' });
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-screen-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-white leading-none">Trust Proof Roofing</h1>
              <p className="text-xs text-gray-400">CRM Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-64"
            />
            <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
              <button
                onClick={() => setView('kanban')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'kanban' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Kanban
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                List
              </button>
            </div>
            <form action="/api/admin/logout" method="POST">
              <button className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors">Logout</button>
            </form>
          </div>
        </div>
      </div>

      {/* Stats */}
      <StatsBar leads={leads} />

      {/* Main Content */}
      {view === 'kanban' ? (
        <div className="px-3 py-4">
          <KanbanBoard leads={filtered} stages={STAGES} onMoveStage={moveStage} onDelete={deleteLead} />
        </div>
      ) : (
        <div className="max-w-screen-2xl mx-auto px-4 py-6">
          <LeadsList leads={filtered} stages={STAGES} onMoveStage={moveStage} onDelete={deleteLead} />
        </div>
      )}
    </div>
  );
}

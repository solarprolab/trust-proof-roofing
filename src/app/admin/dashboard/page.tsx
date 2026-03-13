'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Lead = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  service: string;
  stage: string;
  estimated_value: number | null;
  follow_up_date: string | null;
  source: string;
};

const STAGES = ['new', 'contacted', 'quoted', 'won', 'lost'] as const;
const STAGE_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  quoted: 'Quoted',
  won: 'Won',
  lost: 'Lost',
};
const STAGE_HEADER: Record<string, string> = {
  new: 'bg-blue-600',
  contacted: 'bg-amber-500',
  quoted: 'bg-purple-600',
  won: 'bg-green-600',
  lost: 'bg-red-600',
};
const STAGE_BOARD: Record<string, string> = {
  new: 'bg-blue-50 border-blue-200',
  contacted: 'bg-amber-50 border-amber-200',
  quoted: 'bg-purple-50 border-purple-200',
  won: 'bg-green-50 border-green-200',
  lost: 'bg-red-50 border-red-200',
};

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://trustproofroofing.com';
    fetch(`${baseUrl}/api/admin/leads`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setFetchError(data.error);
        } else {
          setLeads(Array.isArray(data) ? data : []);
        }
        setLoading(false);
      })
      .catch(err => {
        setFetchError(String(err));
        setLoading(false);
      });
  }, []);

  function logout() {
    document.cookie = 'admin_auth=; max-age=0; path=/';
    router.push('/admin');
  }

  const pipelineValue = leads
    .filter(l => l.stage !== 'lost')
    .reduce((sum, l) => sum + (l.estimated_value || 0), 0);

  const countByStage = (stage: string) => leads.filter(l => l.stage === stage).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f2340] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-[#0f2340] flex items-center justify-center p-8">
        <div className="bg-red-900/50 border border-red-500 rounded-2xl p-8 max-w-lg w-full">
          <h2 className="text-red-300 font-bold text-lg mb-3">Failed to load leads</h2>
          <p className="text-red-200 text-sm font-mono break-all">{fetchError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-red-500 hover:bg-red-400 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f2340] text-white flex flex-col">
      {/* Header */}
      <div className="bg-[#1e3a5f] border-b border-[#2a4f7a] px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,5 95,40 95,95 5,95 5,40" fill="#1e3a5f" stroke="#f5c518" strokeWidth="3"/>
            <polyline points="28,60 44,76 72,42" stroke="#f5c518" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <div>
            <h1 className="text-lg font-bold leading-none">Trust Proof Roofing</h1>
            <p className="text-xs text-blue-300">CRM Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/leads/new"
            className="bg-[#f5c518] hover:bg-[#e0b315] text-[#1e3a5f] font-bold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            + Add Lead
          </Link>
          <button
            onClick={logout}
            className="text-blue-300 hover:text-white text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-6 py-4 grid grid-cols-3 md:grid-cols-7 gap-3 flex-shrink-0">
        <div className="bg-[#1e3a5f] rounded-xl p-4">
          <div className="text-2xl font-bold">{leads.length}</div>
          <div className="text-xs text-blue-300 mt-1">Total</div>
        </div>
        {STAGES.map(stage => (
          <div key={stage} className="bg-[#1e3a5f] rounded-xl p-4">
            <div className="text-2xl font-bold">{countByStage(stage)}</div>
            <div className="text-xs text-blue-300 mt-1">{STAGE_LABELS[stage]}</div>
          </div>
        ))}
        <div className="bg-[#1e3a5f] rounded-xl p-4">
          <div className="text-xl font-bold text-[#f5c518]">${pipelineValue.toLocaleString()}</div>
          <div className="text-xs text-blue-300 mt-1">Pipeline</div>
        </div>
      </div>

      {/* Kanban */}
      <div className="px-6 pb-6 flex gap-4 overflow-x-auto flex-1">
        {STAGES.map(stage => {
          const stageLeads = leads.filter(l => l.stage === stage);
          return (
            <div key={stage} className="flex-shrink-0 w-72 flex flex-col">
              <div className={`${STAGE_HEADER[stage]} rounded-t-xl px-4 py-3 flex items-center justify-between`}>
                <span className="font-bold text-white text-sm">{STAGE_LABELS[stage]}</span>
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {stageLeads.length}
                </span>
              </div>
              <div
                className={`${STAGE_BOARD[stage]} border rounded-b-xl overflow-y-auto p-3 space-y-3 flex-1`}
                style={{ minHeight: '300px', maxHeight: 'calc(100vh - 280px)' }}
              >
                {stageLeads.length === 0 && (
                  <p className="text-gray-400 text-sm text-center pt-8">No leads</p>
                )}
                {stageLeads.map(lead => (
                  <Link key={lead.id} href={`/admin/leads/${lead.id}`}>
                    <div className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 mb-3">
                      <div className="font-semibold text-gray-900 text-sm">{lead.name}</div>
                      {lead.city && (
                        <div className="text-xs text-gray-500 mt-0.5">{lead.city}</div>
                      )}
                      {lead.service && (
                        <div className="text-xs bg-blue-50 text-blue-700 rounded px-2 py-0.5 mt-1.5 inline-block">
                          {lead.service}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-2">{lead.phone}</div>
                      {lead.estimated_value ? (
                        <div className="text-xs text-green-700 font-semibold mt-1">
                          ${lead.estimated_value.toLocaleString()}
                        </div>
                      ) : null}
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

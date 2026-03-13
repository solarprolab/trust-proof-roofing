import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import KanbanBoard from '../components/KanbanBoard';
import LogoutButton from '../components/LogoutButton';

const STAGES = ['new', 'contacted', 'quoted', 'won', 'lost'] as const;
const STAGE_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  quoted: 'Quoted',
  won: 'Won',
  lost: 'Lost',
};

export default async function Dashboard() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f2340] flex items-center justify-center p-8">
        <div className="bg-red-900/50 border border-red-500 rounded-2xl p-8 max-w-lg w-full">
          <h2 className="text-red-300 font-bold text-lg mb-3">Failed to load leads</h2>
          <p className="text-red-200 text-sm font-mono break-all">{error.message}</p>
        </div>
      </div>
    );
  }

  const safeLeads = leads ?? [];

  const pipelineValue = safeLeads
    .filter(l => l.stage !== 'lost')
    .reduce((sum: number, l: { estimated_value: number | null }) => sum + (l.estimated_value || 0), 0);

  const countByStage = (stage: string) => safeLeads.filter((l: { stage: string }) => l.stage === stage).length;

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
          <LogoutButton />
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-6 py-4 grid grid-cols-3 md:grid-cols-7 gap-3 flex-shrink-0">
        <div className="bg-[#1e3a5f] rounded-xl p-4">
          <div className="text-2xl font-bold">{safeLeads.length}</div>
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
      <KanbanBoard leads={safeLeads} />
    </div>
  );
}

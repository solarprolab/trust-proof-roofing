'use client';
import Link from 'next/link';

export type Lead = {
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

export default function KanbanBoard({ leads }: { leads: Lead[] }) {
  return (
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
  );
}

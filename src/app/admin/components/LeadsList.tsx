'use client';
import Link from 'next/link';

export default function LeadsList({ leads, stages, onMoveStage, onDelete }: any) {
  const stageMap = Object.fromEntries(stages.map((s: any) => [s.id, s]));

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase">
            <th className="text-left px-4 py-3 font-medium">Name</th>
            <th className="text-left px-4 py-3 font-medium">Contact</th>
            <th className="text-left px-4 py-3 font-medium">Service</th>
            <th className="text-left px-4 py-3 font-medium">Stage</th>
            <th className="text-left px-4 py-3 font-medium">Quote</th>
            <th className="text-left px-4 py-3 font-medium">Follow-Up</th>
            <th className="text-left px-4 py-3 font-medium">Date</th>
            <th className="text-left px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead: any) => {
            const stage = stageMap[lead.stage || 'new'];
            return (
              <tr key={lead.id} className="border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/admin/leads/${lead.id}`} className="font-semibold text-white hover:text-blue-400 transition-colors">
                    {lead.name}
                  </Link>
                  {lead.address && <p className="text-xs text-gray-500">{lead.address}</p>}
                </td>
                <td className="px-4 py-3">
                  <p className="text-gray-300">{lead.phone}</p>
                  <p className="text-gray-500 text-xs">{lead.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-300">{lead.service || '—'}</td>
                <td className="px-4 py-3">
                  <select
                    value={lead.stage || 'new'}
                    onChange={e => onMoveStage(lead.id, e.target.value)}
                    className="text-xs bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    {stages.map((s: any) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-green-400 font-semibold">
                  {lead.quote_amount ? `$${Number(lead.quote_amount).toLocaleString()}` : '—'}
                </td>
                <td className="px-4 py-3 text-orange-400 text-xs">
                  {lead.follow_up_date ? new Date(lead.follow_up_date).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(lead.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button onClick={() => onDelete(lead.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {leads.length === 0 && (
        <div className="text-center py-16 text-gray-500">No leads found</div>
      )}
    </div>
  );
}

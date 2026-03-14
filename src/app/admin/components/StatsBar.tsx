'use client';
export default function StatsBar({ leads }: { leads: any[] }) {
  const total = leads.length;
  const won = leads.filter(l => l.stage === 'won' || l.stage === 'completed').length;
  const lost = leads.filter(l => l.stage === 'lost').length;
  const active = leads.filter(l => !['won', 'completed', 'lost'].includes(l.stage)).length;
  const revenue = leads.filter(l => l.stage === 'won' || l.stage === 'completed').reduce((sum, l) => sum + (Number(l.job_value) || 0), 0);
  const pipeline = leads.filter(l => !['lost'].includes(l.stage)).reduce((sum, l) => sum + (Number(l.quote_amount) || 0), 0);
  const convRate = total > 0 ? Math.round((won / total) * 100) : 0;

  const stats = [
    { label: 'Total Leads', value: total, color: 'text-white' },
    { label: 'Active', value: active, color: 'text-blue-400' },
    { label: 'Won / Completed', value: won, color: 'text-green-400' },
    { label: 'Lost', value: lost, color: 'text-red-400' },
    { label: 'Conversion Rate', value: `${convRate}%`, color: 'text-yellow-400' },
    { label: 'Revenue Closed', value: `$${revenue.toLocaleString()}`, color: 'text-emerald-400' },
    { label: 'Pipeline Value', value: `$${pipeline.toLocaleString()}`, color: 'text-violet-400' },
  ];

  return (
    <div className="border-b border-gray-800 bg-gray-900">
      <div className="max-w-screen-2xl mx-auto px-4 py-3 flex gap-6 overflow-x-auto">
        {stats.map(s => (
          <div key={s.label} className="flex-shrink-0">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

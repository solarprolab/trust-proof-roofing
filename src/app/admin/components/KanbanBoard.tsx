'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function KanbanBoard({ leads, stages, onMoveStage, onDelete }: any) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  function handleDragStart(e: React.DragEvent, leadId: string) {
    setDraggingId(leadId);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e: React.DragEvent, stageId: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stageId);
  }

  function handleDrop(e: React.DragEvent, stageId: string) {
    e.preventDefault();
    if (draggingId) onMoveStage(draggingId, stageId);
    setDraggingId(null);
    setDragOverStage(null);
  }

  return (
    <div className="flex flex-row gap-2 w-full overflow-x-hidden pb-4" style={{ minHeight: '70vh' }}>
      {stages.map((stage: any) => {
        const stageLeads = leads.filter((l: any) => (l.stage || 'new') === stage.id);
        const isOver = dragOverStage === stage.id;
        return (
          <div
            key={stage.id}
            className={`flex flex-col rounded-xl border transition-colors ${isOver ? 'border-blue-500 bg-gray-800/80' : 'border-gray-800 bg-gray-900'}`}
            style={{ flex: '1 1 0', minWidth: 120, maxWidth: '100%' }}
            onDragOver={e => handleDragOver(e, stage.id)}
            onDrop={e => handleDrop(e, stage.id)}
            onDragLeave={() => setDragOverStage(null)}
          >
            <div className="p-2 border-b border-gray-800 flex items-center justify-between gap-1 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${stage.color}`} />
                <span className="text-xs font-semibold text-white truncate">{stage.label}</span>
              </div>
              <span className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-full flex-shrink-0">{stageLeads.length}</span>
            </div>
            <div className="p-2 flex flex-col gap-2 min-h-32">
              {stageLeads.map((lead: any) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={e => handleDragStart(e, lead.id)}
                  className={`bg-gray-800 border border-gray-700 rounded-lg p-2 cursor-grab active:cursor-grabbing hover:border-gray-600 transition-all min-w-0 ${draggingId === lead.id ? 'opacity-40' : ''}`}
                >
                  <div className="flex items-start justify-between mb-1 gap-1 min-w-0">
                    <Link href={`/admin/leads/${lead.id}`} className="font-semibold text-xs text-white hover:text-blue-400 transition-colors leading-tight truncate">
                      {lead.name}
                    </Link>
                    <button onClick={() => onDelete(lead.id)} className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 truncate">{lead.phone || lead.email}</p>
                  {lead.address && <p className="text-[10px] text-gray-500 truncate">{lead.address}</p>}
                  {lead.service && <p className="text-[10px] text-blue-400 truncate mt-0.5">{lead.service}</p>}
                  {lead.quote_amount && <p className="text-[10px] text-green-400 font-semibold mt-0.5">${Number(lead.quote_amount).toLocaleString()}</p>}
                  {lead.follow_up_date && (
                    <p className="text-[10px] text-orange-400 mt-0.5">📅 {new Date(lead.follow_up_date).toLocaleDateString()}</p>
                  )}
                  <p className="text-[10px] text-gray-600 mt-1">{new Date(lead.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

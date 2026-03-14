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
    <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: '70vh' }}>
      {stages.map((stage: any) => {
        const stageLeads = leads.filter((l: any) => (l.stage || 'new') === stage.id);
        const isOver = dragOverStage === stage.id;
        return (
          <div
            key={stage.id}
            className={`flex-shrink-0 w-64 rounded-xl border transition-colors ${isOver ? 'border-blue-500 bg-gray-800/80' : 'border-gray-800 bg-gray-900'}`}
            onDragOver={e => handleDragOver(e, stage.id)}
            onDrop={e => handleDrop(e, stage.id)}
            onDragLeave={() => setDragOverStage(null)}
          >
            <div className="p-3 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                <span className="text-sm font-semibold text-white">{stage.label}</span>
              </div>
              <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{stageLeads.length}</span>
            </div>
            <div className="p-2 flex flex-col gap-2 min-h-32">
              {stageLeads.map((lead: any) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={e => handleDragStart(e, lead.id)}
                  className={`bg-gray-800 border border-gray-700 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-gray-600 transition-all ${draggingId === lead.id ? 'opacity-40' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Link href={`/admin/leads/${lead.id}`} className="font-semibold text-sm text-white hover:text-blue-400 transition-colors leading-tight">
                      {lead.name}
                    </Link>
                    <button onClick={() => onDelete(lead.id)} className="text-gray-600 hover:text-red-400 transition-colors ml-2 flex-shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{lead.phone || lead.email}</p>
                  {lead.address && <p className="text-xs text-gray-500 truncate">{lead.address}</p>}
                  {lead.service && <p className="text-xs text-blue-400 mt-1">{lead.service}</p>}
                  {lead.quote_amount && <p className="text-xs text-green-400 font-semibold mt-1">${Number(lead.quote_amount).toLocaleString()}</p>}
                  {lead.follow_up_date && (
                    <p className="text-xs text-orange-400 mt-1">📅 {new Date(lead.follow_up_date).toLocaleDateString()}</p>
                  )}
                  <p className="text-xs text-gray-600 mt-2">{new Date(lead.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

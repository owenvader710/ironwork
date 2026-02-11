import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function StatusSection({
  title,
  status,
  count,
  icon,
  projectsList,
  collapsedSections,
  onToggle,
  renderCard,
}) {
  const isCollapsed = collapsedSections[status];

  return (
    <div className="mb-6">
      <button
        onClick={() => onToggle(status)}
        className={`w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 shadow-sm mb-3 transition-all hover:bg-gray-50 ${isCollapsed ? 'opacity-80' : 'opacity-100'}`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${status === 'Blocked' ? 'bg-red-50 text-red-500' : status === 'Completed' ? 'bg-emerald-50 text-emerald-500' : 'bg-indigo-50 text-indigo-500'}`}>
            {icon}
          </div>
          <div className="text-left">
            <span className="text-sm font-black uppercase tracking-tight">{title}</span>
            <span className="ml-2 text-[11px] font-black text-gray-400">({count})</span>
          </div>
        </div>
        {isCollapsed ? (
          <ChevronDown size={20} className="text-gray-400" />
        ) : (
          <ChevronUp size={20} className="text-gray-400" />
        )}
      </button>

      {!isCollapsed && (
        <div className="space-y-4 pl-2 animate-in fade-in slide-in-from-top-2 duration-300">
          {projectsList.length > 0 ? (
            projectsList.map(renderCard)
          ) : (
            <div className="p-10 text-center bg-gray-50/50 rounded-[30px] border-2 border-dashed border-gray-100">
              <p className="text-[10px] font-black uppercase text-gray-300 tracking-widest">ไม่มีรายการงานในสถานะนี้</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

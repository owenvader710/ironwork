import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Clock,
  History,
  MessageSquareWarning,
  Square,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  getDeadlineInfo,
  VIDEO_SUB_STEPS,
} from '../../context/AppDataContext.jsx';

export default function ProjectCard({
  project,
  isUrgent = false,
  isCompact = false,
  isMyWork = false,
  isSelected = false,
  onToggleSelect,
  onOpenUpdate,
  onRequestStatus,
  onOpenBlocked,
  onApprove,
  onReject,
  onDelete,
}) {
  const { currentUser } = useAuth();
  const isVideo = project.type === 'Video';
  const [showSubMenu, setShowSubMenu] = useState(false);
  const displayProgress = project.status === 'Completed' ? 100 : Math.min(project.progress || 0, 99);
  const isPending = !!project.pendingApproval;
  const dInfo = useMemo(() => getDeadlineInfo(project.deadline, project.status), [project.deadline, project.status]);

  return (
    <div
      className={`bg-white rounded-3xl shadow-sm border transition-all relative group ${
        isPending ? 'border-amber-200 bg-amber-50/20' : 'border-gray-50'
      } ${isSelected ? 'ring-2 ring-black border-black' : ''} ${
        isUrgent ? 'border-l-4 border-l-red-500 shadow-md' : ''
      } ${isCompact ? 'p-4' : 'p-6'}`}
    >
      {isPending && (
        <div className="absolute -top-3 left-6 bg-amber-500 text-white text-[9px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg z-10 animate-bounce">
          <Clock size={10} /> รออนุมัติการเปลี่ยนสถานะ
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1 min-w-0 flex items-start gap-4">
          {isMyWork && !isCompact && (
            <button
              onClick={() => onToggleSelect?.(project.id)}
              className={`shrink-0 mt-1 transition-colors ${
                isSelected ? 'text-black' : 'text-gray-200 hover:text-gray-400'
              }`}
            >
              {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
            </button>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-2">
              <span
                className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                  project.type === 'Graphic'
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-purple-50 text-purple-600'
                }`}
              >
                {project.type}
              </span>

              {project.videoQuality && (
                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-50 text-amber-600 uppercase">
                  quality: {project.videoQuality}
                </span>
              )}

              {!isCompact && (
                <span className="text-[10px] text-gray-500 font-bold bg-gray-50 px-2 py-0.5 rounded italic">
                  #{project.projectId || 'n/a'}
                </span>
              )}

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 font-bold flex items-center">
                  <CalendarDays size={12} className="mr-1" /> {project.deadline}
                </span>
                {dInfo.type === 'overdue' && (
                  <span className="text-[9px] bg-red-50 text-red-500 px-2 py-0.5 rounded font-black uppercase tracking-tighter flex items-center gap-1">
                    <AlertCircle size={10} /> overdue d+{dInfo.days}
                  </span>
                )}
                {dInfo.type === 'due-soon' && (
                  <span className="text-[9px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-black uppercase tracking-tighter flex items-center gap-1">
                    <History size={10} /> due soon d-{dInfo.days}
                  </span>
                )}
              </div>

              {!isMyWork && !isCompact && (
                <span className="text-[10px] text-indigo-500 font-black flex items-center">
                  <UserCircle size={12} className="mr-1" /> {project.assignedTo}
                </span>
              )}
            </div>

            <h3 className={`${isCompact ? 'text-sm' : 'text-lg'} font-black text-gray-900 truncate flex items-center gap-2`}
            >
              {project.name}
              {project.status === 'Blocked' && (
                <div className="flex items-center gap-1 bg-red-50 text-red-500 px-2 py-0.5 rounded-lg text-[10px] animate-pulse">
                  <AlertTriangle size={10} /> {project.blockedReasonPreset}
                </div>
              )}
            </h3>

            {!isCompact && (
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => onOpenUpdate?.(project)}
                  className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-300 hover:text-indigo-500 transition-all flex items-center gap-1.5"
                  title="อัปเดตงาน"
                >
                  <MessageSquareWarning size={14} />
                  <span className="text-[10px] font-black uppercase tracking-tighter">update</span>
                </button>
                {project.updates && project.updates.length > 0 && (
                  <span className="text-[10px] text-gray-400 font-bold italic truncate">
                    ล่าสุด: {String(project.updates[0].message)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={`flex flex-col md:items-center space-y-4 ${isCompact ? 'md:w-32' : 'md:w-64'}`}>
          <div className="relative w-full">
            <button
              disabled={isPending && currentUser?.role !== 'Leader'}
              onClick={() => setShowSubMenu((v) => !v)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border transition-all ${
                isPending ? 'opacity-70 grayscale' : ''
              } ${
                project.status === 'Completed'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                  : project.status === 'Blocked'
                    ? 'bg-red-50 border-red-100 text-red-600'
                    : 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-white'
              }`}
            >
              <div className="flex items-center space-x-2 text-[11px] font-black uppercase text-left">
                <div
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    project.status === 'Completed'
                      ? 'bg-emerald-500'
                      : project.status === 'Blocked'
                        ? 'bg-red-500'
                        : 'bg-amber-400'
                  }`}
                />
                <span className="truncate">
                  {project.status === 'Completed'
                    ? 'เสร็จสิ้น'
                    : project.status === 'Blocked'
                      ? 'ติดปัญหา'
                      : project.status === 'In Progress'
                        ? `ทำ ${project.subStatus ? `(${project.subStatus})` : ''}`
                        : 'สั่งงาน'}
                </span>
              </div>
              {!isCompact && <ChevronDown size={14} className="shrink-0" />}
            </button>

            {showSubMenu && !isCompact && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 shadow-2xl rounded-2xl p-2 z-[60]">
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      onRequestStatus?.(project.id, 'To Do');
                      setShowSubMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-black text-gray-400 hover:bg-gray-50 uppercase flex items-center"
                  >
                    <Clock size={14} className="mr-2" /> 1. สั่งงาน
                  </button>

                  <div className="relative">
                    <button
                      onClick={(e) => e.preventDefault()}
                      className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-black text-indigo-600 bg-indigo-50/50 flex items-center justify-between uppercase"
                    >
                      <div className="flex items-center">
                        <Zap size={14} className="mr-2 fill-indigo-600" /> 2. ดำเนินการ
                      </div>
                      <ChevronRight size={14} />
                    </button>
                    <div className="pl-6 pt-1 space-y-1">
                      {(isVideo ? VIDEO_SUB_STEPS : ['กำลังออกแบบ', 'รอตรวจ', 'แก้ไข']).map((step, idx) => (
                        <button
                          key={step}
                          onClick={() => {
                            onRequestStatus?.(project.id, 'In Progress', step, (idx + 1) * 20);
                            setShowSubMenu(false);
                          }}
                          className="w-full text-left px-3 py-1.5 rounded-lg text-[10px] font-black uppercase text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                        >
                          2.{idx + 1} {step}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onRequestStatus?.(project.id, 'Completed');
                      setShowSubMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-black text-emerald-600 hover:bg-emerald-50 uppercase flex items-center"
                  >
                    <CheckCircle2 size={14} className="mr-2" /> 3. ปิดโปรเจกต์
                  </button>

                  <button
                    onClick={() => {
                      onOpenBlocked?.(project);
                      setShowSubMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-black text-red-600 hover:bg-red-50 uppercase flex items-center border-t border-gray-50 mt-1"
                  >
                    <AlertTriangle size={14} className="mr-2" /> 4. ติดปัญหา
                  </button>
                </div>
              </div>
            )}
          </div>

          {!isCompact && (
            <div className="w-full px-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black text-gray-400">progress</span>
                <span
                  className={`text-[10px] font-black ${
                    displayProgress === 100
                      ? 'text-emerald-500'
                      : project.status === 'Blocked'
                        ? 'text-red-500'
                        : 'text-gray-900'
                  }`}
                >
                  {displayProgress}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-700 relative"
                  style={{
                    width: `${displayProgress}%`,
                    backgroundColor:
                      project.status === 'Completed'
                        ? '#10b981'
                        : project.status === 'Blocked'
                          ? '#ef4444'
                          : 'black',
                  }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
            </div>
          )}
        </div>

        {!isCompact && (
          <div className="flex md:flex-col items-center justify-end gap-2">
            {isPending && currentUser?.role === 'Leader' && (
              <div className="flex gap-2">
                <button
                  onClick={() => onApprove?.(project.id)}
                  className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-md"
                  title="อนุมัติ"
                >
                  <ThumbsUp size={16} />
                </button>
                <button
                  onClick={() => onReject?.(project.id)}
                  className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-md"
                  title="ไม่อนุมัติ"
                >
                  <ThumbsDown size={16} />
                </button>
              </div>
            )}

            {currentUser?.role === 'Leader' && (
              <button
                onClick={() => onDelete?.(project.id)}
                className="p-2.5 text-gray-300 hover:text-red-500 rounded-xl transition-all"
                title="ลบ"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRightCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Folder,
  History,
  MessageSquareWarning,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  UserCircle,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { formatTimeAgo, getDeadlineInfo, useAppData } from '../context/AppDataContext.jsx';
import ProjectCard from '../components/projects/project-card.jsx';
import CreateProjectModal from '../components/modals/create-project-modal.jsx';
import QuickUpdateModal from '../components/modals/quick-update-modal.jsx';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { projects, approveStatus, rejectStatus } = useAppData();
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);

  const stats = useMemo(() => {
    const overdueCount = projects.filter(p => getDeadlineInfo(p.deadline, p.status).type === 'overdue').length;
    const dueSoonCount = projects.filter(p => getDeadlineInfo(p.deadline, p.status).type === 'due-soon').length;

    return {
      total: projects.length,
      inProgress: projects.filter(p => p.status === 'In Progress').length,
      completed: projects.filter(p => p.status === 'Completed').length,
      blocked: projects.filter(p => p.status === 'Blocked').length,
      pending: projects.filter(p => p.pendingApproval).length,
      overdue: overdueCount,
      dueSoon: dueSoonCount,
    };
  }, [projects]);

  const userStats = useMemo(() => {
    if (!currentUser) return { total: 0, inProgress: 0, completedPercent: 0 };
    const myTasks = projects.filter(p => p.assignedTo === currentUser.name);
    const myCompleted = myTasks.filter(p => p.status === 'Completed').length;
    return {
      total: myTasks.length,
      inProgress: myTasks.filter(p => p.status === 'In Progress').length,
      completedPercent: myTasks.length > 0 ? Math.round((myCompleted / myTasks.length) * 100) : 0,
    };
  }, [projects, currentUser]);

  const manageNowTasks = useMemo(() => {
    if (!currentUser) return [];
    return projects
      .filter(p => p.assignedTo === currentUser.name && p.status !== 'Completed')
      .filter(p => {
        const dInfo = getDeadlineInfo(p.deadline, p.status);
        return dInfo.type === 'overdue' || dInfo.type === 'due-soon' || p.status === 'Blocked';
      })
      .slice(0, 5);
  }, [projects, currentUser]);

  const recentUpdates = useMemo(() => {
    const allUpdates = [];
    projects.forEach(p => {
      (p.updates || []).forEach(u => {
        allUpdates.push({ ...u, projectName: p.name });
      });
    });
    return allUpdates
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [projects]);

  const pendingApprovals = useMemo(() => projects.filter(p => p.pendingApproval), [projects]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
      <div className="lg:col-span-2 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm group hover:border-black transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Folder size={16} /></div>
              <p className="text-2xl font-black text-gray-900">{userStats.total}</p>
            </div>
            <p className="text-gray-400 text-[9px] uppercase font-black tracking-widest">งานของฉันทั้งหมด</p>
          </div>
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm group hover:border-black transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Clock size={16} /></div>
              <p className="text-2xl font-black text-gray-900">{userStats.inProgress}</p>
            </div>
            <p className="text-gray-400 text-[9px] uppercase font-black tracking-widest">กำลังดำเนินการ</p>
          </div>
          <div className="bg-black p-6 rounded-[32px] shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-white/10 text-white rounded-xl"><CheckCircle2 size={16} /></div>
                <p className="text-2xl font-black text-white">{userStats.completedPercent}%</p>
              </div>
              <p className="text-gray-400 text-[9px] uppercase font-black tracking-widest">ความสำเร็จของฉัน</p>
            </div>
            <div className="absolute bottom-0 left-0 h-1 bg-[#e5ff48]" style={{ width: `${userStats.completedPercent}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'ภาพรวมงาน', value: stats.total, icon: <Folder size={18} /> },
            { label: 'กำลังทำ', value: stats.inProgress, icon: <Clock size={18} /> },
            { label: 'เสร็จสิ้น', value: stats.completed, icon: <CheckCircle2 size={18} /> },
            { label: 'ติดปัญหา', value: stats.blocked, icon: <AlertTriangle size={18} />, isAlert: stats.blocked > 0 },
          ].map((item, i) => (
            <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-black transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.isAlert ? 'bg-red-50 text-red-500' : 'bg-[#e5ff48] text-black'}`}>{item.icon}</div>
                <p className={`text-2xl font-black ${item.isAlert ? 'text-red-500' : 'text-gray-900'}`}>{item.value}</p>
              </div>
              <p className="text-gray-400 text-[9px] uppercase font-black tracking-widest leading-tight">{item.label}</p>
            </div>
          ))}
        </div>

        {manageNowTasks.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-red-500 rounded-full" />
                <div>
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">วันนี้ต้องทำอะไร</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">focus on your most urgent tasks</p>
                </div>
              </div>
              <a href="/mywork" className="text-[10px] font-black text-indigo-600 uppercase flex items-center gap-1 hover:underline">
                ดูทั้งหมด <ChevronRight size={14} />
              </a>
            </div>
            <div className="space-y-3">
              {manageNowTasks.map(p => (
                <ProjectCard key={`focus-${p.id}`} project={p} isCompact={true} isUrgent={p.status === 'Blocked' || getDeadlineInfo(p.deadline, p.status).type === 'overdue'} />
              ))}
            </div>
          </div>
        )}

        <div className="bg-[#18181b] text-white p-8 rounded-[40px] shadow-2xl h-64 flex items-center justify-center">
          <p className="text-gray-500 text-xs font-black uppercase tracking-widest">performance analytics chart</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white rounded-[40px] p-6 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-4">quick actions</h3>
          <div className="space-y-3">
            <button onClick={() => setOpenUpdate(true)} className="w-full flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-3xl transition-all group">
              <div className="flex items-center gap-3">
                <MessageSquareWarning size={18} />
                <span className="text-xs font-black uppercase tracking-tight">อัปเดตงาน</span>
              </div>
              <ArrowRightCircle size={18} className="opacity-0 group-hover:opacity-100 transition-all" />
            </button>
            <a href="/mywork" className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-3xl transition-all group">
              <div className="flex items-center gap-3">
                <UserCircle size={18} />
                <span className="text-xs font-black uppercase tracking-tight">ไปที่งานของฉัน</span>
              </div>
              <ArrowRightCircle size={18} className="opacity-0 group-hover:opacity-100 transition-all" />
            </a>
            {currentUser?.role === 'Leader' && (
              <button onClick={() => setOpenCreate(true)} className="w-full flex items-center justify-between p-4 bg-[#e5ff48] hover:bg-[#d4ed3a] text-black rounded-3xl transition-all group">
                <div className="flex items-center gap-3">
                  <Folder size={18} />
                  <span className="text-xs font-black uppercase tracking-tight">สั่งงานใหม่</span>
                </div>
                <ArrowRightCircle size={18} className="opacity-0 group-hover:opacity-100 transition-all" />
              </button>
            )}
          </div>
        </div>

        {currentUser?.role === 'Leader' && pendingApprovals.length > 0 && (
          <div className="bg-white rounded-[40px] p-6 border-2 border-amber-100 shadow-xl shadow-amber-50/50 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><ShieldCheck size={20} /></div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">รออนุมัติ ({pendingApprovals.length})</h3>
              </div>
            </div>

            <div className="space-y-3">
              {pendingApprovals.map(p => (
                <div key={`pending-${p.id}`} className="p-4 bg-amber-50/30 rounded-3xl border border-amber-100/50 hover:bg-white hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${p.type === 'Graphic' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>{p.type}</span>
                    <span className="text-[9px] text-gray-400 font-bold italic">#{p.projectId}</span>
                  </div>
                  <p className="text-xs font-black text-gray-900 mb-1 truncate">{p.name}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <UserCircle size={10} className="text-gray-400" />
                    <span className="text-[9px] font-bold text-gray-500">{p.assignedTo}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4 p-2 bg-white/60 rounded-xl border border-white">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{p.status}</span>
                    <Zap size={10} className="text-amber-500" />
                    <span className="text-[9px] font-black text-amber-600 uppercase tracking-tighter">
                      {p.pendingApproval.status} {p.pendingApproval.subStatus && `(${p.pendingApproval.subStatus})`}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => approveStatus(p.id)} className="py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-1.5"><ThumbsUp size={12} /> อนุมัติ</button>
                    <button onClick={() => rejectStatus(p.id)} className="py-2 bg-white text-gray-400 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-1.5"><ThumbsDown size={12} /> ตีกลับ</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-[40px] p-6 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-6">activity logs</h3>
          <div className="space-y-4">
            {recentUpdates.length > 0 ? (
              recentUpdates.map(u => {
                const isAboutMe = u.author === currentUser.name || u.assignedTo === currentUser.name;
                return (
                  <div key={u.id} className={`p-3 rounded-2xl border border-transparent transition-all ${isAboutMe ? 'bg-emerald-50/50 border-emerald-100' : ''}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-black uppercase ${isAboutMe ? 'text-emerald-600' : 'text-indigo-500'}`}>{u.projectName}</span>
                      {isAboutMe && <span className="text-[8px] font-black bg-[#e5ff48] text-black px-1.5 py-0.5 rounded uppercase tracking-tighter">เกี่ยวกับคุณ</span>}
                    </div>
                    <p className="text-[10px] font-bold text-gray-700">{u.message}</p>
                    <p className="text-[8px] text-gray-400 mt-1 uppercase font-black">{formatTimeAgo(u.createdAt)} โดย {u.author}</p>
                  </div>
                );
              })
            ) : (
              <p className="text-[10px] text-gray-300 font-black uppercase text-center py-10">ไม่มีกิจกรรมล่าสุด</p>
            )}
          </div>
        </div>
      </div>

      <CreateProjectModal open={openCreate} onClose={() => setOpenCreate(false)} />
      <QuickUpdateModal open={openUpdate} onClose={() => setOpenUpdate(false)} />
    </div>
  );
}

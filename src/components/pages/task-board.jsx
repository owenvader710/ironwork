import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Clock,
  MessageSquareWarning,
  Plus,
  Search,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getDeadlineInfo, useAppData } from '../../context/AppDataContext.jsx';
import ProjectCard from '../projects/project-card.jsx';
import StatusSection from '../projects/status-section.jsx';
import CreateProjectModal from '../modals/create-project-modal.jsx';
import QuickUpdateModal from '../modals/quick-update-modal.jsx';

export default function TaskBoard({ mode }) {
  const { currentUser } = useAuth();
  const {
    projects,
    getCollapsedSections,
    setCollapsedSections,
  } = useAppData();

  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [personalFilter, setPersonalFilter] = useState('All');
  const [selectedTasks, setSelectedTasks] = useState([]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  const collapsedSections = getCollapsedSections();

  const displayProjects = useMemo(() => {
    let filtered = projects;

    if (mode === 'mine' && currentUser) {
      filtered = filtered.filter((p) => p.assignedTo === currentUser.name);

      if (personalFilter === 'Today') {
        const today = new Date().toISOString().split('T')[0];
        filtered = filtered.filter((p) => p.deadline === today);
      } else if (personalFilter === 'Tomorrow') {
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        filtered = filtered.filter((p) => p.deadline === tomorrow);
      } else if (personalFilter === 'Overdue') {
        filtered = filtered.filter((p) => getDeadlineInfo(p.deadline, p.status).type === 'overdue');
      } else if (personalFilter === 'Blocked') {
        filtered = filtered.filter((p) => p.status === 'Blocked');
      }
    } else {
      if (deptFilter !== 'All') {
        filtered = filtered.filter((p) => p.type === deptFilter);
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (q.startsWith('overdue:')) {
        filtered = filtered.filter((p) => getDeadlineInfo(p.deadline, p.status).type === 'overdue');
      } else if (q.startsWith('due:')) {
        filtered = filtered.filter((p) => getDeadlineInfo(p.deadline, p.status).type === 'due-soon');
      } else {
        filtered = filtered.filter(
          (p) => p.name.toLowerCase().includes(q) || (p.projectId && p.projectId.toLowerCase().includes(q))
        );
      }
    }

    return filtered;
  }, [projects, mode, currentUser, personalFilter, deptFilter, searchQuery]);

  const toggleSection = (status) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  const renderCard = (p) => (
    <ProjectCard
      key={p.id}
      project={p}
      mode={mode}
      selectedTasks={selectedTasks}
      setSelectedTasks={setSelectedTasks}
    />
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-32">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="ค้นหาโปรเจกต์... (overdue: / due:)"
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold shadow-sm outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              onClick={() => setIsUpdateOpen(true)}
              className="px-5 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-sm uppercase tracking-tight flex items-center space-x-2 shrink-0 hover:bg-indigo-100 transition-colors"
            >
              <MessageSquareWarning size={18} />
              <span className="hidden sm:inline">อัปเดตงาน</span>
            </button>
          </div>

          {currentUser?.role === 'Leader' && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-6 py-3 bg-[#e5ff48] text-black rounded-2xl font-black text-sm uppercase tracking-tight flex items-center space-x-2 shadow-lg shadow-lime-100 transition-transform active:scale-95"
            >
              <Plus size={18} strokeWidth={3} />
              <span>สั่งงานใหม่</span>
            </button>
          )}
        </div>

        {mode === 'mine' ? (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2 shrink-0">
              personal focus:
            </span>
            {[
              { id: 'All', label: 'ทั้งหมด' },
              { id: 'Today', label: 'ส่งวันนี้', icon: <Clock size={12} /> },
              { id: 'Tomorrow', label: 'ส่งพรุ่งนี้', icon: <CalendarIcon size={12} /> },
              {
                id: 'Overdue',
                label: 'เกินกำหนด',
                icon: <AlertCircle size={12} className="text-red-500" />,
              },
              {
                id: 'Blocked',
                label: 'ติดปัญหา',
                icon: <AlertTriangle size={12} className="text-amber-600" />,
              },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setPersonalFilter(f.id)}
                className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-2 flex items-center gap-2 shrink-0 ${
                  personalFilter === f.id
                    ? 'bg-black text-white border-black shadow-lg shadow-gray-200'
                    : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                }`}
              >
                {f.icon}
                {f.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2 shrink-0">
              filter department:
            </span>
            {['All', 'Graphic', 'Video'].map((dept) => (
              <button
                key={dept}
                onClick={() => setDeptFilter(dept)}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                  deptFilter === dept
                    ? 'bg-black text-white border-black shadow-lg shadow-gray-200'
                    : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                }`}
              >
                {dept === 'All' ? 'ทั้งหมด' : dept}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <StatusSection
          title="สั่งงาน (to do)"
          status="To Do"
          count={displayProjects.filter((p) => p.status === 'To Do').length}
          icon={<Clock size={18} />}
          projectsList={displayProjects.filter((p) => p.status === 'To Do')}
          collapsedSections={collapsedSections}
          onToggle={toggleSection}
          renderCard={renderCard}
        />
        <StatusSection
          title="ดำเนินการ (in progress)"
          status="In Progress"
          count={displayProjects.filter((p) => p.status === 'In Progress').length}
          icon={<Zap size={18} />}
          projectsList={displayProjects.filter((p) => p.status === 'In Progress')}
          collapsedSections={collapsedSections}
          onToggle={toggleSection}
          renderCard={renderCard}
        />
        <StatusSection
          title="ติดปัญหา (blocked)"
          status="Blocked"
          count={displayProjects.filter((p) => p.status === 'Blocked').length}
          icon={<AlertTriangle size={18} />}
          projectsList={displayProjects.filter((p) => p.status === 'Blocked')}
          collapsedSections={collapsedSections}
          onToggle={toggleSection}
          renderCard={renderCard}
        />
        <StatusSection
          title="เสร็จแล้ว (completed)"
          status="Completed"
          count={displayProjects.filter((p) => p.status === 'Completed').length}
          icon={<AlertTriangle size={18} className="opacity-0" />}
          projectsList={displayProjects.filter((p) => p.status === 'Completed')}
          collapsedSections={collapsedSections}
          onToggle={toggleSection}
          renderCard={renderCard}
        />
      </div>

      <CreateProjectModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <QuickUpdateModal open={isUpdateOpen} onClose={() => setIsUpdateOpen(false)} />
    </div>
  );
}

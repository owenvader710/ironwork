import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Folder, 
  UserCircle, 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Bell, 
  Filter,
  Clock,
  MoreVertical,
  Video,
  Palette,
  Lock,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  X,
  Zap,
  Tag,
  FileText,
  Trash2,
  ChevronDown,
  ChevronUp,
  Info,
  CalendarDays,
  ShieldCheck,
  BarChart3,
  ArrowUpRight,
  Star,
  Hash,
  AlignLeft,
  MessageSquareWarning,
  ThumbsUp,
  ThumbsDown,
  History,
  AlertTriangle,
  Send,
  Link as LinkIcon,
  CheckSquare,
  Square,
  ArrowRight,
  Target,
  ArrowRightCircle,
  Users as UsersIcon,
  UserPlus
} from 'lucide-react';

const IRONTEC_GREEN = '#e5ff48';

const INITIAL_USERS = [
  { id: 'admin1', pw: '565656', name: 'ขวัญ', role: 'Leader', department: 'All' },
  { id: 'graphic1', pw: '2020', name: 'เดย์', role: 'Member', department: 'Graphic' },
  { id: 'graphic2', pw: '2020', name: 'ลีพ', role: 'Member', department: 'Graphic' },
  { id: 'video1', pw: '1080', name: 'บูม', role: 'Member', department: 'Video' },
  { id: 'video2', pw: '1080', name: 'โอเว่น', role: 'Member', department: 'Video' },
  { id: 'video3', pw: '1080', name: 'อาดีฟ', role: 'Member', department: 'Video' },
];

const VIDEO_SUB_STEPS = ['หาข้อมูล', 'สร้างเสียงพากย์', 'วาง Storyboard', 'ถ่ายงาน', 'ตัดต่อ'];
const BLOCKED_REASONS = ["รอไฟล์/Asset", "รอข้อมูล", "รออนุมัติ", "แก้ตามฟีดแบ็ก", "ปัญหาเทคนิค", "อื่นๆ"];

const getDeadlineInfo = (deadlineStr, status) => {
  if (status === 'Completed' || !deadlineStr) return { type: 'none', days: 0 };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(deadlineStr);
  deadline.setHours(0, 0, 0, 0);
  const diffTime = deadline - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { type: 'overdue', days: Math.abs(diffDays) };
  if (diffDays <= 1) return { type: 'due-soon', days: diffDays };
  return { type: 'none', days: diffDays };
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = new Date() - new Date(dateStr);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'เมื่อสักครู่';
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  return new Date(dateStr).toLocaleDateString('th-TH');
};

const App = () => {
  // 2. Members State and Persistence
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('ironwork_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  useEffect(() => {
    localStorage.setItem('ironwork_users', JSON.stringify(users));
  }, [users]);

  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [personalFilter, setPersonalFilter] = useState('All');
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({ 'Completed': true });
  
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    projectId: '',
    message: '',
    attachmentUrl: '',
    progress: '',
    status: '',
    subStatus: ''
  });

  const [blockingProject, setBlockingProject] = useState(null);
  const [blockingData, setBlockingData] = useState({ preset: BLOCKED_REASONS[0], note: '' });

  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [loginError, setLoginError] = useState('');

  // 4. Member Creation State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberError, setMemberError] = useState('');
  const [memberFormData, setMemberFormData] = useState({
    name: '',
    id: '',
    pw: '',
    department: 'Graphic'
  });

  const [formData, setFormData] = useState({
    projectName: '', 
    projectId: '',
    department: 'Graphic', 
    assignedTo: '',
    orderDate: new Date().toISOString().split('T')[0], 
    deadline: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    videoQuality: ''
  });

  // Set default assigned user when opening project modal
  useEffect(() => {
    if (isModalOpen && !formData.assignedTo) {
      const firstMember = users.find(u => u.department === formData.department && u.role === 'Member')?.name || '';
      setFormData(prev => ({ ...prev, assignedTo: firstMember }));
    }
  }, [isModalOpen, formData.department, users]);

  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(u => u.id === loginId && u.pw === loginPw);
    if (user) {
      setCurrentUser(user);
      setLoginError('');
    } else {
      setLoginError('ID หรือ Password ไม่ถูกต้อง');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('Dashboard');
    setLoginId('');
    setLoginPw('');
    setSelectedTasks([]);
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (currentUser?.role !== 'Leader') return;
    
    if (users.some(u => u.id === memberFormData.id)) {
      setMemberError('User ID นี้มีอยู่ในระบบแล้ว');
      return;
    }

    const newMember = {
      ...memberFormData,
      role: 'Member'
    };

    setUsers(prev => [...prev, newMember]);
    setIsMemberModalOpen(false);
    setMemberFormData({ name: '', id: '', pw: '', department: 'Graphic' });
    setMemberError('');
  };

  const addUpdateToProject = (projectId, updateData) => {
    if (!currentUser) return;
    const newUpdate = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      author: currentUser?.name || 'System',
      createdAt: new Date().toISOString(),
      message: updateData.message || '',
      attachmentUrl: updateData.attachmentUrl || null,
      progress: updateData.progress || null,
      status: updateData.status || null,
      assignedTo: projects.find(p => p.id === projectId)?.assignedTo || ''
    };

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          updates: [newUpdate, ...(p.updates || [])]
        };
      }
      return p;
    }));
  };

  const handleQuickUpdateSubmit = (e) => {
    e.preventDefault();
    if (!currentUser || !updateFormData.projectId || !updateFormData.message) return;

    const project = projects.find(p => p.id === parseInt(updateFormData.projectId));
    if (!project) return;

    addUpdateToProject(project.id, {
      message: updateFormData.message,
      attachmentUrl: updateFormData.attachmentUrl,
      progress: updateFormData.progress ? parseInt(updateFormData.progress) : undefined,
      status: updateFormData.status || undefined
    });

    if (updateFormData.status || updateFormData.progress !== '') {
      requestStatusUpdate(
        project.id, 
        updateFormData.status || project.status, 
        updateFormData.subStatus || project.subStatus, 
        updateFormData.progress !== '' ? parseInt(updateFormData.progress) : null
      );
    }

    setIsUpdateModalOpen(false);
    setUpdateFormData({ projectId: '', message: '', attachmentUrl: '', progress: '', status: '', subStatus: '' });
  };

  const requestStatusUpdate = (id, targetStatus, targetSubStatus = '', targetProgress = null, blockedDetails = null) => {
    if (!currentUser) return;
    setProjects(prevProjects => prevProjects.map(p => {
      if (p.id === id) {
        if (currentUser?.role === 'Leader') {
          return applyStatusChange(p, targetStatus, targetSubStatus, targetProgress, blockedDetails);
        }
        return { 
          ...p, 
          pendingApproval: {
            status: targetStatus,
            subStatus: targetSubStatus,
            progress: targetProgress,
            blockedDetails: blockedDetails
          }
        };
      }
      return p;
    }));
  };

  const applyStatusChange = (project, status, subStatus, progress, blockedDetails) => {
    let newProgress = progress !== null ? progress : project.progress;
    if (status === 'Completed') newProgress = 100;
    else if (status === 'To Do') newProgress = 0;
    else if (status === 'In Progress' && newProgress >= 100) newProgress = 95;
    
    return { 
      ...project, 
      status, 
      subStatus, 
      progress: newProgress, 
      pendingApproval: null,
      blockedReasonPreset: blockedDetails?.preset || null,
      blockedReasonNote: blockedDetails?.note || null,
      blockedAt: blockedDetails ? new Date().toISOString() : null
    };
  };

  const approveStatus = (id) => {
    if (currentUser?.role !== 'Leader') return;
    setProjects(prev => prev.map(p => {
      if (p.id === id && p.pendingApproval) {
        return applyStatusChange(
          p, 
          p.pendingApproval.status, 
          p.pendingApproval.subStatus, 
          p.pendingApproval.progress, 
          p.pendingApproval.blockedDetails
        );
      }
      return p;
    }));
  };

  const rejectStatus = (id) => {
    if (currentUser?.role !== 'Leader') return;
    setProjects(prev => prev.map(p => {
      if (p.id === id) return { ...p, pendingApproval: null };
      return p;
    }));
  };

  const bulkStatusUpdate = (targetStatus) => {
    if (selectedTasks.length === 0) return;
    
    selectedTasks.forEach(id => {
      requestStatusUpdate(id, targetStatus);
      addUpdateToProject(id, {
        message: `อัปเดตสถานะแบบกลุ่มเป็น: ${targetStatus}`,
        status: targetStatus
      });
    });
    
    setSelectedTasks([]);
  };

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
    if (!currentUser) return null;
    const myTasks = projects.filter(p => p.assignedTo === currentUser.name);
    const myCompleted = myTasks.filter(p => p.status === 'Completed').length;
    return {
      total: myTasks.length,
      inProgress: myTasks.filter(p => p.status === 'In Progress').length,
      completedPercent: myTasks.length > 0 ? Math.round((myCompleted / myTasks.length) * 100) : 0
    };
  }, [projects, currentUser]);

  const recentUpdates = useMemo(() => {
    const allUpdates = [];
    projects.forEach(p => {
      (p.updates || []).forEach(u => {
        allUpdates.push({ ...u, projectName: p.name });
      });
    });
    return allUpdates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  }, [projects]);

  const pendingApprovals = useMemo(() => {
    return projects.filter(p => p.pendingApproval);
  }, [projects]);

  const displayProjects = useMemo(() => {
    let filtered = projects;
    
    if (activeTab === 'งานของฉัน' && currentUser) {
      filtered = filtered.filter(p => p.assignedTo === currentUser?.name);
      
      if (personalFilter === 'Today') {
        const today = new Date().toISOString().split('T')[0];
        filtered = filtered.filter(p => p.deadline === today);
      } else if (personalFilter === 'Tomorrow') {
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        filtered = filtered.filter(p => p.deadline === tomorrow);
      } else if (personalFilter === 'Overdue') {
        filtered = filtered.filter(p => getDeadlineInfo(p.deadline, p.status).type === 'overdue');
      } else if (personalFilter === 'Blocked') {
        filtered = filtered.filter(p => p.status === 'Blocked');
      }
    } else {
      if (deptFilter !== 'All') {
        filtered = filtered.filter(p => p.type === deptFilter);
      }
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (q.startsWith('overdue:')) {
        filtered = filtered.filter(p => getDeadlineInfo(p.deadline, p.status).type === 'overdue');
      } else if (q.startsWith('due:')) {
        filtered = filtered.filter(p => getDeadlineInfo(p.deadline, p.status).type === 'due-soon');
      } else {
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(q) || 
          (p.projectId && p.projectId.toLowerCase().includes(q))
        );
      }
    }
    return filtered;
  }, [projects, activeTab, currentUser, searchQuery, deptFilter, personalFilter]);

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

  const toggleSection = (status) => {
    setCollapsedSections(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  const toggleTaskSelection = (id) => {
    setSelectedTasks(prev => 
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  const submitBlockedStatus = () => {
    if (blockingProject && currentUser) {
      requestStatusUpdate(blockingProject.id, 'Blocked', '', null, blockingData);
      addUpdateToProject(blockingProject.id, {
        message: `ติดปัญหา: ${blockingData.preset} ${blockingData.note ? `(${blockingData.note})` : ''}`,
        status: 'Blocked'
      });
      setBlockingProject(null);
      setBlockingData({ preset: BLOCKED_REASONS[0], note: '' });
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="w-full max-w-md">
           <div className="text-center mb-10">
              <h1 className="text-4xl font-black tracking-tighter mb-2" style={{ color: IRONTEC_GREEN }}>IRON<span className="text-white">WORK</span></h1>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Management System Portal</p>
           </div>
           <form onSubmit={handleLogin} className="bg-white rounded-[40px] p-10 shadow-2xl space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">User ID</label>
                 <input required type="text" className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all" placeholder="Enter ID" value={loginId} onChange={(e) => setLoginId(e.target.value)} />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Password</label>
                 <input required type="password" className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all" placeholder="••••••••" value={loginPw} onChange={(e) => setLoginPw(e.target.value)} />
              </div>
              {loginError && <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-tight">{loginError}</p>}
              <button type="submit" className="w-full bg-black text-white py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-gray-900 transition-all shadow-xl active:scale-95">Sign In</button>
           </form>
           <p className="text-center mt-8 text-gray-600 text-[10px] font-bold uppercase tracking-widest">Irontec Co., Ltd. © 2026</p>
        </div>
      </div>
    );
  }

  const ProjectCard = ({ project, isUrgent = false, isCompact = false }) => {
    const isVideo = project.type === 'Video';
    const [showSubMenu, setShowSubMenu] = useState(false);
    const displayProgress = project.status === 'Completed' ? 100 : Math.min(project.progress || 0, 99);
    const isPending = !!project.pendingApproval;
    const dInfo = getDeadlineInfo(project.deadline, project.status);
    const isMyWork = activeTab === 'งานของฉัน';
    const isSelected = selectedTasks.includes(project.id);

    return (
      <div className={`bg-white rounded-3xl p-6 shadow-sm border transition-all relative group ${isPending ? 'border-amber-200 bg-amber-50/20' : 'border-gray-50'} ${isSelected ? 'ring-2 ring-black border-black' : ''} ${isUrgent ? 'border-l-4 border-l-red-500 shadow-md' : ''} ${isCompact ? 'p-4' : 'p-6'}`}>
        {isPending && (
          <div className="absolute -top-3 left-6 bg-amber-500 text-white text-[9px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg z-10 animate-bounce">
            <Clock size={10} /> รออนุมัติการเปลี่ยนสถานะ
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1 min-w-0 flex items-start gap-4">
            {isMyWork && !isCompact && (
              <button onClick={() => toggleTaskSelection(project.id)} className={`shrink-0 mt-1 transition-colors ${isSelected ? 'text-black' : 'text-gray-200 hover:text-gray-400'}`}>
                {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
              </button>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${project.type === 'Graphic' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                  {project.type}
                </span>
                {project.videoQuality && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-50 text-amber-600 uppercase">
                    QUALITY: {project.videoQuality}
                  </span>
                )}
                {!isCompact && <span className="text-[10px] text-gray-500 font-bold bg-gray-50 px-2 py-0.5 rounded italic">#{project.projectId || 'N/A'}</span>}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 font-bold flex items-center">
                    <CalendarDays size={12} className="mr-1" /> {project.deadline}
                  </span>
                  {dInfo.type === 'overdue' && <span className="text-[9px] bg-red-50 text-red-500 px-2 py-0.5 rounded font-black uppercase tracking-tighter flex items-center gap-1"><AlertCircle size={10} /> Overdue D+{dInfo.days}</span>}
                  {dInfo.type === 'due-soon' && <span className="text-[9px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-black uppercase tracking-tighter flex items-center gap-1"><History size={10} /> Due soon D-{dInfo.days}</span>}
                </div>
                {!isMyWork && !isCompact && (
                  <span className="text-[10px] text-indigo-500 font-black flex items-center">
                    <UserCircle size={12} className="mr-1" /> {project.assignedTo}
                  </span>
                )}
              </div>
              <h3 className={`${isCompact ? 'text-sm' : 'text-lg'} font-black text-gray-900 truncate flex items-center gap-2`}>
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
                     onClick={() => { setUpdateFormData({...updateFormData, projectId: project.id.toString()}); setIsUpdateModalOpen(true); }}
                     className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-300 hover:text-indigo-500 transition-all flex items-center gap-1.5"
                     title="อัปเดตงาน"
                   >
                     <MessageSquareWarning size={14} />
                     <span className="text-[10px] font-black uppercase tracking-tighter">Update</span>
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
                onClick={() => setShowSubMenu(!showSubMenu)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border transition-all ${isPending ? 'opacity-70 grayscale' : ''} ${project.status === 'Completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : project.status === 'Blocked' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-white'}`}
              >
                <div className="flex items-center space-x-2 text-[11px] font-black uppercase text-left">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${project.status === 'Completed' ? 'bg-emerald-500' : project.status === 'Blocked' ? 'bg-red-500' : 'bg-amber-400'}`} />
                  <span className="truncate">{project.status === 'Completed' ? 'เสร็จสิ้น' : project.status === 'Blocked' ? 'ติดปัญหา' : project.status === 'In Progress' ? `ทำ ${project.subStatus ? `(${project.subStatus})` : ''}` : 'สั่งงาน'}</span>
                </div>
                {!isCompact && <ChevronDown size={14} className="shrink-0" />}
              </button>
              {showSubMenu && !isCompact && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 shadow-2xl rounded-2xl p-2 z-[60]">
                  <div className="space-y-1">
                    <button onClick={() => { requestStatusUpdate(project.id, 'To Do'); setShowSubMenu(false); }} className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-black text-gray-400 hover:bg-gray-50 uppercase flex items-center"><Clock size={14} className="mr-2" /> 1. สั่งงาน</button>
                    <div className="relative group/sub">
                      <button className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-black text-indigo-600 bg-indigo-50/50 flex items-center justify-between uppercase">
                        <div className="flex items-center"><Zap size={14} className="mr-2 fill-indigo-600" /> 2. ดำเนินการ</div>
                        <ChevronRight size={14} />
                      </button>
                      <div className="pl-6 pt-1 space-y-1">
                        {(isVideo ? VIDEO_SUB_STEPS : ['กำลังออกแบบ', 'รอตรวจ', 'แก้ไข']).map((step, idx) => (
                          <button key={step} onClick={() => { requestStatusUpdate(project.id, 'In Progress', step, (idx + 1) * 20); setShowSubMenu(false); }} className="w-full text-left px-3 py-1.5 rounded-lg text-[10px] font-black uppercase text-gray-400 hover:text-indigo-600 hover:bg-indigo-50">2.{idx+1} {step}</button>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => { requestStatusUpdate(project.id, 'Completed'); setShowSubMenu(false); }} className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-black text-emerald-600 hover:bg-emerald-50 uppercase flex items-center"><CheckCircle2 size={14} className="mr-2" /> 3. ปิดโปรเจกต์</button>
                    <button onClick={() => { setBlockingProject(project); setShowSubMenu(false); }} className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-black text-red-600 hover:bg-red-50 uppercase flex items-center border-t border-gray-50 mt-1"><AlertTriangle size={14} className="mr-2" /> 4. ติดปัญหา</button>
                  </div>
                </div>
              )}
            </div>
            {!isCompact && (
              <div className="w-full px-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black text-gray-400">PROGRESS</span>
                  <span className={`text-[10px] font-black ${displayProgress === 100 ? 'text-emerald-500' : project.status === 'Blocked' ? 'text-red-500' : 'text-gray-900'}`}>{displayProgress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full transition-all duration-700 relative" style={{ width: `${displayProgress}%`, backgroundColor: project.status === 'Completed' ? '#10b981' : project.status === 'Blocked' ? '#ef4444' : 'black' }}>
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
                  <button onClick={() => approveStatus(project.id)} className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-md" title="อนุมัติ"><ThumbsUp size={16} /></button>
                  <button onClick={() => rejectStatus(project.id)} className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-md" title="ไม่อนุมัติ"><ThumbsDown size={16} /></button>
                </div>
              )}
              {currentUser?.role === 'Leader' && <button onClick={() => setProjects(projects.filter(p => p.id !== project.id))} className="p-2.5 text-gray-300 hover:text-red-500 rounded-xl transition-all"><Trash2 size={16} /></button>}
            </div>
          )}
        </div>
      </div>
    );
  };

  const StatusSection = ({ title, status, count, icon, projectsList }) => {
    const isCollapsed = collapsedSections[status];
    
    return (
      <div className="mb-6">
        <button 
          onClick={() => toggleSection(status)}
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
          {isCollapsed ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronUp size={20} className="text-gray-400" />}
        </button>
        
        {!isCollapsed && (
          <div className="space-y-4 pl-2 animate-in fade-in slide-in-from-top-2 duration-300">
             {projectsList.length > 0 ? (
                projectsList.map(p => <ProjectCard key={p.id} project={p} />)
             ) : (
                <div className="p-10 text-center bg-gray-50/50 rounded-[30px] border-2 border-dashed border-gray-100">
                  <p className="text-[10px] font-black uppercase text-gray-300 tracking-widest">ไม่มีรายการงานในสถานะนี้</p>
                </div>
             )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-sans text-gray-900 overflow-hidden">
      <div className="w-64 bg-black text-white h-full flex flex-col border-r border-gray-800 shrink-0">
        <div className="p-8"><h1 className="text-2xl font-black tracking-tighter" style={{ color: IRONTEC_GREEN }}>IRON<span className="text-white">WORK</span></h1></div>
        <nav className="flex-1 px-4 space-y-2">
          {[
            { name: 'Dashboard', icon: <LayoutDashboard size={20} /> }, 
            { name: 'โปรเจกต์ทั้งหมด', icon: <Folder size={20} /> }, 
            { name: 'งานของฉัน', icon: <UserCircle size={20} /> },
            // 1. Members Menu Access Control
            ...(currentUser?.role === 'Leader' ? [{ name: 'สมาชิก', icon: <UsersIcon size={20} /> }] : [])
          ].map((item) => (
            <button key={item.name} onClick={() => { setActiveTab(item.name); setSelectedTasks([]); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.name ? 'bg-[#e5ff48] text-black font-bold' : 'hover:bg-gray-900 text-gray-400'}`}>
              {item.icon}<span className="text-sm font-bold uppercase tracking-wide">{item.name}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
           <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 p-2 text-xs text-gray-500 hover:text-red-400 transition-colors"><LogOut size={14} /><span>ออกจากระบบ</span></button>
        </div>
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
          <div><h2 className="text-xl font-black uppercase tracking-tight">{activeTab}</h2></div>
          <div className="flex items-center space-x-4">
             <div className="text-right mr-2 hidden sm:block">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{currentUser?.role}</p>
               <p className="text-xs font-black text-gray-900">{currentUser?.name || ''}</p>
             </div>
             <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold">{currentUser?.name?.[0] || 'U'}</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative">
          {activeTab === 'Dashboard' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
              <div className="lg:col-span-2 space-y-8">
                {/* 1. My Progress Snapshot (NEW) */}
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

                {/* Main Stats (Existing) */}
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

                {/* 2. Daily Focus (NEW) */}
                {manageNowTasks.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                       <div className="flex items-center gap-3">
                          <div className="w-1.5 h-6 bg-red-500 rounded-full" />
                          <div>
                             <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">วันนี้ต้องทำอะไร</h3>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Focus on your most urgent tasks</p>
                          </div>
                       </div>
                       <button onClick={() => setActiveTab('งานของฉัน')} className="text-[10px] font-black text-indigo-600 uppercase flex items-center gap-1 hover:underline">ดูทั้งหมด <ChevronRight size={14} /></button>
                    </div>
                    <div className="space-y-3">
                       {manageNowTasks.map(p => (
                         <div key={`focus-${p.id}`} className="cursor-pointer" onClick={() => setActiveTab('งานของฉัน')}>
                           <ProjectCard project={p} isCompact={true} isUrgent={p.status === 'Blocked' || getDeadlineInfo(p.deadline, p.status).type === 'overdue'} />
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                <div className="bg-[#18181b] text-white p-8 rounded-[40px] shadow-2xl h-64 flex items-center justify-center">
                   <p className="text-gray-500 text-xs font-black uppercase tracking-widest">Performance Analytics Chart</p>
                </div>
              </div>
              
              <div className="space-y-8">
                {/* 3. Quick Actions (NEW) */}
                <div className="bg-white rounded-[40px] p-6 border border-gray-100 shadow-sm">
                   <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-4">Quick Actions</h3>
                   <div className="space-y-3">
                      <button onClick={() => setIsUpdateModalOpen(true)} className="w-full flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-3xl transition-all group">
                         <div className="flex items-center gap-3">
                            <MessageSquareWarning size={18} />
                            <span className="text-xs font-black uppercase tracking-tight">อัปเดตงาน</span>
                         </div>
                         <ArrowRightCircle size={18} className="opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                      <button onClick={() => setActiveTab('งานของฉัน')} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-3xl transition-all group">
                         <div className="flex items-center gap-3">
                            <UserCircle size={18} />
                            <span className="text-xs font-black uppercase tracking-tight">ไปที่งานของฉัน</span>
                         </div>
                         <ArrowRightCircle size={18} className="opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                      {currentUser?.role === 'Leader' && (
                        <button onClick={() => setIsModalOpen(true)} className="w-full flex items-center justify-between p-4 bg-[#e5ff48] hover:bg-[#d4ed3a] text-black rounded-3xl transition-all group">
                          <div className="flex items-center gap-3">
                              <Plus size={18} />
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
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                          <ShieldCheck size={20} />
                        </div>
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">
                          รออนุมัติ ({pendingApprovals.length})
                        </h3>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {pendingApprovals.map(p => (
                        <div key={`pending-${p.id}`} className="p-4 bg-amber-50/30 rounded-3xl border border-amber-100/50 hover:bg-white hover:shadow-md transition-all">
                          <div className="flex items-center gap-2 mb-2">
                             <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${p.type === 'Graphic' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                {p.type}
                             </span>
                             <span className="text-[9px] text-gray-400 font-bold italic">#{p.projectId}</span>
                          </div>
                          <p className="text-xs font-black text-gray-900 mb-1 truncate">{p.name}</p>
                          <div className="flex items-center gap-2 mb-3">
                             <UserCircle size={10} className="text-gray-400" />
                             <span className="text-[9px] font-bold text-gray-500">{p.assignedTo}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-4 p-2 bg-white/60 rounded-xl border border-white">
                             <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{p.status}</span>
                             <ArrowRight size={10} className="text-amber-500" />
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
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-6">Activity Logs</h3>
                  <div className="space-y-4">
                     {recentUpdates.length > 0 ? (
                       recentUpdates.map(u => {
                         const isAboutMe = u.author === currentUser.name || u.assignedTo === currentUser.name;
                         return (
                           <div key={u.id} className={`p-3 rounded-2xl border border-transparent transition-all ${isAboutMe ? 'bg-emerald-50/50 border-emerald-100' : ''}`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-[10px] font-black uppercase ${isAboutMe ? 'text-emerald-600' : 'text-indigo-500'}`}>
                                  {u.projectName}
                                </span>
                                {isAboutMe && (
                                  <span className="text-[8px] font-black bg-[#e5ff48] text-black px-1.5 py-0.5 rounded uppercase tracking-tighter">เกี่ยวกับคุณ</span>
                                )}
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
            </div>
          ) : activeTab === 'สมาชิก' ? (
            // 3. Members Page
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">รายชื่อสมาชิก</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">จัดการบัญชีผู้ใช้ในระบบ</p>
                  </div>
                  {currentUser?.role === 'Leader' && (
                    <button 
                      onClick={() => setIsMemberModalOpen(true)}
                      className="px-6 py-3 bg-black text-white rounded-2xl font-black text-sm uppercase tracking-tight flex items-center space-x-2 shadow-xl hover:bg-gray-900 transition-all active:scale-95"
                    >
                      <UserPlus size={18} strokeWidth={3} />
                      <span>เพิ่มสมาชิกใหม่</span>
                    </button>
                  )}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((u) => (
                    <div key={u.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-4 group hover:border-black transition-all">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${u.role === 'Leader' ? 'bg-[#e5ff48] text-black' : 'bg-gray-100 text-gray-400 group-hover:bg-black group-hover:text-white transition-colors'}`}>
                          {u.name?.[0]}
                       </div>
                       <div className="min-w-0">
                          <p className="font-black text-gray-900 truncate">{u.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                             <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">ID: {u.id}</span>
                             <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${u.department === 'Graphic' ? 'bg-blue-50 text-blue-600' : u.department === 'Video' ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-gray-600'}`}>
                                {u.department}
                             </span>
                          </div>
                          <span className={`inline-block mt-2 text-[8px] font-black uppercase tracking-[0.2em] ${u.role === 'Leader' ? 'text-amber-500' : 'text-gray-300'}`}>
                             {u.role}
                          </span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          ) : (
            <div className="space-y-8 max-w-6xl mx-auto pb-32">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 max-w-2xl">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input type="text" placeholder="ค้นหาโปรเจกต์..." className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold shadow-sm outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <button onClick={() => setIsUpdateModalOpen(true)} className="px-5 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-sm uppercase tracking-tight flex items-center space-x-2 shrink-0 hover:bg-indigo-100 transition-colors"><MessageSquareWarning size={18} /><span className="hidden sm:inline">อัปเดตงาน</span></button>
                  </div>
                  {currentUser?.role === 'Leader' && <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-[#e5ff48] text-black rounded-2xl font-black text-sm uppercase tracking-tight flex items-center space-x-2 shadow-lg shadow-lime-100 transition-transform active:scale-95"><Plus size={18} strokeWidth={3} /><span>สั่งงานใหม่</span></button>}
                </div>
                
                {activeTab === 'งานของฉัน' ? (
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2 shrink-0">Personal Focus:</span>
                    {[{ id: 'All', label: 'ทั้งหมด' }, { id: 'Today', label: 'ส่งวันนี้', icon: <Clock size={12} /> }, { id: 'Tomorrow', label: 'ส่งพรุ่งนี้', icon: <CalendarIcon size={12} /> }, { id: 'Overdue', label: 'เกินกำหนด', icon: <AlertCircle size={12} />, color: 'text-red-500' }, { id: 'Blocked', label: 'ติดปัญหา', icon: <AlertTriangle size={12} />, color: 'text-amber-600' }].map((f) => (
                      <button key={f.id} onClick={() => setPersonalFilter(f.id)} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-2 flex items-center gap-2 shrink-0 ${personalFilter === f.id ? 'bg-black text-white border-black shadow-lg shadow-gray-200' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}>{f.icon && <span className={personalFilter === f.id ? 'text-white' : f.color || 'text-gray-400'}>{f.icon}</span>}{f.label}</button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2 shrink-0">Filter Department:</span>
                    {['All', 'Graphic', 'Video'].map((dept) => (
                      <button key={dept} onClick={() => setDeptFilter(dept)} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-2 ${deptFilter === dept ? 'bg-black text-white border-black shadow-lg shadow-gray-200' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}>{dept === 'All' ? 'ทั้งหมด' : dept}</button>
                    ))}
                  </div>
                )}
              </div>

              {activeTab === 'งานของฉัน' && manageNowTasks.length > 0 && personalFilter === 'All' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2 px-1">
                    <div className="w-2 h-6 bg-red-500 rounded-full" />
                    <div>
                       <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">ต้องจัดการตอนนี้</h3>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Urgent tasks requiring your immediate attention</p>
                    </div>
                  </div>
                  <div className="space-y-4">{manageNowTasks.map(p => <ProjectCard key={`urgent-${p.id}`} project={p} isUrgent={true} />)}</div>
                  <div className="h-px bg-gray-100 w-full my-8" />
                </div>
              )}

              <div className="space-y-2">
                <StatusSection title="สั่งงาน (To Do)" status="To Do" count={displayProjects.filter(p => p.status === 'To Do').length} icon={<Clock size={18} />} projectsList={displayProjects.filter(p => p.status === 'To Do')} />
                <StatusSection title="ดำเนินการ (In Progress)" status="In Progress" count={displayProjects.filter(p => p.status === 'In Progress').length} icon={<Zap size={18} />} projectsList={displayProjects.filter(p => p.status === 'In Progress')} />
                <StatusSection title="ติดปัญหา (Blocked)" status="Blocked" count={displayProjects.filter(p => p.status === 'Blocked').length} icon={<AlertTriangle size={18} />} projectsList={displayProjects.filter(p => p.status === 'Blocked')} />
                <StatusSection title="เสร็จแล้ว (Completed)" status="Completed" count={displayProjects.filter(p => p.status === 'Completed').length} icon={<CheckCircle2 size={18} />} projectsList={displayProjects.filter(p => p.status === 'Completed')} />
              </div>
            </div>
          )}

          {activeTab === 'งานของฉัน' && selectedTasks.length > 0 && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] w-full max-w-2xl px-6 animate-in slide-in-from-bottom-10 duration-500">
               <div className="bg-black text-white rounded-[32px] p-4 shadow-2xl flex items-center justify-between border border-white/10">
                  <div className="flex items-center gap-4 ml-2">
                     <div className="bg-[#e5ff48] text-black w-8 h-8 rounded-full flex items-center justify-center font-black text-sm">{selectedTasks.length}</div>
                     <div><p className="text-xs font-black uppercase tracking-widest leading-none">Items Selected</p><p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.1em]">Bulk Actions enabled</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                     <button onClick={() => bulkStatusUpdate('In Progress')} className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 rounded-2xl text-[10px] font-black uppercase tracking-tighter transition-colors border border-gray-800">Start Project</button>
                     <button onClick={() => bulkStatusUpdate('Completed')} className="px-4 py-2.5 bg-[#e5ff48] text-black hover:bg-[#d4ed3a] rounded-2xl text-[10px] font-black uppercase tracking-tighter transition-colors">Mark Completed</button>
                     <div className="w-px h-8 bg-gray-800 mx-1" />
                     <button onClick={() => setSelectedTasks([])} className="p-2.5 text-gray-500 hover:text-white transition-colors"><X size={18} /></button>
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>

      {/* 4. Modal - Add Member (Leader Only) */}
      {isMemberModalOpen && currentUser?.role === 'Leader' && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMemberModalOpen(false)} />
           <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl p-8 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-3">
                    <div className="bg-black text-white p-2.5 rounded-2xl"><UserPlus size={24} /></div>
                    <div><h2 className="text-xl font-black uppercase text-gray-900 leading-none mb-1">เพิ่มสมาชิกใหม่</h2><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Create New Member Account</p></div>
                 </div>
                 <button onClick={() => setIsMemberModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddMember} className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block">ชื่อ-นามสกุล</label>
                    <input required type="text" className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-4 py-3.5 text-sm font-bold outline-none" placeholder="ชื่อเล่น หรือ ชื่อจริง" value={memberFormData.name} onChange={(e) => setMemberFormData({...memberFormData, name: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block">User ID</label>
                       <input required type="text" className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-4 py-3 text-sm font-bold outline-none" placeholder="Login ID" value={memberFormData.id} onChange={(e) => setMemberFormData({...memberFormData, id: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block">Password</label>
                       <input required type="text" className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-4 py-3 text-sm font-bold outline-none" placeholder="รหัสผ่าน" value={memberFormData.pw} onChange={(e) => setMemberFormData({...memberFormData, pw: e.target.value})} />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block">แผนก (Department)</label>
                    <select className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-4 py-3.5 text-sm font-bold outline-none appearance-none" value={memberFormData.department} onChange={(e) => setMemberFormData({...memberFormData, department: e.target.value})}>
                       <option value="Graphic">Graphic</option>
                       <option value="Video">Video</option>
                    </select>
                 </div>
                 <div className="space-y-2 opacity-50">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block">ตำแหน่ง (Fixed)</label>
                    <input readOnly type="text" className="w-full bg-gray-100 border-2 border-transparent rounded-2xl px-4 py-3 text-sm font-bold" value="Member" />
                 </div>
                 {memberError && <p className="text-red-500 text-[10px] font-black text-center uppercase">{memberError}</p>}
                 <button type="submit" className="w-full bg-black text-white py-4 rounded-3xl font-black uppercase shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 mt-4">บันทึกข้อมูลสมาชิก</button>
              </form>
           </div>
        </div>
      )}

      {/* Modal - Quick Update */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsUpdateModalOpen(false)} />
           <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-8 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-2xl"><MessageSquareWarning size={24} /></div>
                    <div><h2 className="text-xl font-black uppercase text-gray-900 leading-none mb-1">บันทึกความคืบหน้า</h2><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quick Update Progress</p></div>
                 </div>
                 <button onClick={() => setIsUpdateModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleQuickUpdateSubmit} className="space-y-5">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block">เลือกโปรเจกต์</label>
                    <select required className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none appearance-none" value={updateFormData.projectId} onChange={(e) => setUpdateFormData({...updateFormData, projectId: e.target.value})}>
                       <option value="">-- เลือกโปรเจกต์ --</option>
                       {projects.filter(p => p.assignedTo === currentUser.name).map(p => <option key={p.id} value={p.id}>{p.name} (#{p.projectId || 'N/A'})</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block">ข้อความอัปเดต</label>
                    <textarea required maxLength={200} className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-4 py-3 text-sm font-bold outline-none transition-all h-24 resize-none" placeholder="วันนี้ทำอะไรไปบ้าง..." value={updateFormData.message} onChange={(e) => setUpdateFormData({...updateFormData, message: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block">อัปเดต Status (Optional)</label>
                       <select className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs font-bold outline-none appearance-none" value={updateFormData.status} onChange={(e) => setUpdateFormData({...updateFormData, status: e.target.value})}>
                          <option value="">ไม่เปลี่ยนสถานะ</option>
                          <option value="To Do">สั่งงาน</option>
                          <option value="In Progress">ดำเนินการ</option>
                          <option value="Completed">เสร็จสิ้น</option>
                          <option value="Blocked">ติดปัญหา</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block">อัปเดต % (0-100)</label>
                       <input type="number" min="0" max="100" className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs font-bold outline-none" placeholder="เช่น 50" value={updateFormData.progress} onChange={(e) => setUpdateFormData({...updateFormData, progress: e.target.value})} />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block flex items-center gap-1"><LinkIcon size={10} /> ลิงก์แนบไฟล์ (Optional)</label>
                    <input type="url" className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs font-bold outline-none" placeholder="https://..." value={updateFormData.attachmentUrl} onChange={(e) => setUpdateFormData({...updateFormData, attachmentUrl: e.target.value})} />
                 </div>
                 <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-3xl font-black uppercase shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mt-4"><Send size={18} /><span>บันทึกการอัปเดต</span></button>
              </form>
           </div>
        </div>
      )}

      {/* Modal - Blocked */}
      {blockingProject && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setBlockingProject(null)} />
          <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl p-6 border border-gray-100 overflow-hidden">
             <div className="flex items-center gap-3 mb-6">
               <div className="bg-red-50 text-red-500 p-2 rounded-xl"><AlertTriangle size={24} /></div>
               <div><h3 className="text-lg font-black text-gray-900 uppercase leading-none mb-1">ระบุสาเหตุที่ติดปัญหา</h3><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reason for blocking project</p></div>
             </div>
             <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block">เลือกสาเหตุหลัก</label>
                  <div className="grid grid-cols-2 gap-2">{BLOCKED_REASONS.map(reason => (<button key={reason} onClick={() => setBlockingData({...blockingData, preset: reason})} className={`px-3 py-2.5 rounded-xl text-[11px] font-bold text-left transition-all border-2 ${blockingData.preset === reason ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'}`}>{reason}</button>))}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block">รายละเอียดเพิ่มเติม (ไม่บังคับ)</label>
                  <textarea maxLength={80} className="w-full bg-gray-50 border-2 border-transparent focus:border-red-500 rounded-2xl px-4 py-3 text-xs font-bold outline-none transition-all h-20 resize-none" placeholder="ระบุโน้ตสั้นๆ..." value={blockingData.note} onChange={(e) => setBlockingData({...blockingData, note: e.target.value})} />
                </div>
                <div className="flex gap-3 pt-2">
                   <button onClick={() => setBlockingProject(null)} className="flex-1 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-wider text-gray-400 bg-gray-50 hover:bg-gray-100 transition-all">ยกเลิก</button>
                   <button onClick={submitBlockedStatus} className="flex-1 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-wider text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-all">ยืนยัน</button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Modal - Create Project */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-8">
               <div className="flex items-center gap-3">
                 <div className="bg-[#e5ff48] p-2 rounded-xl text-black"><FileText size={24} /></div>
                 <div><h2 className="text-2xl font-black uppercase text-gray-900 tracking-tight">สั่งงานใหม่</h2><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Create New Project Brief</p></div>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
             </div>
             
             <div className="space-y-8">
                <div className="space-y-4">
                   <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">1. ข้อมูลพื้นฐานโปรเจกต์</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1"><Hash size={10} /> รหัสโปรเจกต์</label>
                        <input type="text" className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-4 py-3 text-sm font-bold outline-none transition-all" placeholder="เช่น PJ-2026-001" value={formData.projectId} onChange={(e) => setFormData({...formData, projectId: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1"><Info size={10} /> ชื่อโปรเจกต์</label>
                        <input type="text" className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-4 py-3 text-sm font-bold outline-none transition-all" placeholder="ระบุชื่อโปรเจกต์..." value={formData.projectName} onChange={(e) => setFormData({...formData, projectName: e.target.value})} />
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">2. การมอบหมายงาน</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1"><Palette size={10} /> ฝ่ายที่รับผิดชอบ</label>
                        <select 
                          className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-4 py-3 text-sm font-bold outline-none appearance-none" 
                          value={formData.department} 
                          onChange={(e) => {
                            const newDept = e.target.value;
                            const firstMember = users.find(u => u.department === newDept && u.role === 'Member')?.name || '';
                            setFormData({
                              ...formData, 
                              department: newDept, 
                              assignedTo: firstMember,
                              videoQuality: newDept === 'Video' ? '⭐⭐⭐' : ''
                            });
                          }}
                        >
                          <option value="Graphic">ฝ่ายกราฟิก (Graphic Design)</option>
                          <option value="Video">ฝ่ายวิดีโอ (Video Editor)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1"><UserCircle size={10} /> มอบหมายให้</label>
                        <select 
                          className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-4 py-3 text-sm font-bold outline-none appearance-none" 
                          value={formData.assignedTo} 
                          onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                        >
                          {users.filter(u => u.department === formData.department && u.role === 'Member').map(u => (
                            <option key={u.id} value={u.name}>{u.name}</option>
                          ))}
                        </select>
                      </div>
                   </div>

                   {formData.department === 'Video' && (
                     <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1"><Star size={10} className="text-amber-500" /> VIDEO QUALITY</label>
                        <div className="grid grid-cols-4 gap-2">
                          {['⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐⭐', 'SPECIAL'].map((quality) => (
                            <button
                              key={quality}
                              onClick={() => setFormData({...formData, videoQuality: quality})}
                              className={`py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all border-2 ${formData.videoQuality === quality ? 'bg-black text-white border-black shadow-lg' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'}`}
                            >
                              {quality}
                            </button>
                          ))}
                        </div>
                     </div>
                   )}
                </div>

                <div className="space-y-4">
                   <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">3. กำหนดระยะเวลา</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1"><Clock size={10} /> วันที่สั่งงาน</label>
                        <input type="date" className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-4 py-3 text-sm font-bold outline-none transition-all" value={formData.orderDate} onChange={(e) => setFormData({...formData, orderDate: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1"><CalendarIcon size={10} /> กำหนดส่งงาน (Deadline)</label>
                        <input type="date" className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-4 py-3 text-sm font-bold outline-none transition-all" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} />
                      </div>
                   </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => { 
                      if(formData.projectName && formData.projectId) { 
                        setProjects([
                          ...projects, 
                          { 
                            ...formData, 
                            id: Date.now(), 
                            type: formData.department, 
                            status: 'To Do', 
                            progress: 0, 
                            name: formData.projectName, 
                            pendingApproval: null, 
                            updates: [] 
                          }
                        ]); 
                        setIsModalOpen(false); 
                      } 
                    }} 
                    className="w-full bg-black text-white py-5 rounded-3xl font-black uppercase shadow-xl hover:bg-gray-900 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                    <Plus size={20} strokeWidth={3} />
                    <span>Confirm and Create Project</span>
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
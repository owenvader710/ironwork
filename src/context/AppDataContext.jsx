import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export const IRONTEC_GREEN = '#e5ff48';

export const INITIAL_USERS = [
  { id: 'admin1', pw: '565656', name: 'ขวัญ', role: 'Leader', department: 'All' },
  { id: 'graphic1', pw: '2020', name: 'เดย์', role: 'Member', department: 'Graphic' },
  { id: 'graphic2', pw: '2020', name: 'ลีพ', role: 'Member', department: 'Graphic' },
  { id: 'video1', pw: '1080', name: 'บูม', role: 'Member', department: 'Video' },
  { id: 'video2', pw: '1080', name: 'โอเว่น', role: 'Member', department: 'Video' },
  { id: 'video3', pw: '1080', name: 'อาดีฟ', role: 'Member', department: 'Video' },
];

export const VIDEO_SUB_STEPS = ['หาข้อมูล', 'สร้างเสียงพากย์', 'วาง storyboard', 'ถ่ายงาน', 'ตัดต่อ'];
export const BLOCKED_REASONS = ['รอไฟล์/asset', 'รอข้อมูล', 'รออนุมัติ', 'แก้ตามฟีดแบ็ก', 'ปัญหาเทคนิค', 'อื่นๆ'];

export const getDeadlineInfo = (deadlineStr, status) => {
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

export const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = new Date() - new Date(dateStr);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'เมื่อสักครู่';
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  return new Date(dateStr).toLocaleDateString('th-TH');
};

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('ironwork_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('ironwork_projects');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('ironwork_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('ironwork_projects', JSON.stringify(projects));
  }, [projects]);

  // ------ MEMBERS ------
  const addMember = (currentUser, memberFormData) => {
    if (currentUser?.role !== 'Leader') throw new Error('not allowed');
    if (users.some((u) => u.id === memberFormData.id)) throw new Error('duplicate id');
    const newMember = { ...memberFormData, role: 'Member' };
    setUsers((prev) => [...prev, newMember]);
  };

  // ------ PROJECTS / UPDATES ------
  const createProject = (formData) => {
    const id = Date.now();
    const project = {
      id,
      projectId: formData.projectId || '',
      department: formData.department,
      type: formData.department,
      assignedTo: formData.assignedTo || '',
      orderDate: formData.orderDate,
      deadline: formData.deadline,
      videoQuality: formData.videoQuality || '',
      status: 'To Do',
      subStatus: '',
      progress: 0,
      name: formData.projectName,
      pendingApproval: null,
      updates: [],
      blockedReasonPreset: null,
      blockedReasonNote: null,
      blockedAt: null,
    };
    setProjects((prev) => [...prev, project]);
    return project;
  };

  const deleteProject = (currentUser, projectId) => {
    if (currentUser?.role !== 'Leader') return;
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  const addUpdateToProject = (currentUser, projectId, updateData) => {
    if (!currentUser) return;

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;

        const newUpdate = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
          projectId,
          author: currentUser?.name || 'System',
          createdAt: new Date().toISOString(),
          message: updateData.message || '',
          attachmentUrl: updateData.attachmentUrl || null,
          progress: typeof updateData.progress === 'number' ? updateData.progress : null,
          status: updateData.status || null,
          assignedTo: p.assignedTo || '',
        };

        return {
          ...p,
          updates: [newUpdate, ...(p.updates || [])],
        };
      })
    );
  };

  const applyStatusChange = (project, status, subStatus, progress, blockedDetails) => {
    let newProgress = progress !== null && typeof progress !== 'undefined' ? progress : project.progress;
    if (status === 'Completed') newProgress = 100;
    else if (status === 'To Do') newProgress = 0;
    else if (status === 'In Progress' && newProgress >= 100) newProgress = 95;

    return {
      ...project,
      status,
      subStatus: subStatus || '',
      progress: typeof newProgress === 'number' ? newProgress : 0,
      pendingApproval: null,
      blockedReasonPreset: blockedDetails?.preset || null,
      blockedReasonNote: blockedDetails?.note || null,
      blockedAt: blockedDetails ? new Date().toISOString() : null,
    };
  };

  const requestStatusUpdate = (currentUser, id, targetStatus, targetSubStatus = '', targetProgress = null, blockedDetails = null) => {
    if (!currentUser) return;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        if (currentUser?.role === 'Leader') {
          return applyStatusChange(p, targetStatus, targetSubStatus, targetProgress, blockedDetails);
        }
        return {
          ...p,
          pendingApproval: {
            status: targetStatus,
            subStatus: targetSubStatus,
            progress: targetProgress,
            blockedDetails,
          },
        };
      })
    );
  };

  const approveStatus = (currentUser, id) => {
    if (currentUser?.role !== 'Leader') return;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== id || !p.pendingApproval) return p;
        return applyStatusChange(
          p,
          p.pendingApproval.status,
          p.pendingApproval.subStatus,
          p.pendingApproval.progress,
          p.pendingApproval.blockedDetails
        );
      })
    );
  };

  const rejectStatus = (currentUser, id) => {
    if (currentUser?.role !== 'Leader') return;
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, pendingApproval: null } : p)));
  };

  const bulkStatusUpdate = (currentUser, ids, targetStatus) => {
    if (!ids?.length) return;
    ids.forEach((id) => {
      requestStatusUpdate(currentUser, id, targetStatus);
      addUpdateToProject(currentUser, id, {
        message: `อัปเดตสถานะแบบกลุ่มเป็น: ${targetStatus}`,
        status: targetStatus,
      });
    });
  };

  const submitBlockedStatus = (currentUser, project, blockingData) => {
    if (!project || !currentUser) return;
    requestStatusUpdate(currentUser, project.id, 'Blocked', '', null, blockingData);
    addUpdateToProject(currentUser, project.id, {
      message: `ติดปัญหา: ${blockingData.preset} ${blockingData.note ? `(${blockingData.note})` : ''}`,
      status: 'Blocked',
    });
  };

  // ------ DERIVED ------
  const pendingApprovals = useMemo(() => projects.filter((p) => p.pendingApproval), [projects]);

  const recentUpdates = useMemo(() => {
    const all = [];
    projects.forEach((p) => {
      (p.updates || []).forEach((u) => all.push({ ...u, projectName: p.name }));
    });
    return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  }, [projects]);

  const stats = useMemo(() => {
    const overdueCount = projects.filter((p) => getDeadlineInfo(p.deadline, p.status).type === 'overdue').length;
    const dueSoonCount = projects.filter((p) => getDeadlineInfo(p.deadline, p.status).type === 'due-soon').length;
    return {
      total: projects.length,
      inProgress: projects.filter((p) => p.status === 'In Progress').length,
      completed: projects.filter((p) => p.status === 'Completed').length,
      blocked: projects.filter((p) => p.status === 'Blocked').length,
      pending: projects.filter((p) => p.pendingApproval).length,
      overdue: overdueCount,
      dueSoon: dueSoonCount,
    };
  }, [projects]);

  const api = {
    users,
    setUsers,
    projects,
    setProjects,
    addMember,
    createProject,
    deleteProject,
    addUpdateToProject,
    requestStatusUpdate,
    approveStatus,
    rejectStatus,
    bulkStatusUpdate,
    submitBlockedStatus,
    pendingApprovals,
    recentUpdates,
    stats,
  };

  return <AppDataContext.Provider value={api}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}

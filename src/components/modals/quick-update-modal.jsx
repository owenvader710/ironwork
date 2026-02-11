import React, { useEffect, useMemo, useState } from 'react';
import { Link as LinkIcon, MessageSquareWarning, Send, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAppData } from '../../context/AppDataContext.jsx';

export default function QuickUpdateModal({ open, onClose }) {
  const { currentUser } = useAuth();
  const {
    projects,
    addUpdateToProject,
    requestStatusUpdate,
  } = useAppData();

  const myProjects = useMemo(() => {
    if (!currentUser) return [];
    return projects.filter((p) => p.assignedTo === currentUser.name);
  }, [projects, currentUser]);

  const [form, setForm] = useState({
    projectId: '',
    message: '',
    attachmentUrl: '',
    progress: '',
    status: '',
    subStatus: '',
  });

  useEffect(() => {
    if (!open) return;
    setForm({ projectId: '', message: '', attachmentUrl: '', progress: '', status: '', subStatus: '' });
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentUser || !form.projectId || !form.message) return;
    const projectId = parseInt(form.projectId, 10);

    addUpdateToProject(projectId, {
      message: form.message,
      attachmentUrl: form.attachmentUrl,
      progress: form.progress !== '' ? parseInt(form.progress, 10) : undefined,
      status: form.status || undefined,
    });

    if (form.status || form.progress !== '') {
      requestStatusUpdate(
        projectId,
        form.status || projects.find((p) => p.id === projectId)?.status || 'To Do',
        form.subStatus || '',
        form.progress !== '' ? parseInt(form.progress, 10) : null,
      );
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-2xl"><MessageSquareWarning size={24} /></div>
            <div>
              <h2 className="text-xl font-black uppercase text-gray-900 leading-none mb-1">บันทึกความคืบหน้า</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">quick update progress</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block">เลือกโปรเจกต์</label>
            <select
              required
              className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none appearance-none"
              value={form.projectId}
              onChange={(e) => setForm((p) => ({ ...p, projectId: e.target.value }))}
            >
              <option value="">-- เลือกโปรเจกต์ --</option>
              {myProjects.map((p) => (
                <option key={p.id} value={p.id}>{p.name} (#{p.projectId || 'n/a'})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block">ข้อความอัปเดต</label>
            <textarea
              required
              maxLength={200}
              className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-4 py-3 text-sm font-bold outline-none transition-all h-24 resize-none"
              placeholder="วันนี้ทำอะไรไปบ้าง..."
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block">อัปเดต status (optional)</label>
              <select
                className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs font-bold outline-none appearance-none"
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="">ไม่เปลี่ยนสถานะ</option>
                <option value="To Do">สั่งงาน</option>
                <option value="In Progress">ดำเนินการ</option>
                <option value="Completed">เสร็จสิ้น</option>
                <option value="Blocked">ติดปัญหา</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block">อัปเดต % (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs font-bold outline-none"
                placeholder="เช่น 50"
                value={form.progress}
                onChange={(e) => setForm((p) => ({ ...p, progress: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block flex items-center gap-1"><LinkIcon size={10} /> ลิงก์แนบไฟล์ (optional)</label>
            <input
              type="url"
              className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs font-bold outline-none"
              placeholder="https://..."
              value={form.attachmentUrl}
              onChange={(e) => setForm((p) => ({ ...p, attachmentUrl: e.target.value }))}
            />
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-3xl font-black uppercase shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mt-4">
            <Send size={18} />
            <span>บันทึกการอัปเดต</span>
          </button>
        </form>
      </div>
    </div>
  );
}

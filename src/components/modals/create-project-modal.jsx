import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, FileText, Hash, Info, Palette, Plus, Star, UserCircle, X, Clock } from 'lucide-react';
import { useAppData, IRONTEC_GREEN } from '../../context/AppDataContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function CreateProjectModal({ open, onClose }) {
  const { currentUser } = useAuth();
  const { users, createProject } = useAppData();

  const [formData, setFormData] = useState({
    projectName: '',
    projectId: '',
    department: 'Graphic',
    assignedTo: '',
    orderDate: new Date().toISOString().split('T')[0],
    deadline: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    videoQuality: '',
  });

  useEffect(() => {
    if (!open) return;
    const firstMember = users.find(
      (u) => u.department === formData.department && u.role === 'Member'
    )?.name;
    setFormData((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo || firstMember || '',
      videoQuality: prev.department === 'Video' ? (prev.videoQuality || '⭐⭐⭐') : '',
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, formData.department, users]);

  if (!open) return null;
  if (currentUser?.role !== 'Leader') return null;

  const members = users.filter(
    (u) => u.department === formData.department && u.role === 'Member'
  );

  const submit = () => {
    if (!formData.projectName || !formData.projectId) return;
    createProject(formData);
    onClose();
    setFormData((prev) => ({
      ...prev,
      projectName: '',
      projectId: '',
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-[#e5ff48] p-2 rounded-xl text-black">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase text-gray-900 tracking-tight">สั่งงานใหม่</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Create New Project Brief</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">1. ข้อมูลพื้นฐานโปรเจกต์</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1">
                  <Hash size={10} /> รหัสโปรเจกต์
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-4 py-3 text-sm font-bold outline-none transition-all"
                  placeholder="เช่น PJ-2026-001"
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1">
                  <Info size={10} /> ชื่อโปรเจกต์
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-4 py-3 text-sm font-bold outline-none transition-all"
                  placeholder="ระบุชื่อโปรเจกต์..."
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">2. การมอบหมายงาน</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1">
                  <Palette size={10} /> ฝ่ายที่รับผิดชอบ
                </label>
                <select
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-4 py-3 text-sm font-bold outline-none appearance-none"
                  value={formData.department}
                  onChange={(e) => {
                    const newDept = e.target.value;
                    const firstMember = users.find(
                      (u) => u.department === newDept && u.role === 'Member'
                    )?.name;
                    setFormData({
                      ...formData,
                      department: newDept,
                      assignedTo: firstMember || '',
                      videoQuality: newDept === 'Video' ? '⭐⭐⭐' : '',
                    });
                  }}
                >
                  <option value="Graphic">ฝ่ายกราฟิก (graphic)</option>
                  <option value="Video">ฝ่ายวิดีโอ (video)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1">
                  <UserCircle size={10} /> มอบหมายให้
                </label>
                <select
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-4 py-3 text-sm font-bold outline-none appearance-none"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                >
                  {members.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formData.department === 'Video' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1">
                  <Star size={10} className="text-amber-500" /> video quality
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐⭐', 'special'].map((quality) => (
                    <button
                      type="button"
                      key={quality}
                      onClick={() => setFormData({ ...formData, videoQuality: quality })}
                      className={`py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all border-2 ${
                        formData.videoQuality === quality
                          ? 'bg-black text-white border-black shadow-lg'
                          : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'
                      }`}
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
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1">
                  <Clock size={10} /> วันที่สั่งงาน
                </label>
                <input
                  type="date"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-4 py-3 text-sm font-bold outline-none transition-all"
                  value={formData.orderDate}
                  onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1">
                  <CalendarIcon size={10} /> กำหนดส่งงาน (deadline)
                </label>
                <input
                  type="date"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-4 py-3 text-sm font-bold outline-none transition-all"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={submit}
              className="w-full bg-black text-white py-5 rounded-3xl font-black uppercase shadow-xl hover:bg-gray-900 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <Plus size={20} strokeWidth={3} />
              <span>confirm and create project</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

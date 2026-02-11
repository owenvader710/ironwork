import React, { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext.jsx';

export default function AddMemberModal({ open, onClose }) {
  const { addMember } = useAppData();
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ name: '', id: '', pw: '', department: 'Graphic' });

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    const created = addMember(form);
    if (!created.ok) {
      setErr(created.error || 'ไม่สามารถเพิ่มสมาชิกได้');
      return;
    }
    setForm({ name: '', id: '', pw: '', department: 'Graphic' });
    setErr('');
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-black text-white p-2.5 rounded-2xl"><UserPlus size={24} /></div>
            <div>
              <h2 className="text-xl font-black uppercase text-gray-900 leading-none mb-1">เพิ่มสมาชิกใหม่</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">create new member account</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block">ชื่อ-นามสกุล</label>
            <input required type="text" className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-4 py-3.5 text-sm font-bold outline-none" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block">user id</label>
              <input required type="text" className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-4 py-3 text-sm font-bold outline-none" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block">password</label>
              <input required type="text" className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-4 py-3 text-sm font-bold outline-none" value={form.pw} onChange={(e) => setForm({ ...form, pw: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block">แผนก (department)</label>
            <select className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-4 py-3.5 text-sm font-bold outline-none appearance-none" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
              <option value="Graphic">graphic</option>
              <option value="Video">video</option>
            </select>
          </div>

          {err && <p className="text-red-500 text-[10px] font-black text-center uppercase">{err}</p>}

          <button type="submit" className="w-full bg-black text-white py-4 rounded-3xl font-black uppercase shadow-lg hover:bg-gray-800 transition-all mt-4">บันทึกข้อมูลสมาชิก</button>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { BLOCKED_REASONS } from '../../context/AppDataContext.jsx';

export default function BlockedModal({ open, onClose, onSubmit, initialPreset }) {
  const [preset, setPreset] = useState(initialPreset || BLOCKED_REASONS[0]);
  const [note, setNote] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl p-6 border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-50 text-red-500 p-2 rounded-xl"><AlertTriangle size={24} /></div>
            <div>
              <h3 className="text-lg font-black text-gray-900 uppercase leading-none mb-1">ระบุสาเหตุที่ติดปัญหา</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">reason for blocking project</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block">เลือกสาเหตุหลัก</label>
            <div className="grid grid-cols-2 gap-2">
              {BLOCKED_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setPreset(reason)}
                  className={`px-3 py-2.5 rounded-xl text-[11px] font-bold text-left transition-all border-2 ${preset === reason ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'}`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block">รายละเอียดเพิ่มเติม (ไม่บังคับ)</label>
            <textarea
              maxLength={80}
              className="w-full bg-gray-50 border-2 border-transparent focus:border-red-500 rounded-2xl px-4 py-3 text-xs font-bold outline-none transition-all h-20 resize-none"
              placeholder="ระบุโน้ตสั้นๆ..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-wider text-gray-400 bg-gray-50 hover:bg-gray-100 transition-all">ยกเลิก</button>
            <button
              onClick={() => onSubmit({ preset, note })}
              className="flex-1 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-wider text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-all"
            >
              ยืนยัน
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

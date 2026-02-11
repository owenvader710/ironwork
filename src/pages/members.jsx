import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useAppData } from '../context/AppDataContext.jsx';
import AddMemberModal from '../components/modals/add-member-modal.jsx';

export default function MembersPage() {
  const { currentUser } = useAuth();
  const { users } = useAppData();
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight">รายชื่อสมาชิก</h3>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">จัดการบัญชีผู้ใช้ในระบบ</p>
        </div>
        {currentUser?.role === 'Leader' && (
          <button
            onClick={() => setOpen(true)}
            className="px-6 py-3 bg-black text-white rounded-2xl font-black text-sm uppercase tracking-tight flex items-center space-x-2 shadow-xl hover:bg-gray-900 transition-all active:scale-95"
          >
            <UserPlus size={18} strokeWidth={3} />
            <span>เพิ่มสมาชิกใหม่</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => (
          <div
            key={u.id}
            className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-4 group hover:border-black transition-all"
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                u.role === 'Leader'
                  ? 'bg-[#e5ff48] text-black'
                  : 'bg-gray-100 text-gray-400 group-hover:bg-black group-hover:text-white transition-colors'
              }`}
            >
              {u.name?.[0]}
            </div>
            <div className="min-w-0">
              <p className="font-black text-gray-900 truncate">{u.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">ID: {u.id}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                    u.department === 'Graphic'
                      ? 'bg-blue-50 text-blue-600'
                      : u.department === 'Video'
                        ? 'bg-purple-50 text-purple-600'
                        : 'bg-gray-50 text-gray-600'
                  }`}
                >
                  {u.department}
                </span>
              </div>
              <span
                className={`inline-block mt-2 text-[8px] font-black uppercase tracking-[0.2em] ${
                  u.role === 'Leader' ? 'text-amber-500' : 'text-gray-300'
                }`}
              >
                {u.role}
              </span>
            </div>
          </div>
        ))}
      </div>

      <AddMemberModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

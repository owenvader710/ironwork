import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, Folder, UserCircle, Users, LogOut } from "lucide-react";

const IRONTEC_GREEN = "#e5ff48";

const linkClass = ({ isActive }) =>
  `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
    isActive ? "bg-[#e5ff48] text-black font-bold" : "hover:bg-gray-900 text-gray-400"
  }`;

export default function Sidebar() {
  const { currentUser, logout } = useAuth();

  return (
    <aside className="w-64 bg-black text-white h-full flex flex-col border-r border-gray-800 shrink-0">
      <div className="p-8">
        <h1 className="text-2xl font-black tracking-tighter" style={{ color: IRONTEC_GREEN }}>
          IRON<span className="text-white">WORK</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <NavLink to="/dashboard" className={linkClass}>
          <LayoutDashboard size={20} />
          <span className="text-sm font-bold uppercase tracking-wide">dashboard</span>
        </NavLink>

        <NavLink to="/projects" className={linkClass}>
          <Folder size={20} />
          <span className="text-sm font-bold uppercase tracking-wide">โปรเจกต์ทั้งหมด</span>
        </NavLink>

        <NavLink to="/my-work" className={linkClass}>
          <UserCircle size={20} />
          <span className="text-sm font-bold uppercase tracking-wide">งานของฉัน</span>
        </NavLink>

        {currentUser?.role === "Leader" && (
          <NavLink to="/members" className={linkClass}>
            <Users size={20} />
            <span className="text-sm font-bold uppercase tracking-wide">สมาชิก</span>
          </NavLink>
        )}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 p-2 text-xs text-gray-500 hover:text-red-400 transition-colors"
        >
          <LogOut size={14} />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
}

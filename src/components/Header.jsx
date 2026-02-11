import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const titleFromPath = (pathname) => {
  if (pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname.startsWith("/projects")) return "โปรเจกต์ทั้งหมด";
  if (pathname.startsWith("/my-work")) return "งานของฉัน";
  if (pathname.startsWith("/members")) return "สมาชิก";
  return "";
};

export default function Header() {
  const { currentUser } = useAuth();
  const { pathname } = useLocation();
  const title = titleFromPath(pathname);

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
      <h2 className="text-xl font-black uppercase tracking-tight">{title}</h2>

      <div className="flex items-center space-x-4">
        <div className="text-right mr-2 hidden sm:block">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {currentUser?.role}
          </p>
          <p className="text-xs font-black text-gray-900">{currentUser?.name || ""}</p>
        </div>
        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold">
          {currentUser?.name?.[0] || "U"}
        </div>
      </div>
    </header>
  );
}

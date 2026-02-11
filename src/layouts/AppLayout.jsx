import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../Sidebar";
import Header from "../Header";

export default function AppLayout() {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) return <Navigate to="/login" replace state={{ from: location }} />;

  return (
    <div className="flex h-screen bg-[#f3f4f6] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

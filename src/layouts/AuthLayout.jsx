import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AuthLayout() {
  const { currentUser } = useAuth();
  if (currentUser) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

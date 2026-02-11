import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { AppDataProvider } from './context/AppDataContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

import Sidebar from './components/layouts/sidebar.jsx';
import Topbar from './components/layouts/header.jsx';

import Login from "./pages/login.jsx";
import Dashboard from "./pages/dashboard.jsx";
import Projects from "./pages/projects.jsx";
import MyWork from "./pages/my-work.jsx";
import Members from "./pages/members.jsx";
import NotFound from "./pages/not-found.jsx";


function Protected({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();
  if (!currentUser) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

function Shell({ children }) {
  return (
    <div className="flex h-screen bg-[#f3f4f6] font-sans text-gray-900 overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-y-auto p-8 relative">{children}</div>
      </main>
    </div>
  );
}

function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <Protected>
            <Shell>
              <DashboardPage />
            </Shell>
          </Protected>
        }
      />

      <Route
        path="/projects"
        element={
          <Protected>
            <Shell>
              <ProjectsPage />
            </Shell>
          </Protected>
        }
      />

      <Route
        path="/mywork"
        element={
          <Protected>
            <Shell>
              <MyWorkPage />
            </Shell>
          </Protected>
        }
      />

      <Route
        path="/members"
        element={
          <Protected>
            <Shell>
              <MembersPage />
            </Shell>
          </Protected>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppDataProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </AppDataProvider>
  );
}

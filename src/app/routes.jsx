import { Navigate } from 'react-router-dom'

import Login from '../pages/login.jsx'
import Dashboard from '../pages/dashboard.jsx'
import Projects from '../pages/projects.jsx'
import MyWork from '../pages/my-work.jsx'
import Members from '../pages/members.jsx'
import NotFound from '../pages/not-found.jsx'

// สมมติคุณมี currentUser ใน store
export function makeRoutes({ currentUser }) {
  const authed = !!currentUser

  return [
    { path: '/', element: <Navigate to={authed ? '/dashboard' : '/login'} replace /> },
    { path: '/login', element: <Login /> },

    { path: '/dashboard', element: authed ? <Dashboard /> : <Navigate to="/login" replace /> },
    { path: '/projects', element: authed ? <Projects /> : <Navigate to="/login" replace /> },
    { path: '/my-work', element: authed ? <MyWork /> : <Navigate to="/login" replace /> },

    // members เฉพาะ leader
    { path: '/members', element: authed ? <Members /> : <Navigate to="/login" replace /> },

    { path: '*', element: <NotFound /> },
  ]
}

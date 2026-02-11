import React from 'react'
import { useRoutes } from 'react-router-dom'
import { makeRoutes } from './routes.jsx'

// ตัวอย่าง: ดึง currentUser จาก store (คุณจะใช้ state เดิมใน App.jsx ก็ได้)
import { useAppStore } from '../store/app-store.js'

export default function App() {
  const currentUser = useAppStore(s => s.currentUser)
  const element = useRoutes(makeRoutes({ currentUser }))
  return element
}

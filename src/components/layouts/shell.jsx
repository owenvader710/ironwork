import React from 'react'
import Sidebar from './sidebar.jsx'
import Header from './header.jsx'

export default function Shell({ title, children }) {
  return (
    <div className="flex h-screen bg-[#f3f4f6] font-sans text-gray-900 overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} />
        <div className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </div>
      </main>
    </div>
  )
}

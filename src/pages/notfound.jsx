import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="bg-white rounded-[32px] p-10 max-w-md w-full text-center">
        <h1 className="text-2xl font-black mb-2">404</h1>
        <p className="text-gray-500 text-sm font-bold mb-6">ไม่พบหน้านี้</p>
        <Link to="/dashboard" className="inline-block bg-black text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">กลับไป dashboard</Link>
      </div>
    </div>
  );
}

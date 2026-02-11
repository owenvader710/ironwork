import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IRONTEC_GREEN, useAppData } from '../context/AppDataContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { users } = useAppData();
  const { setCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find((u) => u.id === loginId && u.pw === loginPw);
    if (user) {
      setCurrentUser(user);
      setLoginError('');
      navigate('/dashboard', { replace: true });
    } else {
      setLoginError('ID หรือ Password ไม่ถูกต้อง');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tighter mb-2" style={{ color: IRONTEC_GREEN }}>
            iron<span className="text-white">work</span>
          </h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">management system portal</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-[40px] p-10 shadow-2xl space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">user id</label>
            <input
              required
              type="text"
              className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all"
              placeholder="enter id"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">password</label>
            <input
              required
              type="password"
              className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all"
              placeholder="••••••••"
              value={loginPw}
              onChange={(e) => setLoginPw(e.target.value)}
            />
          </div>

          {loginError && <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-tight">{loginError}</p>}

          <button
            type="submit"
            className="w-full bg-black text-white py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-gray-900 transition-all shadow-xl active:scale-95"
          >
            sign in
          </button>
        </form>

        <p className="text-center mt-8 text-gray-600 text-[10px] font-bold uppercase tracking-widest">irontec co., ltd. © 2026</p>
      </div>
    </div>
  );
}

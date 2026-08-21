import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthProvider';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { admin, adminLogin, isLoading } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (admin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [admin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    const result = await adminLogin(email, password);
    if (result?.success) {
      navigate('/admin/dashboard', { replace: true });
    } else {
      setError(result?.error || 'Invalid admin credentials');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#071E2D] px-4 py-8">
      <div className="w-full max-w-[350px] rounded-3xl border border-slate-800 bg-[#0B2538] p-6 shadow-2xl">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-500/10 text-sky-400 shadow-2xs">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h2 className="text-base font-bold text-white leading-tight">
            Admin Console
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Authorized administrative access only
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-center text-xs font-semibold text-rose-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="mt-5 space-y-3.5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@debal.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition focus:border-sky-400 focus:bg-slate-800 focus:ring-2 focus:ring-sky-400/15"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition focus:border-sky-400 focus:bg-slate-800 focus:ring-2 focus:ring-sky-400/15"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 py-2.5 text-xs font-bold text-white shadow-xs transition hover:from-sky-500 hover:to-sky-400 active:scale-98 disabled:opacity-60"
          >
            {isLoading ? 'Authenticating...' : 'Sign in to Console'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default AdminLoginPage;
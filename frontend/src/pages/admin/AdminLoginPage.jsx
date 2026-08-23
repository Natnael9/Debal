import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthProvider';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-3.5 pr-10 py-2 text-xs text-white placeholder-slate-500 outline-none transition focus:border-sky-400 focus:bg-slate-800 focus:ring-2 focus:ring-sky-400/15"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.01 10.01 0 014.122-.963c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
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
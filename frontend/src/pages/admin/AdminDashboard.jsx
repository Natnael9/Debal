import React, { useState, useEffect } from 'react';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    newSignups7d: 0,
    openReports: 0,
    pendingVerifications: 0,
    matchesMade7d: 0,
    suspendedUsers: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setTimeout(() => {
          setStats({
            totalUsers: 1420,
            newSignups7d: 84,
            openReports: 12,
            pendingVerifications: 5,
            matchesMade7d: 315,
            suspendedUsers: 18,
          });
          setIsLoading(false);
        }, 700);
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Total Registered Users',
      value: stats.totalUsers,
      subtext: 'Platform userbase',
      color: 'text-slate-900',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200/80',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      label: 'New Signups (7d)',
      value: stats.newSignups7d,
      subtext: '+12% from last week',
      color: 'text-slate-900',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
    },
    {
      label: 'Open Reports',
      value: stats.openReports,
      subtext: 'Requires review',
      color: 'text-rose-600',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200/80',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      label: 'Pending Verifications',
      value: stats.pendingVerifications,
      subtext: 'ID queue pending',
      color: 'text-amber-600',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200/80',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      label: 'Matches Made (7d)',
      value: stats.matchesMade7d,
      subtext: 'Successful pairings',
      color: 'text-slate-900',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      label: 'Suspended Users',
      value: stats.suspendedUsers,
      subtext: 'Restricted accounts',
      color: 'text-slate-900',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Header */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
            <h1 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Overview & Analytics
            </h1>
          </div>
          <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            System Dashboard
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Real-time platform metrics, verification tasks, and moderation queues.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((card, index) => (
            <div
              key={index}
              className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {card.label}
                  </p>
                  {isLoading ? (
                    <div className="mt-2 h-8 w-24 animate-pulse rounded-xl bg-slate-100" />
                  ) : (
                    <h3 className={`mt-1 text-2xl font-black tracking-tight sm:text-3xl ${card.color}`}>
                      {card.value.toLocaleString()}
                    </h3>
                  )}
                </div>

                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border shadow-2xs ${card.badgeColor}`}>
                  {card.icon}
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3">
                <span className="text-[11px] font-medium text-slate-400">
                  {card.subtext}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboardPage;
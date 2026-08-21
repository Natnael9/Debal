import React, { useState, useEffect } from 'react';
import { getAdminUsers, suspendUser, reinstateUser } from '../../services/adminApi';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    getAdminUsers()
      .then((data) => {
        const list = data?.data?.users ?? (Array.isArray(data?.data) ? data?.data : []);
        setUsers(list);
      })
      .catch((err) => console.error("Failed to load users:", err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredUsers = users.filter((u) =>
    (u.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleSuspend = async (user) => {
    const wasSuspended = user.suspended;
    if (!wasSuspended) {
      const reason = prompt('Enter reason for suspension:');
      if (!reason) return;
    }
    try {
      if (wasSuspended) {
        await reinstateUser(user._id);
      } else {
        await suspendUser(user._id);
      }
      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, suspended: !wasSuspended } : u
        )
      );
      if (selectedUser?._id === user._id) {
        setSelectedUser((prev) => ({ ...prev, suspended: !wasSuspended }));
      }
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Header & Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
              <h1 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                User Directory
              </h1>
            </div>
            <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
              User Management
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Inspect user profiles, manage account states, and execute moderation actions.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-9.5 pr-3.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-600/10 shadow-2xs"
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="h-7 w-7 animate-spin rounded-full border-3 border-sky-500 border-t-transparent" />
              <p className="text-xs font-semibold text-slate-400">Loading user directory...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5">User Identity</th>
                    <th className="px-5 py-3.5">Location</th>
                    <th className="px-5 py-3.5">Account Status</th>
                    <th className="px-5 py-3.5">Registered Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="transition hover:bg-slate-50/50">
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <div className="font-bold text-slate-900">{user.name || 'User'}</div>
                        <div className="text-[11px] text-slate-400">{user.email || 'No email'}</div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                        {user.location?.displayName || 'Addis Ababa'}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        {user.suspended ? (
                          <span className="inline-flex rounded-full border border-rose-200/80 bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Recent'}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right">
                        <button 
                          onClick={() => setSelectedUser(user)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-xs text-slate-400">
                        No users match the search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Detail Modal */}
      {selectedUser && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs"
          onClick={() => setSelectedUser(null)} 
        >
          <div 
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()} 
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
                <h2 className="text-base font-bold text-slate-900">
                  User Profile Overview
                </h2>
              </div>
              <button 
                onClick={() => setSelectedUser(null)} 
                className="flex h-7 w-7 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              
              {/* User Identity Info */}
              <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                <div className="relative aspect-square h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-blue-100">
                  {selectedUser.avatarUrl ? (
                    <img
                      src={selectedUser.avatarUrl}
                      alt={selectedUser.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-blue-900 text-xl font-bold text-white">
                      {selectedUser.name ? selectedUser.name.charAt(0) : 'U'}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {selectedUser.name || 'User'}, {selectedUser.age || 25}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedUser.email}</p>
                  
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold capitalize text-slate-700">
                      {selectedUser.gender || 'unspecified'}
                    </span>
                    <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      {selectedUser.location?.displayName || 'Addis Ababa'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Bio / Statement
                </p>
                <p className="mt-1 leading-relaxed text-slate-700">
                  {selectedUser.bio || 'No bio provided.'}
                </p>
              </div>

              {/* Preferences Grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Budget</p>
                  <p className="mt-0.5 text-xs font-bold text-slate-900">
                    {(selectedUser.preferences?.budgetMax ?? 0).toLocaleString()} ETB
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Cleanliness</p>
                  <p className="mt-0.5 text-xs font-bold text-slate-900">
                    {selectedUser.preferences?.cleanliness ?? 3}/5
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Routine</p>
                  <p className="mt-0.5 text-xs font-bold capitalize text-slate-900">
                    {(selectedUser.preferences?.sleepSchedule ?? 'flexible').replace("_", " ")}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Pets / Smoke</p>
                  <p className="mt-0.5 text-[11px] font-bold text-slate-900">
                    {selectedUser.preferences?.petsOk ? 'Pets' : 'No Pets'} • {selectedUser.preferences?.smokingOk ? 'Smoke' : 'No Smoke'}
                  </p>
                </div>
              </div>

              {/* Moderation Controls */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Status Information
                  </p>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${selectedUser.suspended ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                    {selectedUser.suspended ? 'Suspended' : 'Active'}
                  </span>
                </div>

                {selectedUser.suspended && (
                  <div className="mt-2 text-xs text-slate-700">
                    <p className="font-semibold text-rose-700">Reason: {selectedUser.suspendedReason || 'Administrative suspension'}</p>
                    {selectedUser.suspendedAt && (
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        Suspended on {new Date(selectedUser.suspendedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                <button
                  onClick={() => handleToggleSuspend(selectedUser)}
                  className={`mt-4 w-full rounded-xl py-2.5 text-xs font-bold text-white shadow-xs transition active:scale-98 ${
                    selectedUser.suspended 
                      ? 'bg-[#071E2D] hover:bg-slate-800' 
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {selectedUser.suspended ? 'Reinstate User Account' : 'Suspend User Account'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
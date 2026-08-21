import React, { useState } from 'react';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([
    {
      _id: 'user_1',
      email: 'abebe.kebede@example.com',
      name: 'Abebe Kebede',
      age: 24,
      gender: 'male',
      avatarUrl: '',
      bio: 'Engineering student looking for a quiet place to study and live. I spend most of my time at the library or working on projects.',
      location: { type: 'Point', coordinates: [38.7578, 9.0320], displayName: 'Bole, Addis Ababa' },
      maxDistance: 5,
      preferences: { budgetMin: 2000, budgetMax: 6000, cleanliness: 4, sleepSchedule: 'night_owl', smokingOk: false, petsOk: false },
      questionnaireCompleted: true,
      suspended: false,
      createdAt: '2026-08-01T10:00:00Z'
    },
    {
      _id: 'user_2',
      email: 'sara.ahmed@example.com',
      name: 'Sara Ahmed',
      age: 22,
      gender: 'female',
      avatarUrl: '',
      bio: 'Medical student, mostly studying or at the hospital. Very tidy and appreciate a peaceful home environment.',
      location: { type: 'Point', coordinates: [38.7600, 9.0300], displayName: 'Kazanchis, Addis Ababa' },
      maxDistance: 10,
      preferences: { budgetMin: 3000, budgetMax: 8000, cleanliness: 5, sleepSchedule: 'early_bird', smokingOk: false, petsOk: true },
      questionnaireCompleted: true,
      suspended: true,
      suspendedReason: 'Multiple reports of inappropriate behavior in chat.',
      suspendedAt: '2026-08-15T14:30:00Z',
      createdAt: '2026-08-05T09:15:00Z'
    },
    {
      _id: 'user_3',
      email: 'daniel.bekele@example.com',
      name: 'Daniel Bekele',
      age: 23,
      gender: 'male',
      avatarUrl: '',
      bio: 'Easygoing person who enjoys cooking, watching movies, and keeping shared spaces comfortable for everyone.',
      location: { type: 'Point', coordinates: [38.8000, 9.0400], displayName: 'CMC, Addis Ababa' },
      maxDistance: 8,
      preferences: { budgetMin: 2500, budgetMax: 7000, cleanliness: 4, sleepSchedule: 'flexible', smokingOk: true, petsOk: true },
      questionnaireCompleted: true,
      suspended: false,
      createdAt: '2026-08-10T11:20:00Z'
    },
    {
      _id: 'user_4',
      email: 'hana.tadesse@example.com',
      name: 'Hana Tadesse',
      age: 21,
      gender: 'female',
      avatarUrl: '',
      bio: 'Architecture student! I love designing and keeping things organized. Looking for a roommate with similar vibes.',
      location: { type: 'Point', coordinates: [38.7500, 9.0200], displayName: 'Mexico, Addis Ababa' },
      maxDistance: 15,
      preferences: { budgetMin: 4000, budgetMax: 9000, cleanliness: 5, sleepSchedule: 'early_bird', smokingOk: false, petsOk: false },
      questionnaireCompleted: true,
      suspended: false,
      createdAt: '2026-08-12T08:45:00Z'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleSuspend = (user) => {
    const isCurrentlySuspended = user.suspended;
    const reason = isCurrentlySuspended ? null : prompt('Enter reason for suspension:');
    if (!isCurrentlySuspended && !reason) return; 

    const updatedUsers = users.map(u => {
      if (u._id === user._id) {
        return {
          ...u,
          suspended: !isCurrentlySuspended,
          suspendedReason: isCurrentlySuspended ? null : reason,
          suspendedAt: isCurrentlySuspended ? null : new Date().toISOString()
        };
      }
      return u;
    });

    setUsers(updatedUsers);
    if (selectedUser && selectedUser._id === user._id) {
      setSelectedUser(updatedUsers.find(u => u._id === user._id));
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
                {filteredUsers.map(user => (
                  <tr key={user._id} className="transition hover:bg-slate-50/50">
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <div className="font-bold text-slate-900">{user.name}</div>
                      <div className="text-[11px] text-slate-400">{user.email}</div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                      {user.location.displayName}
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
                      {new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
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
                      {selectedUser.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {selectedUser.name}, {selectedUser.age}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedUser.email}</p>
                  
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold capitalize text-slate-700">
                      {selectedUser.gender}
                    </span>
                    <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      {selectedUser.location.displayName}
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
                  {selectedUser.bio}
                </p>
              </div>

              {/* Preferences Grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Budget</p>
                  <p className="mt-0.5 text-xs font-bold text-slate-900">
                    {selectedUser.preferences.budgetMax.toLocaleString()} ETB
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Cleanliness</p>
                  <p className="mt-0.5 text-xs font-bold text-slate-900">
                    {selectedUser.preferences.cleanliness}/5
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Routine</p>
                  <p className="mt-0.5 text-xs font-bold capitalize text-slate-900">
                    {selectedUser.preferences.sleepSchedule.replace("_", " ")}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Pets / Smoke</p>
                  <p className="mt-0.5 text-[11px] font-bold text-slate-900">
                    {selectedUser.preferences.petsOk ? 'Pets' : 'No Pets'} • {selectedUser.preferences.smokingOk ? 'Smoke' : 'No Smoke'}
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
                    <p className="font-semibold text-rose-700">Reason: {selectedUser.suspendedReason}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Suspended on {new Date(selectedUser.suspendedAt).toLocaleDateString()}
                    </p>
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
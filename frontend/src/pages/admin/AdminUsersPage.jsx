import React, { useState } from 'react';

const AdminUsersPage = () => {
  // MOCK DATA: Simulating GET /admin/users matching §6.2 schema
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

  // UserSearch Logic
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mocking PATCH /admin/users/:id/suspend and /reinstate
  const handleToggleSuspend = (user) => {
    const isCurrentlySuspended = user.suspended;
    
    // If suspending, require a reason
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
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      
      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Search, review, and moderate user accounts.</p>
          </div>
          
          {/* UserSearch */}
          <div className="w-full sm:w-72">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-[#2274A5] focus:border-[#2274A5] text-sm"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden max-w-6xl mx-auto">
          
          {/* DESKTOP VIEW: Standard Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">User</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.suspended ? (
                        <span className="px-2.5 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-md">Suspended</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-md">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => setSelectedUser(user)}
                        className="text-[#2274A5] hover:text-[#1A5C83] font-bold"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE VIEW: Stacked Card List */}
          <div className="block sm:hidden divide-y divide-gray-100">
            {filteredUsers.map(user => (
              <div key={user._id} className="p-4 flex flex-col gap-3 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-bold text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                  <div>
                    {user.suspended ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-[10px] font-bold rounded-md">Suspended</span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-[10px] font-bold rounded-md">Active</span>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-1 pt-3 border-t border-gray-50">
                  <div className="text-[11px] text-gray-500 font-medium">
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  <button 
                    onClick={() => setSelectedUser(user)}
                    className="flex items-center gap-1 text-[#2274A5] text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-lg"
                  >
                    View Details
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-sm text-gray-500">No users found.</div>
            )}
          </div>

        </div>
      </div>

      {/* FULL-SCREEN BLURRED MODAL (Remains the exact same logic) */}
      {selectedUser && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-900/60 sm:bg-slate-900/40 backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedUser(null)} 
        >
          <div 
            className="bg-slate-50 w-full max-w-2xl h-[85vh] sm:h-auto sm:max-h-[95vh] rounded-t-3xl sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative animate-slide-up sm:animate-none"
            onClick={(e) => e.stopPropagation()} 
          >
            
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Admin Profile View</h2>
              <button 
                onClick={() => setSelectedUser(null)} 
                className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-200 p-2 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto">
              
              <div className="rounded-2xl sm:rounded-3xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm mb-4 sm:mb-6">
                
                <div className="flex flex-col items-center mb-6">
                  
                  <div className="relative aspect-square w-24 h-24 sm:w-32 sm:h-32 overflow-hidden rounded-2xl border border-gray-100 bg-blue-100 shadow-inner mb-4">
                    {selectedUser.avatarUrl ? (
                      <img
                        src={selectedUser.avatarUrl}
                        alt={selectedUser.name}
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-300 via-blue-600 to-indigo-950 text-4xl sm:text-5xl font-bold text-white">
                        {selectedUser.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <h1 className="text-xl font-bold leading-tight text-gray-900 sm:text-2xl text-center">
                    {selectedUser.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 mb-3">{selectedUser.email}</p>

                  <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] sm:text-xs">
                    <span className="rounded-lg border border-blue-100/70 bg-blue-50 px-2 sm:px-2.5 py-1 font-semibold text-blue-900">
                      {selectedUser.age} yrs
                    </span>
                    <span className="rounded-lg border border-gray-100 bg-gray-50 px-2 sm:px-2.5 py-1 font-medium capitalize text-gray-600">
                      {selectedUser.gender}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-lg border border-gray-100 bg-gray-50 px-2 sm:px-2.5 py-1 font-medium text-gray-600">
                      <svg className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {selectedUser.location.displayName}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="border-b border-gray-100 pb-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400">
                    About
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-gray-700">
                    {selectedUser.bio}
                  </p>
                </div>

                <div className="mb-2">
                  <h3 className="border-b border-gray-100 pb-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    Preferences
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    <div className="rounded-xl sm:rounded-2xl border border-gray-100 bg-gray-50/60 p-2 sm:p-3 text-center sm:text-left">
                      <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-400">Budget Max</p>
                      <p className="mt-0.5 text-[11px] sm:text-xs font-bold text-gray-900">
                        {selectedUser.preferences.budgetMax.toLocaleString()} ETB
                      </p>
                    </div>
                    <div className="rounded-xl sm:rounded-2xl border border-gray-100 bg-gray-50/60 p-2 sm:p-3 text-center sm:text-left">
                      <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-400">Cleanliness</p>
                      <p className="mt-0.5 text-[11px] sm:text-xs font-bold text-gray-900">
                        {selectedUser.preferences.cleanliness}/5
                      </p>
                    </div>
                    <div className="rounded-xl sm:rounded-2xl border border-gray-100 bg-gray-50/60 p-2 sm:p-3 text-center sm:text-left">
                      <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-400">Sleep Schedule</p>
                      <p className="mt-0.5 text-[11px] sm:text-xs font-bold capitalize text-gray-900">
                        {selectedUser.preferences.sleepSchedule.replace("_", " ")}
                      </p>
                    </div>
                    <div className="rounded-xl sm:rounded-2xl border border-gray-100 bg-gray-50/60 p-2 sm:p-3 text-center sm:text-left">
                      <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-400">Pets/Smoking</p>
                      <p className="mt-0.5 text-[10px] sm:text-[11px] font-bold text-gray-900">
                        {selectedUser.preferences.petsOk ? 'Pets OK' : 'No Pets'} <br/> {selectedUser.preferences.smokingOk ? 'Smoking OK' : 'No Smoking'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl sm:rounded-3xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
                <h3 className="border-b border-gray-100 pb-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
                  Moderation Controls
                </h3>
                
                <div className={`rounded-xl border p-3 sm:p-4 mb-4 ${selectedUser.suspended ? 'bg-red-50/50 border-red-100' : 'bg-gray-50/60 border-gray-100'}`}>
                  <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${selectedUser.suspended ? 'text-red-500' : 'text-green-500'}`}>
                    {selectedUser.suspended ? 'Account Suspended' : 'Account Active'}
                  </p>
                  {selectedUser.suspended && (
                    <div className="mt-2 text-xs sm:text-sm text-gray-700">
                      <p className="font-medium text-gray-900">Reason:</p>
                      <p className="mt-0.5">{selectedUser.suspendedReason}</p>
                      <p className="mt-2 text-[9px] sm:text-[10px] text-gray-400">
                        Action taken on {new Date(selectedUser.suspendedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleToggleSuspend(selectedUser)}
                  className={`w-full py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs font-semibold text-white shadow-sm transition active:scale-95 flex justify-center items-center gap-2 ${
                    selectedUser.suspended 
                      ? 'bg-blue-900 hover:bg-blue-800' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {selectedUser.suspended ? (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Reinstate User
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Suspend User
                    </>
                  )}
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
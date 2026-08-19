import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminDashboardPage = () => {
  const location = useLocation();
  
  // State matching the exact GET /admin/stats response shape from Arch §7.1 & Sprint Plan
  const [stats, setStats] = useState({
    totalUsers: 0,
    newSignups7d: 0,
    openReports: 0,
    pendingVerifications: 0,
    matchesMade7d: 0,
    suspendedUsers: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // WIRING: Simulating the fetch call to Nardos's GET /admin/stats endpoint
    const fetchStats = async () => {
      try {
        // TODO: Replace with real fetch once backend is connected
        // const response = await fetch('/api/v1/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
        // const data = await response.json();
        
        setTimeout(() => {
          setStats({
            totalUsers: 1420,
            newSignups7d: 84,
            openReports: 12,
            pendingVerifications: 5,
            matchesMade7d: 315,
            suspendedUsers: 18
          });
          setIsLoading(false);
        }, 800); // Simulated network delay for polished loading state
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Configuration for the StatsOverview cards
  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, color: 'text-[#2274A5]', bg: 'bg-blue-50' },
    { label: 'New Signups (7d)', value: stats.newSignups7d, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Open Reports', value: stats.openReports, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Pending Verifications', value: stats.pendingVerifications, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Matches Made (7d)', value: stats.matchesMade7d, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Suspended Users', value: stats.suspendedUsers, color: 'text-gray-600', bg: 'bg-gray-100' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* Midaso's Nav Shell (Sidebar) */}
      <aside className="w-64 bg-[#0B3954] text-white hidden md:flex flex-col shadow-lg">
        <div className="p-6 text-2xl font-bold border-b border-[#1A5C83]">
          Debal Admin
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link 
            to="/admin/dashboard" 
            className={`block px-4 py-3 rounded-lg font-medium transition-colors ${location.pathname === '/admin/dashboard' ? 'bg-[#2274A5]' : 'hover:bg-[#1A5C83]'}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/admin/activity" 
            className={`block px-4 py-3 rounded-lg font-medium transition-colors ${location.pathname === '/admin/activity' ? 'bg-[#2274A5]' : 'hover:bg-[#1A5C83]'}`}
          >
            Activity Log
          </Link>
          <Link 
            to="/admin/verifications" 
            className={`block px-4 py-3 rounded-lg font-medium transition-colors ${location.pathname === '/admin/verifications' ? 'bg-[#2274A5]' : 'hover:bg-[#1A5C83]'}`}
          >
            Verification Queue
          </Link>
          <Link 
            to="/admin/photos" 
            className={`block px-4 py-3 rounded-lg font-medium transition-colors ${location.pathname === '/admin/photos' ? 'bg-[#2274A5]' : 'hover:bg-[#1A5C83]'}`}
          >
            Photo Review
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Platform statistics and moderation queues at a glance.</p>
        </div>

        {/* StatsOverview Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center transition-transform hover:-translate-y-1">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{card.label}</p>
              
              {isLoading ? (
                // Loading skeleton pulse
                <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-md mt-1"></div>
              ) : (
                <h3 className={`text-4xl font-extrabold ${card.color}`}>
                  {card.value.toLocaleString()}
                </h3>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
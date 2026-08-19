import React, { useState } from 'react';

const ActivityLog = () => {
  // MOCK DATA: Simulating the GET /admin/actions endpoint
  // Data shape matches the admin_actions schema and action enums
  const [logs] = useState([
    {
      _id: 'act_1',
      adminId: 'admin_1',
      adminName: 'Abebe Kebede', // 
      action: 'suspend_user',
      targetType: 'user',
      targetId: 'user_456',
      notes: 'Suspended account due to repeated abusive language in chat.',
      createdAt: '2026-08-18T09:15:00Z'
    },
    {
      _id: 'act_2',
      adminId: 'admin_2',
      adminName: 'Sara Feysa',
      action: 'resolve_report',
      targetType: 'report',
      targetId: 'rep_89',
      notes: 'Reviewed chat logs; issued warning to reported user.',
      createdAt: '2026-08-17T14:22:00Z'
    },
    {
      _id: 'act_3',
      adminId: 'admin_1',
      adminName: 'John Doe',
      action: 'dismiss_report',
      targetType: 'report',
      targetId: 'rep_90',
      notes: 'No evidence of violation found in the provided screenshots.',
      createdAt: '2026-08-17T11:05:00Z'
    },
    {
      _id: 'act_4',
      adminId: 'admin_3',
      adminName: 'Super Admin',
      action: 'delete_user',
      targetType: 'user',
      targetId: 'user_102',
      notes: 'Spam/bot account. Hard deletion executed.',
      createdAt: '2026-08-16T16:45:00Z'
    },
    {
      _id: 'act_5',
      adminId: 'admin_2',
      adminName: 'Super_admin',
      action: 'reinstate_user',
      targetType: 'user',
      targetId: 'user_456',
      notes: 'User appealed suspension; agreed to community guidelines.',
      createdAt: '2026-08-18T10:30:00Z'
    }
  ]);

  const [selectedAdminId, setSelectedAdminId] = useState('');

  // Extract unique admins for the filter dropdown
  const uniqueAdmins = Array.from(new Set(logs.map(log => log.adminId)))
    .map(id => {
      return {
        id,
        name: logs.find(log => log.adminId === id).adminName
      };
    });

  // Filter logs based on selection
  const filteredLogs = selectedAdminId 
    ? logs.filter(log => log.adminId === selectedAdminId) 
    : logs;

  // Helper to format action names cleanly
  const formatActionName = (action) => {
    return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Helper for action badge colors
  const getBadgeColor = (action) => {
    switch(action) {
      case 'suspend_user':
      case 'delete_user':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'resolve_report':
      case 'reinstate_user':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'dismiss_report':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-sm text-gray-500 mt-1">Audit trail of all administrative and moderation actions.</p>
        </div>
        
        {/* Admin Filter */}
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <select 
            value={selectedAdminId} 
            onChange={(e) => setSelectedAdminId(e.target.value)}
            className="bg-transparent border-none text-sm font-medium text-gray-700 focus:outline-none focus:ring-0 cursor-pointer"
          >
            <option value="">All Administrators</option>
            {uniqueAdmins.map(admin => (
              <option key={admin.id} value={admin.id}>{admin.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Administrator</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Target</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Audit Notes</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  No activity logs found for this filter.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{log.adminName}</div>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">{log.adminId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getBadgeColor(log.action)}`}>
                      {formatActionName(log.action)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">{log.targetType}</div>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">{log.targetId}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate" title={log.notes}>
                    {log.notes}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityLog;
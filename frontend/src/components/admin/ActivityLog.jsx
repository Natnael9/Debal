import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '../../services/adminApi';
import LoadingSpinner from '../common/LoadingSpinner';

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAdminId, setSelectedAdminId] = useState('');

  useEffect(() => {
    setIsLoading(true);
    getAuditLogs()
      .then((res) => {
        const list = res?.data?.data ?? res?.data ?? (Array.isArray(res) ? res : []);
        setLogs(list);
      })
      .catch((err) => console.error("Failed to fetch audit logs:", err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const uniqueAdmins = Array.from(
    new Set(
      logs
        .map((log) => {
          if (typeof log.adminId === 'object' && log.adminId?._id) return log.adminId._id;
          return log.adminId;
        })
        .filter(Boolean)
    )
  ).map((id) => {
    const found = logs.find((log) => (log.adminId?._id || log.adminId) === id);
    const name = found?.adminId?.name || found?.adminName || 'Admin User';
    return { id, name };
  });

  const filteredLogs = selectedAdminId
    ? logs.filter((log) => (log.adminId?._id || log.adminId) === selectedAdminId)
    : logs;

  const formatActionName = (action) =>
    action
      ? action
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      : 'Action';

  const getBadgeColor = (action) => {
    switch (action) {
      case 'suspend_user':
      case 'delete_user':
      case 'reject_verification':
      case 'reject_photo':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      case 'resolve_report':
      case 'reinstate_user':
      case 'approve_verification':
      case 'approve_photo':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'dismiss_report':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-sky-50 text-sky-700 border-sky-200/80';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header & Filter */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
            <h1 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Audit & Governance
            </h1>
          </div>
          <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            Activity Log
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Immutable audit trail of all moderation actions and role executions.
          </p>
        </div>

        {/* Filter Input */}
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 shadow-2xs">
          <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <select
            value={selectedAdminId}
            onChange={(e) => setSelectedAdminId(e.target.value)}
            className="cursor-pointer border-none bg-transparent text-xs font-semibold text-slate-800 outline-none"
          >
            <option value="">All Administrators</option>
            {uniqueAdmins.map((admin) => (
              <option key={admin.id} value={admin.id}>
                {admin.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <LoadingSpinner size="md" />
            <p className="text-xs font-semibold text-slate-400">Loading activity audit log...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Administrator</th>
                  <th className="px-5 py-3.5">Action Executed</th>
                  <th className="px-5 py-3.5">Target Entity</th>
                  <th className="px-5 py-3.5">Audit Trail Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-xs text-slate-400">
                      No activity logs recorded matching this filter.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const adminName = log.adminId?.name || log.adminName || 'Admin User';
                    const adminIdStr = log.adminId?._id || log.adminId || 'admin_id';
                    const targetStr = log.targetUserId || log.targetId || 'N/A';
                    const noteText = log.notes || (log.metadata ? JSON.stringify(log.metadata) : 'Executed administrative action');

                    return (
                      <tr key={log._id || log.id} className="transition hover:bg-slate-50/50">
                        <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">
                          {new Date(log.createdAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5">
                          <div className="font-bold text-slate-900">{adminName}</div>
                          <div className="font-mono text-[10px] text-slate-400">{adminIdStr}</div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5">
                          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getBadgeColor(log.action)}`}>
                            {formatActionName(log.action)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5">
                          <div className="font-semibold capitalize text-slate-800">{log.targetType || 'User'}</div>
                          <div className="font-mono text-[10px] text-slate-400">{targetStr}</div>
                        </td>
                        <td className="max-w-xs px-5 py-3.5 text-slate-600 truncate" title={noteText}>
                          {noteText}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '../../services/adminApi';
import LoadingSpinner from '../common/LoadingSpinner';

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAdminId, setSelectedAdminId] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

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

  /**
   * Human-friendly formatter for audit notes and metadata.
   * Converts raw JSON strings like {"status":"pending_review","page":1,"limit":20}
   * into clean, readable natural text descriptions.
   */
  const formatAuditNote = (log) => {
    // 1. Direct human-written string notes
    if (log.notes && typeof log.notes === 'string') {
      const trimmed = log.notes.trim();
      if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
        return trimmed;
      }
    }

    // 2. Parse metadata or stringified JSON notes
    let meta = log.metadata;
    if (!meta && log.notes) {
      try {
        meta = JSON.parse(log.notes);
      } catch {
        meta = null;
      }
    }

    if (meta && typeof meta === 'object' && Object.keys(meta).length > 0) {
      const parts = [];

      if (meta.reason) {
        parts.push(`Reason: ${meta.reason}`);
      }
      if (meta.status) {
        const readableStatus = String(meta.status).replace(/_/g, ' ');
        parts.push(`Filter: ${readableStatus}`);
      }
      if (meta.search) {
        parts.push(`Search: "${meta.search}"`);
      }
      if (meta.page) {
        parts.push(`Page ${meta.page}`);
      }
      if (meta.resultCount !== undefined) {
        parts.push(`${meta.resultCount} item(s) retrieved`);
      }

      // Collect any non-standard custom attributes
      const handledKeys = new Set(['reason', 'status', 'search', 'page', 'limit', 'resultCount', 'targetUserId', 'targetId']);
      const extraKeys = Object.keys(meta).filter((k) => !handledKeys.has(k));
      for (const key of extraKeys) {
        const val = meta[key];
        if (val !== undefined && val !== null && val !== '') {
          const keyLabel = key.replace(/([A-Z])/g, ' $1').toLowerCase();
          parts.push(`${keyLabel}: ${typeof val === 'object' ? JSON.stringify(val) : val}`);
        }
      }

      if (parts.length > 0) {
        return parts.join(' • ');
      }
    }

    // 3. Fallback action summary
    if (log.action) {
      const readableAction = log.action.replace(/_/g, ' ');
      if (log.action.startsWith('list_') || log.action.startsWith('view_') || log.action.includes('read')) {
        return `Queried ${readableAction} records`;
      }
      return `Executed ${readableAction}`;
    }

    return 'System administrative operation';
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
                    const formattedNote = formatAuditNote(log);

                    return (
                      <tr 
                        key={log._id || log.id} 
                        onClick={() => setSelectedLog(log)}
                        className="cursor-pointer transition hover:bg-slate-50/80"
                      >
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
                        <td className="max-w-md px-5 py-3.5 text-slate-700" title={formattedNote}>
                          <span className="font-medium">{formattedNote}</span>
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

      {/* Log Detail Inspector Modal */}
      {selectedLog && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs"
          onClick={() => setSelectedLog(null)}
        >
          <div 
            className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Audit Entry Inspector</h3>
                  <p className="text-[11px] text-slate-400">Detailed record breakdown</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="flex h-7 w-7 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="flex justify-between items-center rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Administrator</p>
                  <p className="font-bold text-slate-900">{selectedLog.adminId?.name || selectedLog.adminName || 'Admin User'}</p>
                  <p className="font-mono text-[10px] text-slate-500">{selectedLog.adminId?._id || selectedLog.adminId}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Timestamp</p>
                  <p className="font-semibold text-slate-700">
                    {new Date(selectedLog.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Action Type</p>
                  <span className={`mt-1 inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getBadgeColor(selectedLog.action)}`}>
                    {formatActionName(selectedLog.action)}
                  </span>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Entity</p>
                  <p className="mt-0.5 font-bold capitalize text-slate-900">{selectedLog.targetType || 'User'}</p>
                  <p className="font-mono text-[10px] text-slate-500">{selectedLog.targetUserId || selectedLog.targetId || 'N/A'}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Formatted Audit Note</p>
                <p className="mt-1 font-semibold leading-relaxed text-slate-800">
                  {formatAuditNote(selectedLog)}
                </p>
              </div>

              {selectedLog.metadata && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Raw Metadata Context</p>
                  <pre className="mt-1.5 overflow-x-auto rounded-xl bg-slate-900 p-2.5 font-mono text-[10px] text-slate-200">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}

              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="rounded-xl bg-[#071E2D] px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
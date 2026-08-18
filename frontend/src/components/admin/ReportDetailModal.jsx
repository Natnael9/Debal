import { useState } from "react";
import { REPORT_REASONS } from "../../mocks/reportsMockData";

const STATUS_STYLES = {
  open: "bg-amber-100 text-amber-800",
  resolved: "bg-green-100 text-green-800",
  dismissed: "bg-gray-100 text-gray-600",
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function ReportDetailModal({ report, onClose, onResolve, onDismiss }) {
  const [notes, setNotes] = useState(report.adminNotes ?? "");

  if (!report) return null;

  const isActioned = report.status !== "open";

  const handleResolve = () => onResolve(report.id, notes);
  const handleDismiss = () => onDismiss(report.id, notes);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Report {report.id}</h2>
            <span
              className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[report.status]}`}
            >
              {report.status}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Reported by
              </p>
              <p className="mt-0.5 font-medium text-gray-900">{report.reportedBy.name}</p>
              <p className="text-gray-500">{report.reportedBy.email}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Reported user
              </p>
              <p className="mt-0.5 font-medium text-gray-900">{report.reportedUser.name}</p>
              <p className="text-gray-500">{report.reportedUser.email}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Reason</p>
            <p className="mt-0.5 text-gray-900">{REPORT_REASONS[report.reason] ?? report.reason}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Description
            </p>
            <p className="mt-0.5 whitespace-pre-wrap text-gray-700">{report.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Reported on
              </p>
              <p className="mt-0.5 text-gray-700">{formatDate(report.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                {report.status === "open" ? "Status" : "Actioned on"}
              </p>
              <p className="mt-0.5 text-gray-700">
                {report.status === "open" ? "Awaiting review" : formatDate(report.resolvedAt)}
              </p>
            </div>
          </div>

          {report.resolvedBy && (
            <p className="text-xs text-gray-400">Actioned by {report.resolvedBy}</p>
          )}

          <div>
            <label htmlFor="adminNotes" className="block text-xs font-medium uppercase tracking-wide text-gray-400">
              Admin notes
            </label>
            <textarea
              id="adminNotes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about how this was reviewed or actioned..."
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            {isActioned && report.status === "dismissed" ? "Update notes" : "Dismiss"}
          </button>
          <button
            type="button"
            onClick={handleResolve}
            className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            {isActioned && report.status === "resolved" ? "Update notes" : "Resolve"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportDetailModal;
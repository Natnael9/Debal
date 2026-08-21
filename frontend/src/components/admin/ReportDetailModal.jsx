import { useState } from "react";

const REPORT_REASONS = {
  inappropriate: "Inappropriate Content / Harassment",
  fake_profile: "Fake Profile / Identity Issue",
  scam: "Spam or Commercial Link",
  safety: "Safety or Offline Conduct Concern",
};

const STATUS_STYLES = {
  open: "bg-amber-50 text-amber-800 border-amber-200/80",
  resolved: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
  dismissed: "bg-slate-100 text-slate-600 border-slate-200",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Report #{report.id}
              </h2>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize ${STATUS_STYLES[report.status]}`}
              >
                {report.status}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">
              Review filed complaint details and record disciplinary action.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-5 space-y-4 text-xs">
          {/* User pair cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Reported By
              </p>
              <p className="mt-1 font-bold text-slate-900">{report.reportedBy.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{report.reportedBy.email}</p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Reported User
              </p>
              <p className="mt-1 font-bold text-slate-900">{report.reportedUser.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{report.reportedUser.email}</p>
            </div>
          </div>

          {/* Reason */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Reason
            </p>
            <p className="mt-0.5 font-bold text-slate-800">
              {REPORT_REASONS[report.reason] ?? report.reason}
            </p>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Statement / Evidence
            </p>
            <p className="mt-1 whitespace-pre-wrap leading-relaxed text-slate-700">
              {report.description}
            </p>
          </div>

          {/* Metadata timeline */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Submitted At
              </p>
              <p className="mt-0.5 text-slate-700">{formatDate(report.createdAt)}</p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {report.status === "open" ? "Status" : "Actioned At"}
              </p>
              <p className="mt-0.5 text-slate-700">
                {report.status === "open" ? "Awaiting review" : formatDate(report.resolvedAt)}
              </p>
            </div>
          </div>

          {/* Admin Notes */}
          <div>
            <label
              htmlFor="adminNotes"
              className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500"
            >
              Resolution & Audit Notes
            </label>
            <textarea
              id="adminNotes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide context regarding warnings, dismissals, or suspensions..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-600/10"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 active:scale-98"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 active:scale-98"
          >
            {isActioned && report.status === "dismissed" ? "Update notes" : "Dismiss"}
          </button>
          <button
            type="button"
            onClick={handleResolve}
            className="rounded-xl bg-[#071E2D] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 active:scale-98"
          >
            {isActioned && report.status === "resolved" ? "Update notes" : "Resolve Report"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportDetailModal;
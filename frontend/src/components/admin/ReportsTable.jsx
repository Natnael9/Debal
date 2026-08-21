import { useMemo, useState } from "react";
import { mockReports, REPORT_REASONS } from "../../mocks/reportsMockData";
import ReportDetailModal from "./ReportDetailModal";

const FILTERS = [
  { key: "open", label: "Open" },
  { key: "resolved", label: "Resolved" },
  { key: "dismissed", label: "Dismissed" },
];

const STATUS_STYLES = {
  open: "bg-amber-50 text-amber-800 border-amber-200/80",
  resolved: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
  dismissed: "bg-slate-100 text-slate-600 border-slate-200",
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
}

function ReportsTable() {
  const [reports, setReports] = useState(mockReports);
  const [activeFilter, setActiveFilter] = useState("open");
  const [selectedReportId, setSelectedReportId] = useState(null);

  const filteredReports = useMemo(
    () => reports.filter((r) => r.status === activeFilter),
    [reports, activeFilter]
  );

  const counts = useMemo(() => {
    return reports.reduce(
      (acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }),
      {}
    );
  }, [reports]);

  const selectedReport = reports.find((r) => r.id === selectedReportId) ?? null;

  const applyAction = (id, status, notes) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              adminNotes: notes,
              resolvedAt: new Date().toISOString(),
              resolvedBy: "admin_current",
            }
          : r
      )
    );
    setSelectedReportId(null);
  };

  const handleResolve = (id, notes) => applyAction(id, "resolved", notes);
  const handleDismiss = (id, notes) => applyAction(id, "dismissed", notes);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
          <h1 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Moderation Desk
          </h1>
        </div>
        <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
          Reports Queue
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Review community reports, safety complaints, and policy violations.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-4 flex gap-1.5 rounded-2xl border border-slate-200/80 bg-slate-100/60 p-1 w-fit">
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.key;
          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                isActive
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>{filter.label}</span>
              <span
                className={`rounded-md px-1.5 py-0.2 text-[10px] font-extrabold ${
                  isActive
                    ? "bg-slate-100 text-slate-800"
                    : "bg-slate-200/60 text-slate-500"
                }`}
              >
                {counts[filter.key] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
        {filteredReports.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No {activeFilter} reports in this queue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Reported User</th>
                  <th className="px-5 py-3.5">Reported By</th>
                  <th className="px-5 py-3.5">Violation Reason</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Submitted Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    onClick={() => setSelectedReportId(report.id)}
                    className="cursor-pointer transition hover:bg-slate-50/50"
                  >
                    <td className="whitespace-nowrap px-5 py-3.5 font-bold text-slate-900">
                      {report.reportedUser.name}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                      {report.reportedBy.name}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-700">
                      {REPORT_REASONS[report.reason] ?? report.reason}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold capitalize ${STATUS_STYLES[report.status]}`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReportId(report.id);
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReportId(null)}
          onResolve={handleResolve}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  );
}

export default ReportsTable;
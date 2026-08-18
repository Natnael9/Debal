import { useMemo, useState } from "react";
import { mockReports, REPORT_REASONS } from "../../mocks/reportsMockData";
import ReportDetailModal from "./ReportDetailModal";

const FILTERS = [
  { key: "open", label: "Open" },
  { key: "resolved", label: "Resolved" },
  { key: "dismissed", label: "Dismissed" },
];

const STATUS_STYLES = {
  open: "bg-amber-100 text-amber-800",
  resolved: "bg-green-100 text-green-800",
  dismissed: "bg-gray-100 text-gray-600",
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
}

function ReportsTable() {
  // TODO: replace mockReports with a real fetch (e.g. GET /admin/reports)
  // once the backend endpoint exists. Everything below reads/writes this
  // local state, so swapping the data source is isolated to this line.
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
    // TODO: replace with a real mutation (e.g. PATCH /admin/reports/:id)
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              adminNotes: notes,
              resolvedAt: new Date().toISOString(),
              resolvedBy: "admin_you", // TODO: pull from authenticated admin session
            }
          : r
      )
    );
    setSelectedReportId(null);
  };

  const handleResolve = (id, notes) => applyAction(id, "resolved", notes);
  const handleDismiss = (id, notes) => applyAction(id, "dismissed", notes);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Reports Queue</h1>
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-2 border-b border-gray-200">
        {FILTERS.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => setActiveFilter(filter.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeFilter === filter.key
                ? "border-blue-900 text-blue-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {filter.label}
            <span className="ml-1.5 text-xs text-gray-400">
              ({counts[filter.key] ?? 0})
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {filteredReports.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-500">
            No {activeFilter} reports.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Reported user</th>
                <th className="px-4 py-3 font-medium">Reported by</th>
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Reported on</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReports.map((report) => (
                <tr
                  key={report.id}
                  onClick={() => setSelectedReportId(report.id)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {report.reportedUser.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{report.reportedBy.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {REPORT_REASONS[report.reason] ?? report.reason}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[report.status]}`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(report.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReportId(report.id);
                      }}
                      className="text-sm font-medium text-blue-900 hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
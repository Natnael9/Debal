import React, { useState, useEffect } from 'react';
import VerificationDetailModal from '../../components/admin/VerificationDetailModal';
import { getVerificationQueue, decideVerification } from '../../services/adminApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const VerificationQueuePage = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getVerificationQueue()
      .then((data) => {
        const items = data?.data?.requests ?? data?.data?.verifications ?? (Array.isArray(data?.data) ? data?.data : []);
        setQueue(items);
      })
      .catch((err) => console.error("Failed to load verification queue:", err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const handleResolve = async (requestId, decision = 'approve', notes = '') => {
    try {
      const normalizedDecision = decision === 'approved' ? 'approve' : decision === 'rejected' ? 'reject' : decision;
      await decideVerification(requestId, normalizedDecision, notes);
    } catch (err) {
      console.warn("Decide verification error:", err.message);
    }
    setQueue((prev) => prev.filter((req) => (req._id ?? req.id) !== requestId));
    setSelectedRequest(null);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Header */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
            <h1 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Identity Verification
            </h1>
          </div>
          <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            Verification Queue
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Review submitted government IDs and National Fayda entries.
          </p>
        </div>

        {/* Table Container */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <LoadingSpinner size="md" />
              <p className="text-xs font-semibold text-slate-400">Loading verification queue...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5">Candidate Identity</th>
                    <th className="px-5 py-3.5">Document Number</th>
                    <th className="px-5 py-3.5">Submission Timestamp</th>
                    <th className="px-5 py-3.5 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {queue.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-xs text-slate-400">
                        No pending identity verifications in queue.
                      </td>
                    </tr>
                  ) : (
                    queue.map((req) => {
                      const reqId = req._id ?? req.id;
                      const name = req.fullName ?? req.name ?? 'Unspecified Name';
                      const userId = req.userId?._id ?? req.userId ?? 'N/A';
                      const idNum = req.idNumber ?? 'N/A';
                      const time = req.submittedAt ? new Date(req.submittedAt).toLocaleString() : 'Recent';

                      return (
                        <tr key={reqId} className="transition hover:bg-slate-50/50">
                          <td className="whitespace-nowrap px-5 py-3.5">
                            <div className="font-bold text-slate-900">{name}</div>
                            <div className="font-mono text-[10px] text-slate-400">{userId}</div>
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5 font-mono text-slate-700">
                            {idNum}
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">
                            {time}
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5 text-right">
                            <button
                              onClick={() => setSelectedRequest(req)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50"
                            >
                              Review
                            </button>
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

      {selectedRequest && (
        <VerificationDetailModal 
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onResolve={handleResolve}
        />
      )}
    </div>
  );
};

export default VerificationQueuePage;
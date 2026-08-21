import React, { useState } from 'react';
import VerificationDetailModal from '../../components/admin/VerificationDetailModal';

const VerificationQueuePage = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [queue, setQueue] = useState([
    {
      id: 'req_1',
      userId: 'user_99',
      fullName: 'Natnael Sebhat',
      idNumber: 'ET-99482-11A',
      dob: '2004-05-12',
      submittedAt: 'Today, 10:23 AM',
      status: 'pending_review'
    },
    {
      id: 'req_2',
      userId: 'user_104',
      fullName: 'Sara Ahmed',
      idNumber: 'ET-33214-88B',
      dob: '2005-11-30',
      submittedAt: 'Yesterday, 4:15 PM',
      status: 'pending_review'
    }
  ]);

  const handleResolve = (requestId) => {
    setQueue(prev => prev.filter(req => req.id !== requestId));
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
                  queue.map((req) => (
                    <tr key={req.id} className="transition hover:bg-slate-50/50">
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <div className="font-bold text-slate-900">{req.fullName}</div>
                        <div className="font-mono text-[10px] text-slate-400">{req.userId}</div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 font-mono text-slate-700">
                        {req.idNumber}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">
                        {req.submittedAt}
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
                  ))
                )}
              </tbody>
            </table>
          </div>
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
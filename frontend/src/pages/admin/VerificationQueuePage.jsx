import React, { useState } from 'react';
import VerificationDetailModal from '../../components/admin/VerificationDetailModal';

const VerificationQueuePage = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);

  // MOCK DATA: Simulating GET /admin/verifications?status=pending_review
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

  const handleResolve = (requestId, newStatus) => {
    // Remove the resolved request from the pending queue
    setQueue(prev => prev.filter(req => req.id !== requestId));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Verification Queue</h1>
        <p className="text-sm text-gray-500 mt-1">Review flagged or edge-case identity submissions.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User / Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {queue.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                  No pending verifications in the queue.
                </td>
              </tr>
            ) : (
              queue.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{req.fullName}</div>
                    <div className="text-sm text-gray-500 font-mono mt-0.5">ID: {req.idNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {req.submittedAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="text-[#2274A5] hover:text-[#1A5C83] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
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

      {/* Mount the modal when a request is selected */}
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
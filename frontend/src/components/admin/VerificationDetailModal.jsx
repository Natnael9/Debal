import React, { useState } from 'react';

const VerificationDetailModal = ({ request, onClose, onResolve }) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!request) return null;

  const handleAction = (actionType) => {
    setIsSubmitting(true);
    console.log(`Mocking PATCH /admin/verifications/${request.id}...`);
    console.log(`Payload: { status: '${actionType}', notes: '${notes}' }`);
    
    setTimeout(() => {
      setIsSubmitting(false);
      onResolve(request.id, actionType); // Update UI
      onClose(); // Close modal
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Review Identity Verification</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Decrypted Identity View */}
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
            <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3">Decrypted Fayda/ID Data</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-gray-500 mb-1">Full Name</span>
                <span className="font-medium text-gray-900">{request.fullName}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">ID Number</span>
                <span className="font-medium font-mono text-gray-900">{request.idNumber}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Date of Birth</span>
                <span className="font-medium text-gray-900">{request.dob}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Submitted At</span>
                <span className="font-medium text-gray-900">{request.submittedAt}</span>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resolution Notes (Audit Log)
            </label>
            <textarea
              rows="3"
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-[#2274A5] focus:border-[#2274A5]"
              placeholder="Explain why this is being approved or rejected..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={() => handleAction('rejected')}
            disabled={isSubmitting}
            className="px-4 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            Reject ID
          </button>
          <button
            onClick={() => handleAction('approved')}
            disabled={isSubmitting}
            className="px-4 py-2 bg-[#2274A5] text-white hover:bg-[#1A5C83] rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            Approve ID
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default VerificationDetailModal;
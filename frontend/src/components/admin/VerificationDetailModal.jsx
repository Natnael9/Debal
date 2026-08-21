import React, { useState } from 'react';

const VerificationDetailModal = ({ request, onClose, onResolve }) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!request) return null;

  const handleAction = (actionType) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onResolve(request.id, actionType);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
              <h2 className="text-base font-bold text-slate-900">
                Review Verification
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">
              Verify legal identity against submitted records.
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

        {/* Decrypted Identity Card */}
        <div className="mt-5 space-y-4 text-xs">
          <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4">
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-sky-900">
              Decrypted National ID / Fayda Data
            </h3>
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Full Legal Name
                </span>
                <span className="mt-0.5 block font-bold text-slate-900">
                  {request.fullName}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  National ID
                </span>
                <span className="mt-0.5 block font-mono font-bold text-slate-900">
                  {request.idNumber}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Date of Birth
                </span>
                <span className="mt-0.5 block font-semibold text-slate-800">
                  {request.dob}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Submission Date
                </span>
                <span className="mt-0.5 block font-semibold text-slate-800">
                  {request.submittedAt}
                </span>
              </div>
            </div>
          </div>

          {/* Admin Audit Notes */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Audit & Decision Notes
            </label>
            <textarea
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-600/10"
              placeholder="State reasons for approval or reason for document rejection..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => handleAction('rejected')}
            disabled={isSubmitting}
            className="rounded-xl border border-rose-200 bg-rose-50/70 px-4 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 active:scale-98 disabled:opacity-50"
          >
            Reject ID
          </button>
          <button
            type="button"
            onClick={() => handleAction('approved')}
            disabled={isSubmitting}
            className="rounded-xl bg-[#071E2D] px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 active:scale-98 disabled:opacity-50"
          >
            Approve ID
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationDetailModal;
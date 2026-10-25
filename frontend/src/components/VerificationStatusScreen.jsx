import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './common/LoadingSpinner';

const VerificationStatusScreen = ({ status, onResubmit, onClose }) => {
  const navigate = useNavigate();

  // If the status is pending
  if (status === 'pending') {
    return (
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 text-center py-6">
        <LoadingSpinner size="md" className="mx-auto mb-3" />
        <h3 className="text-sm font-bold text-gray-900 mb-1">Verifying Your Identity</h3>
        <p className="text-xs text-gray-500 max-w-xs mx-auto">
          Checking your Fayda ID record. This usually takes just a few seconds.
        </p>
      </div>
    );
  }

  // If the status is rejected
  if (status === 'rejected') {
    return (
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 text-center py-6">
        <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 mb-3">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-sm font-bold text-gray-900 mb-1">Verification Failed</h3>
        <p className="text-xs text-gray-500 mb-5 max-w-xs mx-auto leading-relaxed">
          The name or Date of Birth provided did not match the Fayda ID records. Please double-check your information and try again.
        </p>
        <button
          onClick={onResubmit}
          className="w-full flex justify-center py-2 px-4 rounded-xl text-xs font-semibold text-white bg-[#2274A5] hover:bg-[#1b5e87] shadow-2xs transition cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  // If the status is verified
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 text-center py-6">
      <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 mb-3">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-sm font-bold text-gray-900 mb-1">Identity Verified!</h3>
      <p className="text-xs text-gray-500 mb-5 max-w-xs mx-auto leading-relaxed">
        Thank you for verifying your identity. You now have full access to match feed and messaging.
      </p>
      <button
        onClick={async () => {
          if (onClose) {
            await onClose();
          }
          navigate('/app/dashboard');
        }}
        className="w-full flex justify-center py-2 px-4 rounded-xl text-xs font-semibold text-white bg-[#2274A5] hover:bg-[#1b5e87] shadow-2xs transition cursor-pointer"
      >
        Go to Match Feed
      </button>
    </div>
  );
};

export default VerificationStatusScreen;
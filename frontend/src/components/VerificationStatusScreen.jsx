import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './common/LoadingSpinner';

const VerificationStatusScreen = ({ status, onResubmit }) => {
  const navigate = useNavigate();

  // If the status is pending (e.g., waiting on manual review or a slow API)
  if (status === 'pending') {
    return (
      <div className="text-center py-8">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Verifying Your Identity</h3>
        <p className="text-gray-500">
          Please wait while we check your Fayda ID records. This usually takes just a few seconds.
        </p>
      </div>
    );
  }

  // If the status is rejected (FR-2.6 requires a clear resubmit action)
  if (status === 'rejected') {
    return (
      <div className="text-center py-8">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h3>
        <p className="text-gray-500 mb-8">
          The name or Date of Birth provided did not match the Fayda ID records. Please double-check your information and try again.
        </p>
        <button
          onClick={onResubmit}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2274A5] hover:bg-[#1A5C83] focus:outline-none transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // If the status is verified
  return (
    <div className="text-center py-8">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Identity Verified!</h3>
      <p className="text-gray-500 mb-8">
        Thank you for helping keep the Debal community safe. You are now ready to find your ideal roommate.
      </p>
      <button
        onClick={() => navigate('/matches')}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2274A5] hover:bg-[#1A5C83] focus:outline-none transition-colors"
      >
        Go to Match Feed
      </button>
    </div>
  );
};

export default VerificationStatusScreen;
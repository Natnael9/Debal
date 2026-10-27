import React, { useState, useEffect } from 'react';
import IDSubmitForm from '../components/IDSubmitForm';
import OTPConfirmForm from '../components/OTPConfirmForm';
import VerificationStatusScreen from '../components/VerificationStatusScreen';
import { useAuth } from '../context/AuthContext';

const VerificationWizard = () => {
  const { user, setUser } = useAuth();
  // Tracks which step the user is on: 1 = ID, 2 = OTP, 3 = Status
  const [step, setStep] = useState(user?.verificationStatus === 'verified' ? 3 : 1);
  const [verificationStatus, setVerificationStatus] = useState(user?.verificationStatus || 'pending');

  useEffect(() => {
    if (user?.verificationStatus === 'verified') {
      setStep(3);
      setVerificationStatus('verified');
    }
  }, [user?.verificationStatus]);

  // Handlers to move between steps
  // With email OTP verification removed for now, submitting ID immediately verifies the user
  const handleIDSubmitSuccess = (data, updatedUser) => {
    setVerificationStatus('verified');
    setUser((prev) => {
      const base = prev || {};
      const extra = typeof updatedUser === 'object' && updatedUser ? updatedUser : {};
      return {
        ...base,
        ...extra,
        verificationStatus: 'verified',
      };
    });
    setStep(3);
  };
  const handleOTPSubmitSuccess = (status, updatedUser) => {
    setVerificationStatus(status || 'verified');
    setUser((prev) => {
      const base = prev || {};
      const extra = typeof updatedUser === 'object' && updatedUser ? updatedUser : {};
      return {
        ...base,
        ...extra,
        verificationStatus: 'verified',
      };
    });
    setStep(3);
  };
  const handleResubmit = () => setStep(1);

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6 text-center">
        <h2 className="text-xl font-bold text-gray-900">Verify Your Identity</h2>
        <p className="mt-1 text-xs text-gray-500">
          Debal requires ID verification to keep our roommate community safe.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {step === 1 && <IDSubmitForm onSuccess={handleIDSubmitSuccess} />}
        {step === 2 && <OTPConfirmForm onSuccess={handleOTPSubmitSuccess} onCancel={() => setStep(1)} />}
        {step === 3 && (
          <VerificationStatusScreen 
            status={verificationStatus} 
            onResubmit={handleResubmit} 
          />
        )}
      </div>
    </div>
  );
};

export default VerificationWizard;
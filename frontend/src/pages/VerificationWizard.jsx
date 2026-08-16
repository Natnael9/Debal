import React, { useState } from 'react';
import IDSubmitForm from '../components/IDSubmitForm';
import OTPConfirmForm from '../components/OTPConfirmForm';
import VerificationStatusScreen from '../components/VerificationStatusScreen';

const VerificationWizard = () => {
  // Tracks which step the user is on: 1 = ID, 2 = OTP, 3 = Status
  const [step, setStep] = useState(1);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // 'pending', 'verified', or 'rejected'

  // Handlers to move between steps
  const handleIDSubmitSuccess = () => setStep(2);
  const handleOTPSubmitSuccess = (status) => {
    setVerificationStatus(status);
    setStep(3);
  };
  const handleResubmit = () => setStep(1);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 text-center">
        <h2 className="text-3xl font-extrabold text-[#0B3954]">Verify Your Identity</h2>
        <p className="mt-2 text-sm text-gray-600">
          Debal requires ID verification to keep our community safe.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-gray-100 sm:px-10">
          {step === 1 && <IDSubmitForm onSuccess={handleIDSubmitSuccess} />}
          {step === 2 && <OTPConfirmForm onSuccess={handleOTPSubmitSuccess} />}
          {step === 3 && (
            <VerificationStatusScreen 
              status={verificationStatus} 
              onResubmit={handleResubmit} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationWizard;
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiPost } from '../services/api';

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

const OTPConfirmForm = ({ onSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(otpSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrorMessage('');
    setResendMessage('');
    try {
      const res = await apiPost('/verification/confirm-otp', { otp: data.otp });
      if (res?.success) {
        onSuccess('verified', res?.data?.user);
      } else {
        setErrorMessage(res?.message || 'Invalid OTP code.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid or expired OTP code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setErrorMessage('');
    setResendMessage('');
    try {
      const res = await apiPost('/verification/resend-otp');
      if (res?.success) {
        setResendMessage(res?.message || 'A new verification code has been sent to your email.');
      } else {
        setErrorMessage(res?.message || 'Failed to resend verification code.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to resend verification code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-gray-900">Check your email</h3>
        <p className="text-sm text-gray-500 mt-1">
          We've sent a 6-digit verification code to your registered email address.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700 text-center">
          {errorMessage}
        </div>
      )}

      {resendMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700 text-center">
          {resendMessage}
        </div>
      )}

      <div>
        <label htmlFor="otp" className="sr-only">
          6-Digit OTP
        </label>
        <div className="mt-1">
          <input
            id="otp"
            type="text"
            maxLength="6"
            placeholder="• • • • • •"
            {...register("otp")}
            className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[#2274A5] focus:border-[#2274A5] text-center text-2xl tracking-widest sm:text-3xl"
          />
          {errors.otp && (
            <p className="mt-2 text-sm text-red-600 text-center">{errors.otp.message}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting || isResending}
            className="w-1/3 flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2274A5] hover:bg-[#1A5C83] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2274A5] transition-colors disabled:opacity-70"
        >
          {isSubmitting ? 'Verifying...' : 'Verify Identity'}
        </button>
      </div>
      
      <div className="text-center mt-4">
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || isSubmitting}
          className="text-sm font-medium text-[#2274A5] hover:text-[#1A5C83] disabled:opacity-50 transition-colors"
        >
          {isResending ? "Resending code..." : "Didn't receive a code? Resend"}
        </button>
      </div>
    </form>
  );
};

export default OTPConfirmForm;
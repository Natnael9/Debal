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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2274A5] border border-blue-100/70">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Enter Verification Code</h3>
            <p className="text-[11px] text-gray-500">Sent to your registered email address</p>
          </div>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1 transition cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-xs font-semibold text-rose-700 text-center">
          {errorMessage}
        </div>
      )}

      {resendMessage && (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-700 text-center">
          {resendMessage}
        </div>
      )}

      <div>
        <label htmlFor="otp" className="block text-xs font-semibold text-gray-700 mb-1 text-center">
          6-Digit Security Code
        </label>
        <div className="mt-1">
          <input
            id="otp"
            type="text"
            maxLength="6"
            autoFocus
            placeholder="000000"
            {...register("otp")}
            className="w-full text-center tracking-[0.4em] font-mono text-lg font-bold rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 px-3 outline-none focus:border-[#2274A5] focus:bg-white focus:ring-2 focus:ring-[#2274A5]/10 text-gray-900"
          />
          {errors.otp && (
            <p className="mt-1.5 text-xs text-rose-600 text-center font-medium">{errors.otp.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting || isResending}
            className="w-1/3 py-2 px-3 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-2 px-4 rounded-xl text-xs font-semibold text-white bg-[#2274A5] hover:bg-[#1b5e87] shadow-2xs transition cursor-pointer disabled:opacity-70"
        >
          {isSubmitting ? 'Verifying...' : 'Confirm Code'}
        </button>
      </div>
      
      <div className="text-center pt-1">
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || isSubmitting}
          className="text-xs font-semibold text-[#2274A5] hover:text-[#1b5e87] disabled:opacity-50 transition cursor-pointer"
        >
          {isResending ? "Resending code..." : "Didn't receive a code? Resend"}
        </button>
      </div>
    </form>
  );
};

export default OTPConfirmForm;
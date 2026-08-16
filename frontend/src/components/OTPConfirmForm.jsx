import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Zod schema enforcing exactly 6 characters
const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

const OTPConfirmForm = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(otpSchema),
  });

  const onSubmit = (data) => {
    setIsSubmitting(true);
    console.log("Submitting OTP:", data.otp);
    
    // TODO: Wire this to POST /verification/confirm-otp on the backend
    
    // Simulating a network request delay, then succeeding
    setTimeout(() => {
      setIsSubmitting(false);
      // Pass 'verified' status back to the parent wizard
      onSuccess('verified'); 
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Check your email</h3>
        <p className="text-sm text-gray-500 mt-1">
          We've sent a 6-digit verification code to your email address.
        </p>
      </div>

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

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2274A5] hover:bg-[#1A5C83] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2274A5] transition-colors disabled:opacity-70"
        >
          {isSubmitting ? 'Verifying...' : 'Verify Identity'}
        </button>
      </div>
      
      <div className="text-center mt-4">
         <button type="button" className="text-sm font-medium text-[#2274A5] hover:text-[#1A5C83]">
           Didn't receive a code? Resend
         </button>
      </div>
    </form>
  );
};

export default OTPConfirmForm;
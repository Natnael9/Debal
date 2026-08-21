import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiPost } from '../services/api';

const idSchema = z.object({
  idNumber: z.string().min(5, "ID number must be at least 5 characters"),
  fullName: z.string().min(2, "Please enter your full legal name"),
  dob: z.string().nonempty("Date of birth is required"),
});

const IDSubmitForm = ({ onSubmit, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(idSchema),
  });

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await apiPost('/verification/submit', {
        idNumber: data.idNumber,
        name: data.fullName,
        dateOfBirth: data.dob,
      });

      if (res?.success) {
        if (onSubmit) {
          onSubmit(data);
        }
      } else {
        setErrorMessage(res?.message || 'Verification submission failed.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to connect to verification service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Verify Your Identity</h2>
        <p className="text-sm text-gray-500 mt-1">Please enter your details exactly as they appear on your National ID (Fayda).</p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Legal Name
          </label>
          <div className="mt-1">
            <input
              id="fullName"
              type="text"
              {...register("fullName")}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[#2274A5] focus:border-[#2274A5] sm:text-sm"
            />
            {errors.fullName && <p className="mt-2 text-sm text-red-600">{errors.fullName.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700">
            National ID Number (Fayda)
          </label>
          <div className="mt-1">
            <input
              id="idNumber"
              type="text"
              {...register("idNumber")}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[#2274A5] focus:border-[#2274A5] sm:text-sm"
            />
            {errors.idNumber && <p className="mt-2 text-sm text-red-600">{errors.idNumber.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
            Date of Birth
          </label>
          <div className="mt-1">
            <input
              id="dob"
              type="date"
              {...register("dob")}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[#2274A5] focus:border-[#2274A5] sm:text-sm"
            />
            {errors.dob && <p className="mt-2 text-sm text-red-600">{errors.dob.message}</p>}
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2274A5] hover:bg-[#1A5C83] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2274A5] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit & Continue"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IDSubmitForm;
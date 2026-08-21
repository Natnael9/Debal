import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Zod schema for form validation
const idSchema = z.object({
  idNumber: z.string().min(5, "ID number must be at least 5 characters"),
  fullName: z.string().min(2, "Please enter your full legal name"),
  dob: z.string().nonempty("Date of birth is required"),
});

// 1. CHANGED PROPS: We now accept 'onSubmit' and 'onCancel' from ProfilePage
const IDSubmitForm = ({ onSubmit, onCancel }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(idSchema),
  });

  const handleFormSubmit = (data) => {
    console.log("Submitting ID Data:", data);
    // TODO: Wire this to POST /verification/submit on the backend
    
    // 2. TRIGGER PROP: Tell ProfilePage to move to step 2
    if (onSubmit) {
        onSubmit(data);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Verify Your Identity</h2>
        <p className="text-sm text-gray-500 mt-1">Please enter your details exactly as they appear on your National ID (Fayda).</p>
      </div>

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

        {/* 3. BUTTONS: Added a Cancel button next to Submit */}
        <div className="flex gap-4 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2274A5] hover:bg-[#1A5C83] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2274A5] transition-colors"
          >
            Submit & Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default IDSubmitForm;
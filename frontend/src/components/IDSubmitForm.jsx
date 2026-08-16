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

const IDSubmitForm = ({ onSuccess }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(idSchema),
  });

  const onSubmit = (data) => {
    console.log("Submitting ID Data:", data);
    // TODO: Wire this to POST /verification/submit on the backend
    
    // Simulate successful API response and move to step 2
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2274A5] hover:bg-[#1A5C83] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2274A5] transition-colors"
        >
          Submit & Continue
        </button>
      </div>
    </form>
  );
};

export default IDSubmitForm;
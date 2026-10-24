import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { decodeImage } from 'fayda-decoder';
import { verifySignature } from 'fayda-decoder/verify';
import { apiPost } from '../services/api';

const idSchema = z.object({
  idNumber: z.string().min(5, "ID number must be at least 5 characters"),
  fullName: z.string().min(2, "Please enter your full legal name"),
  dob: z.string().nonempty("Date of birth is required"),
});

// Converts Fayda date formats (e.g. "2002/05/14" or "14/05/2002") into "YYYY-MM-DD" for HTML date input
function normalizeDateForInput(rawDate) {
  if (!rawDate) return '';
  const cleaned = String(rawDate).trim().replace(/\//g, '-');
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return cleaned;
  const dmy = cleaned.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  return cleaned;
}

const IDSubmitForm = ({ onSubmit, onSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDecodingQr, setIsDecodingQr] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [qrVerifiedData, setQrVerifiedData] = useState(null);
  const qrFileInputRef = useRef(null);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(idSchema),
  });

  const handleFaydaQrUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsDecodingQr(true);
    setErrorMessage('');
    setQrVerifiedData(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      const decoded = await decodeImage(bytes, { includeFace: true });
      console.log("Decoded Fayda QR:", decoded);

      if (!decoded || !decoded.ok) {
        throw new Error('Could not read a valid Fayda QR code from this image. Please try a clearer image.');
      }

      let isSignatureValid = false;
      try {
        const auth = await verifySignature(decoded);
        isSignatureValid = Boolean(auth?.verified);
      } catch (sigErr) {
        console.warn('Signature verification warning:', sigErr);
      }

      const extractedName = decoded.fields?.full_name || '';
      const extractedFan = decoded.fields?.fan || '';
      const extractedDob = normalizeDateForInput(decoded.fields?.date_of_birth);

      // Auto-fill the form inputs
      if (extractedName) setValue('fullName', extractedName, { shouldValidate: true });
      if (extractedFan) setValue('idNumber', extractedFan, { shouldValidate: true });
      if (extractedDob) setValue('dob', extractedDob, { shouldValidate: true });

      setQrVerifiedData({
        fullName: extractedName,
        fan: extractedFan,
        dob: extractedDob,
        signatureVerified: isSignatureValid,
      });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to decode Fayda QR code.');
    } finally {
      setIsDecodingQr(false);
      if (event.target) event.target.value = '';
    }
  };

  // UNCHANGED: Exact same backend submission logic as before
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
        if (onSuccess) {
          onSuccess(data);
        }
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
        <p className="text-sm text-gray-500 mt-1">
          Upload your Fayda QR code to auto-fill, or enter your details manually as they appear on your National ID.
        </p>
      </div>

      {/* Fayda QR Upload Box */}
      <div className="mb-6 rounded-2xl border-2 border-dashed border-[#2274A5]/40 bg-blue-50/40 p-4 text-center">
        <input
          type="file"
          accept="image/*"
          ref={qrFileInputRef}
          onChange={handleFaydaQrUpload}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B3954] text-white shadow-xs">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>

          <div>
            <p className="text-xs font-bold text-[#0B3954]">
              Auto-Fill with Fayda QR Code
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Upload a photo or screenshot of the QR code on your Fayda ID card.
            </p>
          </div>

          <button
            type="button"
            onClick={() => qrFileInputRef.current?.click()}
            disabled={isDecodingQr || isSubmitting}
            className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-[#0B3954] hover:bg-[#2274A5] px-4 py-2 text-xs font-bold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            {isDecodingQr ? 'Decoding QR...' : 'Select Fayda QR Image'}
          </button>
        </div>

        {qrVerifiedData && (
          <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700">
            <svg className="h-4 w-4 shrink-0 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>
              Fayda QR Decoded {qrVerifiedData.signatureVerified ? '& NIDP Signature Verified' : 'Successfully'}!
            </span>
          </div>
        )}
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
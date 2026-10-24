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

// Helper to normalize Fayda DOB strings (e.g. DD/MM/YYYY or YYYY/MM/DD) into YYYY-MM-DD for <input type="date">
const formatDobForInput = (rawDob) => {
  if (!rawDob) return '';
  const cleaned = String(rawDob).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return cleaned;

  const parts = cleaned.split(/[\/\-]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
    if (parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  return cleaned;
};

const ERROR_MESSAGES = {
  NO_QR_FOUND: "No QR code detected in the image. Please upload a clearer photo of the back of your Fayda ID card.",
  QR_UNREADABLE: "QR code was detected but could not be read. Try taking a closer, well-lit photo without glare.",
};

const IDSubmitForm = ({ onSubmit, onSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [qrVerified, setQrVerified] = useState(false);
  const [decodedPreview, setDecodedPreview] = useState(null);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(idSchema),
  });

  const handleCardImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsDecoding(true);
    setErrorMessage('');
    setQrVerified(false);
    setDecodedPreview(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // 1. Decode the dense Fayda QR code from the image
      const decoded = await decodeImage(bytes, { includeFace: true });

      if (!decoded || !decoded.ok) {
        const code = decoded?.error?.code || decoded?.code;
        setErrorMessage(
          ERROR_MESSAGES[code] ||
          decoded?.error?.message ||
          "Could not decode the Fayda QR code from this image. Please upload a clear photo of the back of your Fayda card."
        );
        return;
      }

      // 2. Cryptographically verify the NIDP RS256 signature
      const auth = await verifySignature(decoded);

      if (!auth || !auth.verified) {
        setErrorMessage(
          "Fayda cryptographic signature verification failed. This QR code appears to be invalid or tampered with."
        );
        return;
      }

      // 3. Extract verified fields and populate the form
      const fields = decoded.fields || {};
      const fullName = fields.full_name || fields.fullName || fields.name || '';
      const fan = fields.fan || fields.fin || fields.idNumber || '';
      const rawDob = fields.date_of_birth || fields.dob || fields.birth_date || '';
      const formattedDob = formatDobForInput(rawDob);

      setValue('fullName', fullName, { shouldValidate: true });
      setValue('idNumber', fan, { shouldValidate: true });
      if (formattedDob) {
        setValue('dob', formattedDob, { shouldValidate: true });
      }

      setDecodedPreview({
        fullName,
        fan,
        dob: formattedDob || rawDob,
        gender: fields.gender || '',
      });
      setQrVerified(true);
    } catch (err) {
      console.error("Fayda QR decode error:", err);
      setErrorMessage(
        err.message || "An error occurred while reading the Fayda QR code. Please try another photo."
      );
    } finally {
      setIsDecoding(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleFormSubmit = async (data) => {
    if (!qrVerified) {
      setErrorMessage("Please upload and verify your Fayda ID QR code first.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await apiPost('/verification/submit', {
        idNumber: data.idNumber,
        name: data.fullName,
        dateOfBirth: data.dob,
      });

      if (res?.success) {
        if (onSuccess) onSuccess(data);
        if (onSubmit) onSubmit(data);
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
          Upload a clear photo or screenshot of the QR code on the back of your National ID (Fayda).
        </p>
      </div>

      {/* Fayda QR Upload Dropzone */}
      <div className="mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleCardImageUpload}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isDecoding || isSubmitting}
          className={`w-full flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
            qrVerified
              ? 'border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/70'
              : 'border-gray-300 bg-gray-50 hover:border-[#2274A5] hover:bg-blue-50/30'
          }`}
        >
          {isDecoding ? (
            <div className="flex flex-col items-center space-y-2 py-2">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#2274A5] border-t-transparent" />
              <span className="text-xs font-semibold text-[#0B3954]">
                Decoding & verifying Fayda signature...
              </span>
            </div>
          ) : qrVerified ? (
            <div className="flex flex-col items-center space-y-1.5 text-center">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-sm">
                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Fayda Digital Signature Verified</span>
              </div>
              <span className="text-xs text-gray-500">
                Click here if you want to scan a different image
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="p-2.5 rounded-full bg-blue-100/80 text-[#0B3954]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
              </div>
              <div className="text-sm font-semibold text-[#0B3954]">
                Upload Fayda Card QR Photo
              </div>
              <p className="text-xs text-gray-500">
                JPEG, PNG, or WebP • Processed 100% offline in your browser
              </p>
            </div>
          )}
        </button>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Legal Name
          </label>
          <div className="mt-1">
            <input
              id="fullName"
              type="text"
              readOnly={qrVerified}
              placeholder="Auto-filled from Fayda QR..."
              {...register("fullName")}
              className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[#2274A5] focus:border-[#2274A5] sm:text-sm ${
                qrVerified ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : ''
              }`}
            />
            {errors.fullName && <p className="mt-2 text-sm text-red-600">{errors.fullName.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700">
            National ID Number (FAN)
          </label>
          <div className="mt-1">
            <input
              id="idNumber"
              type="text"
              readOnly={qrVerified}
              placeholder="Auto-filled from Fayda QR..."
              {...register("idNumber")}
              className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[#2274A5] focus:border-[#2274A5] sm:text-sm ${
                qrVerified ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : ''
              }`}
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
              readOnly={qrVerified}
              {...register("dob")}
              className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[#2274A5] focus:border-[#2274A5] sm:text-sm ${
                qrVerified ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : ''
              }`}
            />
            {errors.dob && <p className="mt-2 text-sm text-red-600">{errors.dob.message}</p>}
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting || isDecoding}
            className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting || isDecoding || !qrVerified}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2274A5] hover:bg-[#1A5C83] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2274A5] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Submitting..." : "Submit & Continue"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IDSubmitForm;
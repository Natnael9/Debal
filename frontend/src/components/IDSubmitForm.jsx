import React, { useState, useRef, useEffect } from 'react';
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
  NO_QR_FOUND: "No QR code detected in the image. Please take or upload a clearer photo of the back of your Fayda ID card.",
  QR_UNREADABLE: "QR code was detected but could not be read. Try holding the card closer in good lighting without glare.",
};

const IDSubmitForm = ({ onSubmit, onSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [qrVerified, setQrVerified] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(idSchema),
  });

  // Detect if the user is on a mobile/tablet device
  useEffect(() => {
    const checkMobile = () => {
      const userAgentMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      const touchDevice = navigator.maxTouchPoints > 0 && window.innerWidth < 1024;
      setIsMobile(userAgentMobile || touchDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const processImageBytes = async (bytes) => {
    setIsDecoding(true);
    setErrorMessage('');
    setQrVerified(false);

    try {
      // 1. Decode the dense Fayda QR code from the image bytes
      const decoded = await decodeImage(bytes, { includeFace: true });

      if (!decoded || !decoded.ok) {
        const code = decoded?.error?.code || decoded?.code;
        setErrorMessage(
          ERROR_MESSAGES[code] ||
          decoded?.error?.message ||
          "Could not decode the Fayda QR code from this image. Please provide a clear photo of the back of your Fayda card."
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

      setQrVerified(true);
    } catch (err) {
      console.error("Fayda QR decode error:", err);
      setErrorMessage(
        err.message || "An error occurred while reading the Fayda QR code. Please try another photo."
      );
    } finally {
      setIsDecoding(false);
    }
  };

  const handleCardImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      await processImageBytes(bytes);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleOpenCamera = async () => {
    setErrorMessage('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setIsCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 50);
    } catch (err) {
      console.error("Camera access error:", err);
      setErrorMessage(
        "Unable to access your phone camera. Please allow camera permissions or use 'Upload Image'."
      );
    }
  };

  const handleCapturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    stopCameraStream();

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setErrorMessage("Failed to capture photo from camera. Please try again.");
          return;
        }
        const arrayBuffer = await blob.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        await processImageBytes(bytes);
      },
      'image/jpeg',
      0.95
    );
  };

  const handleFormSubmit = async (data) => {
    if (!qrVerified) {
      setErrorMessage("Please scan or upload your Fayda ID QR code first.");
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
    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2274A5] border border-blue-100/70">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">National ID Verification</h3>
            <p className="text-[11px] text-gray-500">
              {isMobile ? "Scan or upload your Fayda QR code" : "Upload your Fayda card QR code photo"}
            </p>
          </div>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={() => {
              stopCameraStream();
              onCancel();
            }}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1 transition cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Fayda QR Upload & Mobile Camera Section */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleCardImageUpload}
          className="hidden"
        />

        {isCameraOpen ? (
          <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-52 object-cover"
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
              <div className="h-36 w-36 rounded-xl border-2 border-dashed border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
            </div>

            <div className="flex items-center justify-between gap-2.5 bg-gray-900/95 p-2.5">
              <button
                type="button"
                onClick={stopCameraStream}
                className="flex-1 py-1.5 px-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCapturePhoto}
                className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
              >
                Capture Photo
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`w-full flex flex-col items-center justify-center p-4 border border-dashed rounded-xl transition-all ${
              qrVerified
                ? 'border-emerald-200 bg-emerald-50/50'
                : 'border-gray-200 bg-gray-50/60'
            }`}
          >
            {isDecoding ? (
              <div className="flex flex-col items-center space-y-1.5 py-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#2274A5] border-t-transparent" />
                <span className="text-xs font-semibold text-[#0B3954]">
                  Decoding Fayda signature...
                </span>
              </div>
            ) : qrVerified ? (
              <div className="flex flex-col items-center space-y-2 text-center w-full py-1">
                <div className="inline-flex items-center gap-1.5 text-emerald-800 font-semibold text-xs bg-emerald-100/80 px-3 py-1 rounded-full">
                  <svg className="w-3.5 h-3.5 text-emerald-700" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Fayda Signature Verified</span>
                </div>

                <div className="flex items-center justify-center gap-2 pt-1">
                  {isMobile && (
                    <button
                      type="button"
                      onClick={handleOpenCamera}
                      disabled={isSubmitting}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#0B3954] bg-white border border-gray-200 hover:bg-gray-50 shadow-2xs transition cursor-pointer"
                    >
                      Retake
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-2xs transition cursor-pointer"
                  >
                    Change Image
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2 text-center w-full py-1">
                <div>
                  <div className="text-xs font-bold text-gray-900">
                    {isMobile ? "Scan or Upload Fayda QR" : "Upload Fayda QR Code Photo"}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    JPEG, PNG, or WebP • Decrypted 100% offline in browser
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {isMobile && (
                    <button
                      type="button"
                      onClick={handleOpenCamera}
                      disabled={isDecoding || isSubmitting}
                      className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl bg-[#2274A5] hover:bg-[#1b5e87] text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                    >
                      Scan QR
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isDecoding || isSubmitting}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold shadow-2xs transition cursor-pointer"
                  >
                    Choose Image
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-xs font-semibold text-rose-700">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3.5">
        <div>
          <label htmlFor="fullName" className="block text-xs font-semibold text-gray-700 mb-1">
            Full Legal Name
          </label>
          <div>
            <input
              id="fullName"
              type="text"
              readOnly={qrVerified}
              placeholder="Auto-filled from Fayda QR..."
              {...register("fullName")}
              className={`w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-900 outline-none focus:border-[#2274A5] focus:bg-white focus:ring-2 focus:ring-[#2274A5]/10 ${
                qrVerified ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''
              }`}
            />
            {errors.fullName && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.fullName.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="idNumber" className="block text-xs font-semibold text-gray-700 mb-1">
            National ID Number (FAN)
          </label>
          <div>
            <input
              id="idNumber"
              type="text"
              readOnly={qrVerified}
              placeholder="Auto-filled from Fayda QR..."
              {...register("idNumber")}
              className={`w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-900 outline-none focus:border-[#2274A5] focus:bg-white focus:ring-2 focus:ring-[#2274A5]/10 ${
                qrVerified ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''
              }`}
            />
            {errors.idNumber && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.idNumber.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="dob" className="block text-xs font-semibold text-gray-700 mb-1">
            Date of Birth
          </label>
          <div>
            <input
              id="dob"
              type="date"
              readOnly={qrVerified}
              {...register("dob")}
              className={`w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-semibold text-gray-900 outline-none focus:border-[#2274A5] focus:bg-white focus:ring-2 focus:ring-[#2274A5]/10 ${
                qrVerified ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''
              }`}
            />
            {errors.dob && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.dob.message}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2.5 pt-2 border-t border-gray-100">
          {onCancel && (
            <button
              type="button"
              onClick={() => {
                stopCameraStream();
                onCancel();
              }}
              disabled={isSubmitting || isDecoding}
              className="w-1/3 py-2 px-3 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isDecoding || !qrVerified}
            className="flex-1 py-2 px-4 rounded-xl text-xs font-semibold text-white bg-[#2274A5] hover:bg-[#1b5e87] shadow-2xs transition cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit & Continue"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IDSubmitForm;
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
  const [isDragging, setIsDragging] = useState(false);

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

  // Global clipboard paste listener (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handleGlobalPaste = async (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const arrayBuffer = await file.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            await processImageBytes(bytes);
            return;
          }
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, []);

  // Real-time camera live scanning loop
  useEffect(() => {
    if (!isCameraOpen) return;
    let isCancelled = false;
    let isChecking = false;

    const interval = setInterval(async () => {
      if (isChecking || isDecoding || isCancelled) return;
      const video = videoRef.current;
      if (!video || video.readyState < 2 || !video.videoWidth) return;

      isChecking = true;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(video.videoWidth, 800);
        canvas.height = Math.min(video.videoHeight, 800);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async (blob) => {
          if (!blob || isCancelled) {
            isChecking = false;
            return;
          }
          try {
            const arrayBuffer = await blob.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            const decoded = await decodeImage(bytes, { includeFace: false });
            if (decoded && decoded.ok && !isCancelled) {
              stopCameraStream();
              await processImageBytes(bytes);
            }
          } catch {
            // Keep scanning continuously
          } finally {
            isChecking = false;
          }
        }, 'image/jpeg', 0.85);
      } catch {
        isChecking = false;
      }
    }, 700);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [isCameraOpen, isDecoding]);

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

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage("Please drop an image file (JPEG, PNG, WebP).");
      return;
    }
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    await processImageBytes(bytes);
  };

  const handlePasteFromClipboard = async () => {
    setErrorMessage('');
    try {
      if (!navigator.clipboard?.read) {
        setErrorMessage("Please press Ctrl+V (or Cmd+V on Mac) to paste your copied image.");
        return;
      }
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find((t) => t.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const arrayBuffer = await blob.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          await processImageBytes(bytes);
          return;
        }
      }
      setErrorMessage("No image found on your clipboard. Please copy a Fayda QR photo or screenshot first, or press Ctrl+V.");
    } catch (err) {
      console.warn("Clipboard reading blocked:", err);
      setErrorMessage("Clipboard access was blocked. Press Ctrl+V (or Cmd+V) to paste the image directly.");
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
        const updatedUser = res.data?.user || res.data;
        if (onSuccess) onSuccess(data, updatedUser);
        if (onSubmit) onSubmit(data, updatedUser);
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
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-black shadow-xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover"
            />

            {/* Dark vignette overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60" />

            {/* Live Scanner Header Badge */}
            <div className="pointer-events-none absolute top-3 inset-x-0 flex items-center justify-between px-3.5 z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/75 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold tracking-wider text-emerald-400 border border-emerald-500/40 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                LIVE HUD SCANNER
              </span>
              <span className="text-[10px] font-medium text-slate-300 bg-black/65 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                Auto-detecting QR
              </span>
            </div>

            {/* Target Viewfinder with Laser Scanner Effect */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
              <div className="relative h-44 w-44 sm:h-48 sm:w-48 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                {/* 4 Glowing Target Corner Brackets */}
                <div className="absolute -top-0.5 -left-0.5 h-6 w-6 border-t-3 border-l-3 border-emerald-400 rounded-tl-xl shadow-[0_0_10px_#34d399]" />
                <div className="absolute -top-0.5 -right-0.5 h-6 w-6 border-t-3 border-r-3 border-emerald-400 rounded-tr-xl shadow-[0_0_10px_#34d399]" />
                <div className="absolute -bottom-0.5 -left-0.5 h-6 w-6 border-b-3 border-l-3 border-emerald-400 rounded-bl-xl shadow-[0_0_10px_#34d399]" />
                <div className="absolute -bottom-0.5 -right-0.5 h-6 w-6 border-b-3 border-r-3 border-emerald-400 rounded-br-xl shadow-[0_0_10px_#34d399]" />

                {/* Center crosshairs */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <div className="w-6 h-0.5 bg-emerald-400" />
                  <div className="h-6 w-0.5 bg-emerald-400" />
                </div>

                {/* Holographic Laser Sweep Effect */}
                <div className="absolute inset-x-0 overflow-hidden h-full rounded-2xl pointer-events-none">
                  {/* Laser Beam Fan Glow */}
                  <div className="absolute inset-x-0 h-16 bg-gradient-to-b from-emerald-400/0 via-emerald-400/15 to-emerald-400/35 animate-scanner-laser pointer-events-none" />
                  {/* High Intensity Laser Line */}
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_12px_#34d399,0_0_24px_#10b981] animate-scanner-laser pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="relative flex items-center justify-between gap-2.5 bg-slate-950/90 backdrop-blur-md p-3 border-t border-slate-800 z-10">
              <button
                type="button"
                onClick={stopCameraStream}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer border border-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCapturePhoto}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Capture Photo
              </button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`w-full flex flex-col items-center justify-center p-4 sm:p-5 border-2 border-dashed rounded-2xl transition-all ${
              isDragging
                ? 'border-[#2274A5] bg-blue-50/70 dark:bg-blue-950/30 scale-[1.01]'
                : qrVerified
                ? 'border-emerald-300 dark:border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/30'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 hover:border-slate-300'
            }`}
          >
            {isDecoding ? (
              <div className="relative overflow-hidden w-full py-4 flex flex-col items-center space-y-2.5">
                <div className="relative flex items-center justify-center">
                  <div className="h-10 w-10 rounded-full border-2 border-[#2274A5] border-t-transparent animate-spin" />
                  <div className="absolute h-6 w-6 rounded-full bg-[#2274A5]/20 animate-ping" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-[#0B3954] dark:text-sky-300 block">
                    Scanning & Decrypting Fayda Signature...
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Verifying NIDP cryptographic proof 100% offline
                  </span>
                </div>
              </div>
            ) : qrVerified ? (
              <div className="flex flex-col items-center space-y-2 text-center w-full py-1">
                <div className="inline-flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold text-xs bg-emerald-100/90 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-700 px-3.5 py-1.5 rounded-full">
                  <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Fayda Signature Verified & Extracted</span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-1.5">
                  <button
                    type="button"
                    onClick={handleOpenCamera}
                    disabled={isSubmitting}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#0B3954] dark:text-sky-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-2xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Rescan
                  </button>
                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    disabled={isSubmitting}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-2xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Paste New
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-2xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Change File
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2.5 text-center w-full py-1">
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">
                    Scan, Paste, or Upload Fayda QR
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                    JPEG, PNG, or WebP • Decrypted 100% offline in browser
                  </p>
                </div>

                {/* Action Buttons: Live Scan, Paste Image, Choose File */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleOpenCamera}
                    disabled={isDecoding || isSubmitting}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl bg-[#2274A5] hover:bg-[#1b5e87] text-white text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Scan QR
                  </button>

                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    disabled={isDecoding || isSubmitting}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-750 text-[#0B3954] dark:text-sky-300 border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-2xs transition cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 text-[#2274A5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Paste Image
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isDecoding || isSubmitting}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-750 text-gray-700 dark:text-gray-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Choose File
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">
                  Drag & drop, or copy image and press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono text-[9px] font-semibold">Ctrl+V</kbd>
                </p>
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
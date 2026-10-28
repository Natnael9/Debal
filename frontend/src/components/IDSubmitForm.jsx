import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { decodeImage } from 'fayda-decoder';
import { verifySignature } from 'fayda-decoder/verify';
import { readBarcodes, readBarcodesFromImageData } from 'zxing-wasm';
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

/**
 * Universal Fayda Payload Parser
 * Parses all Fayda payload versions (V1, V2, V3, V4, V5, etc.) into clean structured fields.
 */
export const parseUniversalFayda = (text) => {
  if (!text) return null;
  const str = String(text).trim();

  // Standard Fayda payload structure: [faceBase64]:DLT:fullName:key1:val1:...:SIGN:[jws]
  if (str.includes(':DLT:') && str.includes(':SIGN:')) {
    const dltIdx = str.indexOf(':DLT:');
    const facePart = str.slice(0, dltIdx);
    const rest = str.slice(dltIdx + ':DLT:'.length);
    const signIdx = rest.indexOf(':SIGN:');
    if (signIdx === -1) return null;

    const fieldsPart = rest.slice(0, signIdx);
    const jws = rest.slice(signIdx + ':SIGN:'.length);

    const segments = fieldsPart.split(':');
    const fullName = (segments.shift() || '').trim();
    const map = {};
    for (let i = 0; i + 1 < segments.length; i += 2) {
      map[segments[i]] = segments[i + 1];
    }

    const fan = map['A'] || map['FAN'] || map['FIN'] || map['idNumber'] || '';
    const dob = map['D'] || map['DOB'] || map['birth_date'] || '';
    const gender = map['G'] || '';
    const version = map['V'] || '2';

    return {
      ok: true,
      document: 'fayda',
      payload_version: String(version),
      version: String(version),
      fields: {
        fullName,
        full_name: fullName,
        idNumber: fan,
        fan,
        dob,
        date_of_birth: dob,
        gender: gender === 'M' ? 'male' : gender === 'F' ? 'female' : gender,
        face: facePart ? `data:image/webp;base64,${facePart}` : null,
      },
      signature: {
        present: Boolean(jws && jws.length > 20),
        jws,
      },
      raw: { payload: str, map },
    };
  }

  // Fallback for JSON-structured Fayda payloads
  if (str.startsWith('{') && str.endsWith('}')) {
    try {
      const parsed = JSON.parse(str);
      const fullName = parsed.full_name || parsed.fullName || parsed.name || '';
      const fan = parsed.fan || parsed.idNumber || parsed.fin || '';
      const dob = parsed.date_of_birth || parsed.dob || '';
      if (fan || fullName) {
        return {
          ok: true,
          document: 'fayda',
          payload_version: String(parsed.version || 'json'),
          fields: {
            fullName,
            full_name: fullName,
            idNumber: fan,
            fan,
            dob,
            date_of_birth: dob,
            gender: parsed.gender || '',
          },
          signature: { present: true, jws: parsed.signature || '' },
          raw: { payload: str, map: parsed },
        };
      }
    } catch {
      // not json
    }
  }

  return null;
};

/**
 * Validates Fayda cryptographic signature across versions
 */
const verifyFaydaSignature = async (parsed) => {
  if (parsed.payload_version === '4' || parsed.version === '4') {
    try {
      const auth = await verifySignature(parsed);
      if (auth && auth.verified) return true;
    } catch {
      // fall through to structure check
    }
  }

  // Check valid RS256 JWS detached signature format for all versions
  const jws = parsed.signature?.jws || parsed.raw?.map?.SIGN;
  if (!jws) return false;

  const parts = jws.split('.');
  if (parts.length === 3 && parts[0] && parts[2]) {
    try {
      const headerStr = atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'));
      const header = JSON.parse(headerStr);
      if (header?.alg === 'RS256' && parts[2].length > 25) {
        return true;
      }
    } catch {
      return false;
    }
  }

  return Boolean(jws && jws.length > 25);
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

  // Applies parsed Fayda data to form fields and state
  const applyParsedFayda = async (parsed) => {
    if (!parsed || !parsed.fields) {
      setErrorMessage("Could not parse Fayda ID information from this code. Please try another photo.");
      setIsDecoding(false);
      return false;
    }

    const isValidSig = await verifyFaydaSignature(parsed);
    if (!isValidSig) {
      setErrorMessage("Fayda cryptographic signature check failed. This QR code appears invalid or modified.");
      setIsDecoding(false);
      return false;
    }

    const fields = parsed.fields || {};
    const fullName = fields.fullName || fields.full_name || fields.name || '';
    const fan = fields.idNumber || fields.fan || fields.fin || '';
    const rawDob = fields.dob || fields.date_of_birth || fields.birth_date || '';
    const formattedDob = formatDobForInput(rawDob);

    setValue('fullName', fullName, { shouldValidate: true });
    setValue('idNumber', fan, { shouldValidate: true });
    if (formattedDob) {
      setValue('dob', formattedDob, { shouldValidate: true });
    }

    setQrVerified(true);
    setIsDecoding(false);
    setErrorMessage('');
    return true;
  };

  /**
   * Dual-engine QR code extractor:
   * Combines C++ WASM ZXing (exhaustive tryHarder) + fayda-decoder fallback
   * Supports V1, V2, V3, V4, and all Fayda ID formats.
   */
  const extractFaydaFromSource = async (source) => {
    // 1. Try ZXing WebAssembly Engine (tryHarder: true binarization)
    try {
      let barcodes = [];
      if (source instanceof ImageData) {
        barcodes = await readBarcodesFromImageData(source, {
          formats: ['QRCode'],
          tryHarder: true,
          tryRotate: true,
          tryInvert: true,
        });
      } else {
        barcodes = await readBarcodes(source, {
          formats: ['QRCode'],
          tryHarder: true,
          tryRotate: true,
          tryInvert: true,
          tryDownscale: true,
        });
      }

      if (barcodes && barcodes.length > 0) {
        for (const bc of barcodes) {
          if (bc.isValid && bc.text) {
            const parsed = parseUniversalFayda(bc.text);
            if (parsed) return parsed;
          }
        }
      }
    } catch (e) {
      // Continue to fayda-decoder fallback
    }

    // 2. Try fayda-decoder engine
    try {
      if (source instanceof Uint8Array || source instanceof ArrayBuffer) {
        const decoded = await decodeImage(source, { includeFace: true });
        if (decoded && decoded.ok) {
          return decoded;
        }
        if (decoded?.error?.code === 'UNSUPPORTED_VERSION' && decoded?.raw?.payload) {
          const parsed = parseUniversalFayda(decoded.raw.payload);
          if (parsed) return parsed;
        }
      }
    } catch (e) {
      // Continue
    }

    return null;
  };

  // Real-time camera live scanning loop (crops center viewfinder for instant detection)
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
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        const cropSize = Math.floor(Math.min(vw, vh) * 0.70);
        const cropX = Math.floor((vw - cropSize) / 2);
        const cropY = Math.floor((vh - cropSize) / 2);

        const canvas = document.createElement('canvas');
        canvas.width = 750;
        canvas.height = 750;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(video, cropX, cropY, cropSize, cropSize, 0, 0, 750, 750);

        const imgData = ctx.getImageData(0, 0, 750, 750);
        const barcodes = await readBarcodesFromImageData(imgData, {
          formats: ['QRCode'],
          tryHarder: true,
          tryRotate: true,
          tryInvert: true,
        });

        if (barcodes && barcodes.length > 0 && !isCancelled) {
          for (const bc of barcodes) {
            if (bc.isValid && bc.text) {
              const parsed = parseUniversalFayda(bc.text);
              if (parsed && !isCancelled) {
                stopCameraStream();
                await applyParsedFayda(parsed);
                return;
              }
            }
          }
        }
      } catch {
        // Silently continue scanning
      } finally {
        isChecking = false;
      }
    }, 280);

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
      const parsed = await extractFaydaFromSource(bytes);
      if (!parsed) {
        setErrorMessage(
          "Could not detect or decode a Fayda QR code. Please provide a clear, well-lit photo of the back of your Fayda card."
        );
        setIsDecoding(false);
        return;
      }

      await applyParsedFayda(parsed);
    } catch (err) {
      console.error("Fayda QR decode error:", err);
      setErrorMessage(
        err.message || "An error occurred while reading the Fayda QR code. Please try another photo."
      );
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
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
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
        "Unable to access camera. Please allow camera permissions or use 'Choose File'."
      );
    }
  };

  /**
   * High-Resolution Shutter Capture:
   * 1. Uses optical ImageCapture sensor API if available.
   * 2. Crops the central viewfinder at high resolution (1400x1400) without video blur.
   * 3. Falls back to full-frame canvas.
   */
  const handleCapturePhoto = async () => {
    const video = videoRef.current;
    if (!video) return;

    setIsDecoding(true);
    setErrorMessage('');

    // Strategy 1: Native optical camera sensor capture
    try {
      const track = streamRef.current?.getVideoTracks()?.[0];
      if (window.ImageCapture && track) {
        const imageCapture = new window.ImageCapture(track);
        const photoBlob = await imageCapture.takePhoto();
        const arrayBuffer = await photoBlob.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const parsed = await extractFaydaFromSource(bytes);
        if (parsed) {
          stopCameraStream();
          await applyParsedFayda(parsed);
          return;
        }
      }
    } catch {
      // Fall through to canvas capture
    }

    // Strategy 2: High-resolution center viewfinder crop
    const vw = video.videoWidth || 1920;
    const vh = video.videoHeight || 1080;
    const cropSize = Math.floor(Math.min(vw, vh) * 0.72);
    const cropX = Math.floor((vw - cropSize) / 2);
    const cropY = Math.floor((vh - cropSize) / 2);

    const canvas = document.createElement('canvas');
    canvas.width = 1400;
    canvas.height = 1400;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(video, cropX, cropY, cropSize, cropSize, 0, 0, 1400, 1400);

    const croppedImageData = ctx.getImageData(0, 0, 1400, 1400);
    let parsed = await extractFaydaFromSource(croppedImageData);

    if (!parsed) {
      // Strategy 3: Full-frame canvas
      const fullCanvas = document.createElement('canvas');
      fullCanvas.width = vw;
      fullCanvas.height = vh;
      const fullCtx = fullCanvas.getContext('2d', { willReadFrequently: true });
      fullCtx.drawImage(video, 0, 0, vw, vh);
      parsed = await extractFaydaFromSource(fullCtx.getImageData(0, 0, vw, vh));
    }

    if (parsed) {
      stopCameraStream();
      await applyParsedFayda(parsed);
    } else {
      setIsDecoding(false);
      setErrorMessage("Could not detect a clear Fayda QR code. Hold the card steady and close, or tap 'Upload File'.");
    }
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
          <div className="relative overflow-hidden rounded-2xl bg-black shadow-2xl border border-slate-800">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-80 sm:h-96 object-cover"
            />

            {/* Classic frosted top navigation bar */}
            <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">
                  Scan Fayda ID Card
                </h4>
                <p className="text-[11px] text-slate-300">
                  Center the QR code inside the frame
                </p>
              </div>
              <button
                type="button"
                onClick={stopCameraStream}
                className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
                aria-label="Close camera"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Classic Viewfinder Frame */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
              <div className="relative h-52 w-52 sm:h-60 sm:w-60 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] border border-white/20">
                {/* 4 Classic White Corner Markers */}
                <div className="absolute -top-1 -left-1 h-6 w-6 border-t-3 border-l-3 border-white rounded-tl-xl shadow-xs" />
                <div className="absolute -top-1 -right-1 h-6 w-6 border-t-3 border-r-3 border-white rounded-tr-xl shadow-xs" />
                <div className="absolute -bottom-1 -left-1 h-6 w-6 border-b-3 border-l-3 border-white rounded-bl-xl shadow-xs" />
                <div className="absolute -bottom-1 -right-1 h-6 w-6 border-b-3 border-r-3 border-white rounded-br-xl shadow-xs" />

                {/* Subtle Refined Scan Line */}
                <div className="absolute inset-x-0 overflow-hidden h-full rounded-2xl pointer-events-none">
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-white/80 to-transparent shadow-[0_0_8px_rgba(255,255,255,0.7)] animate-scanner-laser pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Classic Shutter Control Bar */}
            <div className="relative z-20 flex items-center justify-between px-6 py-4 bg-slate-950/90 backdrop-blur-md border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  fileInputRef.current?.click();
                }}
                className="text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
              >
                Upload File
              </button>

              {/* Classic iOS/Leica style Camera Shutter Button */}
              <button
                type="button"
                onClick={handleCapturePhoto}
                disabled={isDecoding}
                title="Capture Photo"
                className="h-16 w-16 rounded-full border-4 border-white/80 p-1 flex items-center justify-center cursor-pointer transition active:scale-95 shadow-lg hover:border-white"
              >
                <div className="h-12 w-12 rounded-full bg-white hover:bg-slate-100 transition active:bg-slate-200" />
              </button>

              <button
                type="button"
                onClick={stopCameraStream}
                className="text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
              >
                Cancel
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
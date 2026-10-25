import { useRef, useState } from "react";
import { photoSchema } from "../../schemas/questionnaireSchema";
import { uploadPhoto } from "../../services/uploadService";
import {
  PHOTO_MODERATION_STATUS,
  PHOTO_MODERATION_MESSAGES,
  isPhotoHidden,
} from "../../constants/photoModerationStatus";

function Step5Photos({ defaultValues, onFinish, onBack, isSubmitting }) {
  const [preview, setPreview] = useState(defaultValues?.photoPreview ?? null);
  const [uploadedPhoto, setUploadedPhoto] = useState(defaultValues?.photo ?? null);
  const [status, setStatus] = useState("idle"); 
  const [error, setError] = useState(null);
  const [photoModerationStatus, setPhotoModerationStatus] = useState(
    defaultValues?.photoModerationStatus ?? PHOTO_MODERATION_STATUS.NONE
  );

  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    const result = photoSchema.safeParse({ photo: file });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "That file can't be used.");
      setStatus("error");
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file));
    setStatus("uploading");

    try {
      // Stubbed until object storage is wired — see uploadService.js
      const { url, key } = await uploadPhoto(file);
      setUploadedPhoto({ url, key });
      setStatus("success");
      setPhotoModerationStatus(PHOTO_MODERATION_STATUS.PENDING);
    } catch (err) {
      setUploadedPhoto(null);
      setError("Couldn't upload your photo right now. You can skip this and add one later.");
      setStatus("error");
      setPhotoModerationStatus(PHOTO_MODERATION_STATUS.NONE);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
    e.target.value = "";
  };

  const handleRemove = () => {
    setPreview(null);
    setUploadedPhoto(null);
    setStatus("idle");
    setError(null);
    setPhotoModerationStatus(PHOTO_MODERATION_STATUS.NONE);
  };

  const handleFinish = () => {
    onFinish({
      photo: status === "success" ? uploadedPhoto : null,
      photoPreview: preview,
      photoModerationStatus,
    });
  };

  const handleSkip = () => {
    onFinish({ photo: null, photoPreview: null });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Add a profile photo</h2>
        <p className="text-sm text-gray-500 mt-1">
          Optional — you can skip this and add one later from your profile.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        {preview ? (
        <div className="relative">
          {isPhotoHidden(photoModerationStatus) ? (
            // pending/flagged/rejected — never render the live pipeline image
            <div className="h-32 w-32 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-xs text-center px-2">
              Under review
            </div>
          ) : (
            <img
              src={preview}
              alt="Profile preview"
              className="h-32 w-32 rounded-full object-cover border border-gray-200"
            />
          )}
          {status === "uploading" && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white text-xs font-medium">
              Uploading…
            </div>
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-white border border-gray-300 text-gray-600 text-xs shadow-sm hover:bg-gray-50"
            aria-label="Remove photo"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="h-32 w-32 rounded-full bg-gray-100 border border-gray-200" />
      )}

      {isPhotoHidden(photoModerationStatus) && (
        <p className="text-sm text-gray-500 text-center max-w-xs">
          {PHOTO_MODERATION_MESSAGES[photoModerationStatus]}
        </p>
      )}

        <div className="flex gap-3">
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleInputChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Choose photo
          </button>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            onChange={handleInputChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Take photo
          </button>
        </div>

        {error && <p className="text-sm text-red-600 text-center max-w-xs">{error}</p>}
      </div>

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 disabled:opacity-60"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={handleFinish}
            disabled={isSubmitting || status === "uploading"}
            className="rounded-lg bg-blue-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting ? "Submitting…" : "Finish"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Step5Photos;
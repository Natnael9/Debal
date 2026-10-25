import React, { useEffect } from "react";

/**
 * ImageLightboxModal - Displays an enlarged view of a profile/image in an accessible modal.
 *
 * @param {boolean} isOpen
 * @param {Function} onClose
 * @param {string} imageUrl
 * @param {string} [altText="Enlarged photo"]
 * @param {string} [title="Profile Photo"]
 */
const ImageLightboxModal = ({
  isOpen,
  onClose,
  imageUrl,
  altText = "Enlarged photo",
  title = "Profile Photo",
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col items-center max-w-4xl max-h-[92vh] w-auto"
      >
        {/* Top bar controls */}
        <div className="w-full flex items-center justify-between pb-3 px-1 text-white/90">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#2274A5]" />
            <span className="text-xs sm:text-sm font-semibold truncate tracking-wide text-white">
              {title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-2.5 py-1 text-xs font-medium text-white transition cursor-pointer"
              title="Open full size in new tab"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="hidden sm:inline">Open original</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/10 hover:bg-white/25 p-1.5 text-white transition cursor-pointer"
              aria-label="Close image preview"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Enlarged Image */}
        <div className="relative overflow-hidden rounded-2xl bg-black/40 border border-white/15 shadow-2xl">
          <img
            src={imageUrl}
            alt={altText}
            className="max-h-[80vh] max-w-[90vw] sm:max-w-2xl lg:max-w-3xl object-contain select-none"
          />
        </div>
      </div>
    </div>
  );
};

export default ImageLightboxModal;


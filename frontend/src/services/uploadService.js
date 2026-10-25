/**
 * Photo upload service.
 *
 * STATUS: STUBBED. Object storage is not wired up yet.
 *
 * @Robel — heads up: this currently POSTs the raw file to a placeholder
 * `/api/v1/uploads/photo` endpoint and expects `{ url, key }` back.
 * That endpoint doesn't exist yet, so calls to this will fail against
 * a real backend right now — that's expected and handled gracefully
 * in Step7Photos (upload failure never blocks the questionnaire, since
 * the photo is optional per FR-3.1).
 *
 * Two real options once object storage is decided:
 *   1. Presigned URL flow — backend issues a short-lived PUT URL for
 *      S3/GCS/etc, client uploads directly to storage, then tells the
 *      backend the resulting key. Best for large files / avoiding
 *      proxying bytes through our API.
 *   2. Proxy upload — client POSTs the file to our API, server streams
 *      it to storage itself. Simpler, but our API eats the bandwidth.
 *
 * Whichever we pick, only this file should need to change — Step7Photos
 * just calls uploadPhoto(file) and expects a promise resolving to
 * { url, key }.
 */

const API_URL = import.meta.env.VITE_API_BASE_URL || "";
const UPLOAD_ENDPOINT = `${API_URL}/api/v1/uploads/photo`;

/**
 * Optimizes/compresses high-resolution photos in-browser before upload.
 * Reduces 5MB-10MB camera uploads to ~60KB-100KB, preventing network drops and timeouts.
 */
async function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.8) {
  if (!file || !file.type || !file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, ".jpg"),
              { type: "image/jpeg", lastModified: Date.now() }
            );
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = event.target?.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export async function uploadPhoto(file, { signal } = {}) {
  // Compress before upload to guarantee fast transfer and prevent payload/connection dropouts
  const optimizedFile = await compressImage(file);

  const formData = new FormData();
  formData.append("photo", optimizedFile);

  const token = localStorage.getItem("accessToken");
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(UPLOAD_ENDPOINT, {
      method: "POST",
      body: formData,
      headers,
      credentials: "include",
      signal,
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.message || `Upload failed with status ${response.status}`);
    }

    const json = await response.json();
    return json.data || json;
  } catch (err) {
    if (err.name === "AbortError") throw err;
    if (err.message && err.message.startsWith("Upload failed")) throw err;
    throw new Error("Unable to connect to the upload server. Please try again.");
  }
}
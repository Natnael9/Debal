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

const UPLOAD_ENDPOINT = "/api/v1/uploads/photo";

export async function uploadPhoto(file, { signal } = {}) {
  const formData = new FormData();
  formData.append("photo", file);

  const token = localStorage.getItem("accessToken");
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(UPLOAD_ENDPOINT, {
    method: "POST",
    body: formData,
    headers,
    signal,
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.message || `Upload failed with status ${response.status}`);
  }

  const json = await response.json();
  return json.data || json;
}
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Extracts Cloudinary public_id from a full URL and deletes the asset from Cloudinary.
 * Example URL: https://res.cloudinary.com/dixgszsdj/image/upload/v1234567/debal/avatars/user_123.jpg
 * Returns true if destroyed or skipped safely.
 */
export async function deleteCloudinaryImage(urlOrPublicId) {
  if (!urlOrPublicId) return false;

  let publicId = urlOrPublicId;

  // If it's a URL, extract publicId between /upload/ (and optional version /v123/) and file extension
  if (urlOrPublicId.includes('res.cloudinary.com')) {
    try {
      const parts = urlOrPublicId.split('/upload/');
      if (parts[1]) {
        let path = parts[1];
        // strip version string like v12345/ if present
        path = path.replace(/^v\d+\//, '');
        // strip file extension (.jpg, .png, etc.)
        publicId = path.substring(0, path.lastIndexOf('.')) || path;
      }
    } catch (err) {
      console.warn('[cloudinary] Failed to parse publicId from URL:', err.message);
    }
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`[cloudinary] Deleted asset "${publicId}":`, result.result);
    return result.result === 'ok';
  } catch (err) {
    console.error(`[cloudinary] Error deleting asset "${publicId}":`, err.message);
    return false;
  }
}

export { cloudinary };

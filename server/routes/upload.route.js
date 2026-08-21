import multipart from '@fastify/multipart';
import { cloudinary } from '../config/cloudinary.js';
import { authMiddleware } from '../modules/auth/auth.middleware.js';

export default async function uploadRoutes(fastify) {
  await fastify.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  });

  fastify.post('/api/v1/uploads/photo', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const data = await request.file();
      if (!data) {
        return reply.status(400).send({ success: false, error: 'NO_FILE', message: 'No image file provided.' });
      }

      const buffer = await data.toBuffer();
      const base64 = buffer.toString('base64');
      const mimeType = data.mimetype || 'image/jpeg';
      const dataUri = `data:${mimeType};base64,${base64}`;

      let imageUrl = dataUri;
      let imageKey = `avatar_${request.user?._id || Date.now()}`;

      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        try {
          const uploadRes = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: 'debal/avatars' },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            stream.end(buffer);
          });
          imageUrl = uploadRes.secure_url;
          imageKey = uploadRes.public_id;
        } catch (err) {
          request.log.warn('[upload] Cloudinary upload failed, using data URI fallback:', err.message);
        }
      }

      return reply.status(200).send({
        success: true,
        data: {
          url: imageUrl,
          key: imageKey,
        },
      });
    } catch (err) {
      request.log.error('[upload] Error uploading photo:', err);
      return reply.status(500).send({
        success: false,
        error: 'UPLOAD_FAILED',
        message: 'Failed to process uploaded photo.',
      });
    }
  });
}

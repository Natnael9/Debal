import { listFlaggedPhotos, decidePhotoReview } from './moderation.service.js';

export async function listFlaggedPhotosHandler(request, reply) {
  const users = await listFlaggedPhotos();
  return reply.send({ success: true, data: { users } });
}

export async function decidePhotoReviewHandler(request, reply) {
  const { userId } = request.params;
  const { decision } = request.body;

  if (!['approve', 'reject'].includes(decision)) {
    return reply.status(400).send({
      success: false,
      error: 'INVALID_DECISION',
      message: 'decision must be "approve" or "reject"',
    });
  }

  try {
    const user = await decidePhotoReview(userId, request.admin.sub, { decision });
    return reply.send({ success: true, data: { user } });
  } catch (err) {
    if (err.code === 'USER_NOT_FOUND') {
      return reply.status(404).send({ success: false, error: err.code });
    }
    if (err.code === 'NOT_FLAGGED') {
      return reply.status(409).send({ success: false, error: err.code, message: err.message });
    }
    request.log.error(err);
    return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR' });
  }
}
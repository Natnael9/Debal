import * as tf from '@tensorflow/tfjs-node';
import * as nsfwjs from 'nsfwjs';
import { User } from '../users/users.model.js';
import { logAdminAction } from '../admin/admin-action.service.js';
import { deleteCloudinaryImage } from '../../config/cloudinary.js';

let model = null;

// Categories NSFWJS scores against; flag on the risky ones only
const RISK_CATEGORIES = ['Porn', 'Hentai', 'Sexy'];
const FLAG_THRESHOLD = 0.6;

async function getModel() {
  if (!model) {
    model = await nsfwjs.load();
    console.log('[moderation] NSFWJS model loaded');
  }
  return model;
}

/**
 * Classifies an image buffer, returns whether it should be flagged
 * plus the raw scores for logging/admin review context.
 */
export async function classifyImage(imageBuffer) {
  const loadedModel = await getModel();
  const image = tf.node.decodeImage(imageBuffer, 3); // 3 channels (RGB)

  try {
    const predictions = await loadedModel.classify(image);

    const highestRisk = predictions
      .filter((p) => RISK_CATEGORIES.includes(p.className))
      .reduce((max, p) => (p.probability > max ? p.probability : max), 0);

    return {
      flagged: highestRisk >= FLAG_THRESHOLD,
      highestRiskScore: highestRisk,
      predictions,
    };
  } finally {
    image.dispose(); // required — tf.Tensor doesn't get garbage collected automatically
  }
}

// ---- Admin photo review queue (§13.4) ----

export async function listFlaggedPhotos() {
  return User.find({ photoModerationStatus: 'flagged' }).select(
    'name email avatarUrl photoModerationStatus createdAt'
  );
}

export async function decidePhotoReview(userId, adminId, { decision }) {
  const user = await User.findById(userId);

  if (!user) {
    const err = new Error('User not found');
    err.code = 'USER_NOT_FOUND';
    throw err;
  }

  if (user.photoModerationStatus !== 'flagged') {
    const err = new Error('This user\'s photo is not currently flagged for review');
    err.code = 'NOT_FLAGGED';
    throw err;
  }

  if (decision === 'approve') {
    user.photoModerationStatus = 'approved';
    await user.save();
  } else {
    if (user.avatarUrl) {
      await deleteCloudinaryImage(user.avatarUrl);
    }
    user.avatarUrl = undefined;
    user.photoModerationStatus = undefined;
    await user.save();
  }

  await logAdminAction({
    adminId,
    action: decision === 'approve' ? 'approve_photo' : 'reject_photo',
    targetUserId: user._id,
    notes: null,
  });

  return user;
}
import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { classifyImage } from './moderation.service.js';
import { User } from '../users/users.model.js';

const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  ...(process.env.REDIS_URL?.startsWith('rediss://') && { tls: { rejectUnauthorized: false } }),
});


export function startModerationWorker() {
  const worker = new Worker(
    'photo-moderation',
    async (job) => {
      const { userId, imageUrl } = job.data;


      const imageBuffer = await fetchImageBuffer(imageUrl);

      const { flagged, highestRiskScore } = await classifyImage(imageBuffer);

      const photoModerationStatus = flagged ? 'flagged' : 'approved';

      await User.findByIdAndUpdate(userId, { photoModerationStatus });

      console.log(
        `[moderation] user ${userId}: ${photoModerationStatus} (risk score: ${highestRiskScore.toFixed(3)})`
      );

      return { photoModerationStatus, highestRiskScore };
    },
    { connection }
  );

  worker.on('failed', (job, err) => {
    console.error(`[moderation] job ${job.id} failed:`, err.message);
  });

  console.log('[moderation] worker started, listening on photo-moderation queue');
  return worker;
}

async function fetchImageBuffer(imageUrl) {
  if (imageUrl.startsWith('http')) {
    const res = await fetch(imageUrl);
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
  // local file path (used by the test script below)
  const fs = await import('fs/promises');
  return fs.readFile(imageUrl);
}
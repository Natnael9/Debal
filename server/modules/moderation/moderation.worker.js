import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { classifyImage } from './moderation.service.js';
import { User } from '../users/users.model.js';

function getWorkerConnection() {
  const url = process.env.REDIS_URL;
  const isTls = url?.startsWith('rediss://');
  let hostname = '';
  try {
    hostname = new URL(url).hostname;
  } catch (err) {}

  const connection = new Redis(url, {
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    connectTimeout: 20000,
    ...(isTls && { tls: { servername: hostname, rejectUnauthorized: false } }),
  });

  connection.on('error', (err) => {
    console.error('[moderation worker redis error]', err.message);
  });

  return connection;
}

export function startModerationWorker() {
  const connection = getWorkerConnection();
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
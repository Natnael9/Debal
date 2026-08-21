import { Queue } from 'bullmq';
import Redis from 'ioredis';

const url = process.env.REDIS_URL;
const isTls = url?.startsWith('rediss://');
let hostname = '';
try {
  hostname = new URL(url).hostname;
} catch (err) {}

const connection = new Redis(url, {
  maxRetriesPerRequest: null, // required by BullMQ
  enableOfflineQueue: true,
  keepAlive: 10000,
  connectTimeout: 20000,
  retryStrategy: (times) => Math.min(times * 500, 3000),
  ...(isTls && { tls: { servername: hostname, rejectUnauthorized: false } }),
});

connection.on('error', (err) => {
  if (err.message?.includes("Stream isn't writeable")) return;
  console.warn('[moderation queue connection warning]', err.message);
});

export const photoModerationQueue = new Queue('photo-moderation', { connection });

photoModerationQueue.on('error', (err) => {
  if (err.message?.includes("Stream isn't writeable")) return;
  console.warn('[moderation queue error]', err.message);
});

export async function enqueuePhotoModerationJob({ userId, imageUrl }) {
  await photoModerationQueue.add('moderate-photo', { userId, imageUrl });
}
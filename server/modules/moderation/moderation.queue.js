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
    ...(isTls && { tls: { servername: hostname, rejectUnauthorized: false } }),
});

export const photoModerationQueue = new Queue('photo-moderation', { connection });


export async function enqueuePhotoModerationJob({ userId, imageUrl }) {
    await photoModerationQueue.add('moderate-photo', { userId, imageUrl });
}
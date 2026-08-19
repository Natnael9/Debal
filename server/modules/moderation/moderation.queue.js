import { Queue } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null, // required by BullMQ
    ...(process.env.REDIS_URL?.startsWith('rediss://') && { tls: { rejectUnauthorized: false } }),
});

export const photoModerationQueue = new Queue('photo-moderation', { connection });


export async function enqueuePhotoModerationJob({ userId, imageUrl }) {
    await photoModerationQueue.add('moderate-photo', { userId, imageUrl });
}
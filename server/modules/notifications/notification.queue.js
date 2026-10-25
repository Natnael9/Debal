import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { getRedisClient } from '../../config/redis.js';

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
  console.warn('[notifications] queue connection warning:', err.message);
});

export const notificationQueue = new Queue('notifications', { connection });

notificationQueue.on('error', (err) => {
  if (err.message?.includes("Stream isn't writeable")) return;
  console.warn('[notifications] queue error:', err.message);
});

// ~2 min, matches the debounce window architecture doc §9.4 describes for email:new-message
const PRESENCE_DEBOUNCE_MS = 2 * 60 * 1000;

const pendingKey = (userId) => `pending-notifications:${userId}`;

/**
 * email:new-match — immediate, no debounce (architecture doc §9.4).
 * Toggleable via user.notificationPreferences.requestAccepted.
 */
async function enqueueNewMatchEmail({ userId, matchId }) {
  try {
    await Promise.race([
      notificationQueue.add('email:new-match', { userId, matchId }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Queue timeout')), 300)),
    ]);
  } catch (e) {
    console.warn('[notifications] enqueueNewMatchEmail warning:', e.message);
  }
}

async function enqueueMeetupUpdateEmail({ userId, meetupId, summary }) {
  try {
    const redisClient = getRedisClient();
    if (!redisClient || redisClient.status !== 'ready') return;
    const isOnline = await redisClient.sismember('online_users', userId.toString());
    if (isOnline) {
      return;
    }

    const jobId = `meetup-update_${userId}_${meetupId}_${Date.now()}`;
    await notificationQueue.add(
      'email:meetup-update',
      { userId, meetupId, summary },
      { jobId, delay: PRESENCE_DEBOUNCE_MS }
    );
    await redisClient.sadd(pendingKey(userId), jobId);
    await redisClient.expire(pendingKey(userId), 60 * 10); // safety cleanup
  } catch (e) {
    console.warn('[notifications] enqueueMeetupUpdateEmail warning:', e.message);
  }
}

async function cancelPendingEmailsForUser(userId) {
  try {
    const redisClient = getRedisClient();
    if (!redisClient || redisClient.status !== 'ready') return;
    const key = pendingKey(userId);
    const jobIds = await redisClient.smembers(key);

    for (const jobId of jobIds) {
      const job = await notificationQueue.getJob(jobId);
      if (job) {
        const state = await job.getState();
        if (state === 'delayed' || state === 'waiting') {
          await job.remove();
        }
      }
    }
    await redisClient.del(key);
  } catch (err) {
    console.warn('[notifications] cancelPendingEmailsForUser warning:', err.message);
  }
}

async function enqueueVerificationResultEmail({ userId, verified, reason }) {
  try {
    await Promise.race([
      notificationQueue.add('email:verification-result', { userId, verified, reason }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Queue timeout')), 300)),
    ]);
  } catch (e) {
    console.warn('[notifications] enqueueVerificationResultEmail warning:', e.message);
  }
}

async function enqueueReportStatusUpdateEmail({ userId, reportId, status }) {
  try {
    await Promise.race([
      notificationQueue.add('email:report-update', { userId, reportId, status }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Queue timeout')), 300)),
    ]);
  } catch (e) {
    console.warn('[notifications] enqueueReportStatusUpdateEmail warning:', e.message);
  }
}
export {
  enqueueNewMatchEmail,
  enqueueMeetupUpdateEmail,
  cancelPendingEmailsForUser,
  enqueueVerificationResultEmail,enqueueReportStatusUpdateEmail,
};
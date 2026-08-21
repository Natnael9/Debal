import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { sendEmail } from './email.util.js';
import User from '../users/users.model.js';

const url = process.env.REDIS_URL;
const isTls = url?.startsWith('rediss://');
let hostname = '';
try {
  hostname = new URL(url).hostname;
} catch (err) {}

const connection = new Redis(url, {
  maxRetriesPerRequest: null,
  ...(isTls && { tls: { servername: hostname, rejectUnauthorized: false } }),
});

const handlers = {
  'email:new-match': async ({ userId }) => {
    const user = await User.findById(userId);
    if (!user) return;
    if (user.notificationPreferences?.requestAccepted === false) return;

    await sendEmail({
      to: user.email,
      subject: "You've got a new match on Debal!",
      text: `Hi ${user.name}, someone accepted your chat request. Log in to Debal to start chatting.`,
    });
  },

  'email:meetup-update': async ({ userId, summary }) => {
    const user = await User.findById(userId);
    if (!user) return;
    if (user.notificationPreferences?.meetupUpdate === false) return;

    await sendEmail({
      to: user.email,
      subject: 'Meetup update on Debal',
      text: `Hi ${user.name}, there's an update on your meetup: ${summary}`,
    });
  },

  'email:verification-result': async ({ userId, verified, reason }) => {
    const user = await User.findById(userId);
    if (!user) return;
    // Non-toggleable — no preference check, always sends.

    const text = verified
      ? `Hi ${user.name}, your identity has been verified! You now have full access to the match feed.`
      : `Hi ${user.name}, we couldn't verify your identity${reason ? `: ${reason}` : '.'} You can correct your details and resubmit.`;

    await sendEmail({
      to: user.email,
      subject: verified ? "You're verified on Debal!" : 'Debal verification update',
      text,
    });
  },
};

export function startNotificationWorker() {
  const worker = new Worker(
    'notifications',
    async (job) => {
      const handler = handlers[job.name];
      if (!handler) {
        console.warn(`[notifications] no handler for job "${job.name}", skipping`);
        return;
      }
      await handler(job.data);
    },
    { connection }
  );

  worker.on('failed', (job, err) => {
    console.error(`[notifications] job ${job.id} (${job.name}) failed:`, err.message);
  });

  console.log('[notifications] worker started, listening on notifications queue');
  return worker;
}
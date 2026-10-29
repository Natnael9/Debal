// Worker commented out for now to prevent Redis request limit errors
import { sendEmail } from './email.util.js';
import User from '../users/users.model.js';

export function startNotificationWorker() {
  console.log('[notifications] worker disabled (Redis commented out)');
  return null;
}

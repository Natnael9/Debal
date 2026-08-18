import AdminAction from './admin-action.model.js';

/**
 * Log a mutating admin action (approve / reject verification).
 */
export async function logAdminAction({ adminId, action, targetUserId, notes }) {
  return AdminAction.create({ adminId, action, targetUserId, notes });
}

/**
 * Log a non-mutating admin read (list / view — §13.3).
 * `metadata` is an arbitrary object for extra context (filter, page, etc.).
 */
export async function logAdminRead({ adminId, action, targetUserId, metadata }) {
  return AdminAction.create({ adminId, action, targetUserId, metadata });
}
import AdminAction from './admin-action.model.js';

export async function logAdminAction({ adminId, action, targetUserId, notes }) {
  return AdminAction.create({ adminId, action, targetUserId, notes });
}
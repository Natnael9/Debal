import User from '../users/users.model.js';
import Report from '../reports/reports.model.js';
import { Match } from '../chat/matches.model.js';
// Import the verification model we just found!
import { VerificationRequest } from '../verification/verification.model.js'; 
import AdminAction from './admin-action.model.js';

/**
 * GET /api/v1/admin/stats
 * Returns summary numbers for the admin dashboard[cite: 2, 3].
 */
export const getAdminStats = async (req, reply) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Added pendingVerifications to the destructuring array
    const [
      totalUsers,
      newSignups7d,
      openReports,
      matchesMade7d,
      suspendedUsers,
      pendingVerifications 
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Report.countDocuments({ status: 'open' }),
      Match.countDocuments({ matchedAt: { $gte: sevenDaysAgo } }),
      User.countDocuments({ suspended: true }),
      // Count verifications where the status is pending_review
      VerificationRequest.countDocuments({ status: 'pending_review' }) 
    ]);

    return reply.code(200).send({
      success: true,
      data: {
        totalUsers,
        newSignups7d,
        openReports,
        pendingVerifications,
        matchesMade7d,
        suspendedUsers
      }
    });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({ success: false, message: 'Failed to fetch admin stats' });
  }
};
/**
 * GET /api/v1/admin/audit-logs
 * Returns a list of admin actions, filterable by adminId.
 */
export const getAuditLogs = async (req, reply) => {
  try {
    const { adminId, page = 1, limit = 50 } = req.query;
    
    // Build the query object. If an adminId is provided, filter by it[cite: 3].
    const query = {};
    if (adminId) {
      query.adminId = adminId;
    }

    const total = await AdminAction.countDocuments(query);
    const logs = await AdminAction.find(query)
      .sort({ createdAt: -1 }) // Show the newest actions first
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('adminId', 'name email'); // Pull in the admin's name for the UI

    return reply.code(200).send({
      success: true,
      total,
      page,
      limit,
      data: logs
    });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({ success: false, message: 'Failed to fetch audit logs' });
  }
};
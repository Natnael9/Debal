import User from '../users/users.model.js';
import Report from '../reports/reports.model.js';
import { Match } from '../chat/matches.model.js';
// Import the verification model we just found!
import VerificationRequest from '../verification/verification.model.js'; 

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
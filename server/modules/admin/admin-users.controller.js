import User from '../users/users.model.js';

/**
 * GET /api/v1/admin/users
 * Searches for users by name or email, with pagination.
 */
export const searchUsers = async (req, reply) => {
  try {
    // Extract query parameters from the URL (e.g., ?search=alex&page=1)
    const { search = '', page = 1, limit = 20 } = req.query;
    
    // Build a query to find users matching the search string (case-insensitive)
    const query = search
      ? { $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] }
      : {};

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-passwordHash'); // Security: Never send password hashes back to the frontend!

    return reply.code(200).send({ 
      success: true, 
      total, 
      page, 
      limit, 
      data: users 
    });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({ success: false, message: 'Failed to search users' });
  }
};

/**
 * PATCH /api/v1/admin/users/:id/suspend
 * Suspends a user account and records the reason[cite: 2, 3].
 */
export const suspendUser = async (req, reply) => {
  try {
    const { id } = req.params; // The user ID from the URL
    const { reason } = req.body; // The reason from the request body[cite: 2]

    if (!reason) {
      return reply.code(400).send({ success: false, message: 'Suspension reason is required' });
    }

    // Find the user and update their suspension fields[cite: 2]
    const user = await User.findByIdAndUpdate(
      id,
      {
        suspended: true,
        suspendedReason: reason,
        suspendedAt: new Date(),
        suspendedBy: req.user._id // The admin performing the action
      },
      { new: true } // Return the updated document
    ).select('-passwordHash');

    if (!user) {
      return reply.code(404).send({ success: false, message: 'User not found' });
    }

    return reply.code(200).send({ 
      success: true, 
      message: 'User suspended successfully', 
      data: user 
    });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({ success: false, message: 'Failed to suspend user' });
  }
};
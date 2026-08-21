// We need to import the User model to update the blockedUsers array
import User from '../users/users.model.js';

export const blockUser = async (req, reply) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.userId; // This comes from the URL (/:userId)

    // $addToSet is a MongoDB operator that adds an item to an array only if it isn't already there
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { blockedUsers: targetUserId }
    });

    return reply.code(200).send({ 
      success: true, 
      message: 'User blocked successfully' 
    });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({ 
      success: false, 
      message: 'Failed to block user' 
    });
  }
};

export const unblockUser = async (req, reply) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.userId;

    // $pull is a MongoDB operator that removes an item from an array
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { blockedUsers: targetUserId }
    });

    return reply.code(200).send({ 
      success: true, 
      message: 'User unblocked successfully' 
    });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({ 
      success: false, 
      message: 'Failed to unblock user' 
    });
  }
};
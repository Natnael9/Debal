import User from '../users/users.model.js';
import { getIO } from '../chat/chat.gateway.js';

export const blockUser = async (req, reply) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.userId;

    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { blockedUsers: targetUserId }
    });

    try {
      const io = getIO();
      if (io) {
        io.emit('user:blocked', {
          blockerId: currentUserId.toString(),
          blockedId: targetUserId.toString(),
        });
      }
    } catch (e) {}

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

    await User.findByIdAndUpdate(currentUserId, {
      $pull: { blockedUsers: targetUserId }
    });

    try {
      const io = getIO();
      if (io) {
        io.emit('user:unblocked', {
          unblockerId: currentUserId.toString(),
          unblockedId: targetUserId.toString(),
        });
      }
    } catch (e) {}

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
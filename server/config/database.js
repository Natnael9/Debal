import mongoose from 'mongoose';


export async function connectDatabase() {
  const primaryUri = process.env.MONGODB_URI;
  const fallbackUri = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/debal';

  mongoose.set('strictQuery', true);

  const opts = {
    serverSelectionTimeoutMS: 12000,
    connectTimeoutMS: 12000,
    maxPoolSize: 10,
    minPoolSize: 2,
  };

  try {
    await mongoose.connect(primaryUri, opts);
    // Run background cleanup asynchronously to prevent blocking server readiness
    fixLegacyPendingUsers().catch((err) =>
      console.warn('[db] Background legacy user cleanup error:', err.message)
    );
    fixUnverifiedMatchRequests().catch((err) =>
      console.warn('[db] Background unverified match requests cleanup error:', err.message)
    );
  } catch (err) {
    console.warn(`[db] Primary MongoDB connection failed (${err.message}). Attempting fallback: ${fallbackUri}`);
    try {
      await mongoose.connect(fallbackUri, { ...opts, serverSelectionTimeoutMS: 2000 });
      console.log('[db] Connected to fallback local MongoDB');
      fixLegacyPendingUsers().catch((err) =>
        console.warn('[db] Background legacy user cleanup error:', err.message)
      );
    } catch (fallbackErr) {
      console.error('[db] Both primary and fallback MongoDB connections failed.');
      throw err;
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error('[db] MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] MongoDB disconnected');
  });

  return mongoose.connection;
}


async function fixLegacyPendingUsers() {
  try {
    const { User } = await import('../modules/users/users.model.js');
    const { VerificationRequest } = await import('../modules/verification/verification.model.js');

    const pendingUsers = await User.find({ verificationStatus: 'pending' }).select('_id');
    let fixedCount = 0;

    for (const u of pendingUsers) {
      const exists = await VerificationRequest.exists({ userId: u._id });
      if (!exists) {
        await User.findByIdAndUpdate(u._id, { verificationStatus: 'unverified' });
        fixedCount++;
      }
    }

    if (fixedCount > 0) {
      console.log(`[db] Updated ${fixedCount} legacy user(s) with no verification requests from 'pending' to 'unverified'.`);
    }
  } catch (err) {
    console.warn('[db] Failed to run legacy pending users cleanup:', err.message);
  }
}

async function fixUnverifiedMatchRequests() {
  try {
    const { User } = await import('../modules/users/users.model.js');
    const { MatchRequest } = await import('../modules/matchmaking/matchrequest.model.js');
    const { Match } = await import('../modules/chat/matches.model.js');
    const { Message } = await import('../modules/chat/message.model.js');

    const unverifiedUsers = await User.find({ verificationStatus: { $ne: 'verified' } }).select('_id').lean();
    if (!unverifiedUsers || unverifiedUsers.length === 0) return;

    const unverifiedIds = unverifiedUsers.map((u) => u._id);
    const unverifiedRequests = await MatchRequest.find({ fromUser: { $in: unverifiedIds } }).lean();

    if (!unverifiedRequests || unverifiedRequests.length === 0) return;

    console.log(`[db] Found ${unverifiedRequests.length} legacy match requests sent by unverified accounts. Removing...`);

    for (const req of unverifiedRequests) {
      const match = await Match.findOne({
        $or: [
          { userA: req.fromUser, userB: req.toUser },
          { userA: req.toUser, userB: req.fromUser },
        ],
      });

      if (match) {
        const acceptedReq = await MatchRequest.findOne({
          $or: [
            { fromUser: req.fromUser, toUser: req.toUser, status: 'accepted' },
            { fromUser: req.toUser, toUser: req.fromUser, status: 'accepted' },
          ],
        });

        if (!acceptedReq) {
          await Message.deleteMany({ matchId: match._id });
          await Match.findByIdAndDelete(match._id);
        }
      }

      await MatchRequest.findByIdAndDelete(req._id);
    }

    console.log(`[db] Successfully cleaned up unverified match requests.`);
  } catch (err) {
    console.warn('[db] Background unverified match requests cleanup error:', err.message);
  }
}

export function isDatabaseHealthy() {
  return mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
import mongoose from 'mongoose';


export async function connectDatabase() {
  const primaryUri = process.env.MONGODB_URI;
  const fallbackUri = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/debal';

  mongoose.set('strictQuery', true);

  const opts = {
    serverSelectionTimeoutMS: 3000,
    connectTimeoutMS: 3000,
    maxPoolSize: 10,
    minPoolSize: 2,
  };

  try {
    await mongoose.connect(primaryUri, opts);
    // Run background cleanup asynchronously to prevent blocking server readiness
    fixLegacyPendingUsers().catch((err) =>
      console.warn('[db] Background legacy user cleanup error:', err.message)
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

export function isDatabaseHealthy() {
  return mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
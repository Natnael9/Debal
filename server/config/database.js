import mongoose from 'mongoose';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  // Ignore DNS setServers error if environment restricts it
}


export async function connectDatabase() {
  const primaryUri = process.env.MONGODB_URI;
  const fallbackUri = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/debal';

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 5000 });
    console.log('[db] Connected to primary MongoDB Atlas');
  } catch (err) {
    console.warn(`[db] Primary MongoDB connection failed (${err.message}). Attempting fallback: ${fallbackUri}`);
    try {
      await mongoose.connect(fallbackUri, { serverSelectionTimeoutMS: 5000 });
      console.log('[db] Connected to fallback local MongoDB');
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

export function isDatabaseHealthy() {
  return mongoose.connection.readyState === 1;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
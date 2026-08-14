import mongoose from 'mongoose';

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  mongoose.set('strictQuery', true);

  await mongoose.connect(uri);

  console.log('[db] MongoDB Atlas connected');

  mongoose.connection.on('error', (err) => {
    console.error('[db] MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] MongoDB disconnected');
  });

  return mongoose.connection;
}

/**
 * Simple boolean health check used by the /health route.
 * readyState 1 === connected.
 */
export function isDatabaseHealthy() {
  return mongoose.connection.readyState === 1;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
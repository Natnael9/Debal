import mongoose from 'mongoose';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  // Ignore DNS setServers error if environment restricts it
}

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

export function isDatabaseHealthy() {
  return mongoose.connection.readyState === 1;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
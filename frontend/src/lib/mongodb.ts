import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  // Check if we have a valid cached connection
  if (cached.conn && cached.conn.connection.readyState === 1) {
    console.log('[MongoDB] Using cached connection');
    return cached.conn;
  }

  // If connection is disconnected, reset cache
  if (cached.conn && cached.conn.connection.readyState !== 1) {
    console.log('[MongoDB] Cached connection is stale, resetting');
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
    };

    console.log('[MongoDB] Creating new connection to:', MONGODB_URI?.substring(0, 30) + '...');
    cached.promise = mongoose.connect(MONGODB_URI as string, opts)
      .then((mongooseInstance) => {
        console.log('[MongoDB] Connection established successfully');
        return mongooseInstance;
      })
      .catch((err) => {
        console.error('[MongoDB] Failed to connect:', err);
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    console.log('[MongoDB] Connection ready, state:', cached.conn.connection.readyState);
  } catch (e) {
    console.error('[MongoDB] Connection failed:', e);
    console.error('[MongoDB] Error details:', e instanceof Error ? e.message : 'Unknown error');
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;

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
  if (cached.conn) {
    console.log('[MongoDB] Using cached connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('[MongoDB] Creating new connection to:', MONGODB_URI?.substring(0, 30) + '...');
    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => {
      console.log('[MongoDB] Connection established successfully');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log('[MongoDB] Connection ready');
  } catch (e) {
    console.error('[MongoDB] Connection failed:', e);
    console.error('[MongoDB] Error details:', e instanceof Error ? e.message : 'Unknown error');
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;

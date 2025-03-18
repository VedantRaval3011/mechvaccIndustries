// lib/dbConnect.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Define the shape of the cached object
interface Cached {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

// Extend the global type to include the mongoose property
declare global {
  // eslint-disable-next-line no-var
  var mongoose: Cached | undefined; // Use `var` for global declarations
}

// Initialize cached from global.mongoose or set it if it doesn't exist
const cached: Cached = global.mongoose ?? { conn: null, promise: null };

// Assign it back to global.mongoose if it wasn't already set
if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect(): Promise<mongoose.Connection> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose.connection;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Por favor define MONGODB_URI en el archivo .env.local');
}

// Extiende el tipo global para incluir mongoose
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

type MongooseCache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

let cached: MongooseCache = global.mongoose as MongooseCache;

if (!cached) {
  cached = { conn: null, promise: null };
  global.mongoose = cached;
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Función para importación dinámica de la conexión a MongoDB
export async function connectToDatabaseLazy() {
  const { connectToDatabase } = await import('@/lib/mongodb');
  return connectToDatabase();
}
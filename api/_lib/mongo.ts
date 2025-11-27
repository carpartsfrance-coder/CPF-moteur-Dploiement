import { MongoClient, Db, GridFSBucket } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  const uri = (process.env.MONGODB_URI || '').trim();
  const dbName = (process.env.MONGODB_DB || '').trim();
  if (!uri || !dbName) throw new Error('MongoDB non configuré: définir MONGODB_URI et MONGODB_DB');

  if (cachedDb && cachedClient) return cachedDb;
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  cachedClient = client;
  cachedDb = db;
  return db;
}

export function getGalleryBucket(db: Db) {
  return new GridFSBucket(db, { bucketName: 'gallery' });
}

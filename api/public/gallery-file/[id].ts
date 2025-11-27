import { ObjectId } from 'mongodb';
import { getDb, getGalleryBucket } from '../../_lib/mongo.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method Not Allowed');
  }
  try {
    let id: string | undefined = undefined;
    if (req?.query && typeof req.query.id === 'string') id = req.query.id;
    if (!id && typeof req?.url === 'string') {
      const m = req.url.match(/\/gallery-file\/([^/?#]+)/);
      if (m) id = m[1];
    }
    if (!id || typeof id !== 'string') return res.status(400).send('Bad Request');
    const db = await getDb();
    const bucket = getGalleryBucket(db);

    const _id = new ObjectId(id);

    // Try to get file info to set headers
    // @ts-ignore
    const fileDoc = await bucket.find({ _id }).limit(1).toArray().then((arr: any[]) => arr[0] || null);
    if (!fileDoc) return res.status(404).send('Not Found');

    const contentType = fileDoc.contentType || fileDoc.metadata?.contentType || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Content-Disposition', 'inline');

    const stream = bucket.openDownloadStream(_id);
    stream.on('error', () => res.status(404).end());
    stream.pipe(res);
  } catch (err: any) {
    console.error('[vercel gallery-file] error', err?.message || err);
    return res.status(500).send('Internal Server Error');
  }
}

import { ObjectId } from 'mongodb';
import { getDb, getGalleryBucket } from '../_lib/mongo.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method Not Allowed');
  }
  try {
    let id: string | undefined = undefined;
    if (req?.query) {
      const q = (req.query as any).id;
      if (typeof q === 'string') id = q;
      else if (Array.isArray(q) && q.length > 0 && typeof q[0] === 'string') id = q[0];
    }
    if (!id && typeof req?.url === 'string') {
      const m = req.url.match(/[?&]id=([^&#]+)/);
      if (m) id = decodeURIComponent(m[1]);
    }
    if (!id) return res.status(400).send('Bad Request');

    const db = await getDb();
    const bucket = getGalleryBucket(db);

    const _id = new ObjectId(String(id));
    // @ts-ignore
    const fileDoc = await bucket.find({ _id }).limit(1).toArray().then((arr: any[]) => arr[0] || null);
    if (!fileDoc) return res.status(404).send('Not Found');

    const name: string = String(fileDoc.filename || '');
    const ext = name.split('.').pop()?.toLowerCase() || '';
    const inferFromExt = (e: string) => {
      if (e === 'jpg' || e === 'jpeg') return 'image/jpeg';
      if (e === 'png') return 'image/png';
      if (e === 'webp') return 'image/webp';
      if (e === 'gif') return 'image/gif';
      if (e === 'svg') return 'image/svg+xml';
      return 'application/octet-stream';
    };
    const contentType = fileDoc.contentType || fileDoc.metadata?.contentType || inferFromExt(ext);
    const size = Number(fileDoc.length || 0);

    res.statusCode = 200;
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Content-Type', contentType);
    if (size && Number.isFinite(size)) {
      try { res.setHeader('Content-Length', String(size)); } catch {}
    }

    const stream = bucket.openDownloadStream(_id);
    stream.on('error', () => res.status(404).end());
    stream.pipe(res);
  } catch (err: any) {
    console.error('[vercel gallery-file by query id] error', err?.message || err);
    return res.status(500).send('Internal Server Error');
  }
}

import { ObjectId } from 'mongodb';
import { getDb, getGalleryBucket } from '../../_lib/mongo.js';

export default async function handler(req: any, res: any) {
  // CORS pour ouverture directe dans un onglet
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).send('Method Not Allowed');
  }
  try {
    // id via segment dynamique
    let id: string | undefined = undefined;
    if (req?.query && typeof (req.query as any).id === 'string') id = (req.query as any).id;
    if (!id && typeof req?.url === 'string') {
      const m = req.url.match(/\/gallery-file\/([^/?#]+)/);
      if (m) id = m[1];
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

    const originalType = fileDoc.contentType || fileDoc.metadata?.contentType || inferFromExt(ext);
    const size = Number(fileDoc.length || 0);

    res.statusCode = 200;
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Content-Type', originalType);
    if (size && Number.isFinite(size)) {
      try { res.setHeader('Content-Length', String(size)); } catch {}
    }

    const stream = bucket.openDownloadStream(_id);
    stream.on('error', () => res.status(404).end());
    stream.pipe(res);
  } catch (err: any) {
    console.error('[vercel gallery-file [id]] error', err?.message || err);
    return res.status(500).send('Internal Server Error');
  }
}

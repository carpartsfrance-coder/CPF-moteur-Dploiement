import { getDb, getGalleryBucket } from '../_lib/mongo.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method Not Allowed');
  }
  try {
    // Auth désactivée temporairement (bypass)

    const db = await getDb();
    const bucket = getGalleryBucket(db);
    // @ts-ignore
    const files = await bucket.find({}, { sort: { uploadDate: -1 } }).toArray();
    const items = files.map((f: any) => ({
      id: String(f._id),
      filename: f.filename,
      length: f.length,
      uploadDate: f.uploadDate,
      contentType: f.contentType || f.metadata?.contentType || null,
      status: (f.metadata?.status || 'unknown') as string,
      url: `/api/public/gallery-file/${String(f._id)}`,
    }));
    res.statusCode = 200;
    res.setHeader('Cache-Control', 'no-store');
    return res.json({ ok: true, items });
  } catch (err: any) {
    console.error('[vercel admin gallery-list] error', err?.message || err);
    return res.status(500).json({ ok: false, error: 'gallery_list_error' });
  }
}

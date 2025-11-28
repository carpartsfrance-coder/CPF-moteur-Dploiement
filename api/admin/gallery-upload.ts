import { getDb, getGalleryBucket } from '../_lib/mongo.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }
  try {
    // Auth désactivée temporairement (bypass)

    const b = req.body || {};
    const name = String(b.name || '').trim();
    const base64 = String(b.base64 || '').trim();
    const contentType = String(b.contentType || '').trim() || 'image/jpeg';

    if (!name || !base64) {
      return res.status(400).json({ ok: false, error: 'missing_fields' });
    }

    // basic size guard (~10MB)
    const approxBytes = Math.floor(base64.length * 0.75);
    if (approxBytes > 10 * 1024 * 1024) {
      return res.status(413).json({ ok: false, error: 'file_too_large' });
    }

    const buf = Buffer.from(base64, 'base64');

    const db = await getDb();
    const bucket = getGalleryBucket(db);

    const uploadStream = bucket.openUploadStream(name, { contentType, metadata: { contentType } });
    await new Promise<void>((resolve, reject) => {
      uploadStream.on('finish', () => resolve());
      uploadStream.on('error', (e) => reject(e));
      uploadStream.end(buf);
    });

    const id = String(uploadStream.id);
    return res.json({ ok: true, id, url: `/api/public/gallery-file/${id}` });
  } catch (err: any) {
    console.error('[vercel gallery-upload] error', err?.message || err);
    return res.status(500).json({ ok: false, error: 'upload_failed' });
  }
}

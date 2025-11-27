import { ObjectId } from 'mongodb';
import { getDb, getGalleryBucket } from '../../_lib/mongo.js';

export default async function handler(req: any, res: any) {
  const token = (process.env.GALLERY_UPLOAD_TOKEN || '').trim();
  const auth = String(req.headers?.authorization || '');
  if (!token || auth !== `Bearer ${token}`) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }

  const method = req.method || 'GET';
  try {
    let id: string | undefined = undefined;
    if (req?.query) {
      const q = (req.query as any).id;
      if (typeof q === 'string') id = q;
      else if (Array.isArray(q) && q.length && typeof q[0] === 'string') id = q[0];
    }
    if (!id && typeof req?.url === 'string') {
      const m = req.url.match(/\/gallery\/([^/?#]+)/);
      if (m) id = m[1];
    }
    if (!id) return res.status(400).json({ ok: false, error: 'bad_request' });

    const _id = new ObjectId(String(id));
    const db = await getDb();
    const bucket = getGalleryBucket(db);

    if (method === 'DELETE') {
      try {
        await bucket.delete(_id);
        return res.json({ ok: true });
      } catch (e: any) {
        // Si déjà supprimé, considérer ok
        return res.json({ ok: true });
      }
    }

    if (method === 'PATCH') {
      try {
        const body = req.body || {};
        const status = String(body.status || '').trim() || 'unknown';
        const filesCol = db.collection('gallery.files');
        await filesCol.updateOne({ _id }, { $set: { 'metadata.status': status } });
        return res.json({ ok: true });
      } catch (e: any) {
        return res.status(500).json({ ok: false, error: 'update_failed' });
      }
    }

    res.setHeader('Allow', 'DELETE, PATCH');
    return res.status(405).send('Method Not Allowed');
  } catch (err: any) {
    console.error('[vercel admin gallery id] error', err?.message || err);
    return res.status(500).json({ ok: false, error: 'server_error' });
  }
}

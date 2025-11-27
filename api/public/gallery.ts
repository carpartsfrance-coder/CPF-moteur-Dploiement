import { getDb, getGalleryBucket } from '../_lib/mongo';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method Not Allowed');
  }
  try {
    const db = await getDb();
    const bucket = getGalleryBucket(db);
    // @ts-ignore: find supports sort in options
    const files = await bucket.find({}, { sort: { uploadDate: -1 } }).toArray();
    const images = files.map((f: any) => {
      const id = String(f._id);
      return {
        id,
        name: f.filename,
        url: `/api/public/gallery-file/${id}`,
        contentType: f.contentType || f.metadata?.contentType || null,
        size: f.length || null,
        uploadDate: f.uploadDate || null,
      };
    });
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.json({ ok: true, images });
  } catch (err: any) {
    console.error('[vercel gallery] list error', err?.message || err);
    return res.status(500).json({ ok: false, error: 'gallery_list_error' });
  }
}

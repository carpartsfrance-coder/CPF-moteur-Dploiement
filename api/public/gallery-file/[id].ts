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

    // lecture des query params (w, q)
    let w: number | undefined = undefined;
    let q: number | undefined = undefined;
    if (req?.query) {
      const qw = (req.query as any).w;
      const qq = (req.query as any).q;
      if (typeof qw === 'string' && /^\d+$/.test(qw)) w = Math.max(320, Math.min(2000, parseInt(qw, 10)));
      if (typeof qq === 'string' && /^\d+$/.test(qq)) q = Math.max(50, Math.min(90, parseInt(qq, 10)));
    }
    if ((!w || !q) && typeof req?.url === 'string') {
      try {
        const u = new URL(req.url, 'http://x');
        const sw = u.searchParams.get('w');
        const sq = u.searchParams.get('q');
        if (!w && sw && /^\d+$/.test(sw)) w = Math.max(320, Math.min(2000, parseInt(sw, 10)));
        if (!q && sq && /^\d+$/.test(sq)) q = Math.max(50, Math.min(90, parseInt(sq, 10)));
      } catch {}
    }

    res.statusCode = 200;
    // cache long côté CDN/navigateur (les ids GridFS sont immuables)
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    res.setHeader('Content-Disposition', 'inline');

    const stream = bucket.openDownloadStream(_id);
    stream.on('error', () => res.status(404).end());

    if (w) {
      // redimensionnement/optimisation à la volée en WebP
      try {
        const sharp = (await import('sharp')).default;
        res.setHeader('Content-Type', 'image/webp');
        const quality = q ?? 82;
        return void stream
          .pipe(sharp().resize({ width: w, withoutEnlargement: true }).webp({ quality }))
          .pipe(res);
      } catch {
        // fallback sans transfo
        res.setHeader('Content-Type', originalType);
        if (size && Number.isFinite(size)) {
          try { res.setHeader('Content-Length', String(size)); } catch {}
        }
        return void stream.pipe(res);
      }
    }

    // pas de redimensionnement demandé: servir brut
    res.setHeader('Content-Type', originalType);
    if (size && Number.isFinite(size)) {
      try { res.setHeader('Content-Length', String(size)); } catch {}
    }
    stream.pipe(res);
  } catch (err: any) {
    console.error('[vercel gallery-file] error', err?.message || err);
    return res.status(500).send('Internal Server Error');
  }
}

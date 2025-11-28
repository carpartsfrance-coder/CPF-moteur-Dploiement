export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, PATCH, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  const method = req.method || 'GET';
  try {
    const adminToken = String(process.env.CF_IMAGES_ADMIN_TOKEN || process.env.GALLERY_UPLOAD_TOKEN || '').trim();
    const auth = String(req.headers?.authorization || '');
    if (!adminToken || auth !== `Bearer ${adminToken}`) {
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }

    const accountId = String(process.env.CLOUDFLARE_ACCOUNT_ID || '').trim();
    const apiToken = String(process.env.CLOUDFLARE_IMAGES_TOKEN || '').trim();
    if (!accountId || !apiToken) {
      return res.status(500).json({ ok: false, error: 'missing_cloudflare_env' });
    }

    let id: string | undefined = undefined;
    if (req?.query && typeof (req.query as any).id === 'string') id = (req.query as any).id;
    if (!id && typeof req?.url === 'string') {
      const m = req.url.match(/\/images\/([^/?#]+)/);
      if (m) id = m[1];
    }
    if (!id) return res.status(400).json({ ok: false, error: 'missing_id' });

    if (method === 'DELETE') {
      const cf = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      const data = await cf.json();
      if (!data?.success) return res.status(502).json({ ok: false, error: 'cloudflare_error', details: data });
      return res.json({ ok: true });
    }

    if (method === 'PATCH') {
      const body = req.body || {};
      const metadata: any = {};
      if (typeof body.name === 'string' && body.name.trim()) metadata.name = body.name.trim();
      const payload: any = {};
      if (Object.keys(metadata).length) payload.metadata = metadata;
      if (typeof body.requireSignedURLs === 'boolean') payload.requireSignedURLs = !!body.requireSignedURLs;

      const cf = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await cf.json();
      if (!data?.success) return res.status(502).json({ ok: false, error: 'cloudflare_error', details: data });
      return res.json({ ok: true, result: data.result });
    }

    res.setHeader('Allow', 'DELETE, PATCH, OPTIONS');
    return res.status(405).send('Method Not Allowed');
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: 'images_id_error', message: err?.message || String(err) });
  }
}

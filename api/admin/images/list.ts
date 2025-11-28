export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).send('Method Not Allowed');
  }
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

    const page = Math.max(1, parseInt(String(req.query?.page || '1'), 10) || 1);
    const perPage = Math.min(100, Math.max(1, parseInt(String(req.query?.per_page || '24'), 10) || 24));

    const url = new URL(`https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`);
    url.searchParams.set('page', String(page));
    url.searchParams.set('per_page', String(perPage));

    const cfResp = await fetch(url, { headers: { Authorization: `Bearer ${apiToken}` } });
    const data = await cfResp.json();
    if (!data?.success) {
      return res.status(502).json({ ok: false, error: 'cloudflare_error', details: data });
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.json({ ok: true, page, per_page: perPage, total: data?.result?.total_count || 0, images: data?.result?.images || [] });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: 'list_error', message: err?.message || String(err) });
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
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

    const name = String(req.body?.name || '').trim();

    const cfResp = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v2/direct_upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiToken}` },
      body: name ? new URLSearchParams({ metadata: JSON.stringify({ name }) }) : undefined,
    });
    const data = await cfResp.json();
    if (!data?.success) {
      return res.status(502).json({ ok: false, error: 'cloudflare_error', details: data });
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.json({ ok: true, result: data.result });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: 'direct_upload_error', message: err?.message || String(err) });
  }
}

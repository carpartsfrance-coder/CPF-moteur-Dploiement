import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

interface StatusResp { ok: boolean; service?: string; version?: string; time?: string; mongoConfigured?: boolean }
interface SeoCheckResp { ok: boolean; websiteOrigin: string; hasGsc: boolean; counts: { static: number; engines: number; brands: number; modelPairs: number; posts: number; sitemapTotal: number }; sitemapIndex: boolean }

const AdminSeoChecks: React.FC = () => {
  const backend = useMemo(() => {
    const env = process.env.REACT_APP_BACKEND_URL || '';
    if (env.trim()) return env.trim().replace(/\/$/, '');
    if (typeof window !== 'undefined') {
      const isLocal = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
      return isLocal ? 'http://localhost:3001' : '';
    }
    return '';
  }, []);

  const [robots, setRobots] = useState<string>('');
  const [sitemap, setSitemap] = useState<string>('');
  const [status, setStatus] = useState<StatusResp | null>(null);
  const [seoCheck, setSeoCheck] = useState<SeoCheckResp | null>(null);
  const [gscDetected, setGscDetected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setError(null); setLoading(true);
    try {
      // robots.txt
      const r = await fetch(`${backend}/robots.txt`, { credentials: 'include' });
      setRobots(r.ok ? await r.text() : '');
      // sitemap.xml
      const sm = await fetch(`${backend}/sitemap.xml`, { credentials: 'include' });
      setSitemap(sm.ok ? await sm.text() : '');
      // status
      const st = await fetch(`${backend}/api/public/status`, { credentials: 'include' });
      setStatus(st.ok ? await st.json() : null);
      // seo-check
      const sc = await fetch(`${backend}/api/public/seo-check`, { credentials: 'include' });
      setSeoCheck(sc.ok ? await sc.json() : null);
      // Vérif meta GSC: lire une page SSR (blog) et chercher la meta
      const bp = await fetch(`${backend}/blog`, { credentials: 'include' });
      if (bp.ok) {
        const html = await bp.text();
        setGscDetected(/<meta[^>]+name=["']google-site-verification["'][^>]*>/i.test(html));
      } else {
        setGscDetected(null);
      }
    } catch (e: any) {
      setError("Erreur lors des vérifs. ");
    } finally {
      setLoading(false);
    }
  }, [backend]);

  useEffect(() => { if (backend) void loadAll(); }, [backend, loadAll]);

  const isIndex = useMemo(() => (sitemap.includes('<sitemapindex') || seoCheck?.sitemapIndex), [sitemap, seoCheck]);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }} sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, flex: 1 }}>Vérifs SEO</Typography>
        <Button variant="outlined" onClick={()=>loadAll()} disabled={loading}>{loading ? 'Chargement…' : 'Rafraîchir'}</Button>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>Search Console</Typography>
          <Chip label={seoCheck?.hasGsc ? 'GSC: configuré' : 'GSC: manquant'} color={seoCheck?.hasGsc ? 'success' : 'default'} />
          <Chip label={gscDetected ? 'Meta GSC détectée' : 'Meta GSC non détectée'} color={gscDetected ? 'success' : 'default'} />
        </Stack>
        <Typography variant="body2" color="text.secondary">Website origin: {seoCheck?.websiteOrigin || '-'}</Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>robots.txt</Typography>
        <TextField value={robots} onChange={()=>{}} fullWidth multiline minRows={8} inputProps={{ readOnly: true }} />
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>sitemap.xml</Typography>
          <Chip label={isIndex ? 'Sitemap index' : 'Sitemap simple'} color={isIndex ? 'primary' : 'default'} />
        </Stack>
        <TextField value={sitemap} onChange={()=>{}} fullWidth multiline minRows={8} inputProps={{ readOnly: true }} />
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Endpoints</Typography>
        <Typography variant="subtitle2">/api/public/status</Typography>
        <TextField value={JSON.stringify(status || {}, null, 2)} onChange={()=>{}} fullWidth multiline minRows={6} inputProps={{ readOnly: true }} sx={{ mb: 2 }} />
        <Typography variant="subtitle2">/api/public/seo-check</Typography>
        <TextField value={JSON.stringify(seoCheck || {}, null, 2)} onChange={()=>{}} fullWidth multiline minRows={6} inputProps={{ readOnly: true }} />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Comptes (résumé)</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip label={`Pages statiques: ${seoCheck?.counts?.static ?? 0}`} />
          <Chip label={`Moteurs: ${seoCheck?.counts?.engines ?? 0}`} />
          <Chip label={`Marques: ${seoCheck?.counts?.brands ?? 0}`} />
          <Chip label={`Paires marque/modèle: ${seoCheck?.counts?.modelPairs ?? 0}`} />
          <Chip label={`Articles: ${seoCheck?.counts?.posts ?? 0}`} />
          <Chip label={`Total est.: ${seoCheck?.counts?.sitemapTotal ?? 0}`} color={(seoCheck?.counts?.sitemapTotal ?? 0) > 5000 ? 'warning' : 'default'} />
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Si le total dépasse 5000 URLs, un sitemap index est généré automatiquement et découpé en sous‑sitemaps de 5000 URLs.
        </Typography>
      </Paper>
    </Container>
  );
};

export default AdminSeoChecks;

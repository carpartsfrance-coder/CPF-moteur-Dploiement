import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Container, Divider, Paper, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink, useParams } from 'react-router-dom';

interface EngineItem {
  id?: string;
  code: string;
  marque: string;
  cylindree?: string;
  carburant?: string;
  annees?: string;
  slug: string;
  title?: string;
}

const EnginesBrandPage: React.FC = () => {
  const { marque: rawBrand = '' } = useParams();
  const selectedBrand = decodeURIComponent(String(rawBrand));

  const base = useMemo(() => {
    const env = process.env.REACT_APP_BACKEND_URL || '';
    return (env.trim() ? env : 'http://localhost:3001').replace(/\/$/, '');
  }, []);

  const [q, setQ] = useState('');
  const [items, setItems] = useState<EngineItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(24);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // SEO
  const pageTitle = `Moteurs ${selectedBrand} – Catalogue par code moteur | Car Parts France`;
  const pageDescription = `Catalogue des moteurs testés & garantis pour la marque ${selectedBrand}. Recherchez par code moteur et demandez un devis.`;
  const canonicalUrl = useMemo(() => `${window.location.origin}/moteurs/${encodeURIComponent(selectedBrand)}`,[selectedBrand]);
  const ogImage = process.env.REACT_APP_OG_IMAGE || '';

  useEffect(() => {
    document.title = pageTitle;
    const ensureMeta = (selector: string, create: () => HTMLMetaElement): HTMLMetaElement => {
      let el = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!el) { el = create(); document.head.appendChild(el); }
      return el;
    };
    const setMeta = (nameOrProp: 'name' | 'property', key: string, content: string) => {
      if (!content) return; const sel = `meta[${nameOrProp}="${key}"]`;
      const m = ensureMeta(sel, () => { const x = document.createElement('meta'); x.setAttribute(nameOrProp, key); return x; });
      m.setAttribute('content', content);
    };
    const setLink = (rel: string, href: string) => {
      const sel = `link[rel="${rel}"]`; let l = document.head.querySelector(sel) as HTMLLinkElement | null;
      if (!l) { l = document.createElement('link'); l.setAttribute('rel', rel); document.head.appendChild(l); }
      l.setAttribute('href', href);
    };
    setMeta('name', 'description', pageDescription);
    setLink('canonical', canonicalUrl);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:title', pageTitle);
    setMeta('property', 'og:description', pageDescription);
    setMeta('property', 'og:url', canonicalUrl);
    if (ogImage) setMeta('property', 'og:image', ogImage);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', pageTitle);
    setMeta('name', 'twitter:description', pageDescription);
    if (ogImage) setMeta('name', 'twitter:image', ogImage);
  }, [canonicalUrl, ogImage, pageDescription, pageTitle]);

  const load = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      params.set('brand', selectedBrand);
      params.set('page', String(p));
      params.set('limit', String(limit));
      const res = await fetch(`${base}/api/public/engine-pages?${params.toString()}`);
      const data = await res.json();
      setItems(Array.isArray(data?.items) ? data.items : []);
      setTotal(Number(data?.total || 0));
      setPage(Number(data?.page || 1));
    } catch {
      setItems([]); setTotal(0);
    } finally { setLoading(false); }
  }, [base, limit, q, selectedBrand]);

  useEffect(() => { void load(1); }, [selectedBrand, load]);

  // JSON-LD ItemList
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `${window.location.origin}/codes-moteur/${encodeURIComponent(it.slug)}`,
      name: it.title || `Moteur ${it.code} — ${it.marque} ${it.cylindree || ''}`.trim(),
    }))
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }} alignItems={{ xs: 'flex-start', sm: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, flex: 1 }}>Moteurs {selectedBrand}</Typography>
        <Button component={RouterLink as any} to="/moteurs">← Tous les moteurs</Button>
      </Stack>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField fullWidth label="Recherche dans la marque (code, cylindrée)" value={q} onChange={(e)=>setQ(e.target.value)} />
          <Button variant="contained" onClick={()=>load(1)} disabled={loading}>Rechercher</Button>
        </Stack>
      </Paper>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)' } }}>
        {items.map((it) => (
          <Paper key={it.slug} sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {it.code} — {it.marque}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {it.cylindree || ''} {it.carburant ? `• ${it.carburant}` : ''} {it.annees ? `• ${it.annees}` : ''}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined" component={RouterLink as any} to={`/codes-moteur/${it.slug}`}>Voir la fiche</Button>
            </Stack>
          </Paper>
        ))}
      </Box>

      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Button disabled={page <= 1} onClick={()=>load(page-1)}>Précédent</Button>
        <Button disabled={(page * limit) >= total} onClick={()=>load(page+1)}>Suivant</Button>
      </Stack>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
    </Container>
  );
};

export default EnginesBrandPage;

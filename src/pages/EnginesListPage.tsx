import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, Container, Divider, MenuItem, Paper, Select, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

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

interface BrandItem { brand: string; count: number; }

const EnginesListPage: React.FC = () => {
  const base = useMemo(() => {
    const env = process.env.REACT_APP_BACKEND_URL || '';
    if (env.trim()) return env.trim().replace(/\/$/, '');
    if (typeof window !== 'undefined') {
      const isLocal = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
      return isLocal ? 'http://localhost:3001' : '';
    }
    return '';
  }, []);

  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [q, setQ] = useState('');
  const [brand, setBrand] = useState('');
  const [items, setItems] = useState<EngineItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(24);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // SEO
  const pageTitle = 'Moteurs testés & garantis – Catalogue par code moteur | Car Parts France';
  const pageDescription = 'Catalogue des moteurs testés et garantis. Recherchez par code moteur ou marque et demandez un devis en 2 minutes.';
  const canonicalUrl = useMemo(() => `${window.location.origin}/moteurs`, []);
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
  }, [canonicalUrl, ogImage]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${base}/api/public/engine-pages/brands`);
        const json = await res.json();
        const arr: BrandItem[] = Array.isArray(json?.items) ? json.items : [];
        setBrands(arr);
      } catch { setBrands([]); }
    })();
  }, [base]);

  const load = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (brand.trim()) params.set('brand', brand.trim());
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
  }, [base, brand, limit, q]);

  useEffect(() => { void load(1); }, [brand, load]);

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
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>Catalogue des moteurs</Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField fullWidth label="Recherche (code, marque, cylindrée)" value={q} onChange={(e)=>setQ(e.target.value)} />
          <Select displayEmpty value={brand} onChange={(e)=>setBrand(String(e.target.value))} sx={{ minWidth: 220 }}>
            <MenuItem value=""><em>Toutes les marques</em></MenuItem>
            {brands.map((b) => (
              <MenuItem key={b.brand} value={b.brand}>{b.brand} ({b.count})</MenuItem>
            ))}
          </Select>
          <Button variant="contained" onClick={()=>load(1)} disabled={loading}>Rechercher</Button>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
          {brands.slice(0, 10).map((b) => (
            <Chip key={b.brand} label={b.brand} component={RouterLink as any} to={`/moteurs/${encodeURIComponent(b.brand)}`} clickable />
          ))}
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

export default EnginesListPage;

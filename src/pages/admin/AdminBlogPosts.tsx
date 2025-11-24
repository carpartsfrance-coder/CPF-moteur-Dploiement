import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Chip,
  Divider,
  CircularProgress,
  LinearProgress,
  Alert,
  Checkbox,
  FormControlLabel,
} from '@mui/material';

interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  contentHtml?: string;
  image?: string;
  tags?: string[];
  status: 'draft' | 'published';
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  noindex?: boolean;
  quality?: any;
}

const AdminBlogPosts: React.FC = () => {
  const base = useMemo(() => {
    const env = process.env.REACT_APP_BACKEND_URL || '';
    if (env.trim()) return env.trim().replace(/\/$/, '');
    if (typeof window !== 'undefined') {
      const isLocal = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
      return isLocal ? 'http://localhost:3001' : '';
    }
    return '';
  }, []);
  const token = useMemo(() => (process.env.REACT_APP_BACKEND_TOKEN || 'cpf-mailersend-2025-setup'), []);
  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<BlogPostItem[]>([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  const [current, setCurrent] = useState<BlogPostItem | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const load = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      params.set('page', String(p));
      params.set('limit', String(limit));
      const res = await fetch(`${base}/api/admin/blog-posts?${params.toString()}`, { headers, credentials: 'include' });
      if (!res.ok) throw new Error('HTTP');
      const data = await res.json();
      const arr: BlogPostItem[] = Array.isArray(data?.items) ? data.items : [];
      setItems(arr);
      setTotal(Number(data?.total || 0));
      setPage(Number(data?.page || 1));
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [base, headers, q, limit]);

  useEffect(() => {
    if (!base || !token) return;
    void load(1);
  }, [base, token, load]);

  const onNew = () => {
    setCurrent({
      id: '',
      title: '',
      slug: '',
      summary: '',
      contentHtml: '',
      image: '',
      tags: [],
      status: 'draft',
      publishedAt: null,
      noindex: false,
    });
  };

  // Helpers SEO
  const slugifyFront = useCallback((val: string) => {
    return String(val || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 200);
  }, []);

  const seo = useMemo(() => {
    const t = (current?.title || '').trim();
    const s = (current?.summary || '').trim();
    const html = String(current?.contentHtml || '');
    const manualSlug = String(current?.slug || '').trim();
    const autoSlug = slugifyFront(t);
    const finalSlug = manualSlug || autoSlug;
    const origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : 'http://localhost:3001';
    const url = finalSlug ? `${origin}/blog/${finalSlug}` : '';
    const host = (typeof window !== 'undefined' && window.location) ? window.location.hostname : '';

    const titleLen = t.length;
    const titleOk = titleLen >= 50 && titleLen <= 60;
    const metaLen = s.length;
    const metaOk = metaLen >= 140 && metaLen <= 160;

    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const wc = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const wordsOk = wc >= 1200;

    const hasStyleTag = /<style[\s>]/i.test(html);
    const hasScriptTag = /<script[\s>]/i.test(html);
    const hasInlineStyle = /\sstyle\s*=\s*("|')/i.test(html);
    const hasClassAttr = /\sclass\s*=\s*("|')/i.test(html);
    const hasDivOrSpan = /<(?:div|span)\b/i.test(html);
    const hasH1 = /<h1[\s>]/i.test(html);
    const hasImg = /<img[\s>]/i.test(html);
    const banned = { hasStyleTag, hasScriptTag, hasInlineStyle, hasClassAttr, hasDivOrSpan };
    const bannedOk = !hasStyleTag && !hasScriptTag && !hasInlineStyle && !hasClassAttr && !hasDivOrSpan;

    const need = {
      resume: /<h2[^>]*>[^<]*(résumé|vue d[’']ensemble)/i.test(html),
      caract: /<h2[^>]*>[^<]*caract/i.test(html),
      modeles: /<h2[^>]*>[^<]*modèles?[^<]*équipés?/i.test(html),
      problemes: /<h2[^>]*>[^<]*probl[èe]mes?[^<]*courants?/i.test(html),
      entretien: /<h2[^>]*>[^<]*entretien/i.test(html),
      fiabilite: /<h2[^>]*>[^<]*fiabilit/i.test(html),
      offre: /<h2[^>]*>[^<]*notre[^<]*offre/i.test(html),
      faq: /<h2[^>]*>[^<]*faq/i.test(html),
      sources: /<h2[^>]*>[^<]*sources/i.test(html),
    };
    const sectionsOk = Object.values(need).every(Boolean);
    const faqCount = (html.match(/<summary[\s>]/gi) || []).length || (html.match(/<details[\s>]/gi) || []).length;
    const faqOk = faqCount >= 5;

    const slugValid = !!finalSlug && !/[^a-z0-9-]/.test(finalSlug);

    // Liens internes/externes
    const hrefs: string[] = [];
    try {
      const re = /<a\s[^>]*href\s*=\s*("|')([^"']+)(\1)/gi; let m;
      while ((m = re.exec(html)) !== null) { hrefs.push(m[2]); }
    } catch {}
    let internal = 0, external = 0;
    hrefs.forEach((h) => {
      const v = String(h || '').trim();
      if (!v) return;
      if (v.startsWith('/')) internal++;
      else if (/^https?:\/\//i.test(v)) {
        try {
          const u = new URL(v);
          if (host && u.hostname === host) internal++; else external++;
        } catch { external++; }
      }
    });

    // Titres
    const h2Count = (html.match(/<h2[\s>]/gi) || []).length;
    const h3Count = (html.match(/<h3[\s>]/gi) || []).length;
    const readMin = Math.max(1, Math.round(wc / 220));

    // Indexation
    const isIndexable = (current?.status === 'published') && !current?.noindex;
    const robots = isIndexable ? 'index,follow' : 'noindex,follow';

    return { titleLen, titleOk, metaLen, metaOk, wc, wordsOk, need, sectionsOk, faqCount, faqOk, banned, bannedOk, finalSlug, slugValid, url, internal, external, h2Count, h3Count, hasH1, hasImg, readMin, isIndexable, robots };
  }, [current, slugifyFront]);

  const onImprove = async () => {
    if (!current?.id) return;
    setIError(null); setISuccess(null); setIQc(null);
    try {
      setILoading(true);
      const body: any = {
        marque: iMarque.trim(),
        code: iCode.trim(),
        cylindree: iCyl.trim(),
        carburant: iCarb.trim(),
        tags: iTags.split(',').map(s => s.trim()).filter(Boolean),
        rag: iRagEnabled,
        ragResults: iRagResults,
        manualCompat: iCompat.split('\n').map(s=>s.trim()).filter(Boolean)
      };
      const res = await fetch(`${base}/api/admin/blog-posts/${current.id}/improve`, { method: 'POST', headers, credentials: 'include', body: JSON.stringify(body) });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) { setIError(data?.error || "Echec amélioration."); return; }
      setISuccess('Article amélioré.');
      if (data?.qc) setIQc(data.qc);
      await load(page);
      // Recharger l'élément courant si toujours présent dans la page courante
      const found = (items || []).find((it) => it.id === current.id);
      if (found) setCurrent({ ...found });
    } catch {
      setIError('Erreur lors de l\'amélioration.');
    } finally {
      setILoading(false);
    }
  };

  const onSave = async () => {
    if (!current) return;
    setSaveError(null);
    setSaveSuccess(null);
    if (!current.title?.trim()) {
      setSaveError('Le titre est requis.');
      return;
    }
    // Indicateur qualité minimal
    const text = String((current.contentHtml || '') + ' ' + (current.summary || ''))
      .replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = text ? text.split(' ').filter(Boolean).length : 0;
    const tagsCount = Array.isArray(current.tags) ? current.tags.filter(Boolean).length : 0;
    const qualityBad = (wordCount < 600) || (tagsCount < 1);
    if (current.status === 'published' && qualityBad && !current.noindex) {
      current.noindex = true;
    }
    const body: any = { ...current };
    delete body.id;
    if (typeof body.tags === 'string') {
      body.tags = String(body.tags).split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    try {
      setSaveLoading(true);
      const isNew = !current.id;
      const res = await fetch(isNew ? `${base}/api/admin/blog-posts` : `${base}/api/admin/blog-posts/${current.id}` , {
        method: isNew ? 'POST' : 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data?.error === 'missing_title') setSaveError('Le titre est requis.');
        else if (data?.error === 'duplicate_slug') setSaveError('Ce slug existe déjà. Modifiez le slug ou le titre.');
        else setSaveError("Impossible d'enregistrer l'article.");
        return;
      }
      await load(page);
      setSaveSuccess('Article enregistré.');
      setCurrent(null);
    } catch {
      setSaveError("Erreur lors de l'enregistrement.");
    } finally {
      setSaveLoading(false);
    }
  };

  const onEdit = (it: BlogPostItem) => {
    setCurrent({ ...it });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async (id?: string) => {
    if (!id) return;
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Supprimer cet article ?')) return;
    try {
      await fetch(`${base}/api/admin/blog-posts/${id}`, { method: 'DELETE', headers, credentials: 'include' });
      await load(page);
      if (current?.id === id) setCurrent(null);
    } catch {}
  };

  // Génération avec IA (brouillon noindex)
  const [gMarque, setGMarque] = useState('');
  const [gCode, setGCode] = useState('');
  const [gCyl, setGCyl] = useState('');
  const [gCarb, setGCarb] = useState('');
  const [gTags, setGTags] = useState('');
  const [gCompat, setGCompat] = useState('');
  const [ragEnabled, setRagEnabled] = useState(true);
  const [ragResults, setRagResults] = useState(3);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [genSuccess, setGenSuccess] = useState<string | null>(null);
  const [genQc, setGenQc] = useState<any | null>(null);

  const [csvName, setCsvName] = useState<string | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchIndex, setBatchIndex] = useState(0);
  const [batchTotal, setBatchTotal] = useState(0);
  const [batchSuccess, setBatchSuccess] = useState<number>(0);
  const [batchFail, setBatchFail] = useState<number>(0);

  const parseCsvLine = useCallback((line: string) => {
    const out: string[] = []; let cur = ''; let q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (q && line[i + 1] === '"') { cur += '"'; i++; }
        else { q = !q; }
      } else if (c === ',' && !q) { out.push(cur); cur = ''; }
      else { cur += c; }
    }
    out.push(cur);
    return out.map(s => s.trim());
  }, []);

  const normalizeKey = useCallback((s: string) => String(s || '')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ''), []);

  const onPickCsv = async (f?: File | null) => {
    setCsvError(null); setCsvName(null); setCsvHeaders([]); setCsvRows([]);
    if (!f) return;
    try {
      setCsvLoading(true);
      const text = await f.text();
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length < 2) { setCsvError('CSV vide.'); return; }
      const headers = parseCsvLine(lines[0]);
      const rows: string[][] = [];
      for (let i = 1; i < lines.length; i++) rows.push(parseCsvLine(lines[i]));
      setCsvName(f.name);
      setCsvHeaders(headers);
      setCsvRows(rows);
    } catch {
      setCsvError('Lecture CSV impossible.');
    } finally { setCsvLoading(false); }
  };

  const runBatch = async () => {
    if (!csvHeaders.length || !csvRows.length) { setCsvError('Aucun CSV chargé.'); return; }
    setBatchRunning(true); setBatchIndex(0); setBatchSuccess(0); setBatchFail(0); setBatchTotal(csvRows.length);
    const keys = csvHeaders.map(h => normalizeKey(h));
    const iMarq = keys.indexOf('marque');
    const iCode = keys.indexOf('code');
    const iCyl = keys.indexOf('cylindree');
    const iCarb = keys.indexOf('carburant');
    const iTags = keys.indexOf('tags');
    const iCompat = keys.indexOf('compat') !== -1 ? keys.indexOf('compat') : (keys.indexOf('compatibilites') !== -1 ? keys.indexOf('compatibilites') : -1);
    if (iMarq === -1 || iCode === -1) { setCsvError('Colonnes requises manquantes: marque, code.'); setBatchRunning(false); return; }
    for (let idx = 0; idx < csvRows.length; idx++) {
      setBatchIndex(idx + 1);
      const r = csvRows[idx] || [];
      const body: any = {
        marque: String(r[iMarq] || '').trim(),
        code: String(r[iCode] || '').trim(),
        cylindree: iCyl !== -1 ? String(r[iCyl] || '').trim() : '',
        carburant: iCarb !== -1 ? String(r[iCarb] || '').trim() : '',
        tags: iTags !== -1 ? String(r[iTags] || '').split(',').map(s=>s.trim()).filter(Boolean) : [],
        rag: ragEnabled,
        ragResults: ragResults,
        manualCompat: iCompat !== -1 ? String(r[iCompat] || '').split(/\||;|\n/).map(s=>s.trim()).filter(Boolean) : []
      };
      if (!body.marque || !body.code) { setBatchFail(v=>v+1); continue; }
      try {
        const res = await fetch(`${base}/api/admin/blog-posts/generate`, { method: 'POST', headers, credentials: 'include', body: JSON.stringify(body) });
        if (!res.ok) { setBatchFail(v=>v+1); await new Promise(r=>setTimeout(r, 600)); continue; }
        setBatchSuccess(v=>v+1);
        await new Promise(r=>setTimeout(r, 800));
      } catch {
        setBatchFail(v=>v+1);
        await new Promise(r=>setTimeout(r, 600));
      }
    }
    setBatchRunning(false);
    await load(1);
  };

  // Améliorer avec IA (sur un article existant)
  const [iMarque, setIMarque] = useState('');
  const [iCode, setICode] = useState('');
  const [iCyl, setICyl] = useState('');
  const [iCarb, setICarb] = useState('');
  const [iTags, setITags] = useState('');
  const [iCompat, setICompat] = useState('');
  const [iRagEnabled, setIRagEnabled] = useState(true);
  const [iRagResults, setIRagResults] = useState(3);
  const [iLoading, setILoading] = useState(false);
  const [iError, setIError] = useState<string | null>(null);
  const [iSuccess, setISuccess] = useState<string | null>(null);
  const [iQc, setIQc] = useState<any | null>(null);

  const onGenerate = async () => {
    setGenError(null); setGenSuccess(null); setGenQc(null);
    if (!gMarque.trim() || !gCode.trim()) { setGenError('Marque et Code sont requis.'); return; }
    try {
      setGenLoading(true);
      const body: any = {
        marque: gMarque.trim(),
        code: gCode.trim(),
        cylindree: gCyl.trim(),
        carburant: gCarb.trim(),
        tags: gTags.split(',').map(s => s.trim()).filter(Boolean),
        rag: ragEnabled,
        ragResults: ragResults,
        manualCompat: gCompat.split('\n').map(s=>s.trim()).filter(Boolean)
      };
      const res = await fetch(`${base}/api/admin/blog-posts/generate`, { method: 'POST', headers, credentials: 'include', body: JSON.stringify(body) });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) { setGenError(data?.error || 'Echec génération.'); return; }
      setGenSuccess(`Brouillon créé: ${data?.slug || ''}`);
      if (data?.qc) setGenQc(data.qc);
      await load(1);
      setGMarque(''); setGCode(''); setGCyl(''); setGCarb(''); setGTags(''); setGCompat('');
    } catch {
      setGenError('Erreur lors de la génération.');
    } finally {
      setGenLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>Articles du blog</Typography>

      {/* Générer avec IA */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Générer avec IA (brouillon noindex)</Typography>
        {genError && <Alert severity="error" sx={{ mb: 2 }}>{genError}</Alert>}
        {genSuccess && <Alert severity="success" sx={{ mb: 2 }}>{genSuccess}</Alert>}
        {genQc && (
          <Alert severity={genQc.pass ? 'success' : 'warning'} sx={{ mb: 2 }}>
            Contrôle qualité: {genQc.pass ? 'OK' : 'À améliorer'} — {genQc.wc} mots, FAQ {genQc.faqCount}.
            {!genQc.pass && Array.isArray(genQc.reasons) && genQc.reasons.length > 0 && (
              <div>Motifs: {genQc.reasons.join(', ')}</div>
            )}
          </Alert>
        )}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField label="Marque" value={gMarque} onChange={(e)=>setGMarque(e.target.value)} fullWidth />
          <TextField label="Code" value={gCode} onChange={(e)=>setGCode(e.target.value)} fullWidth />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField label="Cylindrée (optionnel)" value={gCyl} onChange={(e)=>setGCyl(e.target.value)} fullWidth />
          <TextField label="Carburant (optionnel)" value={gCarb} onChange={(e)=>setGCarb(e.target.value)} fullWidth />
        </Stack>
        <TextField label="Tags (séparés par des virgules)" value={gTags} onChange={(e)=>setGTags(e.target.value)} fullWidth sx={{ mb: 2 }} />
        <TextField label="Modèles compatibles (un par ligne) — optionnel" value={gCompat} onChange={(e)=>setGCompat(e.target.value)} fullWidth multiline minRows={3} sx={{ mb: 2 }} />
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <FormControlLabel control={<Checkbox checked={ragEnabled} onChange={(e)=>setRagEnabled(e.target.checked)} />} label="Activer RAG (recherche web)" />
          <TextField
            type="number"
            label="Nb résultats RAG (1-3)"
            value={ragResults}
            onChange={(e)=> setRagResults(Math.max(1, Math.min(3, parseInt(e.target.value || '3', 10) || 3)))}
            inputProps={{ min: 1, max: 3 }}
            sx={{ width: 220 }}
          />
        </Stack>
        <Button variant="contained" onClick={onGenerate} disabled={genLoading}> {genLoading ? 'Génération…' : 'Générer'} </Button>

        {/* Import CSV (lot) */}
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Import CSV (création en lot)</Typography>
        <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
          Colonnes reconnues: <code>marque</code>, <code>code</code>, <code>cylindree</code>, <code>carburant</code>, <code>tags</code>, <code>compat</code> ou <code>compatibilites</code>.
          Exemple: <code>BMW,N47D20C,2.0L,Diesel,"BMW,N47","Série 1 E81; Série 3 E90"</code>
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Button component="label" variant="outlined" disabled={csvLoading || batchRunning}>
            {csvName ? `Fichier: ${csvName}` : 'Choisir un fichier CSV'}
            <input hidden type="file" accept=".csv" onChange={(e)=> onPickCsv(e.target.files?.[0] || null)} />
          </Button>
          {csvError && <Alert severity="error" sx={{ m: 0 }}>{csvError}</Alert>}
        </Stack>
        {!!csvHeaders.length && (
          <Box sx={{ mb: 2, maxHeight: 240, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {csvHeaders.map((h, i) => (<th key={i} style={{ textAlign: 'left', padding: 6, borderBottom: '1px solid #eee' }}>{h}</th>))}
                </tr>
              </thead>
              <tbody>
                {csvRows.slice(0, 10).map((row, r) => (
                  <tr key={r}>
                    {csvHeaders.map((_, c) => (<td key={c} style={{ padding: 6, borderBottom: '1px solid #f3f4f6' }}>{row[c] || ''}</td>))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <Button variant="contained" color="secondary" onClick={runBatch} disabled={!csvHeaders.length || !csvRows.length || batchRunning}>
            {batchRunning ? 'Création en lot…' : 'Lancer la création en lot'}
          </Button>
          {!!batchTotal && (
            <Typography variant="body2" color="text.secondary">
              Progression: {batchIndex}/{batchTotal} — Succès: {batchSuccess} — Échecs: {batchFail}
            </Typography>
          )}
        </Stack>
        {batchRunning && (
          <Box sx={{ mt: 1 }}>
            <LinearProgress variant="determinate" value={batchTotal ? Math.min(100, Math.round((batchIndex / batchTotal) * 100)) : 0} />
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
          <TextField label="Recherche (titre, slug, tag)" value={q} onChange={(e) => setQ(e.target.value)} fullWidth />
          <Button variant="outlined" onClick={() => load(1)} disabled={loading}>Rechercher</Button>
          <Button variant="contained" onClick={onNew}>Nouvel article</Button>
        </Stack>
      </Paper>

      {current && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{current.id ? 'Éditer' : 'Créer'} un article</Typography>
          {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
          {saveSuccess && <Alert severity="success" sx={{ mb: 2 }}>{saveSuccess}</Alert>}

          <Stack spacing={2}>
            <TextField
              label="Titre"
              value={current.title}
              onChange={(e) => setCurrent({ ...current, title: e.target.value })}
              fullWidth
              helperText={`${seo.titleLen} caractères — recommandé 50–60`}
              FormHelperTextProps={{ sx: { color: seo.titleOk ? 'success.main' : 'warning.main' } }}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
              label="Slug (laissez vide pour auto)"
              value={current.slug || ''}
              onChange={(e) => setCurrent({ ...current, slug: e.target.value })}
              fullWidth
              helperText={seo.finalSlug ? `Slug final: ${seo.finalSlug}` : 'Le slug sera généré depuis le titre'}
              FormHelperTextProps={{ sx: { color: seo.slugValid ? 'success.main' : 'warning.main' } }}
            />
              <FormControl fullWidth>
                <InputLabel id="status">Statut</InputLabel>
                <Select labelId="status" label="Statut" value={current.status} onChange={(e) => setCurrent({ ...current, status: e.target.value as any })}>
                  <MenuItem value="draft">Brouillon</MenuItem>
                  <MenuItem value="published">Publié</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <TextField
              label="Résumé (meta description)"
              value={current.summary || ''}
              onChange={(e) => setCurrent({ ...current, summary: e.target.value })}
              fullWidth
              helperText={`${seo.metaLen} caractères — recommandé 140–160`}
              FormHelperTextProps={{ sx: { color: seo.metaOk ? 'success.main' : 'warning.main' } }}
            />
            <TextField label="Image (URL)" value={current.image || ''} onChange={(e) => setCurrent({ ...current, image: e.target.value })} fullWidth />
            <TextField label="Tags (séparés par des virgules)" value={Array.isArray(current.tags) ? current.tags.join(', ') : (current.tags as any || '')} onChange={(e) => setCurrent({ ...current, tags: e.target.value as any })} fullWidth />
            <TextField label="Contenu (HTML)" value={current.contentHtml || ''} onChange={(e) => setCurrent({ ...current, contentHtml: e.target.value })} fullWidth multiline minRows={10} />
            {(() => {
              const text = String((current.contentHtml || '') + ' ' + (current.summary || ''))
                .replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
              const wc = text ? text.split(' ').filter(Boolean).length : 0;
              const tc = Array.isArray(current.tags) ? current.tags.filter(Boolean).length : 0;
              const ok = wc >= 600 && tc >= 1;
              return ok ? (
                <Alert severity="success">Qualité OK — {wc} mots, {tc} tag(s).</Alert>
              ) : (
                <Alert severity="warning">Qualité faible — {wc} mots, {tc} tag(s). L’article sera marqué "noindex" s’il est publié.</Alert>
              );
            })()}

            {/* Indicateurs SEO (temps réel) */}
            <Box sx={{ mt: 1, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Indicateurs SEO</Typography>
              <Stack spacing={1}>
                <Alert severity={seo.titleOk ? 'success' : 'warning'}>
                  Titre SEO: {seo.titleLen} caractères. Recommandé 50–60.
                </Alert>
                <Alert severity={seo.metaOk ? 'success' : 'warning'}>
                  Meta description: {seo.metaLen} caractères. Recommandé 140–160.
                </Alert>
                <Alert severity={seo.slugValid ? 'success' : 'warning'}>
                  Slug / URL: {seo.finalSlug ? (<><code>/{seo.finalSlug}</code>{seo.url ? ` — ${seo.url}` : ''}</>) : 'sera généré automatiquement'}
                </Alert>
                <Alert severity={seo.wordsOk ? 'success' : 'warning'}>
                  Longueur article: {seo.wc} mots. Minimum conseillé 1200 pour les articles moteurs.
                </Alert>
                <Alert severity={seo.sectionsOk ? 'success' : 'warning'}>
                  Sections H2 requises: {seo.sectionsOk ? 'OK' : 'Manquantes: '}
                  {!seo.sectionsOk && (
                    (() => {
                      const missing = Object.entries(seo.need).filter(([, v]) => !v).map(([k]) => k).join(', ');
                      return <strong>{missing || '—'}</strong>;
                    })()
                  )}
                </Alert>
                <Alert severity={seo.faqOk ? 'success' : 'warning'}>
                  FAQ: {seo.faqCount} question(s). Minimum 5.
                </Alert>
                <Alert severity={seo.bannedOk ? 'success' : 'error'}>
                  Interdits: {seo.bannedOk ? 'Aucun détecté' : (
                    (() => {
                      const on = Object.entries(seo.banned).filter(([, v]) => v).map(([k]) => k).join(', ');
                      return `présents: ${on}`;
                    })()
                  )}
                </Alert>
                {(() => { const tc = Array.isArray(current?.tags) ? current!.tags!.filter(Boolean).length : 0; return (
                  <Alert severity={tc >= 1 ? 'success' : 'warning'}>
                    Tags: {tc} — au moins 1 recommandé.
                  </Alert>
                ); })()}
              </Stack>

              {/* Aperçu SERP */}
              <Box sx={{ mt: 2, p: 2, borderRadius: 1, backgroundColor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
                <Typography sx={{ color: '#1a0dab', fontSize: 18, lineHeight: 1.2, fontWeight: 500 }}>{current?.title || '(Titre de l’article)'}</Typography>
                <Typography sx={{ color: '#006621', fontSize: 13 }}>{seo.url || 'https://www.cpfmoteur.fr/blog/...'}</Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>{(current?.summary || '').slice(0, 160) || '(Meta description...)'}</Typography>
              </Box>
            </Box>
            <FormControlLabel control={<Checkbox checked={Boolean(current.noindex)} onChange={(e) => setCurrent({ ...current, noindex: e.target.checked })} />} label="Noindex (ne pas indexer)" />
            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={onSave} disabled={saveLoading}>
                {saveLoading ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
              {current.id && <Button color="error" variant="outlined" onClick={() => onDelete(current.id)}>Supprimer</Button>}
              <Button variant="text" onClick={() => setCurrent(null)}>Fermer</Button>
            </Stack>

            {/* Améliorer avec IA */}
            {current.id && (
              <Box sx={{ mt: 3, p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Améliorer avec IA</Typography>
                {iError && <Alert severity="error" sx={{ mb: 2 }}>{iError}</Alert>}
                {iSuccess && <Alert severity="success" sx={{ mb: 2 }}>{iSuccess}</Alert>}
                {iQc && (
                  <Alert severity={iQc.pass ? 'success' : 'warning'} sx={{ mb: 2 }}>
                    Contrôle qualité: {iQc.pass ? 'OK' : 'À améliorer'} — {iQc.wc} mots, FAQ {iQc.faqCount}.
                    {!iQc.pass && Array.isArray(iQc.reasons) && iQc.reasons.length > 0 && (
                      <div>Motifs: {iQc.reasons.join(', ')}</div>
                    )}
                  </Alert>
                )}
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
                  <TextField label="Marque (optionnel)" value={iMarque} onChange={(e)=>setIMarque(e.target.value)} fullWidth />
                  <TextField label="Code (optionnel)" value={iCode} onChange={(e)=>setICode(e.target.value)} fullWidth />
                </Stack>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
                  <TextField label="Cylindrée (optionnel)" value={iCyl} onChange={(e)=>setICyl(e.target.value)} fullWidth />
                  <TextField label="Carburant (optionnel)" value={iCarb} onChange={(e)=>setICarb(e.target.value)} fullWidth />
                </Stack>
                <TextField label="Tags (séparés par des virgules)" value={iTags} onChange={(e)=>setITags(e.target.value)} fullWidth sx={{ mb: 2 }} />
                <TextField label="Modèles compatibles (un par ligne) — optionnel" value={iCompat} onChange={(e)=>setICompat(e.target.value)} fullWidth multiline minRows={3} sx={{ mb: 2 }} />
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
                  <FormControlLabel control={<Checkbox checked={iRagEnabled} onChange={(e)=>setIRagEnabled(e.target.checked)} />} label="Activer RAG (recherche web)" />
                  <TextField
                    type="number"
                    label="Nb résultats RAG (1-3)"
                    value={iRagResults}
                    onChange={(e)=> setIRagResults(Math.max(1, Math.min(3, parseInt(e.target.value || '3', 10) || 3)))}
                    inputProps={{ min: 1, max: 3 }}
                    sx={{ width: 220 }}
                  />
                </Stack>
                <Button variant="contained" onClick={onImprove} disabled={iLoading}>
                  {iLoading ? 'Amélioration…' : 'Améliorer avec IA'}
                </Button>
              </Box>
            )}
          </Stack>
        </Paper>
      )}

      <Paper sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>Résultats</Typography>
          <Chip label={`${total} articles`} />
        </Stack>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }
          }}>
            {items.map((it) => (
              <Paper key={it.id} sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{it.title}</Typography>
                <Typography variant="caption" color="text.secondary">/{it.slug}</Typography>
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" spacing={1}>
                  <Chip size="small" label={it.status} color={it.status === 'published' ? 'success' : 'default'} />
                </Stack>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button size="small" variant="outlined" onClick={() => onEdit(it)}>Éditer</Button>
                  <Button size="small" color="error" onClick={() => onDelete(it.id)}>Supprimer</Button>
                </Stack>
              </Paper>
            ))}
          </Box>
        )}
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button disabled={page <= 1} onClick={() => load(page - 1)}>Précédent</Button>
          <Button disabled={(page * limit) >= total} onClick={() => load(page + 1)}>Suivant</Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default AdminBlogPosts;

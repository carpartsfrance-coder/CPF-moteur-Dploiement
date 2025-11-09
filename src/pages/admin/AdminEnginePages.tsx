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
  Alert,
} from '@mui/material';

interface EnginePageItem {
  id: string;
  code: string;
  marque: string;
  cylindree?: string;
  carburant?: string;
  annees?: string;
  slug: string;
  title?: string;
  seoTitle?: string;
  seoDescription?: string;
  contentHtml?: string;
  faq?: Array<{ q: string; a: string }>;
  status: 'draft' | 'published';
  createdAt?: string;
  updatedAt?: string;
  image?: string;
  images?: any;
  availability?: 'in_stock' | 'backorder';
}

const AdminEnginePages: React.FC = () => {
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
  const [items, setItems] = useState<EnginePageItem[]>([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  const [current, setCurrent] = useState<EnginePageItem | null>(null);
  // Import state
  const [importContent, setImportContent] = useState('');
  const [importFilename, setImportFilename] = useState('');
  const [importFormat, setImportFormat] = useState<'csv' | 'json'>('csv');
  const [importPublish, setImportPublish] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ total: number; upserts: number; modified: number } | null>(null);
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
      const res = await fetch(`${base}/api/admin/engine-pages?${params.toString()}`, { headers, credentials: 'include' });
      if (!res.ok) throw new Error('HTTP');
      const data = await res.json();
      const arr: EnginePageItem[] = Array.isArray(data?.items) ? data.items : [];
      setItems(arr);
      setTotal(Number(data?.total || 0));
      setPage(Number(data?.page || 1));
    } catch (e) {
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
      code: '',
      marque: '',
      cylindree: '',
      carburant: '',
      annees: '',
      slug: '',
      title: '',
      seoTitle: '',
      seoDescription: '',
      contentHtml: '',
      faq: [],
      status: 'draft',
      image: '',
      images: '',
      availability: 'in_stock',
    });
  };

  // File upload helper
  const onSelectFile = async (file: File | null) => {
    if (!file) return;
    setImportFilename(file.name);
    const ext = file.name.toLowerCase();
    setImportFormat(ext.endsWith('.json') ? 'json' : 'csv');
    const text = await file.text();
    setImportContent(text);
  };

  const callImport = async (dryRun: boolean) => {
    try {
      setImportLoading(true);
      setImportResult(null);
      const res = await fetch(`${base}/api/admin/engine-pages/import`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ filename: importFilename, content: importContent, format: importFormat, published: importPublish, dryRun })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'HTTP');
      setImportResult({ total: Number(data.total || 0), upserts: Number(data.upserts || 0), modified: Number(data.modified || 0) });
      if (!dryRun) {
        await load(1);
      }
    } catch (e) {
      setImportResult(null);
      alert("Import: erreur. Vérifiez le format et réessayez.");
    } finally {
      setImportLoading(false);
    }
  };

  const onEdit = (it: EnginePageItem) => {
    setCurrent({ ...it });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSave = async () => {
    if (!current) return;
    setSaveError(null);
    setSaveSuccess(null);
    if (!current.code?.trim() || !current.marque?.trim()) {
      setSaveError('Les champs Code et Marque sont requis.');
      return;
    }
    const body = { ...current } as any;
    delete body.id;
    try {
      setSaveLoading(true);
      const isNew = !current.id;
      const res = await fetch(isNew ? `${base}/api/admin/engine-pages` : `${base}/api/admin/engine-pages/${current.id}` , {
        method: isNew ? 'POST' : 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data?.error === 'missing_fields') setSaveError('Champs requis manquants (Code et Marque).');
        else if (data?.error === 'duplicate_slug') setSaveError('Ce slug existe déjà. Modifiez le code/marque ou le slug.');
        else setSaveError("Impossible d'enregistrer la fiche.");
        return;
      }
      await load(page);
      setSaveSuccess('Fiche enregistrée.');
      setCurrent(null);
    } catch (e) {
      setSaveError("Erreur lors de l'enregistrement.");
    } finally {
      setSaveLoading(false);
    }
  };

  const onDelete = async (id?: string) => {
    if (!id) return;
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Supprimer cette fiche ?')) return;
    try {
      await fetch(`${base}/api/admin/engine-pages/${id}`, { method: 'DELETE', headers, credentials: 'include' });
      await load(page);
      if (current?.id === id) setCurrent(null);
    } catch {}
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>Fiches code moteur (MongoDB)</Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
          <TextField label="Recherche (code, marque, slug)" value={q} onChange={(e) => setQ(e.target.value)} fullWidth />
          <Button variant="outlined" onClick={() => load(1)} disabled={loading}>Rechercher</Button>
          <Button variant="contained" onClick={onNew}>Nouvelle fiche</Button>
        </Stack>
      </Paper>

      {/* Importer CSV/JSON */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Importer des fiches (CSV ou JSON)</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Collez votre fichier ici ou importez un fichier. Colonnes attendues (CSV): code, marque, cylindree, carburant, annees.
        </Typography>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <Button variant="outlined" component="label">
              Importer un fichier
              <input hidden type="file" accept=".csv,.json,text/csv,application/json" onChange={(e) => onSelectFile(e.target.files?.[0] || null)} />
            </Button>
            <TextField label="Nom du fichier (optionnel)" value={importFilename} onChange={(e) => setImportFilename(e.target.value)} fullWidth />
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel id="fmt">Format</InputLabel>
              <Select labelId="fmt" label="Format" value={importFormat} onChange={(e) => setImportFormat(e.target.value as any)}>
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel id="pub">Publication</InputLabel>
              <Select labelId="pub" label="Publication" value={importPublish ? 'published' : 'draft'} onChange={(e) => setImportPublish(String(e.target.value) === 'published')}>
                <MenuItem value="draft">Brouillon</MenuItem>
                <MenuItem value="published">Publié</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <TextField
            label="Contenu CSV/JSON"
            value={importContent}
            onChange={(e) => setImportContent(e.target.value)}
            fullWidth
            multiline
            minRows={8}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="outlined" disabled={importLoading || !importContent.trim()} onClick={() => callImport(true)}>Tester (Dry‑run)</Button>
            <Button variant="contained" disabled={importLoading || !importContent.trim()} onClick={() => callImport(false)}>Importer maintenant</Button>
            {importLoading && <CircularProgress size={24} />}
          </Stack>
          {importResult && (
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip label={`Total: ${importResult.total}`} />
              <Chip color="success" label={`Créés: ${importResult.upserts}`} />
              <Chip color="primary" label={`MàJ: ${importResult.modified}`} />
            </Stack>
          )}
        </Stack>
      </Paper>

      {current && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{current.id ? 'Éditer' : 'Créer'} une fiche</Typography>
          {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
          {saveSuccess && <Alert severity="success" sx={{ mb: 2 }}>{saveSuccess}</Alert>}
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Code" value={current.code} onChange={(e) => setCurrent({ ...current, code: e.target.value })} fullWidth />
              <TextField label="Marque" value={current.marque} onChange={(e) => setCurrent({ ...current, marque: e.target.value })} fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Cylindrée" value={current.cylindree || ''} onChange={(e) => setCurrent({ ...current, cylindree: e.target.value })} fullWidth />
              <TextField label="Carburant" value={current.carburant || ''} onChange={(e) => setCurrent({ ...current, carburant: e.target.value })} fullWidth />
              <TextField label="Années" value={current.annees || ''} onChange={(e) => setCurrent({ ...current, annees: e.target.value })} fullWidth />
            </Stack>
            <TextField label="Slug (laissez vide pour auto)" value={current.slug || ''} onChange={(e) => setCurrent({ ...current, slug: e.target.value })} fullWidth />
            <TextField label="Titre (H1)" value={current.title || ''} onChange={(e) => setCurrent({ ...current, title: e.target.value })} fullWidth />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="SEO Title" value={current.seoTitle || ''} onChange={(e) => setCurrent({ ...current, seoTitle: e.target.value })} fullWidth />
              <TextField label="SEO Description" value={current.seoDescription || ''} onChange={(e) => setCurrent({ ...current, seoDescription: e.target.value })} fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Image principale (URL)" value={current.image || ''} onChange={(e) => setCurrent({ ...current, image: e.target.value })} fullWidth />
              <TextField label="Images (URLs séparées par des virgules)" value={Array.isArray(current.images) ? (current.images as string[]).join(', ') : (current.images || '')} onChange={(e) => setCurrent({ ...current, images: e.target.value })} fullWidth />
            </Stack>
            <TextField label="Contenu (HTML)" value={current.contentHtml || ''} onChange={(e) => setCurrent({ ...current, contentHtml: e.target.value })} fullWidth multiline minRows={6} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="status">Statut</InputLabel>
                <Select labelId="status" label="Statut" value={current.status} onChange={(e) => setCurrent({ ...current, status: e.target.value as any })}>
                  <MenuItem value="draft">Brouillon</MenuItem>
                  <MenuItem value="published">Publié</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="avail">Disponibilité</InputLabel>
                <Select labelId="avail" label="Disponibilité" value={current.availability || 'in_stock'} onChange={(e) => setCurrent({ ...current, availability: e.target.value as any })}>
                  <MenuItem value="in_stock">Disponible</MenuItem>
                  <MenuItem value="backorder">Sur commande</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={onSave} disabled={saveLoading}>
                {saveLoading ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
              {current.id && <Button color="error" variant="outlined" onClick={() => onDelete(current.id)}>Supprimer</Button>}
              <Button variant="text" onClick={() => setCurrent(null)}>Fermer</Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      <Paper sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>Résultats</Typography>
          <Chip label={`${total} fiches`} />
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
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{it.code} — {it.marque}</Typography>
                <Typography variant="body2" color="text.secondary">{it.cylindree || ''} {it.carburant ? `• ${it.carburant}` : ''} {it.annees ? `• ${it.annees}` : ''}</Typography>
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

export default AdminEnginePages;

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';

interface RedirectItem { id: string; from: string; to: string; }

const AdminRedirects: React.FC = () => {
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
  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token]);

  const [items, setItems] = useState<RedirectItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fromVal, setFromVal] = useState('');
  const [toVal, setToVal] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${base}/api/admin/redirects`, { headers, credentials: 'include' });
      const data = await res.json();
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [base, headers]);

  useEffect(() => { if (base && token) void load(); }, [base, token, load]);

  const onAdd = async () => {
    setError(null); setSuccess(null);
    const from = fromVal.trim(); const to = toVal.trim();
    if (!from || !to) { setError('Champs requis.'); return; }
    try {
      const res = await fetch(`${base}/api/admin/redirects`, { method: 'POST', headers, credentials: 'include', body: JSON.stringify({ from, to }) });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) { setError(data?.error || 'Erreur.'); return; }
      setFromVal(''); setToVal('');
      setSuccess('Redirection ajoutée.');
      await load();
    } catch {
      setError('Erreur lors de l\'ajout.');
    }
  };

  const onDelete = async (id: string) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Supprimer cette redirection ?')) return;
    try {
      await fetch(`${base}/api/admin/redirects/${id}`, { method: 'DELETE', headers, credentials: 'include' });
      await load();
    } catch {}
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>Redirections SEO (301)</Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Ajouter une redirection</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Depuis (from) — ex: /ancienne-url" value={fromVal} onChange={(e)=>setFromVal(e.target.value)} fullWidth />
          <TextField label="Vers (to) — ex: /nouvelle-url" value={toVal} onChange={(e)=>setToVal(e.target.value)} fullWidth />
          <Button variant="contained" onClick={onAdd}>Ajouter</Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>Liste</Typography>
          <Chip label={`${items.length} redirections`} />
        </Stack>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : (
          <Box sx={{ display: 'grid', gap: 8 }}>
            {items.map((it) => (
              <Box key={it.id}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{it.from} → {it.to}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button size="small" color="error" onClick={()=>onDelete(it.id)}>Supprimer</Button>
                </Stack>
                <Divider sx={{ mt: 2 }} />
              </Box>
            ))}
            {!items.length && <Typography color="text.secondary">Aucune redirection pour le moment.</Typography>}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default AdminRedirects;

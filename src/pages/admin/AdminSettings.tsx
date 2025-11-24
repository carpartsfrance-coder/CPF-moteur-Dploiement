import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Container, Stack, TextField, Typography, Alert, CircularProgress, Paper } from '@mui/material';

interface Settings {
  companyName: string;
  phone: string;
  whatsappUrl: string;
  websiteOrigin: string;
  defaultOgImage: string;
}

const AdminSettings: React.FC = () => {
  const backendBase = useMemo(() => {
    const env = process.env.REACT_APP_BACKEND_URL;
    if (env && env.trim().length > 0) return env.trim().replace(/\/$/, '');
    if (typeof window !== 'undefined') {
      const isLocal = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
      return isLocal ? 'http://localhost:3001' : '';
    }
    return '';
  }, []);

  const authHeader = useMemo(() => {
    const token = process.env.REACT_APP_BACKEND_TOKEN;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [initial, setInitial] = useState<Settings | null>(null);
  const [form, setForm] = useState<Settings>({
    companyName: '',
    phone: '',
    whatsappUrl: '',
    websiteOrigin: '',
    defaultOgImage: '',
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${backendBase}/api/admin/settings`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const s: Settings = data?.settings || {
        companyName: '', phone: '', whatsappUrl: '', websiteOrigin: '', defaultOgImage: ''
      };
      setInitial(s);
      setForm(s);
    } catch (e: any) {
      setError("Impossible de charger les paramètres.");
    } finally {
      setLoading(false);
    }
  }, [backendBase, authHeader]);

  useEffect(() => { load(); }, [load]);

  const onChange = (k: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  const validate = (): string | null => {
    if (!form.websiteOrigin) return 'Le domaine du site (websiteOrigin) est requis.';
    try { new URL(form.websiteOrigin); } catch { return 'Le domaine du site doit être une URL valide (ex: https://www.exemple.com).'; }
    return null;
  };

  const onSave = async () => {
    const v = validate();
    if (v) { setError(v); setSuccess(null); return; }
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const res = await fetch(`${backendBase}/api/admin/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSuccess('Paramètres enregistrés.');
      setInitial(form);
    } catch (e: any) {
      setError("Échec de l'enregistrement des paramètres.");
    } finally {
      setSaving(false);
    }
  };

  const onReset = () => {
    if (initial) setForm(initial);
    setError(null);
    setSuccess(null);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Paramètres du site
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
      )}

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Stack spacing={2}>
          <TextField
            label="Nom de l’entreprise"
            value={form.companyName}
            onChange={onChange('companyName')}
            fullWidth
          />
          <TextField
            label="Téléphone"
            value={form.phone}
            onChange={onChange('phone')}
            fullWidth
          />
          <TextField
            label="Lien WhatsApp"
            value={form.whatsappUrl}
            onChange={onChange('whatsappUrl')}
            fullWidth
          />
          <TextField
            label="Domaine du site (websiteOrigin)"
            helperText="Exemple: https://www.carparts-france.fr"
            value={form.websiteOrigin}
            onChange={onChange('websiteOrigin')}
            fullWidth
            required
          />
          <TextField
            label="Image OG par défaut (URL absolue)"
            value={form.defaultOgImage}
            onChange={onChange('defaultOgImage')}
            fullWidth
          />
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={onReset} disabled={saving}>Annuler</Button>
          <Button variant="contained" onClick={onSave} disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default AdminSettings;

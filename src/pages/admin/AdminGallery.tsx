import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  // Grid,
  Card,
  CardMedia,
  CardActions,
  CardContent,
  Button,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Chip,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface AdminItem {
  id: string;
  filename: string;
  length: number;
  uploadDate: string;
  contentType?: string;
  status: 'ok' | 'hs' | 'unknown' | string;
  url: string; // /gallery-file/:id
}

const AdminGallery: React.FC = () => {
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

  const [items, setItems] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${base}/api/gallery/admin`, { headers, credentials: 'include' });
      if (!res.ok) throw new Error('HTTP');
      const data = await res.json();
      const arr: AdminItem[] = Array.isArray(data?.items) ? data.items : [];
      setItems(arr);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [base, headers]);

  useEffect(() => {
    if (!base || !token) return;
    void load();
  }, [base, token, load]);

  const handleDelete = async (id: string) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Supprimer cette image ?')) return;
    try {
      await fetch(`${base}/api/gallery/${id}`, { method: 'DELETE', headers, credentials: 'include' });
      await load();
    } catch {}
  };

  const handleStatus = async (id: string, status: string) => {
    try {
      await fetch(`${base}/api/gallery/${id}`, { method: 'PATCH', headers, credentials: 'include', body: JSON.stringify({ status }) });
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status } : it)));
    } catch {}
  };

  // read file as base64 dataURL
  const readAsDataURL = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const onUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      setUploading(true);
      for (const file of Array.from(files)) {
        const content = await readAsDataURL(file);
        await fetch(`${base}/api/gallery/upload`, {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify({ filename: file.name, content }),
        });
      }
      await load();
    } catch {} finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, flex: 1 }}>
            Gestion de la galerie (MongoDB)
          </Typography>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={load} disabled={loading}>
            Actualiser
          </Button>
          <Button variant="contained" component="label" startIcon={<CloudUploadIcon />} disabled={uploading}>
            Importer des images
            <input hidden accept="image/*" multiple type="file" onChange={(e) => onUploadFiles(e.target.files)} />
          </Button>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Astuce: configurez REACT_APP_BACKEND_URL et REACT_APP_BACKEND_TOKEN côté front. Les images sont servies via GridFS.
        </Typography>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)'
          }
        }}>
          {items.map((it) => (
            <Box key={it.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  image={`${base}${it.url}`}
                  alt={it.filename}
                  sx={{ aspectRatio: '4/3', objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap title={it.filename}>
                    {it.filename}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip label={it.status} size="small" color={it.status === 'ok' ? 'success' : it.status === 'hs' ? 'warning' : 'default'} />
                    <Chip label={`${Math.round(it.length / 1024)} Ko`} size="small" />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(it.uploadDate).toLocaleString()}
                  </Typography>
                  <FormControl size="small" sx={{ mt: 1, minWidth: 160 }}>
                    <InputLabel id={`status-${it.id}`}>Statut</InputLabel>
                    <Select
                      labelId={`status-${it.id}`}
                      label="Statut"
                      value={it.status}
                      onChange={(e) => handleStatus(it.id, String(e.target.value))}
                    >
                      <MenuItem value="ok">ok (testé & validé)</MenuItem>
                      <MenuItem value="hs">hs (avant reconditionnement)</MenuItem>
                      <MenuItem value="unknown">unknown</MenuItem>
                    </Select>
                  </FormControl>
                </CardContent>
                <CardActions>
                  <Tooltip title="Copier l'URL">
                    <IconButton onClick={() => navigator.clipboard.writeText(`${base}${it.url}`)}>
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton color="error" onClick={() => handleDelete(it.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default AdminGallery;

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, CircularProgress, IconButton, Stack, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import RefreshIcon from '@mui/icons-material/Refresh';

function joinBase(path: string) {
  const base = (process.env.REACT_APP_BACKEND_URL || '').replace(/\/$/, '');
  return base + path;
}

function authHeaders(tokenOverride?: string) {
  const envToken = (process.env.REACT_APP_BACKEND_TOKEN || '').trim();
  const lsToken = (typeof window !== 'undefined' ? (localStorage.getItem('admin_token') || '') : '').trim();
  const token = (tokenOverride || lsToken || envToken).trim();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const AdminImages: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [page] = useState(1);
  const [perPage] = useState(24);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [adminToken, setAdminToken] = useState<string>(() => {
    const ls = typeof window !== 'undefined' ? (localStorage.getItem('admin_token') || '') : '';
    return (ls || process.env.REACT_APP_BACKEND_TOKEN || '').trim();
  });

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL(joinBase('/api/admin/images/list'));
      url.searchParams.set('page', String(page));
      url.searchParams.set('per_page', String(perPage));
      const r = await fetch(url.toString(), { headers: { ...authHeaders(adminToken) } });
      const data = await r.json();
      if (data?.ok) setItems(Array.isArray(data.images) ? data.images : []);
    } catch {}
    finally { setLoading(false); }
  }, [page, perPage, adminToken]);

  useEffect(() => { fetchList(); }, [fetchList]);
  useEffect(() => {
    try { if (typeof window !== 'undefined') localStorage.setItem('admin_token', adminToken || ''); } catch {}
  }, [adminToken]);

  const onClickUpload = useCallback(() => { inputRef.current?.click(); }, []);

  const onFiles = useCallback(async (files: FileList | null) => {
    if (!files || !files.length) return;
    setLoading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file, file.name);
        fd.append('metadata', JSON.stringify({ name: file.name }));
        await fetch(joinBase('/api/admin/images/upload'), { method: 'POST', headers: { ...authHeaders(adminToken) }, body: fd });
      }
      await fetchList();
    } catch {}
    finally { setLoading(false); if (inputRef.current) inputRef.current.value = ''; }
  }, [fetchList, adminToken]);

  const onDelete = useCallback(async (id: string) => {
    if (!id) return;
    setLoading(true);
    try {
      await fetch(joinBase(`/api/admin/images/${id}`), { method: 'DELETE', headers: { ...authHeaders(adminToken) } });
      await fetchList();
    } catch {}
    finally { setLoading(false); }
  }, [fetchList, adminToken]);

  const onRename = useCallback(async (id: string, name: string) => {
    if (!id || !name.trim()) return;
    setLoading(true);
    try {
      await fetch(joinBase(`/api/admin/images/${id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders(adminToken) },
        body: JSON.stringify({ name: name.trim() })
      });
      await fetchList();
    } catch {}
    finally { setLoading(false); }
  }, [fetchList, adminToken]);

  const thumbUrl = useCallback((img: any) => {
    const variants: string[] = Array.isArray(img?.variants) ? img.variants : [];
    if (variants.length) return variants[0];
    return '';
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', rowGap: 1 }}>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>Admin · Images</Typography>
        <IconButton onClick={() => fetchList()}><RefreshIcon /></IconButton>
        <Button startIcon={<UploadIcon />} variant="contained" onClick={onClickUpload}>Ajouter</Button>
        <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => onFiles(e.target.files)} />
        <TextField
          size="small"
          label="Token admin"
          value={adminToken}
          onChange={(e) => setAdminToken(e.target.value)}
          sx={{ minWidth: 260 }}
        />
      </Stack>
      {loading && (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">Chargement…</Typography>
        </Stack>
      )}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
        gap: 2,
      }}>
        {items.map((img) => {
          const id = String(img?.id || img?.imageId || img?.uid || '');
          const url = thumbUrl(img);
          const name = String(img?.filename || img?.meta?.name || img?.filenameOriginal || '');
          return (
            <Box key={id} sx={{ border: '1px solid #eee', borderRadius: 1, p: 1 }}>
              {url ? (
                <Box component="img" src={url} alt={name} sx={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 1, mb: 1 }} />
              ) : (
                <Box sx={{ width: '100%', height: 180, bgcolor: '#f6f6f6', borderRadius: 1, mb: 1 }} />
              )}
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <TextField defaultValue={name} size="small" fullWidth onBlur={(e) => onRename(id, e.target.value)} />
                <IconButton color="error" onClick={() => onDelete(id)}><DeleteIcon /></IconButton>
              </Stack>
              <Typography variant="caption" color="text.secondary">{id}</Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default AdminImages;

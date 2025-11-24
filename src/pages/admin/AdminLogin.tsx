import React, { useState } from 'react';
import { Box, Paper, Container, Typography, TextField, Button, Alert } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { checkAdminPassword, setAdminAuthed } from '../../utils/auth';

const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation() as any;
  const from = location?.state?.from || '/admin/devis';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      setError('');
      const base = (process.env.REACT_APP_BACKEND_URL || '').trim();
      if (base) {
        try {
          const res = await fetch(`${base.replace(/\/$/, '')}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ password }),
          });
          if (res.ok) {
            setAdminAuthed(true);
            navigate(from, { replace: true });
            return;
          }
        } catch {}
      }
      if (checkAdminPassword(password)) {
        setAdminAuthed(true);
        navigate(from, { replace: true });
      } else {
        setError('Mot de passe incorrect');
      }
    })();
  };

  return (
    <Box sx={{ bgcolor: 'background.default', py: { xs: 6, md: 8 } }}>
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Connexion Administrateur
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Entrez le mot de passe administrateur pour accéder à l’espace de gestion des devis.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              type="password"
              label="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Se connecter
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              Astuce: définissez la variable REACT_APP_ADMIN_PASSWORD dans votre fichier .env.local
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminLogin;

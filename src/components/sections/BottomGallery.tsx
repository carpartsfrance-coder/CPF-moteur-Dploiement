import React from 'react';
import { Box, Container, Typography, ImageList, ImageListItem, Skeleton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const BottomGallery: React.FC = () => {
  const theme = useTheme();
  const upMd = useMediaQuery(theme.breakpoints.up('md'));
  const upSm = useMediaQuery(theme.breakpoints.up('sm'));
  const cols = upMd ? 3 : upSm ? 2 : 1;
  const [files, setFiles] = React.useState<string[] | null>(null);
  const [error, setError] = React.useState<string>('');

  React.useEffect(() => {
    const prefix = (() => {
      const env = process.env.REACT_APP_BACKEND_URL || '';
      if (env.trim()) return env.trim().replace(/\/$/, '');
      if (typeof window !== 'undefined') {
        const isLocal = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
        return isLocal ? 'http://localhost:3001' : '';
      }
      return '';
    })();
    const run = async () => {
      try {
        const r = await fetch(`${prefix}/api/public/gallery-files`);
        const j = await r.json();
        if (j && j.ok && Array.isArray(j.files)) {
          setFiles(j.files as string[]);
        } else {
          setFiles([]);
        }
      } catch (e) {
        setError('');
        setFiles([]);
      }
    };
    run();
  }, []);

  const toUrl = (rel: string) => {
    const prefix = (() => {
      const env = process.env.REACT_APP_BACKEND_URL || '';
      if (env.trim()) return env.trim().replace(/\/$/, '');
      if (typeof window !== 'undefined') {
        const isLocal = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
        return isLocal ? 'http://localhost:3001' : '';
      }
      return '';
    })();
    const safeRel = encodeURI(rel);
    return `${prefix}/gallery-opt/${safeRel}`;
  };
  const toRawUrl = (rel: string) => {
    const prefix = (() => {
      const env = process.env.REACT_APP_BACKEND_URL || '';
      if (env.trim()) return env.trim().replace(/\/$/, '');
      if (typeof window !== 'undefined') {
        const isLocal = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
        return isLocal ? 'http://localhost:3001' : '';
      }
      return '';
    })();
    const safeRel = encodeURI(rel);
    return `${prefix}/gallery/${safeRel}`;
  };

  return (
    <Box sx={{ bgcolor: 'rgba(248,250,252,0.6)', py: { xs: 6, md: 8 }, mt: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, textAlign: 'center' }}>
          Nos réalisations en images
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          Extraits des contrôles et préparations effectués dans notre atelier.
        </Typography>
        {files === null ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 2 }}>
            {Array.from({ length: cols * 3 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={180} sx={{ borderRadius: 2 }} />
            ))}
          </Box>
        ) : files.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Aucune image trouvée.
          </Typography>
        ) : (
          <ImageList variant="masonry" cols={cols} gap={16}>
            {files.map((rel) => (
              <ImageListItem key={rel}>
                <Box
                  component="img"
                  src={toUrl(rel)}
                  alt={rel.split('/').pop() || 'Photo atelier'}
                  loading="lazy"
                  decoding="async"
                  onError={(e: any) => { try { e.currentTarget.onerror = null; e.currentTarget.src = toRawUrl(rel); } catch {} }}
                  sx={{ width: '100%', borderRadius: 2, boxShadow: '0 8px 24px rgba(15,23,42,0.08)' }}
                />
              </ImageListItem>
            ))}
          </ImageList>
        )}
      </Container>
    </Box>
  );
};

export default BottomGallery;

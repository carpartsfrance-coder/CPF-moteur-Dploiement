import React from 'react';
import { Box, Container, Typography, ImageList, ImageListItem, Skeleton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const BottomGallery: React.FC = () => {
  const theme = useTheme();
  const upMd = useMediaQuery(theme.breakpoints.up('md'));
  const upSm = useMediaQuery(theme.breakpoints.up('sm'));
  const cols = upMd ? 3 : upSm ? 2 : 1;
  const [files, setFiles] = React.useState<Array<{ url: string; name?: string }> | null>(null);

  const getPrefix = React.useCallback(() => {
      const env = process.env.REACT_APP_BACKEND_URL || '';
      if (env.trim()) return env.trim().replace(/\/$/, '');
      if (typeof window !== 'undefined') {
        const isLocal = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
        return isLocal ? 'http://localhost:3001' : '';
      }
      return '';
  }, []);
  React.useEffect(() => {
    const prefix = getPrefix();
    const run = async () => {
      try {
        const r = await fetch(`${prefix}/api/public/gallery`);
        const j = await r.json();
        if (j && j.ok && Array.isArray(j.images)) setFiles(j.images);
        else setFiles([]);
      } catch (e) {
        setFiles([]);
      }
    };
    run();
  }, [getPrefix]);

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
            {files.map((it) => {
              const raw = it.url || '';
              const remapped = raw.startsWith('/gallery-file/') ? `/api/public${raw}` : raw;
              const baseUrl = remapped.startsWith('/') ? `${getPrefix()}${remapped}` : remapped;
              const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) ? window.devicePixelRatio : 1;
              const approxCol = (typeof window !== 'undefined' && window.innerWidth) ? Math.max(320, Math.min(800, Math.floor(window.innerWidth * 0.9 / cols))) : (cols === 3 ? 400 : cols === 2 ? 520 : 720);
              const w1x = Math.max(320, Math.min(2000, Math.round(approxCol)));
              const w2x = Math.max(320, Math.min(2000, Math.round(approxCol * 2)));
              const url1x = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}w=${w1x}&q=82`;
              const url2x = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}w=${w2x}&q=82`;
              return (
                <ImageListItem key={raw}>
                  <Box
                    component="img"
                    src={dpr > 1.2 ? url2x : url1x}
                    srcSet={`${url1x} 1x, ${url2x} 2x`}
                    sizes={cols === 1 ? '100vw' : cols === 2 ? '50vw' : '33vw'}
                    alt={it.name || 'Photo atelier'}
                    loading="lazy"
                    decoding="async"
                    sx={{ width: '100%', borderRadius: 2, boxShadow: '0 8px 24px rgba(15,23,42,0.08)' }}
                  />
                </ImageListItem>
              );
            })}
          </ImageList>
        )}
      </Container>
    </Box>
  );
};

export default BottomGallery;

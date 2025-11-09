import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  CardActionArea,
  CircularProgress,
  useTheme,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  Tooltip
} from '@mui/material';
import { motion } from 'framer-motion';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface GalleryImage {
  name: string;
  url: string; // Chemin relatif côté backend, ex: /gallery/xxx.jpg
}

const GallerySection: React.FC = () => {
  const theme = useTheme();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  
  const backendBase = useMemo(() => {
    const env = process.env.REACT_APP_BACKEND_URL;
    return env && env.trim().length > 0 ? env.trim() : 'http://localhost:3001';
  }, []);

  // Navigation clavier (← →) et fermeture (Échap)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') {
        setSelectedIndex(null);
        setImgLoaded(false);
      } else if (e.key === 'ArrowLeft') {
        const next = (selectedIndex - 1 + images.length) % images.length;
        setSelectedIndex(next);
        setImgLoaded(false);
      } else if (e.key === 'ArrowRight') {
        const next = (selectedIndex + 1) % images.length;
        setSelectedIndex(next);
        setImgLoaded(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedIndex, images.length]);

  // Préchargement des images adjacentes pour un enchaînement fluide
  useEffect(() => {
    if (selectedIndex === null) return;
    const preload = (idx: number) => {
      if (!images[idx]) return;
      const img = new Image();
      img.src = `${backendBase}${images[idx].url}`;
    };
    preload((selectedIndex + 1) % images.length);
    preload((selectedIndex - 1 + images.length) % images.length);
  }, [selectedIndex, images, backendBase]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const resp = await fetch(`${backendBase}/api/public/gallery`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        if (mounted) {
          const list: GalleryImage[] = Array.isArray(data?.images) ? data.images : [];
          setImages(list);
        }
      } catch (e: any) {
        if (mounted) setError("Impossible de charger la galerie pour le moment.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [backendBase]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.07 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } }
  };

  const detectStatus = (rawName: string): 'ok' | 'hs' | 'unknown' => {
    const lower = rawName.toLowerCase();
    if (/hs|casse|panne|defect|defaut|crack|endom/.test(lower)) return 'hs';
    if (/ok|valide|test|clean|parfait/.test(lower)) return 'ok';
    return 'unknown';
  };

  //

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      sx={{
        py: { xs: 6, md: 8 },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Décor léger */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        sx={{
          position: 'absolute',
          top: '5%',
          left: '3%',
          width: { xs: 120, md: 220 },
          height: { xs: 120, md: 220 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.palette.primary.main}12 0%, ${theme.palette.primary.main}00 70%)`,
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          sx={{ textAlign: 'center', mb: 5 }}
        >
          <motion.div variants={itemVariants}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontWeight: 700,
                mb: 1.5,
                fontSize: { xs: '1.8rem', md: '2.2rem' }
              }}
            >
              Galerie des moteurs clients
            </Typography>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 820, mx: 'auto' }}
            >
              Moteurs testés et en parfait état, et exemples de moteurs HS. Des cas concrets pour illustrer notre exigence qualité.
            </Typography>
          </motion.div>
        </Box>

        {!loading && !error && images.length === 0 && (
          <Typography align="center" color="text.secondary" sx={{ mb: 4 }}>
            Aucune image disponible pour le moment.
          </Typography>
        )}

        {!loading && !error && images.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gap: 2.5,
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)'
              }
            }}
          >
            {images.map((img, index) => {
              const status = detectStatus(img.name);
              const chipProps = {
                ok: {
                  label: 'Testé & validé',
                  color: 'success' as const,
                  bg: 'rgba(46, 125, 50, 0.15)',
                  border: 'rgba(46, 125, 50, 0.3)'
                },
                hs: {
                  label: 'Avant reconditionnement',
                  color: 'warning' as const,
                  bg: 'rgba(237, 108, 2, 0.15)',
                  border: 'rgba(237, 108, 2, 0.3)'
                },
                unknown: {
                  label: 'En atelier',
                  color: 'default' as const,
                  bg: 'rgba(0, 0, 0, 0.08)',
                  border: 'rgba(0, 0, 0, 0.12)'
                }
              }[status];

              return (
                <Box
                  key={img.name}
                  component={motion.div}
                  variants={itemVariants}
                  custom={index}
                  whileHover={{ y: -6 }}
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                    border: '1px solid rgba(0,0,0,0.08)',
                    position: 'relative'
                  }}
                >
                  <Card elevation={0} sx={{ borderRadius: 0 }}>
                    <CardActionArea
                      disableRipple
                      onClick={() => {
                        setSelectedIndex(index);
                        setImgLoaded(false);
                      }}
                    >
                      <Box sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          image={`${backendBase}${img.url}`}
                          alt="Moteur Car Parts France"
                          sx={{
                            aspectRatio: '4/3',
                            objectFit: 'cover',
                            transition: 'opacity 0.35s ease',
                            filter: 'saturate(1.05)'
                          }}
                          loading="lazy"
                          decoding="async"
                          sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.55) 100%)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            p: 2.5
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Chip
                              label={chipProps.label}
                              color={chipProps.color}
                              size="small"
                              sx={{
                                bgcolor: chipProps.bg,
                                border: `1px solid ${chipProps.border}`,
                                color: chipProps.color === 'default' ? 'white' : 'inherit',
                                fontWeight: 600,
                                textTransform: 'uppercase'
                              }}
                            />
                            <Tooltip title="Voir en grand">
                              <IconButton
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(255,255,255,0.25)',
                                  color: 'white',
                                  '&:hover': { bgcolor: 'rgba(255,255,255,0.4)' }
                                }}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setSelectedIndex(index);
                                  setImgLoaded(false);
                                }}
                              >
                                <ZoomInIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          {(status === 'ok' || status === 'hs') && (
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
                              {status === 'ok'
                                ? 'Prêt à expédier vers votre atelier.'
                                : 'À reconditionner ou à expertiser.'}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </CardActionArea>
                  </Card>
                </Box>
              );
            })}
          </Box>
        )}
      </Container>

      <Dialog
        open={selectedIndex !== null}
        onClose={() => { setSelectedIndex(null); setImgLoaded(false); }}
        maxWidth="lg"
        fullWidth
        keepMounted
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden', bgcolor: '#000' } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={() => { setSelectedIndex(null); setImgLoaded(false); }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent
          sx={{
            p: 0,
            bgcolor: '#000',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: { xs: '60vh', md: '70vh' }
          }}
        >
          {selectedIndex !== null && images[selectedIndex] && (
            <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {/* Bouton précédent */}
              <IconButton
                aria-label="Image précédente"
                onClick={() => {
                  const next = (selectedIndex - 1 + images.length) % images.length;
                  setSelectedIndex(next);
                  setImgLoaded(false);
                }}
                sx={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                }}
              >
                <ChevronLeftIcon />
              </IconButton>

              {/* Image centrale */}
              <Box
                sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                onTouchStart={(e) => (e.currentTarget as any)._touchX = e.changedTouches?.[0]?.clientX}
                onTouchEnd={(e) => {
                  const startX = (e.currentTarget as any)._touchX || 0;
                  const endX = e.changedTouches?.[0]?.clientX || 0;
                  const delta = endX - startX;
                  if (Math.abs(delta) > 50) {
                    const dir = delta > 0 ? -1 : 1; // swipe droite: image précédente, gauche: suivante
                    const next = (selectedIndex + dir + images.length) % images.length;
                    setSelectedIndex(next);
                    setImgLoaded(false);
                  }
                }}
              >
                {!imgLoaded && (
                  <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress sx={{ color: 'rgba(255,255,255,0.8)' }} />
                  </Box>
                )}
                <Box
                  component="img"
                  src={`${backendBase}${images[selectedIndex].url}`}
                  alt="Moteur Car Parts France"
                  onLoad={() => setImgLoaded(true)}
                  sx={{
                    opacity: imgLoaded ? 1 : 0,
                    transition: 'opacity 0.25s ease',
                    maxWidth: '100%',
                    maxHeight: { xs: '70vh', md: '80vh' },
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                  loading="lazy"
                  decoding="async"
                />
              </Box>

              {/* Bouton suivant */}
              <IconButton
                aria-label="Image suivante"
                onClick={() => {
                  const next = (selectedIndex + 1) % images.length;
                  setSelectedIndex(next);
                  setImgLoaded(false);
                }}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                }}
              >
                <ChevronRightIcon />
              </IconButton>

              {/* Compteur */}
              <Box sx={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.9)', fontSize: 12, bgcolor: 'rgba(0,0,0,0.35)', px: 1, py: 0.5, borderRadius: 1 }}>
                {selectedIndex + 1} / {images.length}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default GallerySection;

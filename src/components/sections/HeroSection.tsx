import React from 'react';
import axios from 'axios';
import { Box, Container, Typography, Button, useTheme, useMediaQuery, Stack, Chip, TextField, InputAdornment, Snackbar, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PhoneIcon from '@mui/icons-material/Phone';
import { motion } from 'framer-motion';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import { addQuote } from '../../utils/quotesStore';

// Composants animés avec Framer Motion
const MotionBox = styled(motion.div)({});
const MotionTypography = styled(motion.div)({});
const MotionButton = styled(motion.div)({});

const HeroSection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const heroVideoMp4 = (process.env.REACT_APP_HERO_VIDEO_URL_MP4 || '').trim();
  const heroVideoMov = (process.env.REACT_APP_HERO_VIDEO_URL_MOV || '').trim();
  const heroPoster = '/images/Moteur ferrari 458 italia.webp';
  const siteLabel = (process.env.REACT_APP_SITE_LABEL || 'carpartsfrance.fr');
  const [qName, setQName] = React.useState('');
  const [qPhone, setQPhone] = React.useState('');
  const [qEmail, setQEmail] = React.useState('');
  const [qVehicle, setQVehicle] = React.useState('');
  const [showErrors, setShowErrors] = React.useState(false);
  const [snackOpen, setSnackOpen] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState('');
  const handleQuickQuote = React.useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = qName.trim();
    const phone = qPhone.trim();
    const vehicleId = qVehicle.trim();
    const email = qEmail.trim();
    const message = '';

    // Validation minimale: plaque/châssis/code requis ET (téléphone OU email)
    if (!vehicleId || (!phone && !email)) {
      setShowErrors(true);
      return;
    }

    const composed = `Bonjour, je souhaite un devis moteur.\n\n• Nom : ${name || 'Non précisé'}\n• Email : ${email || 'Non précisé'}\n• Téléphone : ${phone || 'Non précisé'}\n• Plaque / N° châssis / Code moteur : ${vehicleId || 'Non précisé'}\n• Détails complémentaires : ${message || 'Non précisé'}\n\nEnvoyé depuis ${siteLabel}`;
    const encoded = encodeURIComponent(composed);

    const apiUrl = process.env.REACT_APP_QUOTE_API_URL as string | undefined;
    const apiKey = process.env.REACT_APP_QUOTE_API_KEY as string | undefined;

    if (apiUrl) {
      try {
        await axios.post(
          apiUrl,
          {
            name,
            email,
            phone,
            vehicleId,
            message,
            source: 'carparts-pro',
            createdAt: new Date().toISOString(),
          },
          {
            headers: {
              'Content-Type': 'application/json',
              ...(apiKey ? { 'X-API-Key': apiKey } : {}),
            },
          }
        );
        addQuote({ name, email, phone, vehicleId, message, channel: 'api' });
        setSnackMessage('Votre demande a été envoyée. Nous revenons vers vous sous 24h.');
        setSnackOpen(true);
        return;
      } catch (err) {
      }
    }

    const whatsappNumber = '330756875025';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encoded}`;
    window.open(whatsappUrl, '_blank');
    setSnackMessage("Votre message WhatsApp est prêt. Vérifiez la nouvelle fenêtre pour l’envoyer.");
    setSnackOpen(true);
    addQuote({ name, email, phone, vehicleId, message, channel: 'whatsapp' });
  }, [qName, qPhone, qEmail, qVehicle, siteLabel]);
  
  // Variantes d'animation pour les éléments
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: { xs: 'auto', md: '100vh' },
        minHeight: { xs: '85vh', md: '700px' },
        maxHeight: { md: '900px' },
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        pt: { xs: 12, md: 0 },
        pb: { xs: 6, md: 0 },
      }}
    >
      {/* Arrière-plan avec overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, rgba(29, 53, 87, 0.95) 0%, rgba(29, 53, 87, 0.85) 100%)`,
            zIndex: 1,
          },
        }}
      >
        {(!isMobile && (heroVideoMp4 || heroVideoMov)) ? (
          <Box
            component="video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={heroPoster}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.6) contrast(1.1)',
            }}
          >
            {heroVideoMp4 ? (<source src={heroVideoMp4} type="video/mp4" />) : null}
            {heroVideoMov ? (<source src={heroVideoMov} type="video/quicktime" />) : null}
          </Box>
        ) : (
          <Box
            component="img"
            src="/images/Moteur ferrari 458 italia.webp"
            alt="Moteur de performance"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.6) contrast(1.1)',
            }}
            decoding="async"
            loading="eager"
            fetchPriority="high"
          />
        )}
      </Box>

      {/* Éléments décoratifs */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        sx={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: { xs: 150, md: 250 },
          height: { xs: 150, md: 250 },
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(230, 57, 70, 0.15) 0%, rgba(230, 57, 70, 0) 70%)`,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      
      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
        sx={{
          position: 'absolute',
          bottom: '15%',
          left: '8%',
          width: { xs: 100, md: 200 },
          height: { xs: 100, md: 200 },
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(230, 57, 70, 0.15) 0%, rgba(230, 57, 70, 0) 70%)`,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2, px: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 6, md: 12 }, alignItems: { xs: 'center', md: 'flex-start' }, justifyContent: 'flex-start', pt: { md: 4 }, ml: { md: -2 } }}>
          <Box sx={{ flex: { md: '0 0 45%', xs: '0 0 100%' }, maxWidth: { md: '45%', xs: '100%' }, pr: { md: 4, xs: 0 }, textAlign: { xs: 'center', md: 'left' } }}>
            <MotionBox
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <Chip 
                label="MOTEURS TESTÉS ET GARANTIS" 
                sx={{ 
                  mb: 3, 
                  fontWeight: 600, 
                  backgroundColor: `${theme.palette.primary.main}30`,
                  color: 'white',
                  borderRadius: '50px',
                  px: 1.5,
                  py: 2,
                  fontSize: '0.75rem',
                  letterSpacing: 1.2,
                  border: `1px solid ${theme.palette.primary.main}40`,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  mx: { xs: 'auto', md: 0 },
                  maxWidth: 420,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  minHeight: 40,
                  '& .MuiChip-label': {
                    px: 1,
                    lineHeight: 1,
                    py: 0
                  }
                }} 
              />
              
              <MotionTypography variants={itemVariants}>
                <Typography
                  variant="h1"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                    mb: 3,
                    color: 'white',
                    textShadow: '0px 3px 6px rgba(0,0,0,0.3)',
                    lineHeight: 1.2,
                    letterSpacing: '-0.01em',
                    position: 'relative',
                    display: 'inline-block',
                    maxWidth: '95%',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -12,
                      left: 0,
                      width: 80,
                      height: 4,
                      backgroundColor: theme.palette.primary.main,
                      borderRadius: 2
                    }
                  }}
                >
                  Moteurs d'occasion de qualité<br />
                  testés et garantis
                </Typography>
              </MotionTypography>

              <MotionTypography variants={itemVariants}>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    fontWeight: 400,
                    color: 'white',
                    opacity: 0.9,
                    maxWidth: '95%',
                    lineHeight: 1.6,
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                  }}
                >
                  Chaque moteur est rigoureusement contrôlé, 
                  testé en conditions réelles et garanti 1 an pour une tranquillité totale.
                </Typography>
              </MotionTypography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: { xs: 4, md: 6 } }}>
                <MotionButton variants={itemVariants}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    component="a"
                    href="/demande-devis"
                    sx={{
                      py: 1.8,
                      px: 4,
                      fontWeight: 600,
                      fontSize: '1rem',
                      borderRadius: '50px',
                      boxShadow: '0 10px 20px rgba(230, 57, 70, 0.3)',
                      transition: 'all 0.3s ease',
                      transform: 'translateY(0)',
                      width: { xs: '100%', sm: 'auto', md: 'fit-content' },
                      '&:hover': {
                        boxShadow: '0 15px 30px rgba(230, 57, 70, 0.4)',
                        transform: 'translateY(-5px)',
                        backgroundColor: theme.palette.primary.dark
                      }
                    }}
                  >
                    Demander un devis
                  </Button>
                </MotionButton>

                <MotionButton variants={itemVariants}>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<PhoneIcon />}
                    sx={{
                      py: 1.8,
                      px: 4,
                      fontWeight: 600,
                      fontSize: '1rem',
                      borderRadius: '50px',
                      borderColor: 'white',
                      color: 'white',
                      borderWidth: 2,
                      transition: 'all 0.3s ease',
                      transform: 'translateY(0)',
                      width: { xs: '100%', sm: 'auto', md: 'fit-content' },
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        borderWidth: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        transform: 'translateY(-5px)'
                      }
                    }}
                    component="a"
                    href="tel:0465845488"
                  >
                    04 65 84 54 88
                  </Button>
                </MotionButton>
              </Stack>

              <Box sx={{ mt: -1, mb: 3 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255,255,255,0.85)',
                    textAlign: { xs: 'center', md: 'left' },
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                    display: 'block',
                    mb: 1
                  }}
                >
                  Nos moteurs ont déjà été montés par
                </Typography>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    gap: { xs: 2, md: 3 },
                    rowGap: { xs: 1.5, md: 2 },
                    px: { xs: 1.5, md: 2 },
                    py: { xs: 1, md: 1.25 },
                    borderRadius: 999,
                    border: '1px solid rgba(255,255,255,0.18)',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.08) 100%)',
                    backdropFilter: 'blur(6px)',
                    flexWrap: 'wrap',
                    maxWidth: { xs: '100%', md: 'unset' }
                  }}
                >
                  <Box
                    component="img"
                    src="/images/partners/logo-porsche.webp"
                    alt="Centre Porsche Toulon"
                    sx={{
                      height: { xs: 28, md: 40 },
                      opacity: 0.98,
                      display: 'block',
                      transition: 'transform .25s ease, opacity .25s ease',
                      '&:hover': { opacity: 1, transform: 'translateY(-2px)' }
                    }}
                    loading="lazy"
                    decoding="async"
                  />
                  <Box
                    component="img"
                    src="/images/partners/mougins-autosport.webp"
                    alt="Mougins Autosport"
                    sx={{
                      height: { xs: 28, md: 40 },
                      opacity: 0.98,
                      display: 'block',
                      transition: 'transform .25s ease, opacity .25s ease',
                      backgroundColor: 'white',
                      borderRadius: 0.75,
                      p: 0.5,
                      '&:hover': { opacity: 1, transform: 'translateY(-2px)' }
                    }}
                    loading="lazy"
                    decoding="async"
                  />
                  <Box
                    component="img"
                    src="/images/partners/sun-motors.webp"
                    alt="Sun Motors"
                    sx={{
                      height: { xs: 28, md: 40 },
                      opacity: 0.98,
                      display: 'block',
                      transition: 'transform .25s ease, opacity .25s ease',
                      '&:hover': { opacity: 1, transform: 'translateY(-2px)' }
                    }}
                    loading="lazy"
                    decoding="async"
                  />
                </Box>
              </Box>
            </MotionBox>
          </Box>

          {!isMobile && (
            <Box sx={{ flex: { md: '0 0 50%', xs: '0 0 100%' }, maxWidth: { md: '50%', xs: '100%' }, ml: { md: 'auto', xs: 0 }, mt: { md: 4 } }}>
              <MotionBox
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                sx={{
                  position: 'relative',
                  zIndex: 2,
                  mt: { xs: 4, md: 0 },
                  mb: { xs: 6, md: 0 }
                }}
              >
                <Box 
                  sx={{ 
                    background: 'transparent',
                    backdropFilter: 'none',
                    borderRadius: '18px',
                    overflow: 'visible',
                    boxShadow: 'none',
                    border: 'none',
                    position: 'relative'
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 3,
                      p: 4
                    }}
                  >
                    
                    
                    <Box
                      component="form"
                      onSubmit={handleQuickQuote}
                      sx={{
                        mt: 3,
                        mb: 3,
                        p: { xs: 2, md: 3 },
                        borderRadius: '18px',
                        background: 'rgba(255,255,255,0.98)',
                        boxShadow: '0 24px 48px rgba(15, 23, 42, 0.28)',
                        border: '1px solid rgba(37,99,235,0.20)',
                        maxWidth: 483,
                        width: '100%',
                        ml: 'auto',
                        mr: { md: '10%' },
                        display: { xs: 'none', md: 'block' }
                      }}
                    >
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: 'primary.main', 
                          fontWeight: 900, 
                          mb: 1.5,
                          letterSpacing: 0.2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <RequestQuoteIcon sx={{ fontSize: 22 }} />
                        Devis rapide
                      </Typography>
                      <Stack spacing={1.8}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                          Véhicule
                        </Typography>
                        <TextField
                          size="medium"
                          fullWidth
                          label="Plaque FR / N° châssis / Code moteur (obligatoire)"
                          value={qVehicle}
                          onChange={(e) => setQVehicle(e.target.value.toUpperCase())}
                          autoComplete="off"
                          helperText={showErrors && !qVehicle.trim() ? 'Ce champ est obligatoire' : 'Ex: AB-123-CD ou VF1XXXXXXXXXXXX ou M48.50'}
                          error={showErrors && !qVehicle.trim()}
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <DirectionsCarIcon sx={{ color: 'primary.main' }} />
                              </InputAdornment>
                            )
                          }}
                          sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#fff', borderRadius: 2 } }}
                        />

                        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.6, mt: 1 }}>
                          Coordonnées
                        </Typography>
                        <TextField
                          size="medium"
                          fullWidth
                          label="Téléphone"
                          value={qPhone}
                          onChange={(e) => setQPhone(e.target.value)}
                          type="tel"
                          autoComplete="tel"
                          inputProps={{ inputMode: 'tel' }}
                          helperText={showErrors && !qPhone.trim() && !qEmail.trim() ? 'Téléphone ou Email requis' : undefined}
                          error={showErrors && !qPhone.trim() && !qEmail.trim()}
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneIcon sx={{ color: 'primary.main' }} />
                              </InputAdornment>
                            )
                          }}
                          sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#fff', borderRadius: 2 } }}
                        />
                        <TextField
                          size="medium"
                          fullWidth
                          type="email"
                          label="Email"
                          value={qEmail}
                          onChange={(e) => setQEmail(e.target.value)}
                          autoComplete="email"
                          placeholder="nom@exemple.fr"
                          helperText={showErrors && !qPhone.trim() && !qEmail.trim() ? 'Téléphone ou Email requis' : undefined}
                          error={showErrors && !qPhone.trim() && !qEmail.trim()}
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AlternateEmailIcon sx={{ color: 'primary.main' }} />
                              </InputAdornment>
                            )
                          }}
                          sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#fff', borderRadius: 2 } }}
                        />
                        <TextField
                          size="medium"
                          fullWidth
                          label="Nom (facultatif)"
                          value={qName}
                          onChange={(e) => setQName(e.target.value)}
                          autoComplete="name"
                          InputLabelProps={{ shrink: true }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonOutlineIcon sx={{ color: 'primary.main' }} />
                              </InputAdornment>
                            )
                          }}
                          sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#fff', borderRadius: 2 } }}
                        />
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          endIcon={<ArrowForwardIcon />}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            borderRadius: '12px',
                            py: 1.2,
                            boxShadow: '0 10px 20px rgba(37,99,235,0.28)',
                            '&:hover': {
                              boxShadow: '0 16px 32px rgba(37,99,235,0.35)'
                            }
                          }}
                        >
                          Envoyer la demande
                        </Button>
                        <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                          Réponse sous 24h — sans engagement
                        </Typography>
                      </Stack>
                    </Box>

                    <Typography
                      variant="caption"
                      sx={{
                        color: 'rgba(255,255,255,0.9)',
                        textTransform: 'uppercase',
                        letterSpacing: 0.6,
                        display: 'block',
                        mb: 0.75,
                        maxWidth: 483,
                        ml: 'auto',
                        mr: { md: '10%' }
                      }}
                    >
                      Pourquoi nous choisir ?
                    </Typography>
                    <Box
                      sx={{
                        background: 'rgba(255,255,255,0.98)',
                        border: '1px solid rgba(37,99,235,0.20)',
                        borderRadius: '18px',
                        px: 2,
                        py: 1.1,
                        boxShadow: '0 12px 24px rgba(15,23,42,0.18)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        flexWrap: 'wrap',
                        maxWidth: 483,
                        width: '100%',
                        ml: 'auto',
                        mr: { md: '10%' }
                      }}
                    >
                      <Chip
                        icon={<ShieldOutlinedIcon sx={{ color: 'success.main', fontSize: 20 }} />}
                        label="Garantie 1 an"
                        sx={{
                          bgcolor: 'rgba(16,185,129,0.10)',
                          color: 'text.primary',
                          border: '1px solid rgba(16,185,129,0.25)',
                          boxShadow: 'none',
                          fontWeight: 700,
                          '& .MuiChip-label': { px: 1.25 }
                        }}
                      />
                      <Chip
                        icon={<AccessTimeIcon sx={{ color: 'primary.main', fontSize: 20 }} />}
                        label="Réponse 24h"
                        sx={{
                          bgcolor: 'rgba(37,99,235,0.10)',
                          color: 'text.primary',
                          border: '1px solid rgba(37,99,235,0.25)',
                          boxShadow: 'none',
                          fontWeight: 700,
                          '& .MuiChip-label': { px: 1.25 }
                        }}
                      />
                      <Chip
                        icon={<LocalShippingOutlinedIcon sx={{ color: 'info.main', fontSize: 20 }} />}
                        label="Livraison rapide"
                        sx={{
                          bgcolor: 'rgba(14,165,233,0.10)',
                          color: 'text.primary',
                          border: '1px solid rgba(14,165,233,0.25)',
                          boxShadow: 'none',
                          fontWeight: 700,
                          '& .MuiChip-label': { px: 1.25 }
                        }}
                      />
                    </Box>

                    {/* Version mobile: CTA unique au lieu du mini-formulaire */}
                    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        endIcon={<ArrowForwardIcon />}
                        component="a"
                        href="/demande-devis#quote-form"
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          borderRadius: '12px',
                          py: 1.4,
                          width: '100%',
                          boxShadow: '0 10px 20px rgba(37,99,235,0.28)'
                        }}
                      >
                        Demander un devis
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </MotionBox>
            </Box>
          )}
        </Box>
      </Container>
      
      {/* Séparateur professionnel en bas */}
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '80px',
          zIndex: 1,
          overflow: 'hidden',
          display: { xs: 'none', md: 'block' }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '8px',
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            boxShadow: '0px -4px 20px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 0,
            width: '100%',
            height: '72px',
            background: theme.palette.background.default
          }}
        />
      </Box>

      {/* Bandeau de succès */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackOpen(false)} severity="success" variant="filled" sx={{ width: '100%' }}>
          {snackMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HeroSection;

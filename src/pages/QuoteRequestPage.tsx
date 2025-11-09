import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  Divider,
  Chip,
  InputAdornment,
} from '@mui/material';
import axios from 'axios';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HandshakeIcon from '@mui/icons-material/Handshake';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { addQuote } from '../utils/quotesStore';
import { useLocation } from 'react-router-dom';

const QuoteSchema = Yup.object({
  name: Yup.string(),
  email: Yup.string().email('Email invalide'),
  phone: Yup.string(),
  vehicleId: Yup.string().required('Plaque, N° châssis ou code moteur requis'),
  message: Yup.string().max(1000, '1000 caractères maximum')
}).test('contact-required', 'Téléphone ou email requis', (values: any) => {
  const phone = values?.phone?.trim();
  const email = values?.email?.trim();
  return Boolean(phone || email);
});

const QuoteRequestPage: React.FC = () => {
  const location = useLocation();
  const siteLabel = (process.env.REACT_APP_SITE_LABEL || 'carpartsfrance.fr');
  const defaults = React.useMemo(() => {
    const sp = new URLSearchParams(location.search);
    const code = sp.get('code') || '';
    const marque = sp.get('marque') || '';
    const cylindree = sp.get('cylindree') || '';
    const vehicleId = [
      code ? `Code: ${code}` : '',
      marque ? `Marque: ${marque}` : '',
      cylindree ? `Cylindrée: ${cylindree}` : ''
    ].filter(Boolean).join(' - ');
    const message = (code || marque || cylindree)
      ? `Je souhaite un devis pour le moteur ${[code, marque, cylindree].filter(Boolean).join(' ')}`
      : '';
    return { vehicleId, message };
  }, [location.search]);
  return (
    <Box
      sx={{
        bgcolor: 'linear-gradient(135deg, rgba(239, 249, 255, 0.8) 0%, rgba(246, 244, 255, 0.9) 100%)',
        py: { xs: 6, md: 8 }
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 0, sm: 2, md: 3 } }}>
        <Paper
          elevation={10}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 4,
            px: { xs: 1, md: 6 },
            py: { xs: 4, md: 6 },
            background: 'rgba(255,255,255,0.92)',
            boxShadow: '0 24px 80px rgba(15, 23, 42, 0.15)'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -120,
              right: -120,
              width: 280,
              height: 280,
              borderRadius: '50%',
              background: 'radial-gradient(circle at center, rgba(37, 99, 235, 0.25), transparent 65%)'
            }}
          />

          <Box id="quote-form" sx={{ position: 'absolute', top: -80 }} />

          <Stack spacing={4} sx={{ position: 'relative', zIndex: 1 }}>
            <Box>
              <Chip icon={<RequestQuoteIcon />} label="Réponse sous 24 heures" color="primary" sx={{ fontWeight: 600, mb: 2 }} />
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.1, maxWidth: 520 }}>
                Demandez un devis précis pour votre moteur en seulement 2 minutes
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 600 }}>
                Notre équipe vous fournit une estimation claire et personnalisée pour chaque moteur.
                Plus vous êtes précis, plus l'offre est rapide.
              </Typography>
            </Box>

            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={{ xs: 4, lg: 6 }} alignItems={{ xs: 'stretch', lg: 'flex-start' }}>
              <Stack spacing={3} sx={{ flex: { lg: '0 0 320px' } }}>
                <Stack spacing={2}>
                  {[
                    { icon: <ShieldOutlinedIcon />, title: 'Pièces garanties', desc: "Chaque moteur est testé et couvert par une garantie constructeur." },
                    { icon: <AccessTimeIcon />, title: 'Réponse rapide', desc: "Devis transmis sous 24 heures pendant les heures d'ouverture." },
                    { icon: <HandshakeIcon />, title: 'Accompagnement dédié', desc: "Un expert vous guide du devis jusqu'à la livraison de votre moteur." },
                  ].map((f, idx) => (
                    <Paper key={idx} elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'rgba(148,163,184,0.25)', bgcolor: 'rgba(248, 250, 252, 0.6)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: 'rgba(37,99,235,0.08)', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {f.icon}
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: 0.2 }}>{f.title}</Typography>
                          <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Stack>

                <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />

                <Stack spacing={1.5}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                    Besoin d'une réponse immédiate ?
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
                    <Button component="a" href="tel:0465845488" startIcon={<PhoneIcon />} variant="outlined" sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 1.8, color: 'primary.main', borderColor: 'rgba(37,99,235,0.35)' }}>
                      04 65 84 54 88
                    </Button>
                    <Button component="a" href="https://wa.me/33756875025" target="_blank" rel="noopener" startIcon={<WhatsAppIcon />} variant="outlined" sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 1.8, color: 'success.main', borderColor: 'rgba(22,163,74,0.35)' }}>
                      WhatsApp
                    </Button>
                  </Stack>
                </Stack>
              </Stack>

              <Paper elevation={0} sx={{ flex: 1, p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: 'rgba(250, 250, 252, 0.9)', border: '1px solid rgba(99, 102, 241, 0.15)', boxShadow: '0 16px 40px rgba(79, 70, 229, 0.08)' }}>
                <Formik
                  enableReinitialize
                  initialValues={{ name: '', email: '', phone: '', vehicleId: defaults.vehicleId, message: defaults.message }}
                  validationSchema={QuoteSchema}
                  onSubmit={async (values, { resetForm, setSubmitting }) => {
                    const message = `Bonjour, je souhaite un devis moteur.\n\n• Nom : ${values.name}\n• Email : ${values.email}\n• Téléphone : ${values.phone}\n• Plaque / N° châssis / Code moteur : ${values.vehicleId}\n• Détails complémentaires : ${values.message || 'Non précisé'}\n\nEnvoyé depuis ${siteLabel}`;
                    const encoded = encodeURIComponent(message);
                    console.log('Demande de devis envoyée:', values);

                    // Tentative d'envoi vers votre application interne si configurée
                    const apiUrl = process.env.REACT_APP_QUOTE_API_URL;
                    const apiKey = process.env.REACT_APP_QUOTE_API_KEY;
                    if (apiUrl) {
                      try {
                        await axios.post(
                          apiUrl,
                          {
                            name: values.name,
                            email: values.email,
                            phone: values.phone,
                            vehicleId: values.vehicleId,
                            message: values.message,
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
                        // Enregistrer aussi localement pour l'espace admin
                        addQuote({
                          name: values.name,
                          email: values.email,
                          phone: values.phone,
                          vehicleId: values.vehicleId,
                          message: values.message,
                          channel: 'api',
                        });
                        alert("Votre demande a été transmise à votre application interne avec succès.");
                        setSubmitting(false);
                        resetForm();
                        return;
                      } catch (err) {
                        console.error('Echec envoi API interne, bascule sur canal alternatif', err);
                      }
                    }

                    // Tentative 2: endpoint interne (Vercel Functions)
                    try {
                      const prefix = (() => {
                        const env = process.env.REACT_APP_BACKEND_URL || '';
                        if (env.trim()) return env.trim().replace(/\/$/, '');
                        if (typeof window !== 'undefined') {
                          const isLocal = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
                          return isLocal ? 'http://localhost:3001' : '';
                        }
                        return '';
                      })();
                      const r = await axios.post(
                        `${prefix}/api/public/quote-request`,
                        {
                          name: values.name,
                          email: values.email,
                          phone: values.phone,
                          vehicleId: values.vehicleId,
                          message: values.message,
                          source: 'form',
                          createdAt: new Date().toISOString(),
                        },
                        { headers: { 'Content-Type': 'application/json' } }
                      );
                      if (r && r.data && r.data.ok) {
                        addQuote({
                          name: values.name,
                          email: values.email,
                          phone: values.phone,
                          vehicleId: values.vehicleId,
                          message: values.message,
                          channel: 'email',
                        });
                        alert('Votre demande a été envoyée. Nous revenons vers vous sous 24h.');
                        setSubmitting(false);
                        resetForm();
                        return;
                      }
                    } catch {}

                    // Fallback unique: WhatsApp (si API non configurée)
                    const whatsappNumber = '330756875025';
                    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encoded}`;
                    window.open(whatsappUrl, '_blank');
                    alert('Votre message WhatsApp est prêt. Vérifiez la nouvelle fenêtre pour l’envoyer.');
                    addQuote({
                      name: values.name,
                      email: values.email,
                      phone: values.phone,
                      vehicleId: values.vehicleId,
                      message: values.message,
                      channel: 'whatsapp',
                    });

                    setSubmitting(false);
                    resetForm();
                  }}
                >
                  {({ errors, touched, isSubmitting, handleChange, handleBlur, values }) => (
                    <Form noValidate>
                      <Stack spacing={3}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          Formulaire de demande
                        </Typography>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                          <TextField
                            fullWidth
                            label="Nom complet"
                            name="name"
                            value={values.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.name && Boolean(errors.name)}
                            helperText={touched.name && errors.name}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PersonOutlineIcon sx={{ color: 'primary.main' }} />
                                </InputAdornment>
                              )
                            }}
                          />
                          <TextField
                            fullWidth
                            type="email"
                            label="Email professionnel"
                            name="email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.email && Boolean(errors.email)}
                            helperText={touched.email && errors.email}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <AlternateEmailIcon sx={{ color: 'primary.main' }} />
                                </InputAdornment>
                              )
                            }}
                          />
                        </Stack>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                          <TextField
                            fullWidth
                            label="Téléphone"
                            name="phone"
                            value={values.phone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.phone && Boolean(errors.phone)}
                            helperText={touched.phone && errors.phone}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PhoneIcon sx={{ color: 'primary.main' }} />
                                </InputAdornment>
                              )
                            }}
                          />
                          <TextField
                            fullWidth
                            label="Plaque FR, N° châssis ou code moteur"
                            name="vehicleId"
                            value={values.vehicleId}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.vehicleId && Boolean(errors.vehicleId)}
                            helperText={touched.vehicleId && errors.vehicleId}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <DirectionsCarIcon sx={{ color: 'primary.main' }} />
                                </InputAdornment>
                              )
                            }}
                          />
                        </Stack>

                        <TextField
                          fullWidth
                          multiline
                          minRows={4}
                          label="Décrivez votre besoin (kilométrage, référence moteur, options...)"
                          name="message"
                          value={values.message}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.message && Boolean(errors.message)}
                          helperText={touched.message && errors.message}
                        />

                        {/* Canal d'envoi retiré: on force WhatsApp (ou API si configurée) */}

                        <Alert
                          icon={<ShieldOutlinedIcon fontSize="inherit" />}
                          severity="info"
                          sx={{
                            bgcolor: 'rgba(239, 246, 255, 0.6)',
                            color: 'primary.dark',
                            borderRadius: 2,
                            alignItems: 'center'
                          }}
                        >
                          Nous traitons vos données en toute confidentialité et ne les partageons jamais sans votre accord.
                        </Alert>

                        <Button type="submit" variant="contained" size="large" disabled={isSubmitting} startIcon={<RequestQuoteIcon />} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '12px', py: 1.5, boxShadow: '0 16px 32px rgba(79, 70, 229, 0.25)', background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)', '&:hover': { background: 'linear-gradient(135deg, #1D4ED8 0%, #6D28D9 100%)', transform: 'translateY(-2px)' } }}>
                          Envoyer ma demande de devis
                        </Button>
                      </Stack>
                    </Form>
                  )}
                </Formik>
              </Paper>
            </Stack>
          </Stack>
        </Paper>
        {/* Réassurance partenaires (cartes avec logos) — positionnée sous le formulaire */}
        <Box sx={{ mt: 8, px: { xs: 1, md: 0 } }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              p: { xs: 2, md: 3 },
              border: '1px solid rgba(0,0,0,0.06)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
              backdropFilter: 'blur(4px)'
            }}
          >
            <Stack spacing={0.75} alignItems="center" textAlign="center" sx={{ mb: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: 0.2 }}>
                Nos moteurs ont déjà été montés par
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Des garages et entreprises partenaires partout en France ont installé nos moteurs avec succès.
              </Typography>
            </Stack>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)' },
                gap: { xs: 1.5, md: 2 }
              }}
            >
              {[{
                src: '/images/partners/logo-porsche.webp',
                alt: 'Centre Porsche Toulon',
                name: 'Centre Porsche Toulon',
                imgSx: { height: { xs: 34, md: 46 } }
              },{
                src: '/images/partners/mougins-autosport.webp',
                alt: 'Mougins Autosport',
                name: 'Mougins Autosport',
                imgSx: { height: { xs: 34, md: 46 }, bgcolor: 'white', borderRadius: 1, p: 0.5 }
              },{
                src: '/images/partners/sun-motors.webp',
                alt: 'Sun Motors',
                name: 'Sun Motors',
                imgSx: { height: { xs: 34, md: 46 } }
              }].map((p, i) => (
                <Paper
                  key={i}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid rgba(0,0,0,0.06)',
                    transition: 'transform .2s ease, box-shadow .2s ease, border-color .2s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 24px rgba(15,23,42,0.08)',
                      borderColor: 'rgba(37,99,235,0.28)'
                    }
                  }}
                >
                  <Stack spacing={1} alignItems="center">
                    <Box component="img" src={p.src} alt={p.alt} sx={p.imgSx} loading="lazy" decoding="async" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{p.name}</Typography>
                  </Stack>
                </Paper>
              ))}
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default QuoteRequestPage;

import React from 'react';
import { Box, Container, Typography, Paper, TextField, Button, Stack, Chip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const ContactPage: React.FC = () => {
  const contactHighlights = [
    'Devis et retours sous 24h ouvrées',
    'WhatsApp & téléphone 6j/7',
    'Rapport de tests envoyé avant paiement'
  ];

  type ContactChannel = {
    title: string;
    value: string;
    helper: string;
    href: string;
    actionLabel: string;
    icon: typeof PhoneIcon;
    buttonVariant: 'contained' | 'outlined' | 'text';
    buttonColor: 'primary' | 'success' | 'inherit';
    target?: string;
    rel?: string;
  };

  const contactChannels: ContactChannel[] = [
    {
      title: 'Téléphone',
      value: '04 65 84 54 88',
      helper: 'Standard 6j/7 • 8h30 → 19h',
      href: 'tel:0465845488',
      actionLabel: 'Appeler',
      icon: PhoneIcon,
      buttonVariant: 'contained',
      buttonColor: 'primary'
    },
    {
      title: 'Email',
      value: 'contact@carpartsfrance.fr',
      helper: 'Réponse détaillée sous 24h',
      href: 'mailto:contact@carpartsfrance.fr',
      actionLabel: 'Écrire un email',
      icon: EmailIcon,
      buttonVariant: 'outlined',
      buttonColor: 'primary'
    },
    {
      title: 'WhatsApp',
      value: '+33 7 56 87 50 25',
      helper: 'Photos & documents partagés en direct',
      href: 'https://wa.me/330756875025',
      actionLabel: 'Ouvrir WhatsApp',
      icon: WhatsAppIcon,
      buttonVariant: 'contained',
      buttonColor: 'success',
      target: '_blank',
      rel: 'noopener'
    }
  ];

  const offices = [
    {
      title: 'Bureau (Nice)',
      lines: ['50 Boulevard Stalingrad', '06300 Nice'],
      map: 'https://www.google.com/maps?q=50%20Boulevard%20Stalingrad%2C%2006300%20Nice&output=embed'
    },
    {
      title: 'Atelier (Rognac)',
      lines: ['515 Avenue Lavoisier', '13340 Rognac'],
      map: 'https://www.google.com/maps?q=515%20Avenue%20Lavoisier%2C%2013340%20Rognac&output=embed'
    }
  ];

  return (
    <Box sx={{ bgcolor: 'rgba(248,249,250,0.7)' }}>
      {/* Hero */}
      <Box
        sx={{
          backgroundImage: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.4)), url(/images/about/livraison-garage-sun-motors.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          py: { xs: 7, md: 10 },
          position: 'relative'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 720 }}>
            <Typography variant="overline" sx={{ letterSpacing: '.4em', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>CONTACT</Typography>
            <Typography variant="h2" component="h1" sx={{ fontWeight: 800, mb: 2, letterSpacing: '-.02em', lineHeight: 1.1 }}>
              Parlons de votre besoin moteur
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>
              Devis sous 24h, suivi personnalisé et envoi du dossier tests avant paiement. Nous restons joignables par téléphone, WhatsApp ou email 6j/7.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button component="a" href="/demande-devis" variant="contained" color="primary" size="large" sx={{ borderRadius: '999px', fontWeight: 700 }}>
                Demander un devis
              </Button>
              <Button component="a" href="tel:0465845488" variant="outlined" color="inherit" startIcon={<PhoneIcon />} size="large" sx={{ borderRadius: '999px', borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}>
                04 65 84 54 88
              </Button>
              <Button component="a" href="https://wa.me/330756875025" target="_blank" rel="noopener" variant="text" color="success" startIcon={<WhatsAppIcon />} size="large" sx={{ color: '#a3e635', fontWeight: 600 }}>
                WhatsApp
              </Button>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 3 }}>
              {contactHighlights.map((item) => (
                <Chip key={item} label={item} size="small" sx={{ borderRadius: '999px', bgcolor: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', fontWeight: 600 }} />
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: { xs: 4, md: 6 }, pb: { xs: 6, md: 10 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' }, gap: 4 }}>
          <Box>
            <Stack spacing={3}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(15,23,42,0.08)', bgcolor: 'white' }}>
                <Typography variant="overline" color="primary" sx={{ letterSpacing: '.2em', fontWeight: 700 }}>
                  Coordonnées directes
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Un interlocuteur unique suit votre dossier</Typography>
                <Stack spacing={2.2}>
                  {contactChannels.map((channel) => {
                    const Icon = channel.icon;
                    return (
                      <Box
                        key={channel.title}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 1.5,
                          borderRadius: 2,
                          border: '1px solid rgba(15,23,42,0.06)',
                          bgcolor: 'rgba(248,249,250,0.8)'
                        }}
                      >
                        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1.5 }}>
                          <Icon sx={{ fontSize: 26, color: channel.icon === WhatsAppIcon ? '#25D366' : 'primary.main' }} />
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{channel.title}</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>{channel.value}</Typography>
                          <Typography variant="body2" color="text.secondary">{channel.helper}</Typography>
                        </Box>
                        <Button
                          component="a"
                          href={channel.href}
                          variant={channel.buttonVariant}
                          color={channel.buttonColor}
                          target={channel.target}
                          rel={channel.rel}
                          sx={{ flexShrink: 0, borderRadius: '999px', textTransform: 'none', fontWeight: 600 }}
                        >
                          {channel.actionLabel}
                        </Button>
                      </Box>
                    );
                  })}
                </Stack>
              </Paper>

              <Paper elevation={2} sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(15,23,42,0.08)', bgcolor: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: 'rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1.5 }}>
                    <LocationOnIcon color="primary" />
                  </Box>
                  <Box>
                    <Typography variant="overline" color="primary" sx={{ letterSpacing: '.2em', fontWeight: 700 }}>Nos adresses</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Bureau et atelier</Typography>
                  </Box>
                </Box>
                <Stack spacing={2.5}>
                  {offices.map((office) => (
                    <Box key={office.title}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{office.title}</Typography>
                      {office.lines.map((line) => (
                        <Typography key={line} variant="body2" color="text.secondary">{line}</Typography>
                      ))}
                      <Button
                        component="a"
                        href={office.map}
                        target="_blank"
                        rel="noopener"
                        size="small"
                        sx={{ mt: 1, textTransform: 'none', fontWeight: 600 }}
                      >
                        Voir sur Google Maps
                      </Button>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Box>

          <Box>
            <Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: '1px solid rgba(15,23,42,0.08)', bgcolor: 'white' }}>
              <Typography variant="overline" color="primary" sx={{ letterSpacing: '.2em', fontWeight: 700 }}>Formulaire</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>Envoyez-nous votre cahier des charges</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Précisez le véhicule, les codes défaut éventuels et le délai souhaité. Nous revenons vers vous avec un rapport de tests disponible.
              </Typography>
              <Box component="form" noValidate>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
                  <TextField required fullWidth label="Nom" name="nom" autoComplete="family-name" />
                  <TextField required fullWidth label="Prénom" name="prenom" autoComplete="given-name" />
                  <TextField required fullWidth label="Nom du garage" name="garage" />
                  <TextField required fullWidth label="Ville" name="ville" />
                  <TextField required fullWidth label="Email" name="email" autoComplete="email" />
                  <TextField required fullWidth label="Téléphone" name="telephone" autoComplete="tel" />
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <TextField required fullWidth label="Sujet / Référence moteur" name="sujet" />
                  </Box>
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <TextField required fullWidth label="Message" name="message" multiline rows={4} />
                  </Box>
                </Box>
                <Button type="submit" variant="contained" color="primary" size="large" fullWidth sx={{ mt: 3, borderRadius: '999px', py: 1.4, fontWeight: 700 }}>
                  Envoyer ma demande
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                  Vos informations restent confidentielles et servent uniquement à traiter votre demande.
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 3, mt: 4 }}>
          {offices.map((office) => (
            <Paper key={office.title} elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(15,23,42,0.08)' }}>
              <Box sx={{ position: 'relative', height: 320 }}>
                <iframe
                  src={office.map}
                  width="100%"
                  height="320"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Carte ${office.title}`}
                />
                <Box sx={{ position: 'absolute', top: 16, left: 16, bgcolor: 'rgba(15,23,42,0.85)', color: 'white', px: 1.5, py: 0.8, borderRadius: 2, fontWeight: 700 }}>
                  {office.title}
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default ContactPage;

import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, Paper, Divider, Avatar, Button, Stack, Dialog, IconButton, LinearProgress, Accordion, AccordionSummary, AccordionDetails, Chip, useTheme, useMediaQuery } from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import VerifiedIcon from '@mui/icons-material/Verified';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownloadIcon from '@mui/icons-material/Download';
import { motion } from 'framer-motion';

 

const SectionTitle: React.FC<{ title: string; overline?: string }> = ({ title, overline }) => (
  <Box sx={{ mb: { xs: 2, md: 3 } }}>
    {overline ? (
      <Typography variant="overline" color="primary" sx={{ letterSpacing: '.08em', fontWeight: 700 }}>
        {overline}
      </Typography>
    ) : null}
    <Typography variant="h4" sx={{ fontWeight: 800 }}>{title}</Typography>
  </Box>
);

const AboutPage: React.FC = () => {
  const stats = [
    { value: '400+', label: 'Clients livrés', detail: 'Garages et particuliers accompagnés partout en France.' },
    { value: '24h', label: 'Temps moyen de devis', detail: 'Réponse moyenne constatée sur les demandes entrantes.' },
    { value: '1 an', label: 'Garantie moteur', detail: "Sur l’ensemble du bloc (hors accessoires)." },
    { value: '72h → 14 j', label: 'Expédition & livraison', detail: 'Selon disponibilité des stocks et destination.' },
  ];

  const heroHighlights = [
    'Rapport de tests signé transmis avant paiement',
    'Transporteurs premium + assurance casse/perte',
    'Interlocuteur dédié jusqu’au montage'
  ];


  const differentiators = [
    {
      title: 'Tests approfondis',
      detail: "Compression, leak-down, endoscopie, analyse d’huile/métaux, contrôle pression d’huile.",
      proof: 'Rapport signé + photos horodatées avant expédition',
      icon: <ScienceIcon fontSize="small" />
    },
    {
      title: 'Compatibilité garantie',
      detail: 'Validation croisée via plaque, VIN, références OEM et retours atelier.',
      proof: 'Validation écrite VIN + référence OEM',
      icon: <VerifiedIcon fontSize="small" />
    },
    {
      title: 'Traçabilité claire',
      detail: 'Photos multiples, numéros de série, rapport détaillé livré avec chaque moteur.',
      proof: 'Dossier complet transmis au garage receveur',
      icon: <Inventory2Icon fontSize="small" />
    },
    {
      title: 'Garantie 1 an',
      detail: 'Garantie commerciale 12 mois sur le bloc moteur (hors accessoires et consommables).',
      proof: 'Clause écrite jointe au devis et au BL',
      icon: <FactCheckIcon fontSize="small" />
    },
    {
      title: 'Logistique sécurisée',
      detail: 'Palette 120×80 cm, protection renforcée, assurance casse/perte incluse.',
      proof: 'Tracking + prise de rendez-vous avec le garage',
      icon: <LocalShippingIcon fontSize="small" />
    },
    {
      title: 'Support technique humain',
      detail: 'Équipe réactive (téléphone, WhatsApp) avec réponses sous 24h maximum.',
      proof: '1 interlocuteur dédié jusqu’au montage',
      icon: <SupportAgentIcon fontSize="small" />
    }
  ];

  const differentiatorHighlights = [
    'Rapport de tests (photos + mesures) transmis avant paiement final',
    'Transport sécurisé : assurance casse/perte + rendez-vous avec le garage',
    'Support humain joignable 6 j/7 par téléphone, WhatsApp ou email'
  ];

  const processSteps = [
    { step: '1', title: 'Analyse & diagnostic', detail: 'Brief complet, codes défaut et usage du véhicule.' },
    { step: '2', title: 'Compatibilité confirmée', detail: 'Références OEM validées, alternatives possibles selon disponibilité.' },
    { step: '3', title: 'Sélection & tests', detail: 'Banc d’essai, contrôle visuel complet, rapport signé.' },
    { step: '4', title: 'Expédition suivie', detail: 'Conditionnement palette, assurance, prise de rendez-vous avec le garage receveur.' }
  ];

  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const heroVideoSrc = isMobile ? '/videos/hero2.min.mp4' : '/videos/hero2.min.mp4';
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = heroVideoRef.current;
    if (!v) return;
    try {
      // Renforce la compatibilité iOS Safari
      v.muted = true;
      // @ts-ignore playsInline côté WebKit
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.setAttribute('muted', '');
      v.setAttribute('autoplay', '');
      const p = v.play();
      if (p && typeof (p as any).catch === 'function') {
        (p as Promise<void>).catch(() => {
          // ignore si le navigateur bloque malgré tout
        });
      }
    } catch (_) {
      // ignore
    }
  }, [isMobile, heroVideoSrc]);
  
  useEffect(() => {
    const title = 'À propos | Car Parts France Moteur';
    const description = "Moteurs d’occasion testés, compatibles et garantis 1 an. Tests en atelier, logistique suivie, devis en 24h. Car Parts France Moteur – 50 Boulevard Staligrand, 06300 Nice.";
    document.title = title;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
  }, []);
  

  const logisticsPoints = [
    {
      title: 'Conditionnement sécurisé',
      detail: 'Palette 120×80 cm, sanglage + filmage multi-couches et témoins de chocs pour bloquer tout mouvement.',
      icon: <Inventory2Icon fontSize="small" />
    },
    {
      title: 'Transporteurs premium',
      detail: 'UPS & DB Schenker avec assurance casse/perte et prise de rendez-vous en amont avec le garage receveur.',
      icon: <LocalShippingIcon fontSize="small" />
    },
    {
      title: 'Suivi proactif',
      detail: 'Tracking temps réel, SMS/email aux garages et interlocuteur logistique qui coordonne chaque étape.',
      icon: <SupportAgentIcon fontSize="small" />
    }
  ];

  const logisticsBadges = [
    'Assurance incluse',
    'Photos d’expédition envoyées',
    'RDV chauffeur confirmé'
  ];

  const teamMembers = [
    { name: 'Killian', role: 'Direction commerciale', focus: 'Garant de la qualité de sélection et de la relation clients.' },
    { name: 'Andy', role: 'Standard téléphonique', focus: 'Premier point de contact et coordination des demandes.' },
    { name: 'Fifaliana', role: 'Gestion logistique', focus: 'Organisation des enlèvements, emballages et livraisons.' },
    { name: 'Matthieu', role: 'Service après-vente', focus: 'Suivi technique, conseils montage et SAV.' },
    { name: 'Illiace', role: 'SEO & Contenus', focus: 'Visibilité en ligne, fiches moteurs et documentation.' },
    { name: 'Benjamin', role: 'Gestion catalogue', focus: 'Mise à jour des références moteur et des stocks.' },
    { name: 'Larissa', role: 'Acquisition SEA', focus: 'Pilotage des campagnes Google Ads et suivi des leads.' },
    { name: 'Julien', role: 'Technicien atelier', focus: 'Tests mécaniques et validation des rapports qualité.' }
  ];

  const teamHighlights = [
    '6 pôles métiers dédiés (commercial, logistique, SAV, acquisition, contenu, atelier).',
    'Réponse moyenne < 24h par téléphone, WhatsApp ou email.',
    'Interlocuteur unique du devis jusqu’à la livraison.'
  ];

  const testimonials = [
    { quote: 'Moteur Porsche Cayenne Turbo livré avec rapport complet. Montage serein et client satisfait.', author: 'Yann T., Nice' },
    { quote: 'Jeep Wrangler 3.6L V6 : référence validée, moteur propre, délais tenus.', author: 'Laurent, Garage Sun Motors' },
    { quote: 'Cayenne S : échanges professionnels, contrôles sérieux, service réactif.', author: 'Éric N.' },
    { quote: 'Cayenne Turbo : rapport de tests rassurant, expédition soignée et protégée.', author: 'Jérôme N.' }
  ];

  const guaranteeItems = [
    "Garantie commerciale 1 an sur le moteur (hors accessoires).",
    'Conformité OEM validée : identique ou équivalent contrôlé.',
    'Rapport de tests complet (photos, mesures, numéros de série).',
    'Procédure d’échange/retour si non-conformité documentée.',
    'Support technique réactif : téléphone, WhatsApp, email.'
  ];

  

  const faqItems = [
    {
      question: 'Vos moteurs sont-ils testés ? ',
      answer: 'Oui, chaque moteur passe au banc : test compression, leak-down, contrôle capteurs et inspection visuelle.'
    },
    {
      question: 'Comment validez-vous la compatibilité ? ',
      answer: 'À partir du VIN/plaque et du code moteur exact. Nous validons également les versions et références OEM.'
    },
    {
      question: 'Quels sont vos délais ? ',
      answer: 'Devis sous 24h. Expédition entre 72h et 14 jours selon la disponibilité du moteur et la destination.'
    },
    {
      question: 'Quelle garantie proposez-vous ? ',
      answer: 'Une garantie commerciale d’un an sur le bloc moteur (hors accessoires). Les modalités détaillées sont fournies avec le devis.'
    }
  ];

  const issueProcedure = [
    {
      step: '1',
      title: 'Signalement documenté',
      detail: 'Vous nous prévenez dès qu’un doute apparaît et partagez photos, vidéos, codes défaut ou remarques du garage.',
      helper: 'Plus le dossier est documenté (photos, diag valise, bon de livraison), plus la résolution est rapide.'
    },
    {
      step: '2',
      title: 'Diagnostic sous 24h',
      detail: 'Matthieu (SAV) et le technicien atelier analysent vos éléments et recoupent avec le dossier de tests fourni.',
      helper: 'Retour garanti en moins de 24h ouvrées par email ou WhatsApp.'
    },
    {
      step: '3',
      title: 'Solution écrite',
      detail: 'Échange standard, prise en charge d’une pièce périphérique ou remboursement selon le cas documenté.',
      helper: 'Chaque décision est formalisée par écrit pour validation des deux parties.'
    },
    {
      step: '4',
      title: 'Suivi logistique',
      detail: 'Nous coordonnons enlèvement, réexpédition ou remboursement et restons en contact jusqu’à clôture.',
      helper: 'CR final envoyé : tracking, interlocuteurs transport et résumé des actions.'
    }
  ];

  const savMetrics = [
    { value: '<24h', label: 'Diagnostic initial' },
    { value: '95%', label: 'Dossiers résolus sans litige' },
    { value: '6j/7', label: 'Support disponible' }
  ];

  const savDocuments = [
    'Photos/vidéos du montage et de la pièce concernée',
    'Codes défaut ou rapport valise OBD',
    'Bon de livraison signé + rapport de tests reçu'
  ];

  

  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          backgroundImage: 'linear-gradient(135deg, rgba(15,23,42,0.88), rgba(15,23,42,0.55)), url(/images/about/carparts-workshop.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: 'white',
          pt: { xs: 6, md: 10 },
          pb: { xs: 6, md: 10 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top right, rgba(37,99,235,0.2), rgba(15,23,42,0.4))' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 4, alignItems: 'center' }}>
            <Box>
              <Typography variant="overline" sx={{ letterSpacing: '.4em', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>À PROPOS</Typography>
              <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-.02em', lineHeight: { xs: 1.1, md: 1 }, mb: 1.5, fontSize: { xs: '2.2rem', md: '2.9rem' } }}>
                Moteurs d’occasion testés, compatibles et garantis 1 an
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, fontWeight: 500, maxWidth: 580, color: 'rgba(255,255,255,0.85)' }}>
                Devis en 24h, rapport de tests signé, logistique sécurisée et interlocuteur dédié jusqu’à la pose. 400+ garages accompagnés partout en France.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ mb: 2 }}>
                <Button component="a" href="/demande-devis" variant="contained" color="primary" size="large" disableElevation sx={{ fontWeight: 700, borderRadius: '999px', px: 3, py: 1.3 }}>
                  Demander un devis
                </Button>
                <Button component="a" href="tel:0465845488" variant="outlined" color="inherit" startIcon={<PhoneIcon />} size="large" sx={{ borderRadius: '999px', borderColor: 'rgba(255,255,255,0.4)', color: 'white', textTransform: 'none' }}>
                  Appeler maintenant
                </Button>
                <Button component="a" href="https://wa.me/33756875025" target="_blank" rel="noopener" variant="text" color="success" startIcon={<WhatsAppIcon />} size="large" sx={{ textTransform: 'none', fontWeight: 600, color: '#a3e635' }}>
                  WhatsApp
                </Button>
              </Stack>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5, mt: 3 }}>
                {heroHighlights.map((point) => (
                  <Paper key={point} elevation={0} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{point}</Typography>
                  </Paper>
                ))}
              </Box>
            </Box>
            <Box>
              <Paper sx={{ p: 1.5, borderRadius: 3, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 60px rgba(2,6,23,0.4)', position: 'relative', overflow: 'hidden' }}>
                <Box
                  component="video"
                  ref={heroVideoRef}
                  src={heroVideoSrc}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  sx={{
                    width: '100%',
                    height: { xs: 240, sm: 300 },
                    objectFit: 'cover',
                    borderRadius: 2,
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    right: 20,
                    bottom: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.8,
                    bgcolor: 'rgba(255,255,255,0.08)',
                    color: 'white',
                    px: 1.2,
                    py: 0.6,
                    borderRadius: '999px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)'
                  }}
                  aria-label="Son désactivé"
                >
                  <VolumeOffIcon sx={{ fontSize: 18 }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Vidéo atelier</Typography>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>
      {/* Chiffres clés */}
      <Box sx={{ bgcolor: 'rgba(248,249,250,0.6)', py: { xs: 5, md: 6 }, position: 'relative', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 24, background: 'linear-gradient(to bottom, rgba(0,0,0,0.06), rgba(0,0,0,0))' }, '&::after': { content: '""', position: 'absolute', bottom: 0, left: 0, right: 0, height: 24, background: 'linear-gradient(to top, rgba(0,0,0,0.06), rgba(0,0,0,0))' } }}>
        <Container maxWidth="lg">
          <Box component={motion.div} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
            <SectionTitle title="Chiffres clés" overline="En bref" />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            {stats.map((stat, idx) => (
              <Paper
                key={stat.label}
                elevation={0}
                component={motion.div}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, ease: 'easeOut', delay: idx * 0.06 }}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid rgba(0,0,0,0.06)',
                  bgcolor: 'white',
                  backgroundImage: 'radial-gradient(60% 60% at 100% 0%, rgba(230,57,70,0.08) 0%, rgba(230,57,70,0) 60%)',
                  transition: 'transform .25s ease, box-shadow .25s ease, border-color .25s ease',
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 30px rgba(2,6,23,0.08)', borderColor: 'rgba(230,57,70,0.25)' }
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 900,
                    mb: 0.5,
                    lineHeight: 1,
                    letterSpacing: '-.01em',
                    background: 'linear-gradient(90deg, #e63946 0%, #ff6b6b 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography variant="overline" sx={{ letterSpacing: '.08em', fontWeight: 800, color: 'text.primary' }}>
                  {stat.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">{stat.detail}</Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Pourquoi Car Parts France */}
      <Box sx={{ bgcolor: 'rgba(248,249,250,0.45)', py: { xs: 6, md: 8 }, position: 'relative', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 24, background: 'linear-gradient(to bottom, rgba(0,0,0,0.06), rgba(0,0,0,0))' }, '&::after': { content: '""', position: 'absolute', bottom: 0, left: 0, right: 0, height: 24, background: 'linear-gradient(to top, rgba(0,0,0,0.06), rgba(0,0,0,0))' } }}>
        <Container maxWidth="lg">
          <SectionTitle title="Pourquoi les garages nous choisissent" overline="Nos différenciants" />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '4fr 8fr' }, gap: { xs: 2.5, md: 4 } }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                border: '1px solid rgba(0,0,0,0.08)',
                bgcolor: 'white',
                backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(37,99,235,0.08), rgba(37,99,235,0))'
              }}
            >
              <Typography variant="overline" color="primary" sx={{ letterSpacing: '.2em', fontWeight: 700 }}>Preuves concrètes</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, mt: 1, mb: 1 }}>Ce qui rassure nos garages</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Chaque moteur est livré avec un dossier complet (tests, photos, numéros de série) et un interlocuteur unique
                jusqu’au montage. Nous validons la compatibilité avant toute commande.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box component="ul" sx={{ listStyle: 'none', pl: 0, m: 0, display: 'grid', gap: 1.2 }}>
                {differentiatorHighlights.map((point) => (
                  <Box key={point} component="li" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: 'primary.light', color: 'primary.main', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', mt: '2px' }}>✓</Box>
                    <Typography variant="body2" color="text.secondary">{point}</Typography>
                  </Box>
                ))}
              </Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
                <Button component="a" href="/demande-devis" variant="contained" color="primary" size="large" sx={{ fontWeight: 700 }}>
                  Demander un devis
                </Button>
                <Button component="a" href="/tests-moteurs" variant="outlined" color="primary" size="large" sx={{ fontWeight: 700 }}>
                  Voir nos tests
                </Button>
              </Stack>
            </Paper>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: { xs: 1.5, md: 2.2 } }}>
              {differentiators.map((item, idx) => (
                <Paper
                  key={item.title}
                  elevation={0}
                  component={motion.div}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  sx={{
                    p: 3,
                    borderRadius: 2.5,
                    border: '1px solid rgba(0,0,0,0.08)',
                    bgcolor: 'white',
                    minHeight: 200,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(135deg, rgba(37,99,235,0.05), rgba(147,197,253,0.04))',
                      opacity: 0,
                      transition: 'opacity .3s ease'
                    },
                    '&:hover': {
                      borderColor: 'rgba(37,99,235,0.25)',
                      boxShadow: '0 18px 35px rgba(15,23,42,0.12)',
                      '&::after': { opacity: 1 }
                    }
                  }}
                >
                  <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: 'rgba(37,99,235,0.08)', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{item.title}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{item.proof}</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ position: 'relative' }}>{item.detail}</Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Process */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <SectionTitle title="Notre méthode" overline="Processus" />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 1.5, md: 2 } }}>
          {processSteps.map((step) => (
            <Paper key={step.step} elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', height: '100%', transition: 'all 0.2s ease-in-out', bgcolor: 'white', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{step.step}</Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{step.title}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">{step.detail}</Typography>
            </Paper>
          ))}
        </Box>
      </Container>

      <Box sx={{ bgcolor: 'rgba(248,249,250,0.6)', py: { xs: 6, md: 8 }, position: 'relative', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 24, background: 'linear-gradient(to bottom, rgba(0,0,0,0.06), rgba(0,0,0,0))' }, '&::after': { content: '""', position: 'absolute', bottom: 0, left: 0, right: 0, height: 24, background: 'linear-gradient(to top, rgba(0,0,0,0.06), rgba(0,0,0,0))' } }}>
        <Container maxWidth="lg">
          <SectionTitle title="Logistique & suivi" overline="Expédition" />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '6fr 6fr' }, gap: 4, alignItems: 'start' }}>
            {/* Colonne gauche: texte + badges + points */}
            <Box>
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: '1px solid rgba(0,0,0,0.08)', bgcolor: 'white' }}>
                <Typography variant="overline" color="primary" sx={{ letterSpacing: '.2em', fontWeight: 700 }}>Expédition maîtrisée</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, mt: 1, mb: 1 }}>Conditionnement + suivi premium</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Nos moteurs quittent l’atelier avec un dossier photo, une assurance casse/perte et un interlocuteur logistique qui reste joignable jusqu’à la livraison.
                </Typography>
                <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap sx={{ mb: 2 }}>
                  {logisticsBadges.map((badge) => (
                    <Chip key={badge} label={badge} color="primary" variant="outlined" size="small" sx={{ borderRadius: '999px', fontWeight: 600 }} />
                  ))}
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'grid', gap: 1.8 }}>
                  {logisticsPoints.map((point) => (
                    <Box key={point.title} sx={{ display: 'flex', gap: 1.5 }}>
                      <Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: 'rgba(37,99,235,0.08)', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {point.icon}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{point.title}</Typography>
                        <Typography variant="body2" color="text.secondary">{point.detail}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Box>
            {/* Colonne droite: galerie */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              {[
                { src: '/images/about/expedition-moteur-sur-palette.webp', alt: 'Conditionnement sur palette' },
                { src: '/images/about/livraison-garage-sun-motors.webp', alt: 'Livraison en garage' }
              ].map((media, index) => (
                <Paper key={index} elevation={0} sx={{ p: 1.5, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', transition: 'all 0.2s ease-in-out', bgcolor: 'white', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 } }}>
                  <Box sx={{ position: 'relative', borderRadius: 1, overflow: 'hidden' }}>
                    <Box component="img" src={media.src} alt={media.alt} loading="lazy" decoding="async" sizes="(max-width: 600px) 100vw, 50vw" width={800} height={480} sx={{ width: '100%', height: { xs: 220, md: 240 }, objectFit: 'cover' }} />
                    <Box sx={{ position: 'absolute', top: 8, left: 8, bgcolor: 'rgba(0,0,0,0.55)', color: 'white', px: 1, py: 0.3, borderRadius: '999px', fontSize: 12, fontWeight: 700 }}>Photo</Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>{media.alt}</Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Équipe */}
      <Box sx={{ bgcolor: 'rgba(248,249,250,0.6)', py: { xs: 6, md: 8 }, position: 'relative', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 24, background: 'linear-gradient(to bottom, rgba(0,0,0,0.06), rgba(0,0,0,0))' }, '&::after': { content: '""', position: 'absolute', bottom: 0, left: 0, right: 0, height: 24, background: 'linear-gradient(to top, rgba(0,0,0,0.06), rgba(0,0,0,0))' } }}>
        <Container maxWidth="lg">
          <SectionTitle title="L’équipe Car Parts France" overline="Équipe" />
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Des profils complémentaires pour suivre chaque dossier</Typography>
              <Typography variant="body1" color="text.secondary">
                Direction commerciale, logistique, atelier et SAV collaborent en temps réel pour sécuriser la sélection moteur,
                la préparation et la livraison. Chaque garage dispose d’un interlocuteur dédié jusqu’au montage.
              </Typography>
              <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap sx={{ mt: 2 }}>
                {teamHighlights.map((highlight) => (
                  <Chip key={highlight} label={highlight} color="default" variant="outlined" size="small" sx={{ borderRadius: '999px', fontWeight: 600 }} />
                ))}
              </Stack>
            </Box>
            <Paper elevation={0} sx={{ flex: 1, p: 3, borderRadius: 3, border: '1px solid rgba(0,0,0,0.08)', bgcolor: 'white', backgroundImage: 'linear-gradient(135deg, rgba(37,99,235,0.05), rgba(147,197,253,0.08))' }}>
              <Typography variant="overline" color="primary" sx={{ letterSpacing: '.2em', fontWeight: 700 }}>Disponibilités</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, mt: 1 }}>6j/7 – téléphone, WhatsApp & email</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Standard assuré par Andy & Larissa de 8h30 à 19h. Réponse SAV sous 24h via Matthieu. Coordination logistique assurée par Fifaliana jusqu’à la réception.
              </Typography>
              <Stack spacing={1.2} sx={{ mt: 2 }}>
                {[
                  { label: 'Téléphone', value: '04 65 84 54 88' },
                  { label: 'WhatsApp', value: '+33 7 56 87 50 25' },
                  { label: 'Email', value: 'contact@carpartsfrance.fr' }
                ].map((item) => (
                  <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.08)', pb: 0.8 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.value}</Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
            {teamMembers.map((member) => (
              <Paper
                key={member.name}
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid rgba(0,0,0,0.08)',
                  bgcolor: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at top right, rgba(37,99,235,0.12), transparent 60%)',
                    opacity: 0,
                    transition: 'opacity .3s ease'
                  },
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 14px 30px rgba(15,23,42,0.12)', '&::after': { opacity: 1 } }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.light', color: 'primary.main', fontWeight: 700 }}>{member.name.charAt(0)}</Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{member.name}</Typography>
                    <Chip label={member.role} size="small" color="primary" variant="outlined" sx={{ borderRadius: '999px', fontWeight: 600 }} />
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">{member.focus}</Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Avis clients */}
      <Box sx={{ bgcolor: 'rgba(248,249,250,0.6)', py: { xs: 6, md: 8 }, position: 'relative', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 24, background: 'linear-gradient(to bottom, rgba(0,0,0,0.06), rgba(0,0,0,0))' }, '&::after': { content: '""', position: 'absolute', bottom: 0, left: 0, right: 0, height: 24, background: 'linear-gradient(to top, rgba(0,0,0,0.06), rgba(0,0,0,0))' } }}>
        <Container maxWidth="lg">
          <SectionTitle title="Avis vérifiés" overline="Témoignages" />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3 }}>
            {testimonials.map((testimonial) => (
              <Paper
                key={testimonial.author}
                elevation={0}
                sx={{
                  p: { xs: 3, md: 3.5 },
                  borderRadius: 3,
                  border: '1px solid rgba(0,0,0,0.08)',
                  bgcolor: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(147,197,253,0.05))',
                    opacity: 0,
                    transition: 'opacity .3s ease'
                  },
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 20px 40px rgba(15,23,42,0.12)', '&::before': { opacity: 1 } }
                }}
              >
                <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.light', color: 'primary.main', fontWeight: 700 }}>{testimonial.author.charAt(0)}</Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{testimonial.author}</Typography>
                    <Stack direction="row" spacing={0.5}>
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Box key={idx} sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: idx < 5 ? 'primary.main' : 'rgba(0,0,0,0.1)' }} />
                      ))}
                    </Stack>
                  </Box>
                </Box>
                <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.05rem' }, fontStyle: 'italic', color: 'text.primary' }}>&ldquo;{testimonial.quote}&rdquo;</Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Garantie */}
      <Box sx={{ bgcolor: 'rgba(248,249,250,0.6)', py: { xs: 6, md: 8 }, position: 'relative', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 24, background: 'linear-gradient(to bottom, rgba(0,0,0,0.06), rgba(0,0,0,0))' }, '&::after': { content: '""', position: 'absolute', bottom: 0, left: 0, right: 0, height: 24, background: 'linear-gradient(to top, rgba(0,0,0,0.06), rgba(0,0,0,0))' } }}>
        <Container maxWidth="lg">
          <SectionTitle title="Garantie & support" overline="Engagements" />
          <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ px: 1, py: 0.5, borderRadius: '999px', bgcolor: 'primary.main', color: 'primary.contrastText', fontSize: 12, fontWeight: 700 }}>Garantie 1 an</Box>
              <Box sx={{ px: 1, py: 0.5, borderRadius: '999px', bgcolor: 'rgba(0,0,0,0.04)', color: 'text.secondary', fontSize: 12, fontWeight: 700 }}>Support réactif</Box>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.2 }}>
              {guaranteeItems.map((item) => (
                <Paper key={item} elevation={0} sx={{ p: 1.5, borderRadius: 1.5, border: '1px solid rgba(0,0,0,0.08)', bgcolor: 'white', display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main', mt: '6px' }} />
                  <Typography variant="body2" color="text.secondary">{item}</Typography>
                </Paper>
              ))}
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              <Button variant="outlined" color="primary" component="a" href="tel:0465845488" size="small">Appeler</Button>
              <Button variant="outlined" color="success" component="a" href="https://wa.me/33756875025" size="small">WhatsApp</Button>
            </Box>
          </Paper>
        </Container>
      </Box>

      <Box sx={{ bgcolor: 'rgba(248,249,250,0.6)', py: { xs: 6, md: 8 }, position: 'relative', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 24, background: 'linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0))' }, '&::after': { content: '""', position: 'absolute', bottom: 0, left: 0, right: 0, height: 24, background: 'linear-gradient(to top, rgba(0,0,0,0.05), rgba(0,0,0,0))' } }}>
        <Container maxWidth="lg">
          <SectionTitle title="Procédure en cas de souci" overline="Après‑vente" />
          <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: '1px solid rgba(0,0,0,0.08)', background: 'white', boxShadow: '0 20px 40px rgba(15,23,42,0.08)' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '4fr 6fr' }, gap: { xs: 3, md: 4 } }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="overline" color="primary" sx={{ letterSpacing: '.2em', fontWeight: 700 }}>SAV humain</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, mt: 1, mb: 1 }}>Nous pilotons chaque dossier jusqu’à résolution</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Interlocuteur unique, réponses sous 24h et rapport écrit de chaque échange pour garder une traçabilité claire.
                  </Typography>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5 }}>
                  {savMetrics.map((metric) => (
                    <Paper key={metric.label} elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', bgcolor: 'rgba(248,249,250,0.8)', textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.5 }}>{metric.value}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{metric.label}</Typography>
                    </Paper>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[ 'Diagnostic sous 24h', 'Solution écrite validée par email', 'Coordination logistique assurée' ].map((item) => (
                    <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: 'primary.light', color: 'primary.main', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</Box>
                      <Typography variant="body2" color="text.secondary">{item}</Typography>
                    </Box>
                  ))}
                </Box>
                <Paper elevation={0} sx={{ borderRadius: 2, border: '1px dashed rgba(0,0,0,0.15)', p: 2, bgcolor: 'rgba(37,99,235,0.04)' }}>
                  <Typography variant="overline" sx={{ letterSpacing: '.2em', fontWeight: 700, color: 'text.secondary' }}>Documents utiles pour accélérer</Typography>
                  <Box component="ul" sx={{ listStyle: 'none', pl: 0, m: 0, mt: 1, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                    {savDocuments.map((doc) => (
                      <Box key={doc} component="li" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main', mt: '6px' }} />
                        <Typography variant="body2" color="text.secondary">{doc}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
                <Paper elevation={0} sx={{ borderRadius: 2, border: '1px dashed rgba(0,0,0,0.15)', p: 2, bgcolor: 'rgba(37,99,235,0.04)' }}>
                  <Typography variant="overline" sx={{ letterSpacing: '.2em', fontWeight: 700, color: 'text.secondary' }}>Contact direct SAV</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>Matthieu – Service après-vente</Typography>
                  <Typography variant="caption" color="text.secondary">Disponible 6j/7 • 8h30 → 19h</Typography>
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    <Typography variant="body2"><strong>Tél</strong> : 04 65 84 54 88</Typography>
                    <Typography variant="body2"><strong>WhatsApp</strong> : +33 7 56 87 50 25</Typography>
                    <Typography variant="body2"><strong>Email</strong> : sav@carpartsfrance.fr</Typography>
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
                    <Button component="a" href="tel:0465845488" variant="contained" color="primary" size="small">Appeler</Button>
                    <Button component="a" href="https://wa.me/33756875025" target="_blank" variant="outlined" color="success" size="small">WhatsApp</Button>
                  </Stack>
                </Paper>
              </Stack>
              <Box>
                <Box component="ol" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {issueProcedure.map((step, idx) => (
                    <Box key={step.step} component="li" sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.main', color: 'primary.contrastText', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18 }}>{step.step}</Box>
                        {idx !== issueProcedure.length - 1 && (
                          <Box sx={{ flexGrow: 1, width: 2, bgcolor: 'rgba(37,99,235,0.2)', mt: 0.5 }} />
                        )}
                      </Box>
                      <Paper elevation={0} sx={{ flex: 1, p: 2.5, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', bgcolor: 'rgba(248,249,250,0.85)', position: 'relative', overflow: 'hidden' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>{step.title}</Typography>
                        <Typography variant="body2" color="text.secondary">{step.detail}</Typography>
                        {step.helper ? (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic', opacity: 0.8 }}>
                            {step.helper}
                          </Typography>
                        ) : null}
                      </Paper>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>

      <Box sx={{ bgcolor: 'rgba(248,249,250,0.6)', py: { xs: 6, md: 8 }, position: 'relative', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 24, background: 'linear-gradient(to bottom, rgba(0,0,0,0.06), rgba(0,0,0,0))' }, '&::after': { content: '""', position: 'absolute', bottom: 0, left: 0, right: 0, height: 24, background: 'linear-gradient(to top, rgba(0,0,0,0.06), rgba(0,0,0,0))' } }}>
        <Container maxWidth="lg">
          <SectionTitle title="Extrait de rapport de tests" overline="Transparence" />
          <Paper elevation={0} sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PictureAsPdfIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Exemple de rapport de tests</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button component="a" href="/reports/rapport-tests.pdf" target="_blank" rel="noopener" size="small" variant="outlined" color="primary" startIcon={<OpenInNewIcon />}>Ouvrir</Button>
                <Button component="a" href="/reports/rapport-tests.pdf" download size="small" variant="outlined" startIcon={<DownloadIcon />}>Télécharger</Button>
                <Box
                  role="button"
                  aria-label="Aperçu du rapport"
                  onClick={() => { setPdfLoaded(false); setPdfDialogOpen(true); }}
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, border: '1px solid rgba(0,0,0,0.12)', borderRadius: 1, cursor: 'pointer', bgcolor: 'rgba(0,0,0,0.02)', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
                >
                  <PictureAsPdfIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Aperçu</Typography>
                </Box>
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Données sensibles floutées.</Typography>
          </Paper>
        </Container>
      </Box>

      <Dialog open={pdfDialogOpen} onClose={() => setPdfDialogOpen(false)} maxWidth="lg" fullWidth>
        <Box sx={{ position: 'relative', bgcolor: 'background.paper', p: { xs: 1.5, md: 2 } }}>
          <IconButton aria-label="Fermer" onClick={() => setPdfDialogOpen(false)} sx={{ position: 'absolute', top: 8, right: 8 }}>
            <CloseIcon />
          </IconButton>
          {!pdfLoaded && <LinearProgress sx={{ mb: 1 }} />}
          <Box
            component="iframe"
            src="/reports/rapport-tests.pdf#toolbar=0&navpanes=0&view=FitH"
            title="Exemple de rapport de tests"
            onLoad={() => setPdfLoaded(true)}
            sx={{ width: '100%', height: { xs: '70vh', md: '80vh' }, border: 0, borderRadius: 1 }}
          />
        </Box>
      </Dialog>

      

      {/* FAQ */}
      <Box sx={{ bgcolor: 'rgba(248,249,250,0.6)', py: { xs: 6, md: 8 }, position: 'relative', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 24, background: 'linear-gradient(to bottom, rgba(0,0,0,0.06), rgba(0,0,0,0))' }, '&::after': { content: '""', position: 'absolute', bottom: 0, left: 0, right: 0, height: 24, background: 'linear-gradient(to top, rgba(0,0,0,0.06), rgba(0,0,0,0))' } }}>
        <Container maxWidth="lg">
          <SectionTitle title="FAQ" overline="Questions fréquentes" />
          <Divider sx={{ mb: 2 }} />
          <Box>
            {faqItems.map((item) => (
              <Accordion key={item.question} disableGutters sx={{ bgcolor: 'white', border: '1px solid rgba(0,0,0,0.08)', boxShadow: 'none', mb: 1, borderRadius: 1.5, overflow: 'hidden' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ '& .MuiAccordionSummary-content': { my: 0.5 } }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{item.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">{item.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>
      </Box>

    </Box>
  );
};

export default AboutPage;

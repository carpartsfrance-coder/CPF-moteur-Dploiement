import React, { useState } from 'react';
import { Box, Container, Typography, Paper, Divider, Avatar, Button, Stack, Dialog, IconButton, LinearProgress, Accordion, AccordionSummary, AccordionDetails, useTheme, useMediaQuery } from '@mui/material';
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


  const differentiators = [
    { title: 'Tests approfondis', detail: "Compression, leak-down, endoscopie, analyse d’huile/métaux, pression d’huile.", icon: <ScienceIcon fontSize="small" /> },
    { title: 'Compatibilité garantie', detail: 'Validation croisée via plaque, VIN, références OEM et retours atelier.', icon: <VerifiedIcon fontSize="small" /> },
    { title: 'Traçabilité claire', detail: 'Photos multiples, numéros de série, rapport détaillé livré avec le moteur.', icon: <Inventory2Icon fontSize="small" /> },
    { title: 'Garantie 1 an', detail: 'Garantie commerciale 12 mois sur le bloc moteur (hors accessoires et consommables).', icon: <FactCheckIcon fontSize="small" /> },
    { title: 'Logistique sécurisée', detail: 'Emballage palette 120×80 cm, protection renforcée, assurance casse/perte incluse.', icon: <LocalShippingIcon fontSize="small" /> },
    { title: 'Support technique', detail: 'Équipe réactive (téléphone, WhatsApp) avec réponses sous 24h maximum.', icon: <SupportAgentIcon fontSize="small" /> }
  ];

  const partners = [
    { name: 'UPS', alt: 'UPS', img: '/partners/ups.svg', color: '#6b5b3e', bg: '#f7f3ec' },
    { name: 'DB Schenker', alt: 'DB Schenker', img: '/partners/db-schenker.svg', color: '#c70016', bg: '#fff1f3' },
    { name: 'Mollie', alt: 'Mollie', img: '/partners/mollie.svg', color: '#0A0B0D', bg: '#f4f5f6' },
    { name: 'Scalapay', alt: 'Scalapay', img: '/partners/scalapay.svg', color: '#ff3b6e', bg: '#fff0f4' },
  ];

  const processSteps = [
    { step: '1', title: 'Analyse & diagnostic', detail: 'Brief complet, codes défaut et usage du véhicule.' },
    { step: '2', title: 'Compatibilité confirmée', detail: 'Références OEM validées, alternatives possibles selon disponibilité.' },
    { step: '3', title: 'Sélection & tests', detail: 'Banc d’essai, contrôle visuel complet, rapport signé.' },
    { step: '4', title: 'Expédition suivie', detail: 'Conditionnement palette, assurance, prise de rendez-vous avec le garage receveur.' }
  ];

  const qualityGallery = [
    { type: 'image', src: '/images/about/Test Leak down moteur.png', title: 'Test leak-down', caption: 'Mesure de l’étanchéité cylindre par cylindre.' },
    { type: 'image', src: '/images/about/prise de compression moteur.jpg', title: 'Prise de compression', caption: 'Contrôle des compressions pour vérifier la santé du bloc.' },
    { type: 'image', src: '/images/about/Endoscopie cylindre moteur bon etat.jpg', title: 'Endoscopie cylindre', caption: 'Inspection visuelle interne pour détecter l’usure.' },
    { type: 'image', src: '/images/about/Endoscopie, soupape bon etat.jpg', title: 'Contrôle soupapes', caption: 'Validation visuelle des soupapes et sièges.' },
    { type: 'video', src: '/videos/about/Vidéo endoscopie cylindre rayé hs.mp4', poster: '/images/about/Endoscopie cylindre moteur bon etat.jpg', title: 'Endoscopie cylindre rayé', caption: 'Détection d’une rayure critique avant expédition.' }
  ];

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerItem, setViewerItem] = useState<null | { type: 'image' | 'video'; src: string; title?: string; poster?: string }>(null);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  

  const logisticsPoints = [
    'Conditionnement sur palette 120×80 cm avec protection renforcée.',
    'Transporteurs partenaires: UPS, DB Schenker avec assurance casse/perte.',
    'Tracking en temps réel et prise de rendez-vous avec le garage receveur.'
  ];

  const teamMembers = [
    { name: 'Killian', role: 'Direction commerciale', focus: 'Garant de la qualité de sélection et de la relation clients.' },
    { name: 'Andy', role: 'Standard téléphonique', focus: 'Premier point de contact et coordination des demandes.' },
    { name: 'Fifaliana', role: 'Gestion logistique', focus: 'Organisation des enlèvements, emballages et livraisons.' },
    { name: 'Matthieu', role: 'Service après-vente', focus: 'Suivi technique, conseils montage et SAV.' },
    { name: 'Illiace', role: 'SEO & Contenus', focus: 'Visibilité en ligne, fiches moteurs et documentation.' },
    { name: 'Benjamin', role: 'Gestion catalogue', focus: 'Mise à jour des références moteur et des stocks.' },
    { name: 'Larissa', role: 'Responsable SEA / Acquisition', focus: 'Pilotage des campagnes Google Ads et suivi des leads.' },
    { name: 'Julien', role: 'Technicien atelier', focus: 'Tests mécaniques et validation des rapports qualité.' }
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
    { step: '1', title: 'Signalement', detail: 'Vous nous informez du problème et partagez les éléments (photos/vidéos/description).' },
    { step: '2', title: 'Diagnostic sous 24h', detail: 'Analyse par notre équipe technique et vérification documentaire.' },
    { step: '3', title: 'Solution proposée', detail: 'Échange du moteur ou remboursement si non‑conformité documentée.' },
    { step: '4', title: 'Suivi jusqu’à résolution', detail: 'Coordination logistique et accompagnement jusqu’à clôture.' }
  ];

  

  return (
    <Box>
      {/* Hero */}
      <Box sx={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.05)', pt: { xs: 6, md: 10 }, pb: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 4, alignItems: 'center' }}>
            <Box>
              <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-.015em', lineHeight: 1.08, mb: 1.25, fontSize: { xs: '2rem', md: '2.6rem' } }}>
                Moteurs d’occasion testés, compatibles et garantis 1 an
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontWeight: 500, maxWidth: 640 }}>
                Devis en 24h. Livraison assurée 72h–14 jours. + de 400 clients livrés.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ mb: 2 }}>
                <Button component="a" href="/demande-devis" variant="contained" color="primary" size="large" disableElevation sx={{ fontWeight: 700, borderRadius: '999px', px: 2.8, py: 1.2, width: { xs: '100%', sm: 'auto' } }}>
                  Demander un devis
                </Button>
                <Button component="a" href="tel:0465845488" variant="text" color="primary" startIcon={<PhoneIcon />} size="large" sx={{ textTransform: 'none', fontWeight: 600, px: 0.6, width: { xs: '100%', sm: 'auto' } }}>
                  Appeler maintenant
                </Button>
                <Button component="a" href="https://wa.me/33756875025" target="_blank" rel="noopener" variant="text" color="success" startIcon={<WhatsAppIcon />} size="large" sx={{ textTransform: 'none', fontWeight: 600, px: 0.6, width: { xs: '100%', sm: 'auto' } }}>
                  WhatsApp
                </Button>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', opacity: 0.9 }}>
                Compatibilité validée via VIN/Code moteur • Rapport de tests fourni • Transport assuré et suivi
              </Typography>
            </Box>
            <Box>
              <Box sx={{ mb: 2, position: 'relative' }}>
                {isMobile ? (
                  <Box
                    component="img"
                    src="/images/about/carparts-workshop.jpg"
                    alt="Atelier"
                    fetchPriority="high"
                    decoding="async"
                    loading="eager"
                    sizes="(max-width: 600px) 100vw, 600px"
                    width={1200}
                    height={300}
                    sx={{
                      width: '100%',
                      height: { xs: 220, sm: 260, md: 300 },
                      objectFit: 'cover',
                      borderRadius: 2,
                      boxShadow: '0 24px 40px rgba(2,6,23,0.08)',
                      border: '1px solid rgba(0,0,0,0.04)',
                      transition: 'transform 220ms ease, box-shadow 220ms ease',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 30px 50px rgba(2,6,23,0.10)' }
                    }}
                  />
                ) : (
                  <Box
                    component="video"
                    src="/videos/hero2.mp4"
                    poster="/images/about/carparts-workshop.jpg"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    sx={{
                      width: '100%',
                      height: { xs: 220, sm: 260, md: 300 },
                      objectFit: 'cover',
                      borderRadius: 2,
                      boxShadow: '0 24px 40px rgba(2,6,23,0.08)',
                      border: '1px solid rgba(0,0,0,0.04)',
                      transition: 'transform 220ms ease, box-shadow 220ms ease',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 30px 50px rgba(2,6,23,0.10)' }
                    }}
                  />
                )}
                {!isMobile && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 12,
                      bottom: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      bgcolor: 'rgba(0,0,0,0.55)',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: '999px',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                    aria-label="Son désactivé"
                  >
                    <VolumeOffIcon sx={{ fontSize: 18 }} />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>Son désactivé</Typography>
                  </Box>
                )}
              </Box>
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
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: { xs: 1.5, md: 2 } }}>
            {differentiators.map((item) => (
              <Paper key={item.title} elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', height: '100%', transition: 'all 0.2s ease-in-out', bgcolor: 'white', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{item.title}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">{item.detail}</Typography>
              </Paper>
            ))}
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

      {/* Qualité contrôlée */}
      <Box sx={{ bgcolor: 'rgba(248,249,250,0.6)', py: { xs: 6, md: 8 }, position: 'relative', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 24, background: 'linear-gradient(to bottom, rgba(0,0,0,0.06), rgba(0,0,0,0))' }, '&::after': { content: '""', position: 'absolute', bottom: 0, left: 0, right: 0, height: 24, background: 'linear-gradient(to top, rgba(0,0,0,0.06), rgba(0,0,0,0))' } }}>
        <Container maxWidth="lg">
          <SectionTitle title="Qualité contrôlée en atelier" overline="Tests en atelier" />
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 300px)', justifyContent: 'center', gap: { xs: 2, md: 2.5 } }}>
            {qualityGallery.map((item, idx) => (
              <Paper key={idx} elevation={0} sx={{ p: 1.5, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', transition: 'all 0.2s ease-in-out', bgcolor: 'white', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 } }}>
                <Box
                  role="button"
                  aria-label={`Agrandir ${item.title || (item.type === 'image' ? 'image' : 'vidéo')}`}
                  onClick={() => { setViewerItem({ type: item.type as 'image' | 'video', src: item.src, title: item.title, poster: (item as any).poster }); setViewerOpen(true); }}
                  sx={{ cursor: 'zoom-in', position: 'relative', borderRadius: 1, overflow: 'hidden' }}
                >
                  {item.type === 'image' ? (
                    <Box component="img" src={item.src} alt={item.title} loading="lazy" decoding="async" sizes="300px" width={300} height={200} sx={{ width: '100%', height: { xs: 180, sm: 200 }, objectFit: 'cover' }} />
                  ) : (
                    <Box component="video" src={item.src} poster={(item as any).poster} muted playsInline preload="none" sx={{ width: '100%', height: { xs: 180, sm: 200 }, objectFit: 'cover' }} />
                  )}
                  <Box sx={{ position: 'absolute', top: 8, left: 8, bgcolor: 'rgba(0,0,0,0.55)', color: 'white', px: 1, py: 0.3, borderRadius: '999px', fontSize: 12, fontWeight: 700 }}>
                    {item.type === 'video' ? 'Vidéo' : 'Image'}
                  </Box>
                  <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, p: 1.2, background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)', color: 'white' }}>
                    <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600 }}>Voir en grand</Typography>
                  </Box>
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>{item.title}</Typography>
                <Typography variant="body2" color="text.secondary">{item.caption}</Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      <Dialog open={viewerOpen} onClose={() => { setViewerOpen(false); setViewerItem(null); }} maxWidth="lg" fullWidth>
        <Box sx={{ position: 'relative', bgcolor: 'black', p: { xs: 1.5, md: 2 } }}>
          <IconButton aria-label="Fermer" onClick={() => { setViewerOpen(false); setViewerItem(null); }} sx={{ position: 'absolute', top: 8, right: 8, color: 'white', zIndex: 1 }}>
            <CloseIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: { xs: '40vh', md: '60vh' } }}>
            {viewerItem?.type === 'image' && (
              <Box component="img" src={viewerItem.src} alt={viewerItem.title} sx={{ maxWidth: '90vw', maxHeight: '80vh', width: 'auto', height: 'auto', objectFit: 'contain' }} />
            )}
            {viewerItem?.type === 'video' && (
              <Box component="video" src={viewerItem.src} poster={viewerItem.poster} controls autoPlay sx={{ maxWidth: '90vw', maxHeight: '80vh', width: 'auto', height: 'auto', objectFit: 'contain' }} />
            )}
          </Box>
          {viewerItem?.title && (
            <Typography variant="caption" sx={{ color: 'white', opacity: 0.8, display: 'block', textAlign: 'center', mt: 1 }}>
              {viewerItem.title}
            </Typography>
          )}
        </Box>
      </Dialog>

      {/* Logistique */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <SectionTitle title="Logistique & suivi" overline="Expédition" />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '6fr 6fr' }, gap: 4, alignItems: 'start' }}>
          <Box>
            <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', bgcolor: 'white' }}>
              <Box sx={{ display: 'grid', gap: 2 }}>
                {logisticsPoints.map((point, i) => (
                  <Box key={point} sx={{ display: 'flex', alignItems: 'flex-start', position: 'relative', pb: i < logisticsPoints.length - 1 ? 2 : 0 }}>
                    <Box sx={{ position: 'relative', mr: 2 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main' }} />
                      {i < logisticsPoints.length - 1 && (
                        <Box sx={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 2, height: 'calc(100% + 16px)', bgcolor: 'rgba(0,0,0,0.1)' }} />
                      )}
                    </Box>
                    <Typography variant="body1" color="text.secondary">{point}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            {[
              { src: '/images/about/Expedition moteur sur palette.jpg', alt: 'Conditionnement sur palette' },
              { src: '/images/about/Livraison garage Sun Motors.jpg', alt: 'Livraison en garage' }
            ].map((media, index) => (
              <Paper key={index} elevation={0} sx={{ p: 1.5, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', transition: 'all 0.2s ease-in-out', bgcolor: 'white', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 } }}>
                <Box
                  role="button"
                  aria-label={`Agrandir ${media.alt}`}
                  onClick={() => { setViewerItem({ type: 'image', src: media.src, title: media.alt }); setViewerOpen(true); }}
                  sx={{ position: 'relative', borderRadius: 1, overflow: 'hidden', cursor: 'zoom-in' }}
                >
                  <Box component="img" src={media.src} alt={media.alt} loading="lazy" decoding="async" sizes="(max-width: 600px) 100vw, 50vw" width={800} height={480} sx={{ width: '100%', height: { xs: 220, md: 240 }, objectFit: 'cover' }} />
                  <Box sx={{ position: 'absolute', top: 8, left: 8, bgcolor: 'rgba(0,0,0,0.55)', color: 'white', px: 1, py: 0.3, borderRadius: '999px', fontSize: 12, fontWeight: 700 }}>Photo</Box>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>{media.alt}</Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      </Container>

      {/* Partenaires */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <SectionTitle title="Ils nous accompagnent" overline="Partenaires" />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 2 }}>
          {partners.map((p) => (
            <Paper key={p.name} elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', bgcolor: 'white', transition: 'all 0.2s ease-in-out', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 72, filter: 'grayscale(1)', opacity: 0.9, transition: 'all 0.25s ease', '&:hover': { filter: 'grayscale(0)', opacity: 1 } }}>
                <Box
                  component="img"
                  src={p.img}
                  alt={`${p.alt} logo`}
                  loading="lazy"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    const img = e.currentTarget as HTMLImageElement;
                    img.style.display = 'none';
                    const sib = img.parentElement?.querySelector('[data-fallback="1"]') as HTMLElement | null;
                    if (sib) sib.style.display = 'inline-flex';
                  }}
                  sx={{ maxHeight: 36, maxWidth: '80%', objectFit: 'contain' }}
                />
                <Box data-fallback="1" sx={{ display: 'none', px: 1.5, py: 0.75, borderRadius: 1, border: '1px solid rgba(0,0,0,0.08)', bgcolor: 'background.paper', color: p.color, fontWeight: 700, fontSize: 14 }}>
                  {p.name}
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      </Container>

      {/* Équipe */}
      <Box sx={{ bgcolor: 'rgba(248,249,250,0.6)', py: { xs: 6, md: 8 }, position: 'relative', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 24, background: 'linear-gradient(to bottom, rgba(0,0,0,0.06), rgba(0,0,0,0))' }, '&::after': { content: '""', position: 'absolute', bottom: 0, left: 0, right: 0, height: 24, background: 'linear-gradient(to top, rgba(0,0,0,0.06), rgba(0,0,0,0))' } }}>
        <Container maxWidth="lg">
          <SectionTitle title="L’équipe Car Parts France" overline="Équipe" />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            {teamMembers.map((member) => (
              <Paper key={member.name} elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', height: '100%', transition: 'all 0.2s ease-in-out', bgcolor: 'white', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.light', color: 'primary.main', fontWeight: 700 }}>{member.name.charAt(0)}</Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{member.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>{member.role}</Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">{member.focus}</Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Avis clients */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <SectionTitle title="Avis vérifiés" overline="Témoignages" />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
          {testimonials.map((testimonial) => (
            <Paper key={testimonial.author} elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', position: 'relative', transition: 'all 0.2s ease-in-out', bgcolor: 'white', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 } }}>
              <Typography variant="body1" sx={{ mb: 1.5 }}>&ldquo;{testimonial.quote}&rdquo;</Typography>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>{testimonial.author}</Typography>
            </Paper>
          ))}
        </Box>
      </Container>

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

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <SectionTitle title="Procédure en cas de souci" overline="Après‑vente" />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          {issueProcedure.map((step) => (
            <Paper key={step.step} elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', height: '100%', bgcolor: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: 'primary.light', color: 'primary.main', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{step.step}</Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{step.title}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">{step.detail}</Typography>
            </Paper>
          ))}
        </Box>
      </Container>

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

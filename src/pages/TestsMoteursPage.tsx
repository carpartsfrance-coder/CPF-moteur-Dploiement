import React from 'react';
import { Box, Container, Typography, Paper, Stack, Button } from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SpeedIcon from '@mui/icons-material/Speed';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import VerifiedIcon from '@mui/icons-material/Verified';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const TestsMoteursPage: React.FC = () => {
  const tests = [
    {
      icon: <ScienceIcon />,
      title: 'Compression',
      badge: 'Mesures chiffrées',
      desc: "Mesure cylindre par cylindre pour vérifier l’étanchéité.",
      points: ['Valeurs comparées aux tolérances constructeur', 'Détection des pertes sur segments, soupapes, joints'],
      image: '/images/tests/compression.jpg'
    },
    {
      icon: <FactCheckIcon />,
      title: 'Leak-down',
      badge: 'Test statique',
      desc: "Analyse des fuites internes sous pression.",
      points: ['Quantifie la fuite (%) pour chaque cylindre', 'Permet de cibler segments, soupapes, culasse'],
      image: '/images/about/prise-de-compression-moteur.webp'
    },
    {
      icon: <VisibilityIcon />,
      title: 'Endoscopie',
      badge: 'Inspection visuelle',
      desc: "Caméra dans les cylindres pour constater l’usure réelle.",
      points: ['Observation rayures, dépôts, piqûres', 'Photos jointes au rapport final'],
      image: '/images/tests/endoscopie.jpg'
    },
    {
      icon: <SpeedIcon />,
      title: 'Préparation / Emballage / Conditionnement',
      badge: 'Logistique sécurisée',
      desc: "Moteur filmé, sanglé et protégé avant le transport.",
      points: ['Protection des organes sensibles et bouchons', 'Palette renforcée + sangles + film étirable'],
      image: '/images/tests/preparation-conditionnement.jpg'
    },
    {
      icon: <FactCheckIcon />,
      title: 'Moteur préparé / nettoyé',
      badge: 'Finition atelier',
      desc: "Nettoyage externe + préparation des points de fixation avant expédition.",
      points: ['Dégraissage, soufflage, bouchons de protection', 'Prêt à être posé dès réception par le garage'],
      image: '/images/tests/moteur-prepare.jpg'
    },
    {
      icon: <SupportAgentIcon />,
      title: 'Validation compatibilité',
      badge: 'Traçabilité',
      desc: "Analyse VIN / immatriculation / références OEM.",
      points: ['Croisement catalogue constructeur + retours atelier', 'Étiquette moteur + rapport pour le garage'],
      image: '/images/tests/validation.png'
    },
  ];

  const processBlocks = [
    {
      superLabel: 'Phase 1',
      title: 'Qualification & sourcing',
      badge: '≤ 2h ouvrées',
      icon: <VerifiedIcon />,
      summary: "On vérifie votre VIN/immat, on commande le moteur chez le fournisseur et on réserve le créneau atelier.",
      bullets: [
        'Analyse des numéros VIN/immat + références OEM',
        'Commande fournisseur + estimation du délai d’acheminement',
        'Sélection et traçabilité du moteur le mieux noté'
      ],
      result: 'Compatibilité validée, fournisseur booké et moteur sécurisé dès son arrivée.'
    },
    {
      superLabel: 'Phase 2',
      title: 'Tests atelier documentés',
      badge: '24h atelier',
      icon: <PrecisionManufacturingIcon />, 
      summary: 'Nos techniciens réalisent et documentent tous les contrôles critiques.',
      bullets: [
        'Compression par cylindre + leak-down',
        'Endoscopie (photos HD) + écoute mécanique',
        'Rapport PDF + visuels envoyés pour validation'
      ],
      result: 'Vous recevez un dossier complet; si le moteur n’est pas conforme, nous relançons le sourcing sans frais.'
    },
    {
      superLabel: 'Phase 3',
      title: 'Préparation & expédition',
      badge: '48-72h France',
      icon: <LocalShippingIcon />, 
      summary: 'Nous préparons le moteur pour un transport sécurisé et rapide.',
      bullets: [
        'Nettoyage, protections, bouchons et filmage intégral',
        'Palette renforcée, sanglage + housse pluie',
        'Transporteur assuré + tracking transmis au garage'
      ],
      result: 'Moteur prêt à poser, suivi partagé jusqu’à réception.'
    }
  ];

  const gallery = [
    { src: '/images/about/prise-de-compression-moteur.webp', alt: 'Prise de compression' },
    { src: '/images/about/endoscopie-cylindre-moteur-bon-etat.webp', alt: 'Endoscopie cylindre' },
    { src: '/images/about/endoscopie-soupape-bon-etat.webp', alt: 'Contrôle soupapes' },
    { src: '/images/about/expedition-moteur-sur-palette.webp', alt: 'Expédition sur palette' },
  ];

  const warningItems: { icon: React.ElementType; title: string; badge: string; desc: string }[] = [
    {
      icon: WarningAmberIcon,
      title: 'Stock fantôme & prix cassés',
      badge: 'Promesse impossible',
      desc: 'Annonce “livraison 24h” alors que rien n’est réservé en atelier. Vous payez, puis ils cherchent un moteur au hasard.'
    },
    {
      icon: AssignmentLateIcon,
      title: 'Tests inexistants ou bâclés',
      badge: 'Zéro preuve',
      desc: 'Pas de compression, pas de leak-down, pas de photos. Au moindre souci, le transporteur ou votre garage sont accusés.'
    },
    {
      icon: PersonSearchIcon,
      title: 'Identité floue & interlocuteur introuvable',
      badge: 'Traçabilité nulle',
      desc: 'Pas d’adresse atelier confirmée, numéro mobile qui change, aucun responsable identifié quand le moteur pose problème.'
    }
  ];

  const safeChecks = [
    'Exiger un rapport daté (compression, leak-down, endoscopie) avant expédition, une fois la commande passée.',
    'Vérifier l’adresse atelier, le téléphone fixe et demander un nom/prénom de référent.',
    'Faire confirmer par écrit délais, garantie et procédure en cas d’échec.'
  ];

  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          position: 'relative',
          backgroundImage: 'url(/images/tests/hero-labo-moteur.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          minHeight: { xs: 420, md: 520 },
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(7,11,23,0.65)' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: { xs: 6, md: 10 } }}>
          <Box sx={{ maxWidth: 700 }}>
            <Typography variant="overline" sx={{ letterSpacing: '.3em', fontWeight: 700, color: 'primary.light' }}>
              Atelier tests & certification
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1.05, mt: 1, mb: 1.5 }}>
              Nos tests moteurs, preuves à l’appui
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 500, color: 'rgba(255,255,255,0.9)', mb: 3 }}>
              Contrôles compression, leak-down et endoscopie documentés. Rapport signé, photos HD, traçabilité atelier complète avant expédition.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button component="a" href="/demande-devis" variant="contained" color="primary" size="large" disableElevation sx={{ minWidth: 220 }}>
                Démarrer une demande
              </Button>
              <Button component="a" href="tel:0465845488" variant="outlined" color="inherit" size="large" startIcon={<SupportAgentIcon />} sx={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}>
                Parler à un expert
              </Button>
            </Stack>
            <Typography variant="body2" sx={{ mt: 3, color: 'rgba(255,255,255,0.8)' }}>
              Rapport PDF remis sous 24h • Garantie 1 an • Transport assuré et suivi
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Méthodes */}
      <Box sx={{ bgcolor: 'rgba(248,249,250,0.15)', py: { xs: 5, md: 6 } }}>
        <Container maxWidth="lg">
          <Typography variant="overline" color="primary" sx={{ letterSpacing: '.08em', fontWeight: 700 }}>Méthodes de test</Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>Ce que nous contrôlons</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)' }, gap: 2 }}>
            {tests.map((t) => (
              <Paper key={t.title} elevation={0} sx={{ p: 0, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', bgcolor: 'white', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {t.image && (
                  <Box component="img" src={t.image} alt={t.title} loading="lazy" decoding="async" sx={{ width: '100%', height: 150, objectFit: 'cover' }} />
                )}
                <Box sx={{ p: 2.4, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box sx={{ width: 42, height: 42, borderRadius: 1, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {t.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{t.title}</Typography>
                      {t.badge && (
                        <Typography variant="caption" sx={{ px: 1, py: 0.3, borderRadius: '999px', bgcolor: 'rgba(37,99,235,0.08)', color: 'primary.main', fontWeight: 700 }}>{t.badge}</Typography>
                      )}
                    </Box>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">{t.desc}</Typography>
                  <Box component="ul" sx={{ pl: 2.5, mb: 0, '& li': { fontSize: '0.9rem', color: 'text.secondary', mb: 0.5 } }}>
                    {t.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Processus + CTA */}
      <Box sx={{ position: 'relative', py: { xs: 6, md: 7 }, background: 'linear-gradient(135deg, #f4f6fb 0%, #eef2ff 45%, #f9fafc 100%)' }}>
        <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle at top right, rgba(59,130,246,0.15), transparent 40%)' }} />
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Paper elevation={0} sx={{ mb: 4, p: { xs: 2.5, md: 3 }, borderRadius: 3, background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(59,130,246,0.15)', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="overline" color="primary" sx={{ letterSpacing: '.2em', fontWeight: 700 }}>Processus</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>Comment nous traitons votre demande</Typography>
              <Typography variant="body2" color="text.secondary">Qualification rapide, tests documentés, préparation packagée : vous suivez chaque phase avec des preuves.</Typography>
            </Box>
            <Button component="a" href="/rapports/exemple-rapport-tests-moteur.pdf" target="_blank" rel="noopener" variant="outlined" color="primary">
              Voir un rapport complet
            </Button>
          </Paper>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {processBlocks.map((block) => (
              <Paper key={block.title} elevation={0} sx={{ p: { xs: 2.6, md: 3.2 }, borderRadius: 4, background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 20px 45px rgba(15,23,42,0.08)', display: 'flex', flexDirection: 'column', gap: 1.6 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ width: 54, height: 54, borderRadius: '18px', bgcolor: 'rgba(59,130,246,0.1)', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {block.icon}
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ letterSpacing: '.2em', textTransform: 'uppercase', color: 'text.secondary', fontWeight: 700 }}>{block.superLabel}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>{block.title}</Typography>
                  </Box>
                </Stack>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>{block.summary}</Typography>
                <Box component="ul" sx={{ pl: 2.3, m: 0, color: 'text.secondary', '& li': { mb: 0.6 } }}>
                  {block.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 'auto' }}>
                  <Typography variant="caption" sx={{ px: 1.4, py: 0.4, borderRadius: '999px', bgcolor: 'rgba(59,130,246,0.1)', color: 'primary.main', fontWeight: 700 }}>{block.badge}</Typography>
                  <Typography variant="caption" color="text.secondary"><strong>Résultat :</strong> {block.result}</Typography>
                </Stack>
              </Paper>
            ))}
          </Box>
          <Paper elevation={0} sx={{ mt: 5, p: { xs: 3, md: 4 }, borderRadius: 4, background: 'linear-gradient(120deg, #0f172a, #1e293b)', color: 'white', display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>Prêt à lancer la phase 1 ?</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>Réponse sous 2h ouvrées, rapport complet sous 24h.</Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
              <Button component="a" href="/demande-devis" variant="contained" color="primary" size="large" disableElevation>
                Demander un devis
              </Button>
              <Button component="a" href="tel:0465845488" variant="outlined" size="large" sx={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}>
                04 65 84 54 88
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>

      {/* Bloc Attention aux fausses promesses (après CTA) */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: '1px solid rgba(253, 176, 34, 0.4)', bgcolor: 'rgba(253, 176, 34, 0.08)' }}>
          <Typography variant="overline" sx={{ letterSpacing: '.12em', fontWeight: 700, color: 'warning.main' }}>Attention aux fausses promesses</Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, mb: 1 }}>Pourquoi certains devis paraissent « trop beaux »</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Voici les signaux d’alerte que nos clients rencontrent le plus souvent avant de revenir vers nous.
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3,1fr)' }, gap: 2.5 }}>
            {warningItems.map(({ icon: Icon, title, badge, desc }) => (
              <Paper key={title} elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', bgcolor: 'white', height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Stack direction="row" spacing={1.2} alignItems="flex-start">
                  <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'rgba(240,163,10,0.15)', color: 'warning.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>
                    <Typography variant="caption" sx={{ px: 1, py: 0.2, borderRadius: '999px', bgcolor: 'rgba(240,163,10,0.15)', color: 'warning.main', fontWeight: 700 }}>{badge}</Typography>
                  </Box>
                </Stack>
                <Typography variant="body2" color="text.secondary">{desc}</Typography>
              </Paper>
            ))}
          </Box>
          <Paper elevation={0} sx={{ mt: 3, p: { xs: 2.5, md: 3 }, borderRadius: 2, bgcolor: 'white', border: '1px solid rgba(0,0,0,0.06)' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Notre engagement transparence</Typography>
            <Box component="ul" sx={{ pl: 2.5, m: 0, color: 'text.secondary', '& li': { mb: 0.4 } }}>
              <li>Commande moteur + délais fournisseur annoncés dès la phase 1.</li>
              <li>Dossier de tests (compression, leak-down, endoscopie) envoyé avant expédition.</li>
              <li>Adresse atelier, téléphone fixe, WhatsApp et visite sur rendez-vous.</li>
              <li>Si un moteur échoue, nous relançons immédiatement un sourcing sans frais.</li>
            </Box>
          </Paper>
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Checklist express avant d’accepter un devis</Typography>
            <Box component="ul" sx={{ listStyle: 'none', pl: 0, m: 0, '& li': { mb: 0.8 } }}>
              {safeChecks.map((item) => (
                <Stack key={item} component="li" direction="row" spacing={1} alignItems="center">
                  <CheckCircleIcon fontSize="small" sx={{ color: 'success.main' }} />
                  <Typography variant="body2" color="text.secondary">{item}</Typography>
                </Stack>
              ))}
            </Box>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ mt: 3 }}>
            <Button component="a" href="/demande-devis" variant="contained" color="warning" disableElevation>
              Vérifier un devis concurrent
            </Button>
            <Button component="a" href="tel:0465845488" variant="text" color="warning">
              Parler à un expert transparence
            </Button>
          </Stack>
        </Paper>
      </Container>

      {/* Exemples */}
      <Box sx={{ bgcolor: 'rgba(248,249,250,0.6)', py: { xs: 5, md: 6 } }}>
        <Container maxWidth="lg">
          <Typography variant="overline" color="primary" sx={{ letterSpacing: '.08em', fontWeight: 700 }}>Exemples</Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>Galerie de tests</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(4,1fr)' }, gap: 2 }}>
            {gallery.map((g) => (
              <Paper key={g.src} elevation={0} sx={{ p: 1.2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', bgcolor: 'white' }}>
                <Box component="img" src={g.src} alt={g.alt} loading="lazy" decoding="async" sx={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 1 }} />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>{g.alt}</Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA final */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 6 } }}>
        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Stack>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Besoin d’un devis précis ?</Typography>
            <Typography variant="body2" color="text.secondary">Réponse sous 24h, rapport de tests fourni, garantie 1 an.</Typography>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
            <Button component="a" href="/demande-devis" variant="contained" color="primary">Demander un devis</Button>
            <Button component="a" href="tel:0465845488" variant="outlined" color="primary" startIcon={<LocalShippingIcon />}>Nous appeler</Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default TestsMoteursPage;

import React from 'react';
import { Box, Container, Typography, Paper, Divider, Avatar } from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import VerifiedIcon from '@mui/icons-material/Verified';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const Bullet: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
    <Box sx={{ width: 8, height: 8, mt: '10px', borderRadius: '50%', background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)' }} />
    <Typography variant="body1" color="text.secondary">{children}</Typography>
  </Box>
);

const SectionTitle: React.FC<{ title: string; overline?: string }> = ({ title, overline }) => (
  <Box sx={{ mb: 3 }}>
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

  const missionPoints = [
    'Qualifier précisément chaque besoin (plaque, VIN, code moteur, contexte de panne).',
    'Tester systématiquement chaque moteur: compression, leak-down, endoscopie, analyse d’huile et métaux.',
    'Documenter la traçabilité: photos haute définition, numéros de série et rapport complet transmis.'
  ];

  const historyFacts = [
    { title: 'Expérience terrain', detail: "Équipe issue de la mécanique auto, du SAV et de la logistique." },
    { title: 'Réseau certifié', detail: 'Ateliers partenaires audités, transporteurs premium (UPS, DB Schenker).' },
    { title: 'Approche transparente', detail: 'Références moteur validées, communication claire et suivi personnalisé.' }
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

  const caseStudy = {
    context: 'SUV premium immobilisé suite à une casse moteur, garages déjà sollicités sans solution fiable.',
    actions: [
      'Analyse du besoin avec VIN, codes défaut et historique d’entretien.',
      'Contrôle approfondi du moteur sélectionné (compression, endoscopie, analyse d’huile).',
      'Rapport transmis avec photos HD, numéros de série et recommandations montage.',
      'Expédition palette 120×80 cm, assurance et suivi jusqu’au garage partenaire.'
    ],
    outcome: 'Véhicule opérationnel en 7 jours, client final satisfait, aucune réclamation SAV.'
  };

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

  return (
    <Box>
      {/* Hero */}
      <Box sx={{ background: 'linear-gradient(180deg, #ffffff 0%, rgba(0,0,0,0.02) 100%)', pt: { xs: 6, md: 10 }, pb: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 4, alignItems: 'center' }}>
            <Box>
              <Typography variant="h2" sx={{ fontWeight: 800, lineHeight: 1.1, mb: 2, fontSize: { xs: '2rem', md: '2.8rem' } }}>
                À propos de Car Parts France
              </Typography>
              <Typography variant="h5" color="text.secondary" sx={{ mb: 0, fontWeight: 500 }}>
                Nous sommes une équipe spécialisée dans la sélection, le test et l’expédition de moteurs d’occasion compatibles, avec un haut niveau d’exigence qualité.
              </Typography>
            </Box>
            <Box>
              <Box sx={{ mb: 2, position: 'relative' }}>
                <Box
                  component="img"
                  src="/images/about/carparts-workshop.jpg"
                  alt="Notre atelier"
                  loading="lazy"
                  sx={{
                    width: '100%',
                    height: { xs: 220, sm: 260, md: 300 },
                    objectFit: 'cover',
                    borderRadius: 2,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.06)'
                  }}
                />
                <Paper elevation={0} sx={{ position: 'absolute', left: 12, bottom: 12, px: 1.5, py: 0.5, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Notre atelier</Typography>
                </Paper>
              </Box>
              <></>
            </Box>
          </Box>
        </Container>
      </Box>
      {/* Chiffres clés */}
      <Box sx={{ bgcolor: 'rgba(248,249,250,0.6)', py: { xs: 5, md: 6 } }}>
        <Container maxWidth="lg">
          <SectionTitle title="Chiffres clés" overline="En bref" />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            {stats.map((stat) => (
              <Paper key={stat.label} elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)', bgcolor: 'white', transition: 'all 0.2s ease-in-out', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4, borderColor: 'rgba(0,0,0,0.08)' } }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>{stat.value}</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{stat.label}</Typography>
                <Typography variant="body2" color="text.secondary">{stat.detail}</Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Mission & ADN */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <SectionTitle title="Notre mission et notre ADN" overline="Qui sommes‑nous" />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 4 }}>
          <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Notre mission</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Sélectionner, tester et livrer des moteurs d’occasion compatibles, en apportant un niveau d’exigence équivalent à du matériel neuf.
            </Typography>
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              {missionPoints.map((point) => (
                <Bullet key={point}>{point}</Bullet>
              ))}
            </Box>
          </Paper>
          <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Ce qui nous définit</Typography>
            <Box sx={{ display: 'grid', gap: 2 }}>
              {historyFacts.map((fact) => (
                <Box key={fact.title}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{fact.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{fact.detail}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </Container>

      {/* Pourquoi Car Parts France */}
      <Box sx={{ bgcolor: 'rgba(248,249,250,0.45)', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <SectionTitle title="Pourquoi les garages nous choisissent" overline="Nos différenciants" />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {differentiators.map((item) => (
              <Paper key={item.title} elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', height: '100%', transition: 'all 0.2s ease-in-out', bgcolor: 'white', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1 }}>
                  <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: 'primary.light', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.icon}
                  </Box>
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
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          {processSteps.map((step) => (
            <Paper key={step.step} elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', height: '100%', transition: 'all 0.2s ease-in-out', bgcolor: 'white', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: 'primary.light', color: 'primary.main', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{step.step}</Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{step.title}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">{step.detail}</Typography>
            </Paper>
          ))}
        </Box>
      </Container>

      {/* Qualité contrôlée */}
      <Box sx={{ bgcolor: 'rgba(248,249,250,0.6)', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <SectionTitle title="Qualité contrôlée en atelier" overline="Tests en atelier" />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {qualityGallery.map((item, idx) => (
              <Paper key={idx} elevation={0} sx={{ p: 1.5, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', transition: 'all 0.2s ease-in-out', bgcolor: 'white', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 } }}>
                {item.type === 'image' ? (
                  <Box component="img" src={item.src} alt={item.title} loading="lazy" sx={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 1, border: '1px solid rgba(0,0,0,0.06)' }} />
                ) : (
                  <Box component="video" src={item.src} poster={item.poster} controls sx={{ width: '100%', height: 180, borderRadius: 1, objectFit: 'cover', border: '1px solid rgba(0,0,0,0.06)' }} />
                )}
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>{item.title}</Typography>
                <Typography variant="body2" color="text.secondary">{item.caption}</Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Logistique */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <SectionTitle title="Logistique & suivi" overline="Expédition" />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '6fr 6fr' }, gap: 4, alignItems: 'center' }}>
          <Box>
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              {logisticsPoints.map((point) => (
                <Bullet key={point}>{point}</Bullet>
              ))}
            </Box>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            {[
              { src: '/images/about/Expedition moteur sur palette.jpg', alt: 'Conditionnement sur palette' },
              { src: '/images/about/Livraison garage Sun Motors.jpg', alt: 'Livraison en garage' }
            ].map((media, index) => (
              <Paper key={index} elevation={0} sx={{ p: 1.5, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', transition: 'all 0.2s ease-in-out', bgcolor: 'white', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 } }}>
                <Box component="img" src={media.src} alt={media.alt} loading="lazy" sx={{ width: '100%', height: { xs: 200, md: 220 }, objectFit: 'cover', borderRadius: 1, border: '1px solid rgba(0,0,0,0.06)' }} />
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
      <Box sx={{ bgcolor: 'rgba(248,249,250,0.6)', py: { xs: 6, md: 8 } }}>
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
      <Box sx={{ bgcolor: 'rgba(248,249,250,0.6)', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <SectionTitle title="Garantie & support" overline="Engagements" />
          <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }}>
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              {guaranteeItems.map((item) => (
                <Bullet key={item}>{item}</Bullet>
              ))}
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Étude de cas */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <SectionTitle title="Étude de cas: SUV premium" overline="Cas réel" />
        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Contexte</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{caseStudy.context}</Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Actions menées</Typography>
          <Box sx={{ display: 'grid', gap: 1 }}>
            {caseStudy.actions.map((action) => (
              <Bullet key={action}>{action}</Bullet>
            ))}
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 3, mb: 1 }}>Résultat</Typography>
          <Typography variant="body2" color="text.secondary">{caseStudy.outcome}</Typography>
        </Paper>
      </Container>

      {/* FAQ */}
      <Box sx={{ bgcolor: 'rgba(248,249,250,0.6)', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <SectionTitle title="FAQ" overline="Questions fréquentes" />
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ display: 'grid', gap: 2 }}>
            {faqItems.map((item) => (
              <Box key={item.question}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{item.question}</Typography>
                <Typography variant="body2" color="text.secondary">{item.answer}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

    </Box>
  );
};

export default AboutPage;

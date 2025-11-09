import React from 'react';
import { Box, Container, Typography, Paper, Button, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const KPI: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Paper elevation={0} sx={{ p: 3, textAlign: 'center', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 2 }}>
    <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>{value}</Typography>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
  </Paper>
);

const Bullet: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
    <Box sx={{ width: 8, height: 8, mt: '10px', borderRadius: '50%', bgcolor: 'primary.main' }} />
    <Typography variant="body1" color="text.secondary">{children}</Typography>
  </Box>
);

const AboutPage: React.FC = () => {
  return (
    <Box>
      {/* Hero */}
      <Box sx={{ bgcolor: 'background.default', pt: { xs: 6, md: 10 }, pb: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 4, alignItems: 'center' }}>
            <Box>
              <Typography variant="h2" sx={{ fontWeight: 800, lineHeight: 1.1, mb: 2, fontSize: { xs: '2rem', md: '2.8rem' } }}>
                Car Parts France Moteur
              </Typography>
              <Typography variant="h5" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
                Le moteur d'occasion testé et garanti. Devis en 24h, compatibilité vérifiée, livraison rapide.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button component={RouterLink} to="/demande-devis" variant="contained" color="primary" size="large">
                  Demander un devis
                </Button>
                <Button component="a" href="tel:0465845488" variant="outlined" color="primary" size="large">
                  04 65 84 54 88
                </Button>
                <Button component="a" href="https://wa.me/330756875025" target="_blank" variant="outlined" color="success" size="large">
                  WhatsApp
                </Button>
              </Box>
            </Box>
            <Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <KPI value="1 800+" label="Moteurs livrés" />
                <KPI value="4,8/5" label="Satisfaction client" />
                <KPI value="24h" label="Délai devis" />
                <KPI value="jusqu'à 12m" label="Garantie" />
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Mission */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 6 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>Notre mission</Typography>
            <Typography variant="body1" color="text.secondary">
              Permettre aux pros et particuliers d'obtenir un moteur fiable, testé et compatible, au meilleur rapport qualité/prix,
              avec un service humain, rapide et transparent.
            </Typography>
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>Ce qui nous différencie</Typography>
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              <Bullet>Tests complets sur banc avant expédition (compression, étanchéité, capteurs clés)</Bullet>
              <Bullet>Traçabilité (numéro de série, photos, rapport)</Bullet>
              <Bullet>Compatibilité vérifiée (VIN/plaque, code moteur)</Bullet>
              <Bullet>Livraison rapide et sécurisée (palette, assurance)</Bullet>
              <Bullet>Garantie claire jusqu'à 12 mois</Bullet>
              <Bullet>Support technique réactif</Bullet>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Process */}
      <Box sx={{ bgcolor: 'rgba(248,249,250,0.6)', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Notre méthode</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {[
              { n: '1', t: "Analyse de votre besoin", d: "Plaque, VIN ou code moteur" },
              { n: '2', t: "Vérification de compatibilité", d: "Référence exacte validée" },
              { n: '3', t: "Sélection & tests", d: "Banc d'essai + rapport" },
              { n: '4', t: "Validation & expédition", d: "Protection palette, 24–72h" },
              { n: '5', t: "Assistance au montage", d: "Conseils et SAV réactif" },
            ].map((s) => (
              <Box key={s.n}>
                <Paper elevation={0} sx={{ p: 3, height: '100%', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: 'primary.light', color: 'primary.main', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.n}</Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{s.t}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">{s.d}</Typography>
                </Paper>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Garanties & engagements */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Garanties & engagements</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          {[
            "Garantie commerciale jusqu'à 12 mois",
            "Conformité OEM (identique ou équivalent validé)",
            "Rapport de test systématique",
            "Échange/retour si non-conformité",
            "SAV réactif: 04 65 84 54 88 · WhatsApp · contact@carpartsfrance.fr",
          ].map((g, i) => (
            <Box key={i}>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid rgba(0,0,0,0.06)', borderRadius: 2 }}>
                <Typography variant="body1">{g}</Typography>
              </Paper>
            </Box>
          ))}
        </Box>
      </Container>

      {/* Équipe / Avis / Cas */}
      <Box sx={{ bgcolor: 'rgba(248,249,250,0.6)', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 6 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>L'équipe</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Killian — Direction & Qualité</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Responsable atelier — Banc de test, contrôle</Typography>
              <Typography variant="body2" color="text.secondary">Conseillers techniques — Compatibilité & suivi devis</Typography>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Avis clients</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>“Moteur livré sous 3 jours, montage parfait.” — Garage A., Lyon</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>“Devis clair, SAV pro, référence conforme.” — J. Martin</Typography>
              <Typography variant="body2" color="text.secondary">“Bon prix, moteur testé, client satisfait.” — Carrossier B.</Typography>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Études de cas</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>BMW 320d (N47): sélection d’un N47 compatible, test compression OK, expédition 48h → reprise en 5 jours.</Typography>
              <Typography variant="body2" color="text.secondary">Clio 1.5 dCi: moteur d’échange testé, injecteurs contrôlés → remise en route en 72h, garantie 12 mois.</Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* FAQ simple */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>FAQ</Typography>
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Vos moteurs sont-ils testés ?</Typography>
            <Typography variant="body2" color="text.secondary">Oui, passage au banc, test compression, contrôle étanchéité/capteurs.</Typography>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Comment validez-vous la compatibilité ?</Typography>
            <Typography variant="body2" color="text.secondary">À partir du VIN/plaque et du code moteur exact.</Typography>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Quels sont vos délais ?</Typography>
            <Typography variant="body2" color="text.secondary">Devis 24h. Expédition 24–72h selon stock et zone.</Typography>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Quelle garantie ?</Typography>
            <Typography variant="body2" color="text.secondary">Jusqu’à 12 mois. Détails fournis au devis.</Typography>
          </Box>
        </Box>
      </Container>

      {/* CTA final */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2, alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: { xs: 2, md: 0 } }}>
                Parlons de votre véhicule. Recevez un devis clair et rapide.
              </Typography>
            </Box>
            <Box>
              <Box sx={{ display: 'flex', gap: 1.5, justifyContent: { xs: 'flex-start', md: 'flex-end' }, flexWrap: 'wrap' }}>
                <Button component={RouterLink} to="/demande-devis" variant="contained" color="secondary">Demander un devis</Button>
                <Button component="a" href="tel:0465845488" variant="outlined" color="inherit">Appeler</Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default AboutPage;

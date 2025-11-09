import React from 'react';
import { Box, Container, Typography, Divider, Paper, Link } from '@mui/material';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        <Paper elevation={2} sx={{ p: { xs: 3, md: 4 } }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
            Politique de confidentialité
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Version en vigueur au {new Date().toLocaleDateString('fr-FR')}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Box id="responsable" sx={{ mb: 5 }}>
            <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mb: 2 }}>
              1. Responsable du traitement
            </Typography>
            <Typography paragraph>
              Car Parts France — 50 Boulevard Stalingrad, 06300 Nice — contact@carpartsfrance.fr — 04 65 84 54 88.
            </Typography>
          </Box>

          <Box id="donnees" sx={{ mb: 5 }}>
            <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mb: 2 }}>
              2. Données collectées
            </Typography>
            <Typography paragraph>
              Données d’identification et de contact (nom, email, téléphone), informations véhicule (plaque, N° châssis, code moteur),
              contenu des messages, informations de navigation et de mesure d’audience (cookies/traceurs si acceptés).
            </Typography>
          </Box>

          <Box id="bases-legales" sx={{ mb: 5 }}>
            <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mb: 2 }}>
              3. Bases légales (RGPD art. 6)
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Exécution de mesures précontractuelles et du contrat (devis, vente, livraison, SAV).</li>
              <li>Intérêt légitime (amélioration des services, prévention des fraudes, statistiques agrégées).</li>
              <li>Obligation légale (facturation, comptabilité, garanties légales).</li>
              <li>Consentement (prospection électronique, cookies non essentiels).</li>
            </Typography>
          </Box>

          <Box id="finalites" sx={{ mb: 5 }}>
            <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mb: 2 }}>
              4. Finalités des traitements
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Répondre aux demandes de devis et assurer la relation commerciale.</li>
              <li>Gérer la livraison, la facturation, la garantie et le SAV.</li>
              <li>Assurer la sécurité du site et prévenir les abus.</li>
              <li>Envoyer des communications (avec votre consentement le cas échéant).</li>
            </Typography>
          </Box>

          <Box id="durees" sx={{ mb: 5 }}>
            <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mb: 2 }}>
              5. Durées de conservation
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Demandes de devis: jusqu’à 3 ans après le dernier contact.</li>
              <li>Documents de vente et facturation: 10 ans (obligations légales).</li>
              <li>Cookies de mesure d’audience: selon votre choix (durée maximale 13 mois).</li>
            </Typography>
          </Box>

          <Box id="destinataires" sx={{ mb: 5 }}>
            <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mb: 2 }}>
              6. Destinataires
            </Typography>
            <Typography paragraph>
              Le personnel habilité de Car Parts France et, le cas échéant, nos prestataires techniques (hébergement, messagerie,
              outils de support) strictement nécessaires à la prestation. Aucune cession de données à des tiers à des fins commerciales
              sans votre consentement.
            </Typography>
          </Box>

          <Box id="transferts" sx={{ mb: 5 }}>
            <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mb: 2 }}>
              7. Transferts hors UE
            </Typography>
            <Typography paragraph>
              Si certains prestataires sont situés hors de l’UE, des garanties appropriées sont mises en place (clauses contractuelles types,
              pays reconnus adéquats, ou équivalents) conformément au RGPD.
            </Typography>
          </Box>

          <Box id="droits" sx={{ mb: 5 }}>
            <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mb: 2 }}>
              8. Vos droits
            </Typography>
            <Typography component="ul" sx={{ pl: 3 }}>
              <li>Droit d’accès, de rectification, d’effacement, d’opposition, de limitation et de portabilité.</li>
              <li>Droit de retirer votre consentement à tout moment (pour les traitements basés sur le consentement).</li>
              <li>Droit d’introduire une réclamation auprès de la CNIL (<Link href="https://www.cnil.fr/" target="_blank" rel="noopener">cnil.fr</Link>).</li>
            </Typography>
            <Typography paragraph sx={{ mt: 1 }}>
              Pour exercer vos droits, contactez: contact@carpartsfrance.fr.
            </Typography>
          </Box>

          <Box id="cookies" sx={{ mb: 5 }}>
            <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mb: 2 }}>
              9. Cookies et traceurs
            </Typography>
            <Typography paragraph>
              Lors de votre navigation, des cookies peuvent être déposés sur votre terminal. Les cookies strictement nécessaires au
              fonctionnement du site ne requièrent pas de consentement. Les cookies de mesure d’audience et autres cookies non essentiels
              ne sont déposés qu’avec votre consentement. Vous pouvez à tout moment gérer vos préférences via votre navigateur.
            </Typography>
          </Box>

          <Box id="securite" sx={{ mb: 5 }}>
            <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mb: 2 }}>
              10. Sécurité
            </Typography>
            <Typography paragraph>
              Nous mettons en œuvre des mesures techniques et organisationnelles adaptées pour assurer la confidentialité et l’intégrité
              de vos données personnelles.
            </Typography>
          </Box>

          <Box id="maj" sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mb: 2 }}>
              11. Mise à jour
            </Typography>
            <Typography paragraph>
              La présente politique peut être mise à jour pour refléter des évolutions légales ou fonctionnelles. En cas de changement
              important, nous vous en informerons par les moyens appropriés.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PrivacyPolicyPage;

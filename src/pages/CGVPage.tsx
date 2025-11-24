import React from 'react';
import { Box, Container, Typography, Divider, Paper } from '@mui/material';

const CGVPage: React.FC = () => {
  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        <Paper elevation={2} sx={{ p: { xs: 3, md: 4 } }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
            Conditions Générales de Vente (CGV)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Version en vigueur au {new Date().toLocaleDateString('fr-FR')}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mb: 2 }}>
            1. Champ d’application
          </Typography>
          <Typography paragraph>
            Les présentes CGV s’appliquent aux ventes de moteurs d’occasion testés et garantis effectuées par Car Parts France auprès de clients professionnels (B2B) et de consommateurs (B2C) au sein de l’Union européenne. Toute commande implique l’acceptation sans réserve des présentes CGV.
          </Typography>

          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mt: 4, mb: 2 }}>
            2. Produits et disponibilité
          </Typography>
          <Typography paragraph>
            Les moteurs proposés sont d’occasion et testés selon un protocole interne (compression/leak test, endoscopie, pression d’huile, analyse d’huile, inspection visuelle). Les photos, fiches techniques et disponibilités sont indicatifs et susceptibles d’évoluer.
          </Typography>

          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mt: 4, mb: 2 }}>
            3. Commande
          </Typography>
          <Typography paragraph>
            La commande devient ferme après confirmation écrite (devis accepté, bon de commande, paiement d’acompte le cas échéant). Car Parts France se réserve le droit de refuser une commande pour motif légitime (indisponibilité, anomalie manifeste de prix, suspicion de fraude, etc.).
          </Typography>

          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mt: 4, mb: 2 }}>
            4. Prix et paiement
          </Typography>
          <Typography paragraph>
            Les prix sont exprimés en euros HT, TVA en sus le cas échéant. Les frais de livraison et d’emballage sont communiqués avant validation. Les modalités de paiement (virement, carte, etc.) sont précisées sur le devis. En B2B, tout retard de paiement entraîne l’application d’intérêts de retard et d’une indemnité forfaitaire de recouvrement conformément au Code de commerce.
          </Typography>

          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mt: 4, mb: 2 }}>
            5. Livraison et transfert des risques
          </Typography>
          <Typography paragraph>
            Les délais de livraison sont indiqués à titre indicatif et peuvent varier selon les contrôles et la logistique. Le transfert des risques intervient à la remise au transporteur (B2B) ou à la livraison effective au consommateur (B2C), conformément au droit applicable.
          </Typography>

          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mt: 4, mb: 2 }}>
            6. Réception et conformité
          </Typography>
          <Typography paragraph>
            À réception, le client doit vérifier l’état du colis et du produit. En cas d’avarie ou de manquant, des réserves précises doivent être émises auprès du transporteur et notifiées à Car Parts France sous 48h. Pour tout défaut non apparent, le client doit informer Car Parts France dans un délai raisonnable.
          </Typography>

          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mt: 4, mb: 2 }}>
            7. Droit de rétractation (B2C uniquement)
          </Typography>
          <Typography paragraph>
            Conformément au droit de l’UE, le consommateur dispose d’un délai de 14 jours à compter de la livraison pour exercer son droit de rétractation, sans avoir à motiver sa décision. Les produits doivent être renvoyés complets, en bon état et non montés, aux frais du consommateur, dans leur emballage d’origine si possible. Le remboursement intervient sous 14 jours après réception et vérification. Certaines exceptions légales au droit de rétractation peuvent s’appliquer.
          </Typography>

          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mt: 4, mb: 2 }}>
            8. Garanties
          </Typography>
          <Typography paragraph>
            Tous les moteurs bénéficient d’une garantie de 1 an contre les défauts de fonctionnement dans les conditions normales d’utilisation. La garantie ne couvre pas les dommages consécutifs à un montage non conforme, à l’absence d’entretien, à une utilisation inappropriée ou à une modification du produit. Les garanties légales de conformité (B2C) et contre les vices cachés s’appliquent conformément au droit français.
          </Typography>

          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mt: 4, mb: 2 }}>
            9. Retour, échange et procédure SAV
          </Typography>
          <Typography paragraph>
            Toute demande de retour ou d’échange doit être préalablement acceptée par Car Parts France. Un numéro de dossier et des consignes de réexpédition sont communiqués. Après analyse, Car Parts France procédera, selon le cas, à la réparation, au remplacement ou au remboursement.
          </Typography>

          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mt: 4, mb: 2 }}>
            10. Responsabilité
          </Typography>
          <Typography paragraph>
            La responsabilité de Car Parts France ne saurait être engagée pour un dommage indirect, immatériel ou consécutif. En B2B, toute limitation de responsabilité applicable est interprétée au regard du droit impératif. Rien n’exclut les droits impératifs du consommateur en B2C.
          </Typography>

          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mt: 4, mb: 2 }}>
            11. Force majeure
          </Typography>
          <Typography paragraph>
            En cas de force majeure au sens du droit français rendant impossible l’exécution des obligations, l’exécution est suspendue pendant la durée de l’événement.
          </Typography>

          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mt: 4, mb: 2 }}>
            12. Médiation et règlement des litiges
          </Typography>
          <Typography paragraph>
            Conformément à l’article L612-1 du Code de la consommation, le consommateur peut recourir gratuitement à un dispositif de médiation de la consommation en vue de la résolution amiable d’un litige. Les informations de contact du médiateur seront communiquées sur demande. En cas d’échec, les tribunaux compétents seront ceux déterminés par le droit applicable.
          </Typography>

          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mt: 4, mb: 2 }}>
            13. Droit applicable
          </Typography>
          <Typography paragraph>
            Les présentes CGV sont soumises au droit français, sans préjudice des dispositions impératives plus favorables du droit du consommateur de l’État de résidence du client.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default CGVPage;

import React from 'react';
import { Box, Container, Typography, Divider, Paper } from '@mui/material';

const LegalPage: React.FC = () => {
  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        <Paper elevation={2} sx={{ p: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Mentions Légales
          </Typography>
          <Divider sx={{ my: 3 }} />
          
          <Box id="mentions-legales" sx={{ mb: 6 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
              Informations légales
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
              Raison sociale
            </Typography>
            <Typography variant="body1" paragraph>
              Car Parts France<br />
              SIRET : 907 510 838 00028<br />
              RCS : Nice B 907 510 838
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
              Siège social
            </Typography>
            <Typography variant="body1" paragraph>
              50 Boulevard Stalingrad<br />
              06300 Nice<br />
              France
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
              Contact
            </Typography>
            <Typography variant="body1" paragraph>
              Téléphone : 04 65 84 54 88<br />
              Email : contact@carpartsfrance.fr
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
              Directeur de la publication
            </Typography>
            <Typography variant="body1" paragraph>
              Car Parts France (Représentant légal)
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
              Hébergement
            </Typography>
            <Typography variant="body1" paragraph>
              OVH SAS<br />
              2 rue Kellermann<br />
              59100 Roubaix<br />
              France
            </Typography>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box id="cgv" sx={{ mb: 6 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
              Conditions Générales de Vente
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
              Article 1 - Objet
            </Typography>
            <Typography variant="body1" paragraph>
              Les présentes conditions générales de vente régissent les relations contractuelles entre la société Car Parts France et ses clients professionnels. Elles s'appliquent à toutes les ventes de moteurs d'occasion testés et garantis.
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
              Article 2 - Prix
            </Typography>
            <Typography variant="body1" paragraph>
              Les prix des produits sont indiqués en euros hors taxes. Ils sont majorés de la TVA au taux en vigueur au jour de la commande. Les frais de livraison sont facturés en supplément et indiqués avant la validation de la commande.
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
              Article 3 - Garantie
            </Typography>
            <Typography variant="body1" paragraph>
              Tous les moteurs vendus par Car Parts France bénéficient d'une garantie de 1 an à compter de la date de livraison. Cette garantie couvre les défauts de fonctionnement du moteur, à l'exclusion des dommages résultant d'une utilisation anormale ou non conforme.
            </Typography>
            
            {/* Ajoutez d'autres articles selon vos besoins */}
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box id="confidentialite" sx={{ mb: 6 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
              Politique de Confidentialité
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
              Collecte des données personnelles
            </Typography>
            <Typography variant="body1" paragraph>
              Car Parts France collecte des données personnelles lors de la demande de devis ou de la création de compte client. Ces données comprennent notamment le nom, l'adresse email, le numéro de téléphone et l'adresse postale du client.
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
              Utilisation des données
            </Typography>
            <Typography variant="body1" paragraph>
              Les données collectées sont utilisées pour le traitement des commandes, l'envoi de devis, la livraison des produits et la gestion de la relation client. Elles peuvent également être utilisées, avec le consentement du client, pour l'envoi de communications commerciales.
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
              Protection des données
            </Typography>
            <Typography variant="body1" paragraph>
              Car Parts France s'engage à protéger la confidentialité des données personnelles de ses clients conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.
            </Typography>
            
            {/* Ajoutez d'autres sections selon vos besoins */}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LegalPage;

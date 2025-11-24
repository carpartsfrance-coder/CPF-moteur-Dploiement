import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedIcon from '@mui/icons-material/Verified';
import { styled } from '@mui/material/styles';
 

const FeatureItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  marginBottom: theme.spacing(3),
  alignItems: 'flex-start',
}));

const CheckIcon = styled(CheckCircleIcon)(({ theme }) => ({
  color: theme.palette.primary.main,
  marginRight: theme.spacing(2),
  marginTop: theme.spacing(0.5),
}));

const SolutionSection: React.FC = () => {
  return (
    <Box sx={{ py: 10 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', flexDirection: { xs: 'column', md: 'row' } }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
            <Box
              component="img"
              src="/images/Moteur audi rs6.jpeg"
              alt="Moteur testé et garanti"
              sx={{
                width: '100%',
                borderRadius: 2,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              }}
            />
          </Box>
          
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
            <Typography
              variant="h2"
              component="h2"
              gutterBottom
              sx={{ 
                fontWeight: 700,
                position: 'relative',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -16,
                  left: 0,
                  width: 80,
                  height: 4,
                  bgcolor: 'primary.main'
                }
              }}
            >
              Notre solution pour les professionnels
            </Typography>
            
            <Typography variant="h5" color="text.secondary" paragraph sx={{ mt: 4, mb: 4 }}>
              Car Parts France propose un service exclusif de fourniture de moteurs d'occasion testés et garantis pour les garages professionnels.
            </Typography>
            
            <FeatureItem>
              <CheckIcon />
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Sourcing fiable
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Réseau de fournisseurs partenaires sélectionnés pour la qualité de leurs pièces.
                </Typography>
              </Box>
            </FeatureItem>
            
            <FeatureItem>
              <CheckIcon />
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Tests complets
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Chaque moteur subit une batterie de tests rigoureux avant expédition.
                </Typography>
              </Box>
            </FeatureItem>
            
            <FeatureItem>
              <CheckIcon />
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Rapport de contrôle détaillé
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Documentation complète avec photos et vidéos des tests effectués.
                </Typography>
              </Box>
            </FeatureItem>
            
            <FeatureItem>
              <CheckIcon />
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Garantie 6 mois
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Tous nos moteurs sont garantis 6 mois, pour une tranquillité d'esprit totale.
                </Typography>
              </Box>
            </FeatureItem>
            
            <FeatureItem>
              <CheckIcon />
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Livraison nationale
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Service de livraison rapide et sécurisé partout en France.
                </Typography>
              </Box>
            </FeatureItem>
            
            <Box sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
              <VerifiedIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Service exclusivement réservé aux professionnels de l'automobile
              </Typography>
            </Box>
            
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                component="a"
                href="/demande-devis"
                sx={{ py: 1.5, px: 3, fontWeight: 600 }}
              >
                Demander un devis personnalisé
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default SolutionSection;

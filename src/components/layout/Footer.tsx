import React from 'react';
import { Box, Container, Typography, Link, Divider, IconButton, Button, Tooltip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import InstagramIcon from '@mui/icons-material/Instagram';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LaunchIcon from '@mui/icons-material/Launch';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box component="footer" sx={{ bgcolor: 'secondary.main', color: 'white', py: { xs: 4, md: 5 }, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 33.33333333333333%' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box component="img" src="/images/logo.png" alt="Car Parts France" sx={{ height: { xs: 48, md: 60 }, mr: 1, background: 'white', p: 1, borderRadius: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                CAR PARTS FRANCE PRO
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              Service professionnel de fourniture de moteurs d'occasion testés et garantis pour les garages automobiles.
            </Typography>
            
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, borderBottom: '2px solid rgba(255,255,255,0.1)', pb: 0.5 }}>
              Suivez-nous
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
              <Tooltip title="Instagram">
                <IconButton 
                  aria-label="Instagram"
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
                    }
                  }}
                  onClick={() => window.open('https://www.instagram.com/carpartsfrance/', '_blank')}
                >
                  <InstagramIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Button 
              variant="contained" 
              endIcon={<LaunchIcon />} 
              onClick={() => window.open('https://www.carpartsfrance.fr', '_blank')}
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                borderRadius: '50px',
                padding: '8px 16px',
                marginTop: '8px',
                transition: 'all 0.3s ease',
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)'
                }
              }}
            >
              Visitez notre site principal
            </Button>
          </Box>
          
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 33.33333333333333%' } }}>
            <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
              Contact
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOnIcon sx={{ mr: 1 }} />
              <Typography variant="body2">
                50 Boulevard Stalingrad, 06300 Nice
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PhoneIcon sx={{ mr: 1 }} />
              <Link href="tel:0465845488" color="inherit" underline="hover">
                04 65 84 54 88
              </Link>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EmailIcon sx={{ mr: 1 }} />
              <Link href="mailto:contact@carpartsfrance.fr" color="inherit" underline="hover">
                contact@carpartsfrance.fr
              </Link>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccessTimeIcon sx={{ mr: 1 }} />
              <Typography variant="body2">
                09h00 - 12h00 / 14h00 - 18h00 (lundi au vendredi)
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 33.33333333333333%' } }}>
            <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
              Informations
            </Typography>
            <Link component={RouterLink} to="/" color="inherit" underline="hover" sx={{ display: 'block', mb: 1 }}>
              Accueil
            </Link>
            <Link component={RouterLink} to="/contact" color="inherit" underline="hover" sx={{ display: 'block', mb: 1 }}>
              Contact
            </Link>
            <Link component={RouterLink} to="/a-propos" color="inherit" underline="hover" sx={{ display: 'block', mb: 1 }}>
              À propos
            </Link>
            <Link component={RouterLink} to="/mentions-legales" color="inherit" underline="hover" sx={{ display: 'block', mb: 1 }}>
              Mentions légales
            </Link>
            <Link component={RouterLink} to="/cgv" color="inherit" underline="hover" sx={{ display: 'block', mb: 1 }}>
              CGV
            </Link>
            <Link component={RouterLink} to="/politique-de-confidentialite" color="inherit" underline="hover" sx={{ display: 'block', mb: 1 }}>
              Politique de confidentialité
            </Link>

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
              Société
            </Typography>
            <Typography variant="body2">Car Parts France</Typography>
            <Typography variant="body2">SIRET : 907 510 838 00028</Typography>
            <Typography variant="body2">RCS : Nice B 907 510 838</Typography>
            <Typography variant="body2">50 Boulevard Stalingrad, 06300 Nice</Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
        
        <Typography variant="body2" align="center">
          &copy; {currentYear} Car Parts France. Tous droits réservés.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;

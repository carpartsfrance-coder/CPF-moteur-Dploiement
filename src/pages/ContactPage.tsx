import React from 'react';
import { Box, Container, Typography, Paper, TextField, Button, Divider } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const ContactPage: React.FC = () => {
  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="h2" component="h1" align="center" gutterBottom sx={{ fontWeight: 700, mb: 6 }}>
          Contactez-nous
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
            <Paper elevation={2} sx={{ p: 4, height: '100%' }}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                Nos coordonnées
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <LocationOnIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h6" gutterBottom>Adresse</Typography>
                  <Typography variant="body1">
                    7 Avenue du Maréchal Juin<br />
                    92100 Boulogne-Billancourt<br />
                    France
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PhoneIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h6" gutterBottom>Téléphone</Typography>
                  <Typography variant="body1" component="a" href="tel:0465845488" sx={{ textDecoration: 'none', color: 'inherit' }}>
                    04 65 84 54 88
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <EmailIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h6" gutterBottom>Email</Typography>
                  <Typography variant="body1" component="a" href="mailto:contact@carpartsfrance.fr" sx={{ textDecoration: 'none', color: 'inherit' }}>
                    contact@carpartsfrance.fr
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WhatsAppIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h6" gutterBottom>WhatsApp</Typography>
                  <Button 
                    variant="contained" 
                    color="success" 
                    startIcon={<WhatsAppIcon />}
                    component="a"
                    href="https://wa.me/330756875025"
                    target="_blank"
                  >
                    Discuter sur WhatsApp
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Box>
          
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
            <Paper elevation={2} sx={{ p: 4, height: '100%' }}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                Envoyez-nous un message
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box component="form" noValidate sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                    <TextField
                      required
                      fullWidth
                      label="Nom"
                      name="nom"
                      autoComplete="name"
                    />
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                    <TextField
                      required
                      fullWidth
                      label="Prénom"
                      name="prenom"
                      autoComplete="given-name"
                    />
                  </Box>
                  <Box sx={{ width: '100%' }}>
                    <TextField
                      required
                      fullWidth
                      label="Nom du garage"
                      name="garage"
                    />
                  </Box>
                  <Box sx={{ width: '100%' }}>
                    <TextField
                      required
                      fullWidth
                      label="Email"
                      name="email"
                      autoComplete="email"
                    />
                  </Box>
                  <Box sx={{ width: '100%' }}>
                    <TextField
                      required
                      fullWidth
                      label="Téléphone"
                      name="telephone"
                      autoComplete="tel"
                    />
                  </Box>
                  <Box sx={{ width: '100%' }}>
                    <TextField
                      required
                      fullWidth
                      label="Sujet"
                      name="sujet"
                    />
                  </Box>
                  <Box sx={{ width: '100%' }}>
                    <TextField
                      required
                      fullWidth
                      label="Message"
                      name="message"
                      multiline
                      rows={4}
                    />
                  </Box>
                </Box>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Envoyer
                </Button>
              </Box>
            </Paper>
          </Box>
        </Box>
        
        <Box sx={{ mt: 6 }}>
          <Paper elevation={2} sx={{ p: 0, height: '400px', overflow: 'hidden' }}>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2625.8542901726766!2d2.2372802!3d48.8346598!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e67ae5e2bb8e3d%3A0x8f2a9d0db6d0f3a5!2s7%20Av.%20du%20Mar%C3%A9chal%20Juin%2C%2092100%20Boulogne-Billancourt!5e0!3m2!1sfr!2sfr!4v1650000000000!5m2!1sfr!2sfr" 
              width="100%" 
              height="400" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Carte Car Parts France"
            />
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default ContactPage;

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  useTheme, 
  Button, 
  TextField, 
  Paper, 
  IconButton,
  Slide,
  Divider
} from '@mui/material';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import PhoneIcon from '@mui/icons-material/Phone';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
 

const FloatingQuoteButton: React.FC = () => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    vehicleId: ''
  });
  
  // Contrôle de la visibilité basée sur le défilement
  useEffect(() => {
    const handleScroll = () => {
      // Afficher la bannière après avoir défilé de 300px
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsFormOpen(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ici, vous pourriez envoyer les données du formulaire à votre backend
    console.log('Formulaire soumis:', formData);
    alert('Votre demande de devis a été envoyée ! Nous vous contacterons rapidement.');
    setIsFormOpen(false);
    setFormData({
      name: '',
      phone: '',
      email: '',
      vehicleId: ''
    });
  };
  
  return (
    <>
      {/* Bannière flottante en bas */}
      <Slide direction="up" in={isVisible && !isFormOpen} mountOnEnter unmountOnExit>
        <Paper
          elevation={6}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(230, 57, 70, 0.95)',
            backdropFilter: 'blur(10px)',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            borderTop: `1px solid rgba(255,255,255,0.1)`,
            boxShadow: '0 -5px 20px rgba(0,0,0,0.2)',
            p: { xs: 1, sm: 2 },
            pb: 'calc(env(safe-area-inset-bottom) + 8px)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            gap: { xs: 1, sm: 2 }
          }}
        >
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
            <RequestQuoteIcon sx={{ color: theme.palette.primary.main, fontSize: { xs: 24, sm: 32 } }} />
            <Box>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                Besoin d'un moteur fiable ?
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', display: { xs: 'none', sm: 'block' } }}>
                Demandez un devis gratuit en quelques secondes
              </Typography>
            </Box>
          </Box>
          
          {/* Layout mobile: CTA plein largeur puis 2 boutons côte à côte */}
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, flexDirection: 'column', gap: 1, width: '100%' }}>
            <Button
              variant="contained"
              color="primary"
              component="a"
              href="/demande-devis"
              startIcon={<RequestQuoteIcon />}
              sx={{
                borderRadius: '50px',
                px: { xs: 2, sm: 3 },
                py: { xs: 0.5, sm: 1 },
                width: { xs: 'auto', sm: 'auto' },
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: '0 8px 16px rgba(230, 57, 70, 0.3)',
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 20px rgba(230, 57, 70, 0.4)',
                },
                transition: 'all 0.3s ease',
                textTransform: 'none'
              }}
            >
              Demander un devis
            </Button>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                component="a"
                href="tel:0465845488"
                startIcon={<PhoneIcon sx={{ fontSize: 18 }} />}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.5)',
                  flex: 1,
                  px: 1.5,
                  py: 0.5,
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Appeler
              </Button>
              <Button
                variant="outlined"
                size="small"
                href="https://wa.me/330756875025"
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<WhatsAppIcon sx={{ fontSize: 18 }} />}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.5)',
                  flex: 1,
                  px: 1.5,
                  py: 0.5,
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                WhatsApp
              </Button>
            </Box>
          </Box>

          {/* Layout desktop: 3 boutons en ligne */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 2, ml: 'auto' }}>
            <Button
              variant="outlined"
              size="small"
              component="a"
              href="tel:0465845488"
              startIcon={<PhoneIcon />}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Appeler
            </Button>
            <Button
              variant="outlined"
              size="small"
              href="https://wa.me/330756875025"
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<WhatsAppIcon />}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              WhatsApp
            </Button>
            <Button
              variant="contained"
              color="primary"
              component="a"
              href="/demande-devis"
              startIcon={<RequestQuoteIcon />}
              sx={{
                borderRadius: '50px',
                px: 3,
                py: 1,
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: '0 8px 16px rgba(230, 57, 70, 0.3)',
                textTransform: 'none'
              }}
            >
              Demander un devis
            </Button>
          </Box>
        </Paper>
      </Slide>
      
      {/* Formulaire de devis rapide */}
      <Slide direction="up" in={false} mountOnEnter unmountOnExit>
        <Paper
          elevation={6}
          component="form"
          onSubmit={handleSubmit}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            borderTop: `1px solid rgba(0,0,0,0.1)`,
            boxShadow: '0 -5px 20px rgba(0,0,0,0.2)',
            p: { xs: 2, md: 3 },
            pb: 'calc(env(safe-area-inset-bottom) + 8px)',
            maxHeight: { xs: '75vh', md: '80vh' },
            overflowY: 'auto'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.secondary.main, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
              Demande de devis rapide
            </Typography>
            <IconButton onClick={() => setIsFormOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                label="Nom"
                name="name"
                variant="outlined"
                value={formData.name}
                onChange={handleInputChange}
                required
                size="small"
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                label="Téléphone"
                name="phone"
                variant="outlined"
                value={formData.phone}
                onChange={handleInputChange}
                required
                size="small"
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                variant="outlined"
                value={formData.email}
                onChange={handleInputChange}
                required
                size="small"
              />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <TextField
                fullWidth
                label="Plaque FR, N° châssis ou code moteur"
                name="vehicleId"
                variant="outlined"
                value={formData.vehicleId}
                onChange={handleInputChange}
                required
                size="small"
                helperText="Ex: AB-123-CD, VF1234567890, K9K836"
                InputProps={{
                  startAdornment: <DirectionsCarIcon sx={{ mr: 1, color: 'rgba(0,0,0,0.4)' }} />
                }}
              />
            </Box>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: { xs: 'stretch', sm: 'flex-end' }, mt: 1 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                endIcon={<SendIcon />}
                sx={{
                  borderRadius: '50px',
                  px: { xs: 2, sm: 3 },
                  py: { xs: 0.75, sm: 1 },
                  width: { xs: '100%', sm: 'auto' },
                  fontWeight: 600,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: '0 4px 10px rgba(230, 57, 70, 0.3)',
                  textTransform: 'none'
                }}
              >
                Envoyer ma demande
              </Button>
            </Box>
          </Box>
          
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, color: 'text.secondary' }}>
            Vos données personnelles sont protégées conformément à notre politique de confidentialité.
          </Typography>
        </Paper>
      </Slide>
    </>
  );
};

export default FloatingQuoteButton;

import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Divider,
  useTheme,
  InputAdornment
} from '@mui/material';
import { Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { addQuote } from '../../utils/quotesStore';
import { useFormik } from 'formik';
import * as yup from 'yup';
import SendIcon from '@mui/icons-material/Send';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedIcon from '@mui/icons-material/Verified';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

const StepIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 70,
  height: 70,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  marginBottom: theme.spacing(2),
  '& svg': {
    fontSize: 35
  }
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  }
}));

const InfoCard = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  position: 'relative',
  overflow: 'hidden',
  background: '#ffffff',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
  border: 'none'
}));

const StepNumber = styled(Box)(({ theme }) => ({
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  backgroundColor: 'rgba(230, 57, 70, 0.1)',
  color: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(2),
  fontWeight: 'bold',
  fontSize: '0.9rem'
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  '& svg': {
    marginRight: theme.spacing(1.5),
    color: theme.palette.primary.main,
    fontSize: '1.5rem'
  }
}));

const ProcessStep = styled(Box)(({ theme }) => ({
  display: 'flex',
  marginBottom: theme.spacing(2.5),
  alignItems: 'flex-start',
  transition: 'all 0.3s ease',
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: 'rgba(248, 249, 250, 0.8)',
    transform: 'translateX(5px)'
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  padding: '12px 24px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
  }
}));

// Composant pour les boutons avec lien
interface LinkButtonProps {
  children: React.ReactNode;
  [key: string]: any;
}

const LinkButton = ({ children, ...props }: LinkButtonProps) => {
  return (
    <ActionButton {...props}>
      {children}
    </ActionButton>
  );
};

const validationSchema = yup.object({
  name: yup.string().required('Votre nom est requis'),
  email: yup.string().email('Email invalide').required("L'email est requis"),
  phone: yup.string().required('Le téléphone est requis'),
  vehicleId: yup.string().required('Plaque, N° châssis ou code moteur requis'),
  message: yup.string().max(1000, '1000 caractères maximum')
});

const QuoteFormSection: React.FC = () => {
  const theme = useTheme();
  const [snackOpen, setSnackOpen] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState('');
  
  const steps = [
    {
      label: 'Demande de devis',
      description: 'Remplissez notre formulaire de demande ou appelez-nous directement.',
      icon: <RequestQuoteIcon />
    },
    {
      label: 'Validation technique',
      description: 'Notre équipe vérifie la compatibilité et prépare votre devis personnalisé sous 24h.',
      icon: <VerifiedIcon />
    },
    {
      label: 'Livraison rapide',
      description: 'Après validation, votre moteur est testé et expédié vers votre garage.',
      icon: <LocalShippingIcon />
    }
  ];
  
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      vehicleId: '',
      message: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }: any = { setSubmitting: () => {} }) => {
      const messageTxt = `Bonjour, je souhaite un devis moteur.\n\n• Nom : ${values.name}\n• Email : ${values.email}\n• Téléphone : ${values.phone}\n• Plaque / N° châssis / Code moteur : ${values.vehicleId}\n• Détails complémentaires : ${values.message || 'Non précisé'}\n\nEnvoyé depuis carparts-france.com`;
      const encoded = encodeURIComponent(messageTxt);
      try {
        const apiUrl = (process as any).env.REACT_APP_QUOTE_API_URL;
        const apiKey = (process as any).env.REACT_APP_QUOTE_API_KEY;
        if (apiUrl) {
          await axios.post(apiUrl, {
            name: values.name,
            email: values.email,
            phone: values.phone,
            vehicleId: values.vehicleId,
            message: values.message,
            source: 'carparts-pro',
            createdAt: new Date().toISOString(),
          }, {
            headers: {
              'Content-Type': 'application/json',
              ...(apiKey ? { 'X-API-Key': apiKey } : {}),
            },
          });
          addQuote({
            name: values.name,
            email: values.email,
            phone: values.phone,
            vehicleId: values.vehicleId,
            message: values.message,
            channel: 'api',
          });
          setSnackMessage('Merci, demande reçue. Nous revenons vers vous sous 24h.');
          setSnackOpen(true);
          (setSubmitting && setSubmitting(false));
          formik.resetForm();
          return;
        }
      } catch (err) {
        console.error('Echec envoi API, fallback WhatsApp', err);
      }
      // Tentative interne: utiliser URL relative si origine différente
      try {
        const prefix = (() => {
          const env = (process as any).env.REACT_APP_BACKEND_URL || '';
          if (env && typeof window !== 'undefined') {
            try {
              const u = new URL(env);
              if (u.origin !== window.location.origin) return '';
            } catch {}
          }
          return (env || '').trim().replace(/\/$/, '');
        })();
        const r = await axios.post(
          `${prefix}/api/public/quote-request`,
          {
            name: values.name,
            email: values.email,
            phone: values.phone,
            vehicleId: values.vehicleId,
            message: values.message,
            source: 'quote-form-section',
            createdAt: new Date().toISOString(),
          },
          { headers: { 'Content-Type': 'application/json' } }
        );
        if (r && r.data && r.data.ok) {
          addQuote({
            name: values.name,
            email: values.email,
            phone: values.phone,
            vehicleId: values.vehicleId,
            message: values.message,
            channel: 'email',
          });
          const ref = (r.data && (r.data.ref as string)) || '';
          setSnackMessage(ref ? `Merci, demande reçue. Référence ${ref}. Nous revenons vers vous sous 24h.` : 'Merci, demande reçue. Nous revenons vers vous sous 24h.');
          setSnackOpen(true);
          (setSubmitting && setSubmitting(false));
          formik.resetForm();
          return;
        }
      } catch (e) {}
      const whatsappNumber = '330756875025';
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encoded}`;
      window.open(whatsappUrl, '_blank');
      setSnackMessage('Votre message WhatsApp est prêt. Vérifiez la nouvelle fenêtre pour l’envoyer.');
      setSnackOpen(true);
      addQuote({
        name: values.name,
        email: values.email,
        phone: values.phone,
        vehicleId: values.vehicleId,
        message: values.message,
        channel: 'whatsapp',
      });
      (setSubmitting && setSubmitting(false));
      formik.resetForm();
    },
  });

  return (
    <Box
      id="devis"
      component={motion.div}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      sx={{
        pt: { xs: 3, md: 6 },
        pb: { xs: 6, md: 9 },
        background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, rgba(248, 249, 250, 0.5) 100%)`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Éléments décoratifs */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, x: -100 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.2 }}
        sx={{
          position: 'absolute',
          top: '10%',
          left: '-5%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(230, 57, 70, 0.05) 0%, rgba(230, 57, 70, 0) 70%)`,
          zIndex: 0
        }}
      />
      
      <Box
        component={motion.div}
        initial={{ opacity: 0, x: 100 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.2 }}
        sx={{
          position: 'absolute',
          bottom: '10%',
          right: '-5%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(29, 53, 87, 0.05) 0%, rgba(29, 53, 87, 0) 70%)`,
          zIndex: 0
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box 
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{ textAlign: 'center', mb: 8 }}
        >
          <Typography 
            variant="h2" 
            component="h2" 
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Un processus simple pour obtenir votre moteur
          </Typography>
        </Box>
        
        {/* Section des étapes du processus - Version desktop */}
        <Box 
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            flexWrap: 'wrap', 
            gap: 4, 
            mb: 10,
            justifyContent: 'center'
          }}
        >
          {steps.map((step, index) => (
            <Box 
              key={index} 
              sx={{ 
                flex: '1 1 30%',
                maxWidth: '30%',
                position: 'relative',
                '&::after': index < steps.length - 1 ? {
                  content: '""',
                  position: 'absolute',
                  top: 35,
                  right: -30,
                  width: 60,
                  height: 2,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.main}50 100%)`,
                } : {}
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  textAlign: 'center',
                  height: '100%',
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  <Box 
                    sx={{ 
                      width: 90, 
                      height: 90, 
                      borderRadius: '50%', 
                      bgcolor: 'primary.light',
                      opacity: 0.15,
                      position: 'absolute'
                    }} 
                  />
                  <StepIcon>{step.icon}</StepIcon>
                </Box>
                
                <Typography 
                  variant="h5" 
                  component="h3" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 600, 
                    mt: 2,
                    position: 'relative',
                    '&::before': {
                      content: `"${index + 1}"`,
                      position: 'absolute',
                      top: -55,
                      left: -15,
                      fontSize: '5rem',
                      fontWeight: 800,
                      color: 'rgba(0,0,0,0.04)',
                      zIndex: -1
                    }
                  }}
                >
                  {step.label}
                </Typography>
                
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  sx={{ mb: 3 }}
                >
                  {step.description}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
        
        <Box 
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          sx={{ 
            display: { xs: 'block', md: 'none' }, 
            mb: 6 
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', scrollSnapType: 'x mandatory', pb: 1 }}>
            {steps.map((step, index) => (
              <Box 
                key={index}
                sx={{
                  minWidth: 260,
                  borderRadius: 2,
                  p: 2,
                  bgcolor: '#ffffff',
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
                  scrollSnapAlign: 'start'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1.5, '& svg': { fontSize: 22 } }}>
                    {step.icon}
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {step.label}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            <Box 
              sx={{ 
                width: { xs: '100%', md: '41.666%' },
                height: '100%',
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
              }}
            >
              <InfoCard>
                {/* Élément décoratif */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '120px',
                    height: '120px',
                    background: 'radial-gradient(circle at top right, rgba(230, 57, 70, 0.08), transparent 70%)',
                    borderRadius: '0 0 0 100%',
                    zIndex: 0
                  }}
                />
                
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography 
                    variant="h4" 
                    component="h3" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 700, 
                      color: 'primary.main',
                      position: 'relative',
                      paddingBottom: 2,
                      marginBottom: 3,
                      display: 'inline-block',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '40px',
                        height: '3px',
                        backgroundColor: 'primary.main',
                        borderRadius: '3px'
                      }
                    }}
                  >
                    Demandez votre devis personnalisé
                  </Typography>
                  
                  <Typography 
                    variant="body1" 
                    paragraph 
                    sx={{ 
                      mb: 4,
                      fontSize: '1.05rem',
                      color: 'text.secondary'
                    }}
                  >
                    Recevez une proposition sur mesure pour votre véhicule en moins de 24h
                  </Typography>
                  
                  <Box sx={{ mb: 4 }}>
                    <IconWrapper>
                      <RequestQuoteIcon fontSize="small" />
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 600, 
                          color: 'secondary.main',
                          display: 'inline-block'
                        }}
                      >
                        Comment ça marche ?
                      </Typography>
                    </IconWrapper>
                    
                    {[
                      'Remplissez le formulaire ci-contre avec les informations sur votre véhicule',
                      'Notre équipe technique analyse votre demande et vérifie les disponibilités',
                      'Vous recevez un devis détaillé par email sous 24h ouvrées',
                      'Après validation, nous préparons et testons votre moteur avant expédition'
                    ].map((step, index) => (
                      <ProcessStep key={index}>
                        <StepNumber>
                          {index + 1}
                        </StepNumber>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            pt: 0.2,
                            color: index === 0 ? 'text.primary' : 'text.secondary'
                          }}
                        >
                          {step}
                        </Typography>
                      </ProcessStep>
                    ))}
                  </Box>
                </Box>
                
                <Box sx={{ mt: 'auto', position: 'relative', zIndex: 1 }}>
                  <Divider sx={{ mb: 4 }} />
                  
                  <IconWrapper>
                    <PhoneIcon fontSize="small" />
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 600,
                        display: 'inline-block'
                      }}
                    >
                      Besoin d'une réponse immédiate ?
                    </Typography>
                  </IconWrapper>
                  
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 2 }}>
                    <LinkButton
                      variant="outlined"
                      color="primary"
                      startIcon={<PhoneIcon />}
                      size="large"
                      href="tel:0465845488"
                      fullWidth
                      sx={{
                        py: 1.2,
                        fontWeight: 500,
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2,
                          bgcolor: 'rgba(230, 57, 70, 0.04)'
                        }
                      }}
                    >
                      04 65 84 54 88
                    </LinkButton>
                    
                    <LinkButton
                      variant="contained"
                      color="success"
                      startIcon={<WhatsAppIcon />}
                      size="large"
                      href="https://wa.me/330756875025"
                      target="_blank"
                      fullWidth
                      sx={{
                        py: 1.2,
                        fontWeight: 500,
                        boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
                        '&:hover': {
                          boxShadow: '0 6px 16px rgba(46, 125, 50, 0.3)'
                        }
                      }}
                    >
                      WhatsApp
                    </LinkButton>
                  </Box>
                </Box>
              </InfoCard>
            </Box>
            
            <Box 
              sx={{ 
                width: { xs: '100%', md: '58.333%' },
                height: '100%'
              }}
            >
              <Box 
                component={motion.div}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <StyledPaper 
                  elevation={3} 
                  sx={{ 
                    p: 4, 
                    borderRadius: 2,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
                  }}
                >
                  <Typography variant="h4" component="h3" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 3 }}>
                    Formulaire de demande
                  </Typography>
                  
                  <Box component="form" id="quote-form" noValidate onSubmit={formik.handleSubmit}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 50%' } }}>
                        <TextField
                          fullWidth
                          id="name"
                          name="name"
                          label="Nom complet *"
                          value={formik.values.name}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.name && Boolean(formik.errors.name)}
                          helperText={formik.touched.name && formik.errors.name}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonOutlineIcon sx={{ color: 'primary.main' }} />
                              </InputAdornment>
                            )
                          }}
                        />
                      </Box>
                      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 50%' } }}>
                        <TextField
                          fullWidth
                          id="email"
                          name="email"
                          type="email"
                          label="Email professionnel *"
                          value={formik.values.email}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.email && Boolean(formik.errors.email)}
                          helperText={formik.touched.email && formik.errors.email}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AlternateEmailIcon sx={{ color: 'primary.main' }} />
                              </InputAdornment>
                            )
                          }}
                        />
                      </Box>
                      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 50%' } }}>
                        <TextField
                          fullWidth
                          id="phone"
                          name="phone"
                          label="Téléphone *"
                          value={formik.values.phone}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.phone && Boolean(formik.errors.phone)}
                          helperText={formik.touched.phone && formik.errors.phone}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneIcon sx={{ color: 'primary.main' }} />
                              </InputAdornment>
                            )
                          }}
                        />
                      </Box>
                      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 50%' } }}>
                        <TextField
                          fullWidth
                          id="vehicleId"
                          name="vehicleId"
                          label="Plaque FR, N° châssis ou code moteur *"
                          value={formik.values.vehicleId}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.vehicleId && Boolean(formik.errors.vehicleId)}
                          helperText={formik.touched.vehicleId && formik.errors.vehicleId}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <DirectionsCarIcon sx={{ color: 'primary.main' }} />
                              </InputAdornment>
                            )
                          }}
                        />
                      </Box>
                      <Box sx={{ flex: '1 1 100%' }}>
                        <TextField
                          fullWidth
                          multiline
                          minRows={4}
                          id="message"
                          name="message"
                          label="Décrivez votre besoin (kilométrage, référence moteur, options...)"
                          value={formik.values.message}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.message && Boolean(formik.errors.message)}
                          helperText={formik.touched.message && formik.errors.message}
                        />
                      </Box>
                      <Box sx={{ flex: '1 1 100%', mt: 2 }}>
                        <ActionButton
                          fullWidth
                          size="large"
                          type="submit"
                          variant="contained"
                          color="primary"
                          endIcon={<SendIcon />}
                          sx={{ 
                            py: 1.5,
                            boxShadow: '0 4px 12px rgba(230, 57, 70, 0.2)',
                            '&:hover': {
                              boxShadow: '0 8px 20px rgba(230, 57, 70, 0.3)'
                            }
                          }}
                        >
                          Envoyer ma demande de devis
                        </ActionButton>
                      </Box>
                    </Box>
                  </Box>
                </StyledPaper>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
    <Snackbar
      open={snackOpen}
      autoHideDuration={4000}
      onClose={() => setSnackOpen(false)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={() => setSnackOpen(false)} severity="success" variant="filled" sx={{ width: '100%' }}>
        {snackMessage}
      </Alert>
    </Snackbar>
  );
};

export default QuoteFormSection;

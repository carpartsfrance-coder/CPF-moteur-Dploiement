import React from 'react';
import { Box, Container, Typography, Stepper, Step, StepLabel, StepContent, Button } from '@mui/material';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import DescriptionIcon from '@mui/icons-material/Description';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { styled } from '@mui/material/styles';
import { Link as ScrollLink } from 'react-scroll';

const StepIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 80,
  height: 80,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  marginBottom: theme.spacing(2),
  '& svg': {
    fontSize: 40
  }
}));

const ProcessStepsSection: React.FC = () => {
  const steps = [
    {
      icon: <RequestQuoteIcon />,
      title: "Demande de devis",
      description: "Remplissez notre formulaire de demande ou appelez-nous directement. Précisez la marque, le modèle, la motorisation et l'année du véhicule ou fournissez le numéro de châssis ou la plaque d'immatriculation.",
      action: "Faire une demande maintenant"
    },
    {
      icon: <DescriptionIcon />,
      title: "Réception du devis détaillé",
      description: "Sous 24h, nous vous envoyons un devis personnalisé comprenant les informations sur le moteur disponible, son prix et les tests qui seront effectués avant expédition.",
      action: "Voir un exemple de devis"
    },
    {
      icon: <LocalShippingIcon />,
      title: "Livraison du moteur testé",
      description: "Après validation du devis, nous effectuons tous les tests, préparons le rapport détaillé et vous livrons le moteur avec sa garantie de 6 mois. Un suivi de colis vous est fourni.",
      action: "En savoir plus sur la livraison"
    }
  ];

  return (
    <Box sx={{ py: 10, bgcolor: 'white' }}>
      <Container maxWidth="lg">
        <Typography 
          variant="h2" 
          component="h2" 
          align="center" 
          gutterBottom
          sx={{ 
            fontWeight: 700, 
            mb: 2
          }}
        >
          Un processus simple en 3 étapes
        </Typography>
        
        <Typography 
          variant="h5" 
          align="center" 
          color="text.secondary" 
          paragraph
          sx={{ mb: 8, maxWidth: 800, mx: 'auto' }}
        >
          Notre service est conçu pour être efficace et transparent du début à la fin
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', flexDirection: { xs: 'column', md: 'row' } }}>
          {steps.map((step, index) => (
            <Box key={index} sx={{ flex: { xs: '1 1 100%', md: '1 1 33.33333333333333%' } }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  textAlign: 'center',
                  height: '100%',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 40,
                    right: -30,
                    width: 60,
                    height: 2,
                    bgcolor: 'primary.main',
                    display: { xs: 'none', md: index < steps.length - 1 ? 'block' : 'none' }
                  }
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
                      width: 100, 
                      height: 100, 
                      borderRadius: '50%', 
                      bgcolor: 'primary.light',
                      opacity: 0.2,
                      position: 'absolute'
                    }} 
                  />
                  <StepIcon>{step.icon}</StepIcon>
                </Box>
                
                <Typography 
                  variant="h4" 
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
                  {step.title}
                </Typography>
                
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  paragraph
                  sx={{ mb: 3, flexGrow: 1 }}
                >
                  {step.description}
                </Typography>
                
                {index === 0 ? (
                  <ScrollLink to="devis" smooth={true} duration={500}>
                    <Button 
                      variant="outlined" 
                      color="primary"
                    >
                      {step.action}
                    </Button>
                  </ScrollLink>
                ) : (
                  <Button 
                    variant="outlined" 
                    color="primary"
                  >
                    {step.action}
                  </Button>
                )}
              </Box>
            </Box>
          ))}
        </Box>
        
        {/* Version mobile avec stepper vertical */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 4 }}>
          <Stepper orientation="vertical">
            {steps.map((step, index) => (
              <Step active={true} key={index}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box sx={{ 
                      bgcolor: 'primary.main', 
                      color: 'white', 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      {index + 1}
                    </Box>
                  )}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {step.title}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {step.description}
                  </Typography>
                  {index === 0 ? (
                    <ScrollLink to="devis" smooth={true} duration={500}>
                      <Button 
                        variant="outlined" 
                        color="primary"
                        size="small"
                      >
                        {step.action}
                      </Button>
                    </ScrollLink>
                  ) : (
                    <Button 
                      variant="outlined" 
                      color="primary"
                      size="small"
                    >
                      {step.action}
                    </Button>
                  )}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Box>
      </Container>
    </Box>
  );
};

export default ProcessStepsSection;

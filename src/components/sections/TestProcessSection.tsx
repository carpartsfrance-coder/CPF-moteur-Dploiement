import React, { useState } from 'react';
import { Box, Container, Typography, Button, Dialog, DialogContent, DialogTitle, IconButton, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DescriptionIcon from '@mui/icons-material/Description';
import { motion } from 'framer-motion';

const TestProcessSection: React.FC = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  
  const handleOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  const tests = [
    {
      title: "Contrôle visuel complet",
      description: "Inspection minutieuse de l'état du bloc, turbo, faisceaux, supports, joints, carter, injecteurs, collecteurs et autres composants visibles.",
      icon: "inspection"
    },
    {
      title: "Contrôle des prises et capteurs",
      description: "Vérification de l'état général des connecteurs électriques et des capteurs, ainsi que de leurs connectiques.",
      icon: "sensor"
    },
    {
      title: "Test de compression par cylindre",
      description: "Mesure précise de la compression dans chaque cylindre avec rapport numérique détaillé pour évaluer l'étanchéité.",
      icon: "compression"
    },
    {
      title: "Endoscopie 360° interne",
      description: "Inspection visuelle complète des cylindres, soupapes et chambres de combustion avec caméra endoscopique fournissant vidéos et photos.",
      icon: "endoscopy"
    },
    {
      title: "Test de pression d'huile",
      description: "Vérification du fonctionnement de la pompe à huile et de la crépine pour garantir une lubrification optimale du moteur.",
      icon: "oil"
    },
    {
      title: "Contrôle du vilebrequin et distribution",
      description: "Examen du vilebrequin, de l'arbre à cames et du système de distribution lorsque ces éléments sont accessibles.",
      icon: "crankshaft"
    }
  ];

  const getIconForTest = (iconType: string) => {
    switch(iconType) {
      case 'inspection':
        return <Box sx={{ fontSize: 40, color: theme.palette.primary.main }}>🔍</Box>;
      case 'sensor':
        return <Box sx={{ fontSize: 40, color: theme.palette.primary.main }}>🔌</Box>;
      case 'compression':
        return <Box sx={{ fontSize: 40, color: theme.palette.primary.main }}>🔧</Box>;
      case 'endoscopy':
        return <Box sx={{ fontSize: 40, color: theme.palette.primary.main }}>📹</Box>;
      case 'oil':
        return <Box sx={{ fontSize: 40, color: theme.palette.primary.main }}>💧</Box>;
      case 'crankshaft':
        return <Box sx={{ fontSize: 40, color: theme.palette.primary.main }}>⚙️</Box>;
      default:
        return <Box sx={{ fontSize: 40, color: theme.palette.primary.main }}>✓</Box>;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <Box 
      sx={{ 
        py: { xs: 10, md: 12 }, 
        bgcolor: '#FFFFFF',
        borderBottom: '1px solid',
        borderColor: 'rgba(0, 0, 0, 0.06)'
      }}
    >
      <Container maxWidth="lg">
        <Box 
          sx={{ 
            maxWidth: '650px', 
            mx: 'auto', 
            textAlign: 'center', 
            mb: { xs: 6, md: 8 } 
          }}
        >
          <Typography 
            variant="overline" 
            component="p"
            sx={{ 
              color: theme.palette.primary.main,
              fontWeight: 600,
              letterSpacing: 1.5,
              mb: 2,
              fontSize: '0.85rem'
            }}
          >
            NOTRE EXPERTISE
          </Typography>
          
          <Typography 
            variant="h2" 
            component="h2" 
            sx={{ 
              fontWeight: 700, 
              mb: 3,
              fontSize: { xs: '2rem', md: '2.5rem' },
              lineHeight: 1.2
            }}
          >
            Processus de test rigoureux
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              fontSize: '1.1rem', 
              lineHeight: 1.6,
              opacity: 0.85
            }}
          >
            Chaque moteur est soumis à une série de tests complets dans notre atelier spécialisé
          </Typography>
        </Box>
        
        <Box 
          component={motion.div}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          sx={{ 
            display: 'grid',
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              md: 'repeat(3, 1fr)' 
            },
            gap: 4
          }}
        >
          {tests.map((test, index) => (
            <Box
              component={motion.div}
              variants={itemVariants}
              key={index}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'rgba(0, 0, 0, 0.06)',
                backgroundColor: 'white',
                transition: 'all 0.3s ease',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
                  borderColor: 'rgba(0, 0, 0, 0.02)'
                }
              }}
            >
              <Box 
                sx={{ 
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  height: '100%'
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: '16px',
                    backgroundColor: 'rgba(230, 57, 70, 0.08)',
                    mb: 3
                  }}
                >
                  {getIconForTest(test.icon)}
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      mb: 1.5
                    }}
                  >
                    {test.title}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      lineHeight: 1.7,
                      fontSize: '0.95rem',
                      opacity: 0.85,
                      flexGrow: 1
                    }}
                  >
                    {test.description}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
        
        <Box 
          sx={{ 
            mt: 8, 
            textAlign: 'center',
            p: 5,
            borderRadius: 3,
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            border: '1px solid',
            borderColor: 'rgba(0, 0, 0, 0.06)'
          }}
        >
          <Typography 
            variant="h4" 
            component="h3" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              fontSize: { xs: '1.75rem', md: '2rem' },
              mb: 3
            }}
          >
            Rapport de test complet fourni
          </Typography>
          
          <Typography 
            variant="body1" 
            paragraph 
            sx={{ 
              maxWidth: 700, 
              mx: 'auto', 
              mb: 4,
              fontSize: '1.05rem',
              lineHeight: 1.7,
              opacity: 0.85
            }}
          >
            Tous les tests sont réalisés dans un atelier équipé et filmés. Un rapport PDF détaillé est fourni à l'acheteur avec photos, mesures et observations.
          </Typography>
          
          <Box 
            sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: 'center', 
              gap: 2 
            }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<VisibilityIcon />}
              onClick={handleOpen}
              sx={{ 
                py: 1.5, 
                px: 3,
                borderRadius: 2,
                fontWeight: 600,
                transition: 'all 0.3s ease',
                transform: 'translateY(0)',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              Voir un exemple de rapport
            </Button>
            
            <Button
              variant="outlined"
              color="primary"
              size="large"
              startIcon={<DescriptionIcon />}
              component="a"
              href="/images/rapport test moteur 2.png"
              target="_blank"
              sx={{ 
                py: 1.5, 
                px: 3,
                borderRadius: 2,
                fontWeight: 600,
                transition: 'all 0.3s ease',
                transform: 'translateY(0)',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              Télécharger un exemple
            </Button>
          </Box>
        </Box>
        
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)'
            }
          }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Exemple de rapport de test moteur</Typography>
              <IconButton 
                onClick={handleClose} 
                aria-label="close"
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box 
                component="img" 
                src="/images/rapport test moteur 1.png" 
                alt="Rapport de test page 1"
                sx={{ width: '100%', borderRadius: 2 }}
              />
              <Box 
                component="img" 
                src="/images/rapport test moteur 2.png" 
                alt="Rapport de test page 2"
                sx={{ width: '100%', borderRadius: 2 }}
              />
            </Box>
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
};

export default TestProcessSection;

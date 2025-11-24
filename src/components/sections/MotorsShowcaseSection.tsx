import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardMedia, 
  CardContent, 
  Button, 
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  useTheme,
  Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import SpeedIcon from '@mui/icons-material/Speed';
import BuildIcon from '@mui/icons-material/Build';
import VerifiedIcon from '@mui/icons-material/Verified';
import SearchIcon from '@mui/icons-material/Search';
import { motion } from 'framer-motion';

interface MotorData {
  id: number;
  name: string;
  brand: string;
  model: string;
  year: string;
  image: string;
  price: string;
  displacement: string;
  power: string;
  mileage: string;
  condition: string;
  warranty: string;
  testReport: string[];
  features: string[];
  engineCode?: string;
}

const MotorsShowcaseSection: React.FC = () => {
  const theme = useTheme();
  const [selectedMotor, setSelectedMotor] = useState<MotorData | null>(null);
  const [open, setOpen] = useState(false);

  const handleOpen = (motor: MotorData) => {
    setSelectedMotor(motor);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const motors: MotorData[] = [
    {
      id: 1,
      name: "Porsche Cayenne 4.5L V8 (M48.50)",
      brand: "Porsche",
      model: "Cayenne",
      year: "—",
      image: "/images/motors/Moteur Cayenne .5 V8 M48.50.jpg",
      price: "Sur devis",
      displacement: "4.5L V8",
      engineCode: "M48.50",
      power: "450 ch",
      mileage: "98 000 km",
      condition: "Occasion - Contrôlés",
      warranty: "1 an",
      testReport: [
        "/images/motors/rapport test moteur 1.png"
      ],
      features: [
        "Test de compression effectué",
        "Endoscopie complète",
        "Vérification des capteurs",
        "Nettoyage professionnel"
      ]
    },
    {
      id: 2,
      name: "Porsche Cayenne 3.6L V6 (MA5502)",
      brand: "Porsche",
      model: "Cayenne",
      year: "—",
      image: "/images/motors/Moteur Cayenne 3.6 V6.jpg",
      price: "Sur devis",
      displacement: "3.6L V6",
      engineCode: "MA5502",
      power: "290 ch",
      mileage: "87 000 km",
      condition: "Occasion - Contrôlés",
      warranty: "1 an",
      testReport: [
        "/images/motors/rapport test moteur 1.png"
      ],
      features: [
        "Test de compression effectué",
        "Endoscopie complète",
        "Vérification des capteurs",
        "Nettoyage professionnel"
      ]
    },
    {
      id: 3,
      name: "Porsche Cayenne S/GTS 4.8L V8 (M48.01)",
      brand: "Porsche",
      model: "Cayenne S / GTS",
      year: "—",
      image: "/images/motors/Moteur M48.01 Cayenne S GTS V8.jpg",
      price: "Sur devis",
      displacement: "4.8L V8",
      engineCode: "M48.01",
      power: "340 ch",
      mileage: "121 000 km",
      condition: "Occasion - Contrôlés",
      warranty: "1 an",
      testReport: [
        "/images/motors/rapport test moteur 1.png"
      ],
      features: [
        "Test de compression effectué",
        "Endoscopie complète",
        "Vérification des capteurs",
        "Nettoyage professionnel"
      ]
    },
    {
      id: 4,
      name: "Porsche Macan 3.0L TDI (CDUC)",
      brand: "Porsche",
      model: "Macan",
      year: "—",
      image: "/images/motors/Moteur Macan 3.0 TDI.jpg",
      price: "Sur devis",
      displacement: "3.0 TDI",
      engineCode: "CDUC",
      power: "258 ch",
      mileage: "76 000 km",
      condition: "Occasion - Contrôlés",
      warranty: "1 an",
      testReport: [
        "/images/motors/rapport test moteur 1.png"
      ],
      features: [
        "Test de compression effectué",
        "Endoscopie complète",
        "Vérification des capteurs",
        "Nettoyage professionnel"
      ]
    }
  ];

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    },
    hover: {
      y: -10,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <Box 
      sx={{ 
        pt: 2, // Léger padding pour créer un espace minimal avec la section précédente
        pb: 6, // Réduction supplémentaire du padding bottom pour diminuer l'espace avant la section suivante
        position: 'relative',
        overflow: 'hidden',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '150px',
          background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(29,53,87,0.02) 100%)',
          zIndex: 0,
        }
      }}
    >
      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        sx={{
          position: 'absolute',
          bottom: '-5%',
          right: '-5%',
          width: { xs: 140, md: 220 },
          height: { xs: 140, md: 220 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.palette.primary.main}05 0%, ${theme.palette.primary.main}00 70%)`,
          zIndex: 0,
        }}
      />
      {/* Cercles décoratifs */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        sx={{
          position: 'absolute',
          top: '30%',
          right: '5%',
          width: { xs: 110, md: 220 },
          height: { xs: 110, md: 220 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.palette.primary.main}08 0%, ${theme.palette.primary.main}00 70%)`,
          zIndex: 0
        }}
      />
      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
        sx={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          width: { xs: 80, md: 180 },
          height: { xs: 80, md: 180 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.palette.secondary.main}08 0%, ${theme.palette.secondary.main}00 70%)`,
          zIndex: 0
        }}
      />
      
      <Container maxWidth="lg" sx={{ 
        position: 'relative',
        zIndex: 1,
        mt: 0, // Suppression de la marge négative qui cause le chevauchement
        pt: 4, // Ajout d'un padding supérieur pour éviter que le titre soit tronqué
        background: 'transparent',
        boxShadow: 'none',
        border: 'none',
        borderRadius: 0,
        '& > .MuiBox-root': {
          background: 'transparent',
          boxShadow: 'none',
          border: 'none',
          borderRadius: 0
        }
      }}>
        <Box 
          component={motion.div}
          sx={{ 
            textAlign: 'center', 
            mb: 6,
            background: 'transparent',
            boxShadow: 'none',
            padding: 0,
            border: 'none',
            borderRadius: 0,
            '&::before': {
              display: 'none'
            },
            '&::after': {
              display: 'none'
            }
          }} 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Chip 
            icon={<VerifiedIcon />} 
            label="DÉJÀ VENDUS" 
            sx={{ 
              mb: 2, 
              fontWeight: 600,
              bgcolor: 'rgba(230, 57, 70, 0.1)',
              color: 'primary.main',
              '& .MuiChip-icon': {
                color: 'primary.main'
              }
            }} 
          />
          <Typography variant="h2" sx={{ 
            mb: 2,
            fontWeight: 700,
            mt: 2, // Ajout d'une marge supérieure pour éviter que le titre soit tronqué
            position: 'relative', // Assure que le titre est positionné correctement
            zIndex: 2, // S'assure que le titre est au-dessus des autres éléments
            fontSize: { xs: '2rem', md: '2.5rem' }
          }}>
            Moteurs déjà testés et vendus
          </Typography>
          <Typography variant="body1" sx={{ 
            maxWidth: '800px', 
            mx: 'auto',
            color: 'text.secondary',
            fontSize: '1.1rem',
            lineHeight: 1.6,
            position: 'relative',
            zIndex: 2,
            backgroundColor: 'transparent !important',
            background: 'transparent !important',
            boxShadow: 'none !important',
            border: 'none !important',
            borderRadius: '0 !important',
            '&::before, &::after': {
              content: '""',
              display: 'none !important'
            },
            '& > *': {
              backgroundColor: 'transparent !important',
              background: 'transparent !important'
            }
          }}>
            Voici quelques exemples de moteurs que nous avons récemment testés et livrés à nos clients. 
            Contactez-nous pour obtenir un devis personnalisé sur le modèle que vous recherchez.
          </Typography>
        </Box>
        
        <Box 
          sx={{ 
            display: { xs: 'flex', sm: 'grid' },
            overflowX: { xs: 'auto', sm: 'visible' },
            scrollSnapType: { xs: 'x mandatory', sm: 'none' },
            WebkitOverflowScrolling: 'touch',
            gap: { xs: 2, md: 4 },
            pb: { xs: 1, sm: 0 },
            px: { xs: 1, sm: 0 },
            gridTemplateColumns: { sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }
          }}
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {motors.map((motor, index) => (
            <Card 
              key={motor.id}
              component={motion.div}
              variants={itemVariants}
              whileHover="hover"
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                minHeight: { xs: 460, sm: 480, md: 500 },
                transition: 'all 0.3s ease',
                minWidth: { xs: '80%', sm: 'auto' },
                scrollSnapAlign: { xs: 'start', sm: 'none' },
                '&:hover': {
                  boxShadow: '0 15px 50px rgba(0, 0, 0, 0.18)',
                  transform: 'translateY(-8px)'
                }
              }}
            >
              <Box sx={{ position: 'relative', height: { xs: 180, sm: 200, md: 220 } }}>
                <CardMedia
                  component="img"
                  image={motor.image}
                  alt={motor.name}
                  loading="lazy"
                  decoding="async"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    bgcolor: 'primary.main',
                    color: 'white',
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                  }}
                >
                  {motor.price}
                </Box>
              </Box>
              
              <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 700, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 56 }}>
                  {motor.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PrecisionManufacturingIcon sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {motor.displacement}
                  </Typography>
                </Box>

                {motor.engineCode && motor.engineCode !== '—' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <QrCode2Icon sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Code moteur: {motor.engineCode}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SpeedIcon sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {motor.power} | {motor.mileage}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BuildIcon sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    État: {motor.condition}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CheckCircleIcon sx={{ color: 'primary.main', mr: 1.5, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Garantie: {motor.warranty}
                  </Typography>
                </Box>
                
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={() => handleOpen(motor)}
                  fullWidth
                  sx={{ 
                    py: 1.2,
                    borderRadius: 2,
                    fontWeight: 600,
                    mt: 'auto'
                  }}
                >
                  Voir les détails
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
        
        {/* Section de recherche de moteur spécifique */}
        <Box 
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          sx={{ 
            maxWidth: '900px', 
            mx: 'auto', 
            mt: 12,
            mb: 0, // Réduction de la marge bottom
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            background: 'linear-gradient(to right, #ffffff, #f8f9fa)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            position: 'relative',
            overflow: 'visible',
            height: 'auto',
            minHeight: '200px',
            zIndex: 20, // Augmentation du z-index pour s'assurer que cette section est au-dessus des autres
            transform: 'translateZ(0)'
          }}
        >
          {/* Élément décoratif */}
          <Box
            sx={{
              position: 'absolute',
              top: -15,
              right: -15,
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(230, 57, 70, 0.1) 0%, rgba(230, 57, 70, 0.2) 100%)',
              zIndex: -1
            }}
          />
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 4,
            width: '100%',
            height: '100%'
          }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Vous recherchez un moteur spécifique ?
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.8 }}>
                Nous disposons d'un large stock de moteurs pour toutes marques et modèles. Notre équipe d'experts vous aide à trouver le moteur parfaitement adapté à vos besoins.
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              gap: 2,
              minWidth: { xs: '100%', md: '200px' }
            }}>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                startIcon={<SearchIcon />}
                component="a"
                href="/demande-devis"
                sx={{ 
                  borderRadius: 2,
                  py: 1.5,
                  px: 3,
                  boxShadow: '0 8px 20px rgba(230, 57, 70, 0.25)',
                  '&:hover': {
                    boxShadow: '0 12px 25px rgba(230, 57, 70, 0.35)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Demander un devis
              </Button>
              <Button 
                variant="outlined" 
                color="primary"
                sx={{ 
                  borderRadius: 2,
                  py: 1.2,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    backgroundColor: 'rgba(230, 57, 70, 0.05)'
                  }
                }}
              >
                Nous contacter
              </Button>
            </Box>
          </Box>
        </Box>
        
        {/* Modal de détails du moteur */}
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              overflow: 'hidden'
            }
          }}
        >
          {selectedMotor && (
            <>
              <DialogTitle sx={{ 
                bgcolor: 'primary.main', 
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 2,
                px: 3
              }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
                  {selectedMotor.name}
                </Typography>
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={handleClose}
                  aria-label="close"
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent sx={{ p: 0 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, p: 3 }}>
                  <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 1' } }}>
                    <img 
                      src={selectedMotor.image} 
                      alt={selectedMotor.name} 
                      loading="lazy"
                      decoding="async"
                      style={{ 
                        width: '100%', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                        Rapport de test
                      </Typography>
                      
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                        {selectedMotor.testReport.map((report, index) => (
                          <Paper 
                            elevation={0} 
                            sx={{ 
                              p: 1, 
                              border: '1px solid rgba(0, 0, 0, 0.1)',
                              borderRadius: 2,
                              cursor: 'pointer',
                              '&:hover': {
                                bgcolor: 'rgba(0, 0, 0, 0.02)'
                              }
                            }}
                            key={index}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <img 
                                src={report} 
                                alt={`Rapport ${index + 1}`} 
                                style={{ 
                                  width: '60px', 
                                  height: '60px',
                                  objectFit: 'cover',
                                  borderRadius: '4px',
                                  marginRight: '12px'
                                }} 
                              />
                              <Typography variant="body2">
                                Rapport de test {index + 1}
                              </Typography>
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 1' }, bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                    <Box sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                        Caractéristiques techniques
                      </Typography>
                      
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                          <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}>
                            <Typography variant="body2" color="text.secondary">Marque</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedMotor.brand}</Typography>
                          </Box>
                          <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}>
                            <Typography variant="body2" color="text.secondary">Modèle</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedMotor.model}</Typography>
                          </Box>
                          <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}>
                            <Typography variant="body2" color="text.secondary">Année</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedMotor.year}</Typography>
                          </Box>
                          <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}>
                            <Typography variant="body2" color="text.secondary">Cylindrée</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedMotor.displacement}</Typography>
                          </Box>
                          <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}>
                            <Typography variant="body2" color="text.secondary">Puissance</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedMotor.power}</Typography>
                          </Box>
                          <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}>
                            <Typography variant="body2" color="text.secondary">Kilométrage</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedMotor.mileage}</Typography>
                          </Box>
                          <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}>
                            <Typography variant="body2" color="text.secondary">État</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedMotor.condition}</Typography>
                          </Box>
                          <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}>
                            <Typography variant="body2" color="text.secondary">Garantie</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedMotor.warranty}</Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                        Tests effectués
                      </Typography>
                      
                      <Box sx={{ mb: 3 }}>
                        {selectedMotor.features.map((feature, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CheckCircleIcon sx={{ color: 'primary.main', mr: 1.5, fontSize: 20 }} />
                            <Typography variant="body2">{feature}</Typography>
                          </Box>
                        ))}
                      </Box>
                      
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                        Prix
                      </Typography>
                      
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 700, 
                          color: 'primary.main',
                          mb: 3
                        }}
                      >
                        {selectedMotor.price}
                      </Typography>
                      
                      <Button 
                        variant="contained" 
                        color="primary" 
                        fullWidth
                        component="a"
                        href="/demande-devis"
                        sx={{ 
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          boxShadow: '0 4px 12px rgba(230, 57, 70, 0.2)',
                          '&:hover': {
                            boxShadow: '0 8px 20px rgba(230, 57, 70, 0.3)'
                          }
                        }}
                      >
                        Demander un devis
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </DialogContent>
            </>
          )}
        </Dialog>
      </Container>

      {/* Bande de transition vers la section suivante */}
      <Box sx={{
        height: 10,
        background: 'linear-gradient(90deg, #E8EFFD 0%, #F5F8FF 100%)',
        borderTop: '1px solid rgba(2,6,23,0.06)'
      }} />
    </Box>
  );
};

export default MotorsShowcaseSection;

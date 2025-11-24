import React, { useState } from 'react';
import { Box, Container, Typography, useTheme, Chip, Tooltip, Accordion, AccordionSummary, AccordionDetails, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { motion } from 'framer-motion';
import SpeedIcon from '@mui/icons-material/Speed';
import VerifiedIcon from '@mui/icons-material/Verified';
import BuildIcon from '@mui/icons-material/Build';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import HistoryIcon from '@mui/icons-material/History';
import CircleIcon from '@mui/icons-material/Circle';

const ComparisonSection: React.FC = () => {
  const theme = useTheme();
  const [showMoreMobile, setShowMoreMobile] = useState(false);
  
  // Couleurs personnalisées pour un meilleur contraste
  const successColor = '#2e7d32'; // Vert plus foncé
  const warningColor = '#ed6c02'; // Orange
  const errorColor = '#d32f2f';   // Rouge
  
  const comparisonPoints = [
    {
      title: "Tests complets",
      icon: <SpeedIcon sx={{ fontSize: 24, color: theme.palette.primary.main }} />,
      carPartsFrance: {
        icon: <CheckCircleOutlineIcon sx={{ fontSize: 24, color: successColor }} />,
        description: "Chaque moteur subit 5 tests/analyses ou inspections : compression ou leak test, endoscopie, pression d'huile, analyse d'huile, inspection visuelle, etc.",
        value: true,
        status: "excellent",
        statusColor: successColor,
        fact: "5 tests par moteur"
      },
      others: {
        icon: <CancelOutlinedIcon sx={{ fontSize: 24, color: errorColor }} />,
        description: "Tests très rarement effectués, voire inexistants dans la plupart des cas.",
        value: false,
        status: "insuffisant",
        statusColor: errorColor,
        fact: "Tests rarement effectués"
      }
    },
    {
      title: "Garantie",
      icon: <VerifiedIcon sx={{ fontSize: 24, color: theme.palette.primary.main }} />,
      carPartsFrance: {
        icon: <CheckCircleOutlineIcon sx={{ fontSize: 24, color: successColor }} />,
        description: "Garantie de 1 an sur tous nos moteurs, avec possibilité d'extension.",
        value: true,
        status: "excellent",
        statusColor: successColor,
        fact: "1 an de garantie"
      },
      others: {
        icon: <CancelOutlinedIcon sx={{ fontSize: 24, color: warningColor }} />,
        description: "Garantie limitée ou inexistante, souvent sans conditions claires.",
        value: false,
        status: "moyen",
        statusColor: warningColor,
        fact: "0-3 mois selon fournisseur"
      }
    },
    {
      title: "Rapport de test",
      icon: <BuildIcon sx={{ fontSize: 24, color: theme.palette.primary.main }} />,
      carPartsFrance: {
        icon: <CheckCircleOutlineIcon sx={{ fontSize: 24, color: successColor }} />,
        description: "Rapport détaillé fourni avec chaque moteur, incluant photos et mesures précises.",
        value: true,
        status: "excellent",
        statusColor: successColor,
        fact: "Rapport complet avec photos"
      },
      others: {
        icon: <CancelOutlinedIcon sx={{ fontSize: 24, color: errorColor }} />,
        description: "Aucune documentation sur l'état réel et les performances du moteur.",
        value: false,
        status: "insuffisant",
        statusColor: errorColor,
        fact: "Aucun rapport fourni"
      }
    },
    {
      title: "Délai de livraison",
      icon: <LocalShippingIcon sx={{ fontSize: 24, color: theme.palette.primary.main }} />,
      carPartsFrance: {
        icon: <CheckCircleOutlineIcon sx={{ fontSize: 24, color: successColor }} />,
        description: "Livraison en 14 jours en raison de nos tests rigoureux. Délai planifié avec suivi en temps réel.",
        value: true,
        status: "bon",
        statusColor: successColor,
        fact: "14 jours avec suivi"
      },
      others: {
        icon: <CancelOutlinedIcon sx={{ fontSize: 24, color: warningColor }} />,
        description: "Délais parfois courts (4 jours) mais sans aucun test ni suivi de livraison.",
        value: false,
        status: "moyen",
        statusColor: warningColor,
        fact: "4-15 jours sans suivi"
      }
    },
    {
      title: "Support technique",
      icon: <SupportAgentIcon sx={{ fontSize: 24, color: theme.palette.primary.main }} />,
      carPartsFrance: {
        icon: <CheckCircleOutlineIcon sx={{ fontSize: 24, color: successColor }} />,
        description: "Assistance technique disponible avant, pendant et après l'achat. Réponse sous 24h.",
        value: true,
        status: "excellent",
        statusColor: successColor,
        fact: "Réponse sous 24h"
      },
      others: {
        icon: <CancelOutlinedIcon sx={{ fontSize: 24, color: errorColor }} />,
        description: "Support minimal ou inexistant en cas de problème. Temps d'attente moyen : 72h.",
        value: false,
        status: "insuffisant",
        statusColor: errorColor,
        fact: "Réponse en 72h ou plus"
      }
    },
    {
      title: "Traçabilité",
      icon: <HistoryIcon sx={{ fontSize: 24, color: theme.palette.primary.main }} />,
      carPartsFrance: {
        icon: <CheckCircleOutlineIcon sx={{ fontSize: 24, color: successColor }} />,
        description: "Historique complet et transparent de chaque moteur.",
        value: true,
        status: "excellent",
        statusColor: successColor,
        fact: "Historique complet fourni"
      },
      others: {
        icon: <CancelOutlinedIcon sx={{ fontSize: 24, color: errorColor }} />,
        description: "Origine et historique souvent flous ou incomplets.",
        value: false,
        status: "insuffisant",
        statusColor: errorColor,
        fact: "Pas d'historique détaillé"
      }
    }
  ];

  return (
    <Box 
      sx={{ 
        pt: { xs: 4, md: 8 },
        pb: { xs: 5, md: 8 }, 
        background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Vague décorative en haut */}
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100px',
          zIndex: 0,
          overflow: 'hidden',
          transform: 'rotate(180deg)',
          display: 'none'
        }}
      >
        <svg
          viewBox="0 0 1440 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: 'auto',
            transform: 'translateY(-1px)'
          }}
        >
          <path
            fill="#1d3557"
            fillOpacity="0.03"
            d="M0,288L48,277.3C96,267,192,245,288,245.3C384,245,480,267,576,261.3C672,256,768,224,864,213.3C960,203,1056,213,1152,224C1248,235,1344,245,1392,250.7L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </Box>

      {/* Background elements */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        sx={{
          position: 'absolute',
          top: '15%',
          right: '5%',
          width: { xs: 150, md: 300 },
          height: { xs: 150, md: 300 },
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(230, 57, 70, 0.05) 0%, rgba(230, 57, 70, 0) 70%)`,
          zIndex: 0,
          pointerEvents: 'none'
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
          width: { xs: 100, md: 250 },
          height: { xs: 100, md: 250 },
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(29, 53, 87, 0.05) 0%, rgba(29, 53, 87, 0) 70%)`,
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box 
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          sx={{ 
            maxWidth: '700px', 
            mx: 'auto', 
            textAlign: 'center', 
            mb: { xs: 6, md: 10 } 
          }}
        >
          <Chip 
            icon={<CompareArrowsIcon />}
            label="COMPARAISON" 
            sx={{ 
              mb: 3, 
              fontWeight: 600, 
              backgroundColor: `${theme.palette.primary.main}15`,
              color: theme.palette.primary.main,
              borderRadius: '50px',
              px: 1.5,
              py: 2.5,
              fontSize: '0.75rem',
              letterSpacing: 1.2,
              border: `1px solid ${theme.palette.primary.main}30`,
              boxShadow: '0 6px 16px rgba(15,23,42,0.08)',
              '& .MuiChip-label': {
                px: 1
              }
            }} 
          />
          
          <Typography 
            variant="h2" 
            component="h2" 
            sx={{ 
              fontWeight: 700, 
              mb: 3,
              fontSize: { xs: '2rem', md: '2.5rem' },
              lineHeight: 1.2,
              color: theme.palette.text.primary,
              position: 'relative',
              display: 'inline-block',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -12,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 80,
                height: 4,
                backgroundColor: theme.palette.primary.main,
                borderRadius: 2
              }
            }}
          >
            Car Parts France vs. Autres fournisseurs
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              fontSize: { xs: '1rem', md: '1.15rem' }, 
              lineHeight: { xs: 1.6, md: 1.7 },
              mb: { xs: 4, md: 5 },
              maxWidth: '90%',
              mx: 'auto'
            }}
          >
            Découvrez pourquoi les professionnels de l'automobile choisissent Car Parts France pour leurs moteurs d'occasion plutôt que les alternatives traditionnelles.
          </Typography>

          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
            mb: { xs: 4, md: 6 }
          }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 1, borderRadius: 2, background: '#fff', border: '1px solid rgba(2,6,23,0.08)', color: 'text.primary' }}>
              <SpeedIcon sx={{ color: theme.palette.primary.main }} />
              <Typography variant="body2" fontWeight={700}>5 tests par moteur</Typography>
            </Box>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 1, borderRadius: 2, background: '#fff', border: '1px solid rgba(2,6,23,0.08)', color: 'text.primary' }}>
              <VerifiedIcon sx={{ color: '#2e7d32' }} />
              <Typography variant="body2" fontWeight={700}>Garantie 1 an</Typography>
            </Box>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 1, borderRadius: 2, background: '#fff', border: '1px solid rgba(2,6,23,0.08)', color: 'text.primary' }}>
              <SupportAgentIcon sx={{ color: '#eab308' }} />
              <Typography variant="body2" fontWeight={700}>Support ≤ 24h</Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', gap: 2, mb: 6, flexWrap: 'wrap' }}>
          <Chip icon={<CircleIcon sx={{ color: successColor }} />} label="Excellent" variant="outlined" sx={{ fontWeight: 600, color: '#fff', borderColor: 'rgba(255,255,255,0.25)' }} />
          <Chip icon={<CircleIcon sx={{ color: warningColor }} />} label="Moyen" variant="outlined" sx={{ fontWeight: 600, color: '#fff', borderColor: 'rgba(255,255,255,0.25)' }} />
          <Chip icon={<CircleIcon sx={{ color: errorColor }} />} label="Insuffisant" variant="outlined" sx={{ fontWeight: 600, color: '#fff', borderColor: 'rgba(255,255,255,0.25)' }} />
        </Box>

        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          sx={{
            mb: { xs: 6, md: 10 },
            borderRadius: 4,
            backgroundColor: '#fff',
            boxShadow: '0 12px 24px rgba(15,23,42,0.06)',
            border: '1px solid rgba(2,6,23,0.06)',
            overflow: 'hidden',
            display: { xs: 'none', md: 'block' }
          }}
        >
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
            borderBottom: '1px solid rgba(2,6,23,0.06)'
          }}>
            <Box sx={{ 
              p: { xs: 2, md: 3 }, 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center', 
              borderRight: { xs: 'none', md: '1px solid rgba(2,6,23,0.06)' } 
            }}>
              <Typography variant="h6" fontWeight={600} color="text.secondary">
                Critères
              </Typography>
            </Box>
            <Box sx={{ 
              p: { xs: 2, md: 3 }, 
              backgroundColor: 'rgba(46, 125, 50, 0.08)',
              borderRight: { xs: 'none', md: '1px solid rgba(2,6,23,0.06)' },
              textAlign: 'center',
              boxShadow: 'inset 0 -4px 0 rgba(46, 125, 50, 0.2)'
            }}>
              <Typography variant="h6" fontWeight={700} color={successColor}>
                Car Parts France
              </Typography>
            </Box>
            <Box sx={{ 
              p: { xs: 2, md: 3 }, 
              backgroundColor: 'rgba(211, 47, 47, 0.05)',
              textAlign: 'center',
              boxShadow: 'inset 0 -4px 0 rgba(211, 47, 47, 0.2)'
            }}>
              <Typography variant="h6" fontWeight={700} color={errorColor}>
                Autres fournisseurs
              </Typography>
            </Box>
          </Box>

          {comparisonPoints.map((point, index) => (
            <Box 
              key={index}
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              sx={{ 
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                borderBottom: index < comparisonPoints.length - 1 ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                '&:hover': {
                  backgroundColor: 'transparent'
                }
              }}
            >
              <Box sx={{ 
                p: { xs: 2, md: 4 }, 
                borderRight: { xs: 'none', md: '1px solid rgba(2,6,23,0.06)' },
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                backgroundColor: { xs: 'transparent', md: index % 2 ? 'rgba(2,6,23,0.02)' : 'transparent' },
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(2,6,23,0.03)'
                }
              }}>
                <Box sx={{ 
                  backgroundColor: `${theme.palette.primary.main}15`,
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {point.icon}
                </Box>
                <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                  {point.title}
                </Typography>
              </Box>
               
              <Box sx={{ 
                p: { xs: 2, md: 4 }, 
                borderRight: { xs: 'none', md: '1px solid rgba(2,6,23,0.06)' },
                backgroundColor: 'rgba(46, 125, 50, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: `rgba(46, 125, 50, 0.08)`,
                }
              , borderLeft: { md: '4px solid rgba(46, 125, 50, 0.3)' } }}>
                <Typography variant="overline" sx={{ display: { xs: 'block', md: 'none' }, color: successColor, fontWeight: 700, mb: 1 }}>
                  Car Parts France
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ 
                    minWidth: 24, 
                    height: 24, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mt: 0.5
                  }}>
                    {point.carPartsFrance.icon}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {point.carPartsFrance.description}
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5,
                    backgroundColor: 'rgba(46, 125, 50, 0.1)',
                    borderRadius: '30px',
                    px: 2,
                    py: 0.75,
                    border: '1px solid rgba(46, 125, 50, 0.2)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      transform: 'translateY(-2px)'
                    }
                  }}>
                    <Tooltip title={point.carPartsFrance.status}>
                      <CircleIcon sx={{ color: point.carPartsFrance.statusColor, fontSize: 12 }} />
                    </Tooltip>
                    <Typography variant="body2" fontWeight={600} color={successColor}>
                      {point.carPartsFrance.fact}
                    </Typography>
                  </Box>
                </Box>
              </Box>
               
              <Box sx={{ 
                p: { xs: 2, md: 4 }, 
                backgroundColor: point.others.statusColor === warningColor ? 'rgba(237, 108, 2, 0.04)' : 'rgba(211, 47, 47, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: point.others.statusColor === warningColor ? 'rgba(237, 108, 2, 0.08)' : 'rgba(211, 47, 47, 0.08)',
                }
              , borderLeft: point.others.statusColor === warningColor ? '4px solid rgba(237, 108, 2, 0.3)' : '4px solid rgba(211, 47, 47, 0.3)' }}>
                <Typography variant="overline" sx={{ display: { xs: 'block', md: 'none' }, color: errorColor, fontWeight: 700, mb: 1 }}>
                  Autres fournisseurs
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ 
                    minWidth: 24, 
                    height: 24, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mt: 0.5
                  }}>
                    {point.others.icon}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {point.others.description}
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5,
                    backgroundColor: point.others.statusColor === warningColor ? 'rgba(237, 108, 2, 0.1)' : 'rgba(211, 47, 47, 0.1)',
                    borderRadius: '30px',
                    px: 2,
                    py: 0.75,
                    border: point.others.statusColor === warningColor ? '1px solid rgba(237, 108, 2, 0.2)' : '1px solid rgba(211, 47, 47, 0.2)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      transform: 'translateY(-2px)'
                    }
                  }}>
                    <Tooltip title={point.others.status}>
                      <CircleIcon sx={{ color: point.others.statusColor, fontSize: 12 }} />
                    </Tooltip>
                    <Typography variant="body2" fontWeight={600} color={point.others.statusColor}>
                      {point.others.fact}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Box sx={{ mb: 6 }}>
            {(showMoreMobile ? comparisonPoints : comparisonPoints.slice(0, 3)).map((point, index) => (
              <Accordion key={index} disableGutters sx={{ mb: 1, boxShadow: 'none', border: '1px solid rgba(2,6,23,0.08)', borderRadius: 2, background: '#fff' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: `${theme.palette.primary.main}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {point.icon}
                    </Box>
                    <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                      {point.title}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Typography variant="overline" sx={{ color: successColor, fontWeight: 700, mb: 1, display: 'block' }}>
                    Car Parts France
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box sx={{ minWidth: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 0.2 }}>
                      {point.carPartsFrance.icon}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {point.carPartsFrance.description}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 1.25, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CircleIcon sx={{ color: point.carPartsFrance.statusColor, fontSize: 12 }} />
                    <Typography variant="body2" fontWeight={600} color={successColor}>
                      {point.carPartsFrance.fact}
                    </Typography>
                  </Box>

                  <Typography variant="overline" sx={{ color: errorColor, fontWeight: 700, mt: 2, mb: 1, display: 'block' }}>
                    Autres fournisseurs
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box sx={{ minWidth: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 0.2 }}>
                      {point.others.icon}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {point.others.description}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 1.25, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CircleIcon sx={{ color: point.others.statusColor, fontSize: 12 }} />
                    <Typography variant="body2" fontWeight={600} color={point.others.statusColor}>
                      {point.others.fact}
                    </Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
            {comparisonPoints.length > 3 && (
              <Button variant="outlined" onClick={() => setShowMoreMobile(!showMoreMobile)} sx={{ textTransform: 'none', width: '100%', mt: 2 }}>
                {showMoreMobile ? 'Voir moins' : 'Voir plus'}
              </Button>
            )}
          </Box>
        </Box>
      </Container>
      </Box>
    );
  };

export default ComparisonSection;

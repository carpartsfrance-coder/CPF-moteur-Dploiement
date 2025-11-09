import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  useTheme, 
  useMediaQuery,
  Modal, 
  IconButton,
  Chip,
  Tabs,
  Tab,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import { motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import BuildIcon from '@mui/icons-material/Build';
import CompressIcon from '@mui/icons-material/Compress';
import OpacityIcon from '@mui/icons-material/Opacity';
import ScienceIcon from '@mui/icons-material/Science';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import Looks3Icon from '@mui/icons-material/Looks3';
import Looks4Icon from '@mui/icons-material/Looks4';
import Looks5Icon from '@mui/icons-material/Looks5';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`test-tabpanel-${index}`}
      aria-labelledby={`test-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 4 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `test-tab-${index}`,
    'aria-controls': `test-tabpanel-${index}`,
  };
}

const TestsGallery: React.FC = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [showAllProc, setShowAllProc] = useState<{[key:number]: boolean}>({});
  const tabLabels = [
    'Inspection Visuelle',
    'Endoscopie',
    'Compression / Leak test',
    "Pression d'huile",
    "Analyse d'huile",
    'Rapport de test'
  ];
  const totalSteps = tabLabels.length;
  
  // Fermer l'image en plein écran
  const handleCloseImage = () => {
    setSelectedImage(null);
  };

  // Gérer le changement d'onglet
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  return (
    <Box 
      sx={{ 
        pt: { xs: 5, md: 6 }, 
        pb: { xs: 2, md: 3 }, 
        bgcolor: theme.palette.background.default,
        position: 'relative',
        overflow: { xs: 'hidden', md: 'visible' },
        backgroundImage: 'linear-gradient(to bottom, rgba(245, 245, 247, 0.9), rgba(255, 255, 255, 1))',
        boxShadow: 'inset 0 5px 15px rgba(0, 0, 0, 0.05)',
        marginTop: '0',
        zIndex: 2
      }}
      id="tests-gallery"
    >
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
          width: { xs: 100, md: 200 },
          height: { xs: 100, md: 200 },
          borderRadius: '50%',
          background: 'linear-gradient(to bottom, rgba(245, 245, 247, 0.9), rgba(255, 255, 255, 1))',
          boxShadow: 'inset 0 5px 15px rgba(0, 0, 0, 0.05)',
          marginTop: '0',
          zIndex: 2,
          display: { xs: 'none', md: 'block' }
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
          zIndex: 0,
          display: { xs: 'none', md: 'block' }
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
            maxWidth: '800px', 
            mx: 'auto', 
            textAlign: 'center', 
            mb: { xs: 1.5, md: 2 } 
          }}
        >
          <Chip 
            icon={<BuildIcon />}
            label="EXCELLENCE TECHNIQUE" 
            sx={{ 
              mb: 3, 
              fontWeight: 600, 
              backgroundColor: `${theme.palette.primary.main}30`,
              color: theme.palette.primary.main,
              borderRadius: '50px',
              px: 1.5,
              py: 2.5,
              fontSize: '0.75rem',
              letterSpacing: 1.2,
              border: `1px solid ${theme.palette.primary.main}40`,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              '& .MuiChip-label': {
                px: 1
              }
            }} 
          />
          
          <Typography 
            variant="h2" 
            component="h2" 
            sx={{ 
              fontWeight: 800, 
              mb: 3,
              fontSize: { xs: '1.75rem', md: '2.75rem' },
              lineHeight: 1.2,
              color: theme.palette.text.primary,
              position: 'relative',
              display: 'inline-block',
              textShadow: '0 2px 4px rgba(0,0,0,0.05)',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -12,
                left: '50%',
                transform: 'translateX(-50%)',
                width: { xs: 64, md: 100 },
                height: { xs: 3, md: 4 },
                backgroundColor: theme.palette.primary.main,
                borderRadius: 2
              }
            }}
          >
            Notre processus de contrôle qualité
          </Typography>
          
          
        </Box>

        <Box 
          component={motion.div}
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          sx={{ 
            width: '100%', 
            height: '8px', 
            maxWidth: '120px', 
            borderRadius: '4px',
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            mb: { xs: 3, md: 6 },
            mx: 'auto',
            display: { xs: 'none', md: 'block' }
          }}
        />

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: { xs: 2, md: 4 }, position: 'relative', '&::after': { content: '""', position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0) 100%)' } }}>
          {isXs ? (
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel id="test-select-label">Choisir un test</InputLabel>
              <Select
                labelId="test-select-label"
                id="test-select"
                label="Choisir un test"
                value={tabValue}
                onChange={(e) => setTabValue(Number(e.target.value))}
                renderValue={(selected) => `Étape ${Number(selected) + 1}/${totalSteps} — ${tabLabels[selected as number]}`}
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  boxShadow: 'none',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0,0,0,0.15)',
                    borderWidth: 1
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                    borderWidth: 1
                  },
                  '& .MuiSelect-select': {
                    py: 0.9
                  }
                }}
              >
                {tabLabels.map((label, idx) => (
                  <MenuItem key={label} value={idx}>{`${idx + 1}. ${label}`}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
              <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile aria-label="Tests tabs" sx={{ '& .MuiTabs-indicator': { backgroundColor: theme.palette.primary.main, height: 3 }, '& .MuiTabs-scrollButtons': { color: theme.palette.primary.main } }}>
                <Tab icon={<VisibilityIcon />} iconPosition="start" label={`1. ${tabLabels[0]}`} {...a11yProps(0)} sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.95rem', color: tabValue === 0 ? theme.palette.primary.main : theme.palette.text.primary, minHeight: '48px', transition: 'all 0.2s ease', mr: 2, '& .MuiSvgIcon-root': { fontSize: '1.1rem', mr: 1 } }} />
                <Tab icon={<CameraAltIcon />} iconPosition="start" label={`2. ${tabLabels[1]}`} {...a11yProps(1)} sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.95rem', color: tabValue === 1 ? theme.palette.primary.main : theme.palette.text.primary, minHeight: '48px', transition: 'all 0.2s ease', mr: 2, '& .MuiSvgIcon-root': { fontSize: '1.1rem', mr: 1 } }} />
                <Tab icon={<CompressIcon />} iconPosition="start" label={`3. ${tabLabels[2]}`} {...a11yProps(2)} sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.95rem', color: tabValue === 2 ? theme.palette.primary.main : theme.palette.text.primary, minHeight: '48px', transition: 'all 0.2s ease', mr: 2, '& .MuiSvgIcon-root': { fontSize: '1.1rem', mr: 1 } }} />
                <Tab icon={<OpacityIcon />} iconPosition="start" label={`4. ${tabLabels[3]}`} {...a11yProps(3)} sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.95rem', color: tabValue === 3 ? theme.palette.primary.main : theme.palette.text.primary, minHeight: '48px', transition: 'all 0.2s ease', mr: 2, '& .MuiSvgIcon-root': { fontSize: '1.1rem', mr: 1 } }} />
                <Tab icon={<ScienceIcon />} iconPosition="start" label={`5. ${tabLabels[4]}`} {...a11yProps(4)} sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.95rem', color: tabValue === 4 ? theme.palette.primary.main : theme.palette.text.primary, minHeight: '48px', transition: 'all 0.2s ease', mr: 2, '& .MuiSvgIcon-root': { fontSize: '1.1rem', mr: 1 } }} />
                <Tab icon={<AssessmentIcon />} iconPosition="start" label={`6. ${tabLabels[5]}`} {...a11yProps(5)} sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.95rem', color: tabValue === 5 ? theme.palette.primary.main : theme.palette.text.primary, minHeight: '48px', transition: 'all 0.2s ease', '& .MuiSvgIcon-root': { fontSize: '1.1rem', mr: 1 } }} />
              </Tabs>
              <Typography variant="body2" sx={{ whiteSpace: 'nowrap', color: 'text.secondary', fontWeight: 600 }}>
                Étape {tabValue + 1} / {totalSteps}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Tab panels */}
        <TabPanel value={tabValue} index={0}>
          <Box 
            sx={{ 
              position: 'relative',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
              borderRadius: 3,
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              mb: 4
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '40%',
                height: '100%',
                background: 'linear-gradient(135deg, rgba(230, 57, 70, 0.03) 0%, rgba(230, 57, 70, 0.08) 100%)',
                clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
                zIndex: 0,
                display: { xs: 'none', md: 'block' }
              }}
            />
            
            <Grid container spacing={3} sx={{ position: 'relative', zIndex: 1, p: { xs: 2, md: 4 } }}>
              <Grid sx={{ gridColumn: 'span 12', '@media (min-width: 900px)': { gridColumn: 'span 7' } }}>
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box 
                      sx={{ 
                        width: 60, 
                        height: 60, 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #e63946 0%, #ff6b6b 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        boxShadow: '0 4px 10px rgba(230, 57, 70, 0.3)'
                      }}
                    >
                      <VisibilityIcon sx={{ color: 'white', fontSize: 30 }} />
                    </Box>
                    <Box>
                      <Typography 
                        variant="overline" 
                        sx={{ 
                          color: theme.palette.primary.main, 
                          fontWeight: 600,
                          letterSpacing: 1.5
                        }}
                      >
                        INSPECTION VISUELLE
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        Inspection Visuelle
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Réalisé moteur à l'arrêt, inspection extérieure
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      bgcolor: 'rgba(230, 57, 70, 0.1)',
                      borderRadius: '50px',
                      px: 2,
                      py: 0.5,
                      mb: 3
                    }}
                  >
                    <LooksOneIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                    <Typography variant="body2" fontWeight={600} color="primary">
                      Étape 1 sur 5 dans notre processus de test
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontSize: '1.05rem',
                      lineHeight: 1.8,
                      color: 'text.secondary',
                      mb: 4
                    }}
                  >
                    L'inspection visuelle est une étape cruciale de notre processus de contrôle qualité. Nos techniciens expérimentés vérifient minutieusement l'état extérieur du moteur, en examinant les composants visibles, les connexions, les joints, et l'état général. Cette inspection permet de détecter d'éventuelles fuites, fissures ou signes d'usure anormale avant même de procéder aux tests plus approfondis.
                  </Typography>
                  
                  <Accordion disableGutters defaultExpanded={!isXs} sx={{ mb: 2, borderRadius: 2, border: '1px solid rgba(244, 67, 54, 0.2)', bgcolor: 'rgba(244, 67, 54, 0.05)' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#d32f2f' }}>
                        Risques en cas d'échec du test
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.7 }}>
                        <strong>Problèmes potentiels :</strong> Des fissures non détectées, des joints défectueux ou des fuites peuvent indiquer des problèmes structurels graves.
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                        <strong>Conséquences :</strong> Sans une inspection visuelle approfondie, des problèmes comme des fuites d'huile, des fissures sur le bloc moteur ou des joints défectueux peuvent passer inaperçus, entraînant ultérieurement des pannes catastrophiques, des fuites de liquides, une surchauffe du moteur ou même une casse moteur complète après installation.
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                  
                  <Accordion disableGutters defaultExpanded={!isXs} sx={{ mb: 2, borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.06)' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Processus d'inspection
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, gap: 2, overflowX: { xs: 'auto', md: 'visible' }, scrollSnapType: { xs: 'x mandatory', md: 'none' }, pb: { xs: 1, md: 0 } }}>
                      <Box 
                        sx={{ 
                          display: 'flex',
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'rgba(255,255,255,0.7)',
                          border: '1px solid rgba(0,0,0,0.05)',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          minWidth: { xs: 260, md: 'auto' },
                          scrollSnapAlign: { xs: 'start', md: 'none' },
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
                          }
                        }}
                      >
                        <Box 
                          sx={{ 
                            minWidth: 40, 
                            height: 40, 
                            borderRadius: '50%', 
                            bgcolor: theme.palette.primary.main,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            fontWeight: 700
                          }}
                        >
                          <LooksOneIcon />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            Vérification des composants externes
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Inspection minutieuse de l'extérieur du moteur, des connexions et des joints
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mt: 1 }}>
                      <Button size="small" variant="text" onClick={() => setShowAllProc(prev => ({ ...prev, 1: !prev[1] }))} sx={{ textTransform: 'none' }}>
                        {showAllProc[1] ? 'Voir moins' : 'Voir tout'}
                      </Button>
                    </Box>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              </Grid>
              
              {/* Image grid item removed */}
            </Grid>
          </Box>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Box 
            sx={{ 
              position: 'relative',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
              borderRadius: 3,
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              mb: 4
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '40%',
                height: '100%',
                background: 'linear-gradient(135deg, rgba(230, 57, 70, 0.03) 0%, rgba(230, 57, 70, 0.08) 100%)',
                clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
                zIndex: 0,
                display: { xs: 'none', md: 'block' }
              }}
            />
            
            <Grid container spacing={3} sx={{ position: 'relative', zIndex: 1, p: { xs: 2, md: 4 } }}>
              <Grid sx={{ gridColumn: 'span 12', '@media (min-width: 900px)': { gridColumn: 'span 7' } }}>
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box 
                      sx={{ 
                        width: 60, 
                        height: 60, 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #e63946 0%, #ff6b6b 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        boxShadow: '0 4px 10px rgba(230, 57, 70, 0.3)'
                      }}
                    >
                      <CameraAltIcon sx={{ color: 'white', fontSize: 30 }} />
                    </Box>
                    <Box>
                      <Typography 
                        variant="overline" 
                        sx={{ 
                          color: theme.palette.primary.main, 
                          fontWeight: 700,
                          letterSpacing: 1.5,
                          fontSize: { xs: '0.7rem', md: '0.75rem' }
                        }}
                      >
                        ENDOSCOPIE
                      </Typography>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 800, 
                          color: 'text.primary',
                          fontSize: { xs: '1.25rem', md: '1.5rem' },
                          lineHeight: { xs: 1.2, md: 1.3 }
                        }}
                      >
                        Test d'Endoscopie
                      </Typography>
                      <Typography 
                        variant="subtitle2" 
                        color="text.secondary" 
                        sx={{ 
                          fontStyle: 'italic',
                          mt: 0.5,
                          fontSize: { xs: '0.85rem', md: '0.95rem' }
                        }}
                      >
                        Réalisé moteur à l'arrêt, avant la mise sur banc d'essai
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      bgcolor: 'rgba(230, 57, 70, 0.08)',
                      border: '1px solid rgba(230,57,70,0.2)',
                      borderRadius: '999px',
                      px: 1.5,
                      py: 0.4,
                      mb: { xs: 2, md: 3 }
                    }}
                  >
                    <LooksTwoIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      Étape 2 sur 5
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontSize: { xs: '1rem', md: '1.05rem' },
                      lineHeight: { xs: 1.6, md: 1.8 },
                      color: 'text.secondary',
                      mb: { xs: 3, md: 4 }
                    }}
                  >
                    L'endoscopie est une technique d'inspection visuelle qui permet d'examiner l'intérieur des cylindres sans démonter le moteur. Nous utilisons une caméra endoscopique 4K avec tête à 360° pour inspecter minutieusement l'état des chemises de cylindres et des soupapes. Cette méthode nous permet de détecter des problèmes qui ne seraient pas visibles lors d'une inspection extérieure.
                  </Typography>
                  
                  <Accordion disableGutters defaultExpanded={!isXs} sx={{ mb: 2, borderRadius: 2, border: '1px solid rgba(244, 67, 54, 0.2)', bgcolor: 'rgba(244, 67, 54, 0.05)' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#d32f2f' }}>
                        Risques en cas d'échec du test
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.7 }}>
                        <strong>Problèmes potentiels :</strong> Rayures sur les parois des cylindres, dépôts de carbone excessifs, soupapes endommagées ou déformées.
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                        <strong>Conséquences :</strong> Des cylindres rayés peuvent causer une perte de compression et une consommation d'huile excessive. Des soupapes endommagées peuvent entraîner une perte de puissance, une consommation de carburant accrue et des ratés d'allumage. Les dépôts de carbone excessifs peuvent provoquer une surchauffe, une détonation prématurée et une diminution des performances du moteur.
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                  
                  <Accordion disableGutters defaultExpanded={!isXs} sx={{ mb: 2, borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.06)' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Processus d'inspection
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, gap: 2, overflowX: { xs: 'auto', md: 'visible' }, scrollSnapType: { xs: 'x mandatory', md: 'none' }, pb: { xs: 1, md: 0 } }}>
                      <Box 
                        sx={{ 
                          display: 'flex',
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'rgba(255,255,255,0.7)',
                          border: '1px solid rgba(0,0,0,0.05)',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          minWidth: { xs: 260, md: 'auto' },
                          scrollSnapAlign: { xs: 'start', md: 'none' },
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
                          }
                        }}
                      >
                        <Box 
                          sx={{ 
                            minWidth: 40, 
                            height: 40, 
                            borderRadius: '50%', 
                            bgcolor: theme.palette.primary.main,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            fontWeight: 700
                          }}
                        >
                          <LooksOneIcon />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            Inspection des parois des cylindres
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Détection d'éventuelles rayures ou anomalies sur les surfaces internes
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box 
                        sx={{ 
                          display: 'flex',
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'rgba(255,255,255,0.7)',
                          border: '1px solid rgba(0,0,0,0.05)',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
                          }
                        }}
                      >
                        <Box 
                          sx={{ 
                            minWidth: 40, 
                            height: 40, 
                            borderRadius: '50%', 
                            bgcolor: theme.palette.primary.main,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            fontWeight: 700
                          }}
                        >
                          <LooksTwoIcon />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            Vérification des soupapes et chemises
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Examen minutieux de l'état et de l'usure des composants critiques
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box 
                        sx={{ 
                          display: 'flex',
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'rgba(255,255,255,0.7)',
                          border: '1px solid rgba(0,0,0,0.05)',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
                          }
                        }}
                      >
                        <Box 
                          sx={{ 
                            minWidth: 40, 
                            height: 40, 
                            borderRadius: '50%', 
                            bgcolor: theme.palette.primary.main,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            fontWeight: 700
                          }}
                        >
                          <Looks3Icon />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            Test d'étanchéité (Leak-down)
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Mesure du pourcentage de fuite et localisation (soupapes, segments, joint de culasse)
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              </Grid>
              
              {/* Image grid item removed */}
            </Grid>
          </Box>
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <Box 
            sx={{ 
              position: 'relative',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
              borderRadius: 3,
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              mb: 4
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '40%',
                height: '100%',
                background: 'linear-gradient(135deg, rgba(230, 57, 70, 0.03) 0%, rgba(230, 57, 70, 0.08) 100%)',
                clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
                zIndex: 0,
                display: { xs: 'none', md: 'block' }
              }}
            />
            
            <Grid container spacing={3} sx={{ position: 'relative', zIndex: 1, p: { xs: 2, md: 4 } }}>
              <Grid sx={{ gridColumn: 'span 12', '@media (min-width: 900px)': { gridColumn: 'span 7' } }}>
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box 
                      sx={{ 
                        width: 60, 
                        height: 60, 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #e63946 0%, #ff6b6b 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        boxShadow: '0 4px 10px rgba(230, 57, 70, 0.3)'
                      }}
                    >
                      <CompressIcon sx={{ color: 'white', fontSize: 30 }} />
                    </Box>
                    <Box>
                      <Typography 
                        variant="overline" 
                        sx={{ 
                          color: theme.palette.primary.main, 
                          fontWeight: 600,
                          letterSpacing: 1.5
                        }}
                      >
                        COMPRESSION / LEAK TEST
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        Compression / Leak test
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Réalisé sur banc d'essai avec moteur en rotation (sans démarrage)
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      bgcolor: 'rgba(230, 57, 70, 0.1)',
                      borderRadius: '50px',
                      px: 2,
                      py: 0.5,
                      mb: 3
                    }}
                  >
                    <Looks3Icon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                    <Typography variant="body2" fontWeight={600} color="primary">
                      Étape 3 sur 5 dans notre processus de test
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontSize: { xs: '1rem', md: '1.05rem' },
                      lineHeight: { xs: 1.6, md: 1.8 },
                      color: 'text.secondary',
                      mb: { xs: 3, md: 4 }
                    }}
                  >
                    Le test de compression mesure la pression maximale atteinte dans chaque cylindre pendant le cycle de compression. En complément, le leak test (test d'étanchéité) évalue le pourcentage de fuite d'air dans chaque cylindre afin d'identifier la cause (soupapes, segments, joint de culasse). Ces mesures assurent une étanchéité correcte et homogène, gage d'un fonctionnement équilibré du moteur et d'une combustion efficace.
                  </Typography>
                  
                  <Accordion disableGutters defaultExpanded={!isXs} sx={{ mb: 2, borderRadius: 2, border: '1px solid rgba(244, 67, 54, 0.2)', bgcolor: 'rgba(244, 67, 54, 0.05)' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#d32f2f' }}>
                        Risques en cas d'échec du test
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.7 }}>
                        <strong>Problèmes potentiels :</strong> Compression faible ou inégale entre les cylindres, indiquant des problèmes d'étanchéité.
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                        <strong>Conséquences :</strong> Une faible compression peut entraîner des démarrages difficiles, une perte de puissance significative, une consommation excessive de carburant et d'huile. Des valeurs inégales entre les cylindres peuvent provoquer des vibrations, un fonctionnement irrégulier et une usure accélérée des composants. Dans les cas graves, cela peut mener à une panne complète du moteur peu après l'installation.
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                  
                  <Accordion disableGutters defaultExpanded={!isXs} sx={{ mb: 2, borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.06)' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6" sx={{ mb: 0, fontWeight: 600, color: 'text.primary' }}>
                        Processus d'inspection
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, gap: 2, overflowX: { xs: 'auto', md: 'visible' }, scrollSnapType: { xs: 'x mandatory', md: 'none' }, pb: { xs: 1, md: 0 } }}>
                      <Box 
                        sx={{ 
                          display: 'flex',
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'rgba(255,255,255,0.7)',
                          border: '1px solid rgba(0,0,0,0.05)',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          minWidth: { xs: 260, md: 'auto' },
                          scrollSnapAlign: { xs: 'start', md: 'none' },
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
                          }
                        }}
                      >
                        <Box 
                          sx={{ 
                            minWidth: 40, 
                            height: 40, 
                            borderRadius: '50%', 
                            bgcolor: theme.palette.primary.main,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            fontWeight: 700
                          }}
                        >
                          <LooksOneIcon />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            Mesure de la pression maximale atteinte dans chaque cylindre
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Évaluation de l'étanchéité des segments, des soupapes et des joints de culasse
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box 
                        sx={{ 
                          display: 'flex',
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'rgba(255,255,255,0.7)',
                          border: '1px solid rgba(0,0,0,0.05)',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
                          }
                        }}
                      >
                        <Box 
                          sx={{ 
                            minWidth: 40, 
                            height: 40, 
                            borderRadius: '50%', 
                            bgcolor: theme.palette.primary.main,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            fontWeight: 700
                          }}
                        >
                          <LooksTwoIcon />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            Évaluation de l'étanchéité des segments, des soupapes et des joints de culasse
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Vérification de la compression optimale et homogène entre tous les cylindres
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    </AccordionDetails>
                  </Accordion>

                  <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mt: 2 }}>
                    <Button variant="contained" color="primary" sx={{ textTransform: 'none', borderRadius: 2 }} component="a" href="/demande-devis">
                      Demander un devis
                    </Button>
                  </Box>
                </Box>
              </Grid>
              
              {/* Image grid item removed */}
            </Grid>
          </Box>
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <Box 
            sx={{ 
              position: 'relative',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
              borderRadius: 3,
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              mb: 4
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '40%',
                height: '100%',
                background: 'linear-gradient(135deg, rgba(230, 57, 70, 0.03) 0%, rgba(230, 57, 70, 0.08) 100%)',
                clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
                zIndex: 0,
                display: { xs: 'none', md: 'block' }
              }}
            />
            
            <Grid container spacing={3} sx={{ position: 'relative', zIndex: 1, p: { xs: 2, md: 4 } }}>
              <Grid sx={{ gridColumn: 'span 12', '@media (min-width: 900px)': { gridColumn: 'span 7' } }}>
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box 
                      sx={{ 
                        width: 60, 
                        height: 60, 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #e63946 0%, #ff6b6b 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        boxShadow: '0 4px 10px rgba(230, 57, 70, 0.3)'
                      }}
                    >
                      <OpacityIcon sx={{ color: 'white', fontSize: 30 }} />
                    </Box>
                    <Box>
                      <Typography 
                        variant="overline" 
                        sx={{ 
                          color: theme.palette.primary.main, 
                          fontWeight: 600,
                          letterSpacing: 1.5
                        }}
                      >
                        TEST DE PRESSION D'HUILE
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        Test de pression d'huile
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Réalisé sur banc d'essai avec moteur en rotation à environ 1000 tours/minute
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      bgcolor: 'rgba(230, 57, 70, 0.1)',
                      borderRadius: '50px',
                      px: 2,
                      py: 0.5,
                      mb: 3
                    }}
                  >
                    <Looks4Icon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                    <Typography variant="body2" fontWeight={600} color="primary">
                      Étape 4 sur 5 dans notre processus de test
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontSize: { xs: '1rem', md: '1.05rem' },
                      lineHeight: { xs: 1.6, md: 1.8 },
                      color: 'text.secondary',
                      mb: { xs: 3, md: 4 }
                    }}
                  >
                    La mesure de la pression d'huile est cruciale pour garantir une lubrification adéquate de toutes les pièces mobiles du moteur. Nous testons la pression à un régime moyen d'environ 1000 tours/minute pour vérifier que la pompe à huile fonctionne correctement et que les canalisations ne présentent pas de restrictions. Une pression d'huile optimale protège le moteur contre l'usure prématurée et assure sa longévité, même dans des conditions d'utilisation intensives.
                  </Typography>
                  
                  <Accordion disableGutters defaultExpanded={!isXs} sx={{ mb: 2, borderRadius: 2, border: '1px solid rgba(244, 67, 54, 0.2)', bgcolor: 'rgba(244, 67, 54, 0.05)' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6" sx={{ mb: 0, fontWeight: 600, color: '#d32f2f' }}>
                        Risques en cas d'échec du test
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.7 }}>
                        <strong>Problèmes potentiels :</strong> Pression d'huile insuffisante ou excessive, variations anormales de la pression.
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                        <strong>Conséquences :</strong> Une pression d'huile insuffisante est l'une des causes les plus graves de défaillance moteur. Elle entraîne une lubrification inadéquate des paliers de vilebrequin, des arbres à cames et d'autres composants critiques, causant une friction excessive et une surchauffe. Cela peut provoquer une usure rapide des pièces mobiles, des grippages et ultimement une casse moteur catastrophique en quelques minutes de fonctionnement. Une pression excessive peut quant à elle forcer l'huile à travers les joints et causer des fuites importantes.
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                  
                  <Accordion disableGutters defaultExpanded={!isXs} sx={{ mb: 2, borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.06)' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6" sx={{ mb: 0, fontWeight: 600, color: 'text.primary' }}>
                        Processus d'inspection
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, gap: 2, overflowX: { xs: 'auto', md: 'visible' }, scrollSnapType: { xs: 'x mandatory', md: 'none' }, pb: { xs: 1, md: 0 } }}>
                      <Box 
                        sx={{ 
                          display: 'flex',
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'rgba(255,255,255,0.7)',
                          border: '1px solid rgba(0,0,0,0.05)',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          minWidth: { xs: 260, md: 'auto' },
                          scrollSnapAlign: { xs: 'start', md: 'none' },
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
                          }
                        }}
                      >
                        <Box 
                          sx={{ 
                            minWidth: 40, 
                            height: 40, 
                            borderRadius: '50%', 
                            bgcolor: theme.palette.primary.main,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            fontWeight: 700
                          }}
                        >
                          <LooksOneIcon />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            Mesure de la pression d'huile à un régime moyen d'environ 1000 tours/minute
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Vérification de la pompe à huile et des canalisations
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    </AccordionDetails>
                  </Accordion>

                  <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mt: 2 }}>
                    <Button variant="contained" color="primary" sx={{ textTransform: 'none', borderRadius: 2 }} component="a" href="/demande-devis">
                      Demander un devis
                    </Button>
                  </Box>
                </Box>
              </Grid>
              
              {/* Image grid item removed */}
            </Grid>
          </Box>
        </TabPanel>
        <TabPanel value={tabValue} index={4}>
          <Box 
            sx={{ 
              position: 'relative',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
              borderRadius: 3,
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              mb: 4
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '40%',
                height: '100%',
                background: 'linear-gradient(135deg, rgba(230, 57, 70, 0.03) 0%, rgba(230, 57, 70, 0.08) 100%)',
                clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
                zIndex: 0,
                display: { xs: 'none', md: 'block' }
              }}
            />
            
            <Grid container spacing={3} sx={{ position: 'relative', zIndex: 1, p: { xs: 2, md: 4 } }}>
              <Grid sx={{ gridColumn: 'span 12', '@media (min-width: 900px)': { gridColumn: 'span 7' } }}>
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box 
                      sx={{ 
                        width: 60, 
                        height: 60, 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #e63946 0%, #ff6b6b 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        boxShadow: '0 4px 10px rgba(230, 57, 70, 0.3)'
                      }}
                    >
                      <ScienceIcon sx={{ color: 'white', fontSize: 30 }} />
                    </Box>
                    <Box>
                      <Typography 
                        variant="overline" 
                        sx={{ 
                          color: theme.palette.primary.main, 
                          fontWeight: 600,
                          letterSpacing: 1.5
                        }}
                      >
                        ANALYSE D'HUILE
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        Analyse d'huile
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Échantillon d'huile prélevé et analysé (présence de particules, dilution, traces de liquide de refroidissement)
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      bgcolor: 'rgba(230, 57, 70, 0.1)',
                      borderRadius: '50px',
                      px: 2,
                      py: 0.5,
                      mb: 3
                    }}
                  >
                    <Looks5Icon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                    <Typography variant="body2" fontWeight={600} color="primary">
                      Étape 5 sur 5 dans notre processus de test
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontSize: { xs: '1rem', md: '1.05rem' },
                      lineHeight: { xs: 1.6, md: 1.8 },
                      color: 'text.secondary',
                      mb: { xs: 3, md: 4 }
                    }}
                  >
                    L'analyse d'huile permet de détecter des contaminants et indices d'usure invisibles à l'œil nu. Nous vérifions la présence de particules métalliques (usure interne), de dilution par le carburant, d'eau/liquide de refroidissement (joint de culasse), ainsi que la viscosité et l'aspect général. Cette analyse complète les mesures physiques en apportant une vision chimique de l'état interne du moteur.
                  </Typography>
                  
                  <Accordion disableGutters defaultExpanded={!isXs} sx={{ mb: 2, borderRadius: 2, border: '1px solid rgba(244, 67, 54, 0.2)', bgcolor: 'rgba(244, 67, 54, 0.05)' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6" sx={{ mb: 0, fontWeight: 600, color: '#d32f2f' }}>
                        Risques en cas d'échec du test
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.7 }}>
                        <strong>Problèmes potentiels :</strong> Particules métalliques, dilution de l'huile par le carburant, présence d'eau/LLR, viscosité anormale.
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                        <strong>Conséquences :</strong> Usure accélérée des paliers et segments, perte de lubrification, risque de serrage, corrosion interne. En cas de LLR, suspicion de joint de culasse ou fissure (risque de casse à court terme).
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                  
                  <Accordion disableGutters defaultExpanded={!isXs} sx={{ mb: 2, borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.06)' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6" sx={{ mb: 0, fontWeight: 600, color: 'text.primary' }}>
                        Processus d'inspection
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, gap: 2, overflowX: { xs: 'auto', md: 'visible' }, scrollSnapType: { xs: 'x mandatory', md: 'none' }, pb: { xs: 1, md: 0 } }}>
                        <Box 
                          sx={{ 
                            display: 'flex',
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'rgba(255,255,255,0.7)',
                            border: '1px solid rgba(0,0,0,0.05)',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            minWidth: { xs: 260, md: 'auto' },
                            scrollSnapAlign: { xs: 'start', md: 'none' },
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
                            }
                          }}
                        >
                          <Box 
                            sx={{ 
                              minWidth: 40, 
                              height: 40, 
                              borderRadius: '50%', 
                              bgcolor: theme.palette.primary.main,
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 2,
                              fontWeight: 700
                            }}
                          >
                            <LooksOneIcon />
                          </Box>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              Prélèvement d'un échantillon d'huile et examen visuel
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Vérification de la couleur, de la viscosité et de la présence de particules (limaille)
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </AccordionDetails>
                  </Accordion>

                  <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mt: 2 }}>
                    <Button variant="contained" color="primary" sx={{ textTransform: 'none', borderRadius: 2 }} onClick={() => {
                      const el = document.getElementById('devis');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}>
                      Demander un devis
                    </Button>
                  </Box>
                </Box>
              </Grid>
              
              {/* Image grid item removed */}
            </Grid>
          </Box>
        </TabPanel>
        <TabPanel value={tabValue} index={5}>
          <Box 
            sx={{ 
              position: 'relative',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
              borderRadius: 3,
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              mb: 4
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '40%',
                height: '100%',
                background: 'linear-gradient(135deg, rgba(230, 57, 70, 0.03) 0%, rgba(230, 57, 70, 0.08) 100%)',
                clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
                zIndex: 0,
                display: { xs: 'none', md: 'block' }
              }}
            />
            
            <Grid container spacing={3} sx={{ position: 'relative', zIndex: 1, p: { xs: 2, md: 4 } }}>
              <Grid sx={{ gridColumn: 'span 12' }}>
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box 
                      sx={{ 
                        width: 60, 
                        height: 60, 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #e63946 0%, #ff6b6b 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        boxShadow: '0 4px 10px rgba(230, 57, 70, 0.3)'
                      }}
                    >
                      <AssessmentIcon sx={{ color: 'white', fontSize: 30 }} />
                    </Box>
                    <Box>
                      <Typography 
                        variant="overline" 
                        sx={{ 
                          color: theme.palette.primary.main, 
                          fontWeight: 600,
                          letterSpacing: 1.5
                        }}
                      >
                        RAPPORT DE TEST
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        Exemple de rapport de test
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Document fourni à chaque acheteur
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      bgcolor: 'rgba(230, 57, 70, 0.1)',
                      borderRadius: '50px',
                      px: 2,
                      py: 0.5,
                      mb: 3
                    }}
                  >
                    <Looks5Icon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                    <Typography variant="body2" fontWeight={600} color="primary">
                      Étape 5 sur 5 dans notre processus de test
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontSize: '1.05rem',
                      lineHeight: 1.8,
                      color: 'text.secondary',
                      mb: 4
                    }}
                  >
                    Chaque moteur vendu par Car Parts Pro est accompagné d'un rapport de test détaillé qui documente les résultats de tous les tests effectués. Ce document certifie la qualité et la fiabilité du moteur, et sert de référence pour l'acheteur. Voici un exemple de rapport de test pour un moteur BMW N54 3.0L Twin Turbo.
                  </Typography>
                  
                  <Paper sx={{ 
                    p: 4, 
                    mb: 4, 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                    borderRadius: 2,
                    border: '1px solid rgba(0,0,0,0.05)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <Box sx={{ 
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: 150,
                      height: 150,
                      background: 'linear-gradient(135deg, rgba(230, 57, 70, 0.1) 0%, rgba(230, 57, 70, 0) 70%)',
                      borderRadius: '0 0 0 100%',
                      zIndex: 0
                    }} />
                    
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 4,
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 2, sm: 0 }
                      }}>
                        <Box>
                          <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
                            Rapport de Test Moteur
                          </Typography>
                          <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                            Car Parts Pro - Certification Qualité
                          </Typography>
                        </Box>
                        <Box sx={{ 
                          p: 2, 
                          border: '1px solid rgba(0,0,0,0.1)', 
                          borderRadius: 1,
                          minWidth: 150,
                          textAlign: 'center'
                        }}>
                          <Typography variant="overline" display="block" gutterBottom>
                            N° de référence
                          </Typography>
                          <Typography variant="h6" fontWeight={700}>
                            CPP-2025-04562
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Informations du moteur
                        </Typography>
                        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                          <Table size="small">
                            <TableBody>
                              <TableRow>
                                <TableCell component="th" width="30%" sx={{ bgcolor: 'rgba(0,0,0,0.02)', fontWeight: 600 }}>
                                  Marque / Modèle
                                </TableCell>
                                <TableCell>BMW N54 3.0L Twin Turbo</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell component="th" sx={{ bgcolor: 'rgba(0,0,0,0.02)', fontWeight: 600 }}>
                                  Numéro de série
                                </TableCell>
                                <TableCell>N54D30A-98752431</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell component="th" sx={{ bgcolor: 'rgba(0,0,0,0.02)', fontWeight: 600 }}>
                                  Année de fabrication
                                </TableCell>
                                <TableCell>2012</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell component="th" sx={{ bgcolor: 'rgba(0,0,0,0.02)', fontWeight: 600 }}>
                                  Kilométrage
                                </TableCell>
                                <TableCell>85 421 km</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell component="th" sx={{ bgcolor: 'rgba(0,0,0,0.02)', fontWeight: 600 }}>
                                  Date des tests
                                </TableCell>
                                <TableCell>18-19 Avril 2025</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell component="th" sx={{ bgcolor: 'rgba(0,0,0,0.02)', fontWeight: 600 }}>
                                  Technicien responsable
                                </TableCell>
                                <TableCell>Jean Dupont (Maître Technicien)</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                      
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Résultats des tests
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                          <Table>
                            <TableHead sx={{ bgcolor: 'rgba(230, 57, 70, 0.08)' }}>
                              <TableRow>
                                <TableCell width="25%">Test</TableCell>
                                <TableCell width="50%">Résultat</TableCell>
                                <TableCell width="25%" align="center">Statut</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Inspection visuelle</TableCell>
                                <TableCell>Aucune fuite d'huile ou de liquide de refroidissement détectée. État général excellent.</TableCell>
                                <TableCell align="center" sx={{ color: 'success.main', fontWeight: 700 }}>VALIDÉ</TableCell>
                              </TableRow>
                              <TableRow sx={{ '&:nth-of-type(odd)': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
                                <TableCell sx={{ fontWeight: 600 }}>Endoscopie</TableCell>
                                <TableCell>Parois des cylindres en excellent état. Aucune rayure ou usure anormale détectée.</TableCell>
                                <TableCell align="center" sx={{ color: 'success.main', fontWeight: 700 }}>VALIDÉ</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Test de compression</TableCell>
                                <TableCell>Cyl 1: 13.2 bar, Cyl 2: 13.4 bar, Cyl 3: 13.3 bar, Cyl 4: 13.2 bar, Cyl 5: 13.5 bar, Cyl 6: 13.3 bar</TableCell>
                                <TableCell align="center" sx={{ color: 'success.main', fontWeight: 700 }}>VALIDÉ</TableCell>
                              </TableRow>
                              <TableRow sx={{ '&:nth-of-type(odd)': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
                                <TableCell sx={{ fontWeight: 600 }}>Test de pression d'huile</TableCell>
                                <TableCell>4.2 bar à 1000 tr/min. Conforme aux spécifications du constructeur.</TableCell>
                                <TableCell align="center" sx={{ color: 'success.main', fontWeight: 700 }}>VALIDÉ</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Analyse d'huile</TableCell>
                                <TableCell>Aucune particule métallique détectée. Viscosité conforme, absence d'eau/LLR.</TableCell>
                                <TableCell align="center" sx={{ color: 'success.main', fontWeight: 700 }}>VALIDÉ</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                      
                      <Box sx={{ 
                        p: 3, 
                        bgcolor: 'rgba(46, 125, 50, 0.08)', 
                        borderRadius: 2,
                        border: '1px solid rgba(46, 125, 50, 0.2)',
                        mb: 3
                      }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'success.main' }}>
                          Conclusion
                        </Typography>
                        <Typography variant="body1">
                          Le moteur BMW N54 3.0L Twin Turbo référencé CPP-2025-04562 a passé avec succès tous les tests de notre protocole de contrôle qualité. Il est certifié conforme à nos standards de qualité et bénéficie de notre garantie de 1 an.
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        pt: 3,
                        borderTop: '1px dashed rgba(0,0,0,0.1)'
                      }}>
                        <Typography variant="body2" color="text.secondary">
                          Document généré le 20/04/2025
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="primary">
                          Car Parts Pro 
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

      </Container>
      
      {/* Modal pour afficher l'image en plein écran */}
      <Modal
        open={selectedImage !== null}
        onClose={handleCloseImage}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Box sx={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
          <IconButton
            onClick={handleCloseImage}
            sx={{
              position: 'absolute',
              top: -40,
              right: -10,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt="Endoscopie détaillée"
              sx={{
                maxWidth: '100%',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
              }}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default TestsGallery;

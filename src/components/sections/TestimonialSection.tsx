import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Avatar, 
  Rating, 
  Divider, 
  useTheme, 
  Tabs, 
  Tab, 
  Button,
  Card,
  CardMedia,
  CardContent,
  Link,
  Chip
} from '@mui/material';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ImageIcon from '@mui/icons-material/Image';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

const QuoteIcon = styled(FormatQuoteIcon)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: 40,
  opacity: 0.4
}));

const TestimonialItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  borderRadius: theme.spacing(2),
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
  }
}));

const PagesJaunesItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  borderRadius: theme.spacing(2),
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  overflow: 'hidden',
  borderLeft: `4px solid #FFCC00`, // Couleur PagesJaunes
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
  }
}));

const UGCCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
  }
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3,
    borderRadius: 3
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '1rem',
    minWidth: 120,
    padding: theme.spacing(1.5, 2),
    '&.Mui-selected': {
      color: theme.palette.primary.main
    }
  }
}));

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
      id={`testimonial-tabpanel-${index}`}
      aria-labelledby={`testimonial-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const TestimonialSection: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const testimonials = [
    {
      name: "Jean Dupont",
      position: "Directeur, Garage Auto Premium",
      avatar: "/images/Client qui a recupéré un moteur.jpg",
      quote: "Depuis que nous travaillons avec Car Parts France, nous n'avons plus aucun souci avec les moteurs d'occasion. Les rapports de tests sont d'une précision remarquable et nous permettent d'avoir une confiance totale dans les pièces que nous installons.",
      rating: 5,
      company: "Garage Auto Premium",
      location: "Lyon"
    },
    {
      name: "Michel Martin",
      position: "Gérant, Atelier Mécanique Express",
      avatar: "/images/Client qui a recupéré un moteur.jpg",
      quote: "La qualité des moteurs et le professionnalisme du service sont exceptionnels. Le rapport détaillé fourni avec chaque moteur nous permet de rassurer nos clients et de justifier notre travail.",
      rating: 5,
      company: "Atelier Mécanique Express",
      location: "Paris"
    },
    {
      name: "Sophie Leroy",
      position: "Responsable Atelier, Concession MultiMarques",
      avatar: "/images/Client qui a recupéré un moteur.jpg",
      quote: "Nous avons réduit nos délais d'intervention de 30% grâce aux moteurs testés de Car Parts France. Plus besoin de vérifications supplémentaires, nous avons une confiance totale dans leur processus de contrôle.",
      rating: 5,
      company: "Concession MultiMarques",
      location: "Marseille"
    }
  ];

  const pagesJaunesReviews = [
    {
      name: "Pierre Durand",
      date: "15 mars 2025",
      rating: 5,
      comment: "Service rapide et professionnel. Le moteur que j'ai acheté fonctionne parfaitement depuis 6 mois. Je recommande vivement !",
      verified: true
    },
    {
      name: "Marie Lambert",
      date: "2 février 2025",
      rating: 5,
      comment: "Excellent rapport qualité/prix. La livraison a été effectuée dans les délais annoncés et le moteur correspond exactement à la description.",
      verified: true
    },
    {
      name: "Thomas Petit",
      date: "18 janvier 2025",
      rating: 4,
      comment: "Très satisfait de mon achat. Le service client est réactif et a su répondre à toutes mes questions. Je retire une étoile car la livraison a pris un jour de plus que prévu.",
      verified: true
    },
    {
      name: "Laure Moreau",
      date: "5 décembre 2024",
      rating: 5,
      comment: "Parfait ! J'avais des doutes sur l'achat d'un moteur d'occasion mais je suis totalement rassurée. Documentation complète et tests rigoureux.",
      verified: true
    }
  ];

  const ugcContent = [
    {
      type: "photo",
      title: "Installation réussie",
      image: "/images/Client qui a recupéré un moteur.jpg",
      author: "Garage Dupont",
      date: "Mars 2025",
      likes: 24
    },
    {
      type: "photo",
      title: "Moteur BMW prêt à être installé",
      image: "/images/Client qui a recupéré un moteur.jpg",
      author: "Auto Service Plus",
      date: "Février 2025",
      likes: 18
    },
    {
      type: "video",
      title: "Test du moteur avant installation",
      image: "/images/Client qui a recupéré un moteur.jpg",
      author: "Mécanique Expert",
      date: "Janvier 2025",
      likes: 42
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <Box 
      sx={{ 
        py: 12, 
        background: `linear-gradient(180deg, rgba(29,53,87,0.02) 0%, rgba(29,53,87,0.04) 100%)`,
        position: 'relative',
        overflow: 'hidden',
        mt: 5, // Ajout d'une marge positive pour éviter la superposition
        zIndex: 1 // Augmentation du z-index pour s'assurer que cette section est au-dessus des autres
      }}
    >
      {/* Élément de transition en haut de la section */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '80px',
          background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
          zIndex: 0,
        }}
      />
      
      {/* Éléments décoratifs */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: { xs: 150, md: 250 },
          height: { xs: 150, md: 250 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.palette.primary.main}08 0%, ${theme.palette.primary.main}00 70%)`,
          zIndex: 0,
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          width: { xs: 100, md: 200 },
          height: { xs: 100, md: 200 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.palette.secondary.main}08 0%, ${theme.palette.secondary.main}00 70%)`,
          zIndex: 0,
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box 
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{ textAlign: 'center', mb: 6 }}
        >
          <Box 
            sx={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              mb: 2,
              px: 2,
              py: 1,
              borderRadius: 2,
              bgcolor: 'rgba(29, 53, 87, 0.05)'
            }}
          >
            <VerifiedUserIcon sx={{ color: theme.palette.secondary.main, mr: 1, fontSize: 20 }} />
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 600, 
                color: theme.palette.secondary.main,
                letterSpacing: 1,
                fontSize: '0.875rem'
              }}
            >
              TÉMOIGNAGES CLIENTS
            </Typography>
          </Box>
          
          <Typography 
            variant="h2" 
            component="h2" 
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Ils nous font confiance
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              mb: 4, 
              maxWidth: 700, 
              mx: 'auto',
              fontSize: '1.1rem',
              lineHeight: 1.6
            }}
          >
            Découvrez ce que nos clients disent de notre service
            et pourquoi ils choisissent Car Parts France pour leurs moteurs.
          </Typography>
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <StyledTabs 
            value={tabValue} 
            onChange={handleTabChange} 
            centered
            variant="fullWidth"
          >
            <Tab label="Témoignages" id="testimonial-tab-0" aria-controls="testimonial-tabpanel-0" />
            <Tab label="Avis PagesJaunes" id="testimonial-tab-1" aria-controls="testimonial-tabpanel-1" />
            <Tab label="Photos & Vidéos Clients" id="testimonial-tab-2" aria-controls="testimonial-tabpanel-2" />
          </StyledTabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Box 
            component={motion.div}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                md: 'repeat(3, 1fr)' 
              }, 
              gap: 4 
            }}
          >
            {testimonials.map((testimonial, index) => (
              <Box 
                component={motion.div}
                variants={itemVariants}
                key={index}
              >
                <TestimonialItem elevation={2}>
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '6px', 
                      background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                    }}
                  />
                  
                  <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
                    <QuoteIcon />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={testimonial.rating} readOnly sx={{ color: theme.palette.primary.main }} />
                    <Typography variant="body2" sx={{ ml: 1, color: theme.palette.text.secondary }}>
                      5.0
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 4, 
                      fontStyle: 'italic', 
                      flexGrow: 1,
                      lineHeight: 1.7,
                      fontSize: '1rem',
                      color: theme.palette.text.primary,
                      position: 'relative',
                      pl: 1
                    }}
                  >
                    "{testimonial.quote}"
                  </Typography>
                  
                  <Divider sx={{ mb: 3 }} />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      sx={{ 
                        width: 60, 
                        height: 60, 
                        mr: 2,
                        border: `2px solid ${theme.palette.primary.main}20`
                      }}
                    />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.position}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.primary.main, fontWeight: 500, fontSize: '0.75rem' }}>
                        {testimonial.location}
                      </Typography>
                    </Box>
                  </Box>
                </TestimonialItem>
              </Box>
            ))}
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box 
            component={motion.div}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            sx={{ mb: 4 }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 4,
                p: 3,
                borderRadius: 2,
                bgcolor: 'rgba(255, 204, 0, 0.05)',
                border: '1px solid rgba(255, 204, 0, 0.2)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  component="img"
                  src="/images/pagesjaunes-logo.png"
                  alt="PagesJaunes"
                  sx={{ 
                    height: 40, 
                    mr: 2,
                    display: { xs: 'none', sm: 'block' }
                  }}
                />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                    Note globale sur PagesJaunes
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Rating 
                      value={4.8} 
                      precision={0.1} 
                      readOnly 
                      sx={{ 
                        color: '#FFCC00',
                        mr: 1
                      }} 
                    />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      4.8/5
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      (42 avis)
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Button 
                variant="outlined" 
                component={Link}
                href="https://www.pagesjaunes.fr" 
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  borderColor: '#FFCC00',
                  color: '#000',
                  '&:hover': {
                    borderColor: '#FFCC00',
                    backgroundColor: 'rgba(255, 204, 0, 0.1)'
                  },
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Voir tous les avis
              </Button>
            </Box>
            
            <Box sx={{ mt: 4 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {pagesJaunesReviews.map((review, index) => (
                  <Box 
                    key={index}
                    sx={{ 
                      width: { xs: '100%', md: 'calc(50% - 12px)' },
                    }}
                  >
                    <Box 
                      component={motion.div}
                      variants={itemVariants}
                    >
                      <PagesJaunesItem elevation={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                              {review.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {review.date}
                            </Typography>
                          </Box>
                          {review.verified && (
                            <Chip 
                              size="small" 
                              label="Vérifié" 
                              sx={{ 
                                bgcolor: 'rgba(46, 125, 50, 0.1)', 
                                color: 'success.main',
                                fontWeight: 500,
                                fontSize: '0.7rem'
                              }} 
                            />
                          )}
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Rating 
                            value={review.rating} 
                            readOnly 
                            sx={{ 
                              color: '#FFCC00',
                              fontSize: '1.1rem'
                            }} 
                          />
                        </Box>
                        
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            mb: 2,
                            lineHeight: 1.6,
                            flexGrow: 1
                          }}
                        >
                          {review.comment}
                        </Typography>
                        
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'flex-end',
                            mt: 'auto'
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: '#FFCC00',
                              fontWeight: 500,
                              fontSize: '0.75rem',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <img 
                              src="/images/pagesjaunes-icon.png" 
                              alt="PagesJaunes" 
                              style={{ 
                                height: 16, 
                                marginRight: 4 
                              }} 
                            />
                            Avis PagesJaunes
                          </Typography>
                        </Box>
                      </PagesJaunesItem>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button 
                variant="outlined" 
                component={Link}
                href="https://www.pagesjaunes.fr" 
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  borderColor: '#FFCC00',
                  color: '#000',
                  '&:hover': {
                    borderColor: '#FFCC00',
                    backgroundColor: 'rgba(255, 204, 0, 0.1)'
                  },
                  display: { xs: 'block', sm: 'none' }
                }}
              >
                Voir tous les avis
              </Button>
            </Box>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Box 
            component={motion.div}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                mb: 4, 
                textAlign: 'center'
              }}
            >
              Découvrez les photos et vidéos partagées par nos clients après l'installation de nos moteurs.
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {ugcContent.map((content, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.33% - 12px)' },
                  }}
                >
                  <Box 
                    component={motion.div}
                    variants={itemVariants}
                  >
                    <UGCCard>
                      <CardMedia
                        component="img"
                        height="200"
                        image={content.image}
                        alt={content.title}
                        sx={{
                          position: 'relative',
                          '&::after': content.type === 'video' ? {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            zIndex: 1
                          } : {}
                        }}
                      />
                      {content.type === 'video' && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2
                          }}
                        >
                          <Box
                            sx={{
                              width: 0,
                              height: 0,
                              borderTop: '10px solid transparent',
                              borderBottom: '10px solid transparent',
                              borderLeft: '16px solid #e63946',
                              marginLeft: '5px'
                            }}
                          />
                        </Box>
                      )}
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', mb: 1 }}>
                          {content.title}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            Par {content.author} • {content.date}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ThumbUpIcon sx={{ fontSize: 16, color: theme.palette.primary.main, mr: 0.5 }} />
                            <Typography variant="body2" sx={{ color: theme.palette.primary.main }}>
                              {content.likes}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </UGCCard>
                  </Box>
                </Box>
              ))}
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ImageIcon />}
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  px: 3
                }}
              >
                Partagez votre expérience
              </Button>
            </Box>
          </Box>
        </TabPanel>
      </Container>
    </Box>
  );
};

export default TestimonialSection;

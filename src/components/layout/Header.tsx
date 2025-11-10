import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Box, 
  IconButton, 
  useMediaQuery,
  useTheme,
  Slide,
  Fab,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { setAdminAuthed } from '../../utils/auth';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import HomeIcon from '@mui/icons-material/Home';
import ContactsIcon from '@mui/icons-material/Contacts';
import InfoIcon from '@mui/icons-material/Info';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

// Composant Zoom personnalisé pour l'animation du bouton de retour en haut
const ZoomEffect = ({ children, in: inProp }) => {
  return (
    <Box
      sx={{
        transition: 'all 0.3s ease-in-out',
        transform: inProp ? 'scale(1)' : 'scale(0)',
        opacity: inProp ? 1 : 0,
      }}
    >
      {children}
    </Box>
  );
};

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const inAdmin = (location.pathname || '').startsWith('/admin');
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
      
      const showButton = window.scrollY > 400;
      if (showButton !== showScrollTop) {
        setShowScrollTop(showButton);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled, showScrollTop]);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleLogout = async () => {
    try {
      const base = (process.env.REACT_APP_BACKEND_URL || '').trim();
      if (base) {
        await fetch(`${base.replace(/\/$/, '')}/api/auth/logout`, { method: 'POST', credentials: 'include' });
      }
    } catch {}
    setAdminAuthed(false);
    setDrawerOpen(false);
    navigate('/admin/login', { replace: true });
  };

  const drawer = (
    <Box sx={{ width: 280, p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }} onClick={() => setDrawerOpen(false)}>
          <Box component="img" src="/images/logo.png" alt="Car Parts France" sx={{ height: 40, mr: 1 }} />
        </Box>
        <IconButton edge="end" color="inherit" aria-label="close" onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <List>
        <ListItem component={RouterLink} to="/" onClick={() => setDrawerOpen(false)}>
          <ListItemIcon>
            <HomeIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Accueil" />
        </ListItem>
        
        <ListItem component={RouterLink} to="/a-propos" onClick={() => setDrawerOpen(false)}>
          <ListItemIcon>
            <InfoIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="À propos" />
        </ListItem>
        
        <ListItem component={RouterLink} to="/contact" onClick={() => setDrawerOpen(false)}>
          <ListItemIcon>
            <ContactsIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Contact" />
        </ListItem>
        
        <ListItem component="a" href="/demande-devis" onClick={() => setDrawerOpen(false)}>
          <ListItemIcon>
            <RequestQuoteIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Demander un devis" />
        </ListItem>
        {inAdmin && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem component={RouterLink} to="/admin/devis" onClick={() => setDrawerOpen(false)}>
              <ListItemText primary="Admin · Devis" />
            </ListItem>
            <ListItem component={RouterLink} to="/admin/gallery" onClick={() => setDrawerOpen(false)}>
              <ListItemText primary="Admin · Galerie" />
            </ListItem>
            <ListItem component={RouterLink} to="/admin/engine-pages" onClick={() => setDrawerOpen(false)}>
              <ListItemText primary="Admin · Fiches moteurs" />
            </ListItem>
            <ListItem component={RouterLink} to="/admin/settings" onClick={() => setDrawerOpen(false)}>
              <ListItemText primary="Admin · Paramètres" />
            </ListItem>
            <ListItem component="button" onClick={handleLogout}>
              <ListItemIcon>
                <CloseIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Déconnexion" />
            </ListItem>
          </>
        )}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Contactez-nous directement
      </Typography>
      
      <Button 
        variant="outlined" 
        color="primary" 
        component="a" 
        href="tel:0465845488"
        startIcon={<PhoneIcon />}
        fullWidth
        sx={{ mb: 2 }}
      >
        04 65 84 54 88
      </Button>
      
      <Button 
        variant="contained" 
        color="success" 
        component="a" 
        href="https://wa.me/330756875025"
        target="_blank"
        startIcon={<WhatsAppIcon />}
        fullWidth
      >
        WhatsApp
      </Button>
    </Box>
  );

  return (
    <>
      <Slide appear={false} direction="down" in={!scrolled}>
        <AppBar 
          position="fixed" 
          color="default" 
          elevation={scrolled ? 4 : 0}
          sx={{
            transition: 'all 0.3s ease-in-out',
            bgcolor: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.98)',
            borderBottom: scrolled ? 'none' : '1px solid rgba(0, 0, 0, 0.05)',
          }}
        >
          <Container maxWidth="lg">
            <Toolbar disableGutters sx={{ py: 1 }}>
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                  <Box component="img" src="/images/logo.png" alt="Car Parts France" sx={{ height: { xs: 40, sm: 50 }, mr: 1 }} />
                </Box>
              </Box>

              {isMobile ? (
                <IconButton
                  size="large"
                  edge="end"
                  color="primary"
                  aria-label="menu"
                  onClick={handleDrawerToggle}
                >
                  <MenuIcon />
                </IconButton>
              ) : (
                inAdmin ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button component={RouterLink} to="/admin/devis" color="inherit" sx={{ fontWeight: 600 }}>Devis</Button>
                    <Button component={RouterLink} to="/admin/gallery" color="inherit" sx={{ fontWeight: 600 }}>Galerie</Button>
                    <Button component={RouterLink} to="/admin/engine-pages" color="inherit" sx={{ fontWeight: 600 }}>Fiches moteurs</Button>
                    <Button component={RouterLink} to="/admin/settings" color="inherit" sx={{ fontWeight: 600 }}>Paramètres</Button>
                    <Button variant="outlined" color="error" onClick={handleLogout} sx={{ ml: 1 }}>
                      Déconnexion
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button 
                      component={RouterLink} 
                      to="/" 
                      color="inherit" 
                      sx={{ 
                        fontWeight: 600,
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '0%',
                          height: '3px',
                          bgcolor: 'primary.main',
                          transition: 'width 0.3s ease-in-out',
                        },
                        '&:hover::after': {
                          width: '80%',
                        }
                      }}
                    >
                      Accueil
                    </Button>
                    <Button 
                      component={RouterLink} 
                      to="/a-propos" 
                      color="inherit"
                      sx={{ 
                        fontWeight: 600,
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '0%',
                          height: '3px',
                          bgcolor: 'primary.main',
                          transition: 'width 0.3s ease-in-out',
                        },
                        '&:hover::after': {
                          width: '80%',
                        }
                      }}
                    >
                      À propos
                    </Button>
                    <Button 
                      component={RouterLink} 
                      to="/contact" 
                      color="inherit"
                      sx={{ 
                        fontWeight: 600,
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '0%',
                          height: '3px',
                          bgcolor: 'primary.main',
                          transition: 'width 0.3s ease-in-out',
                        },
                        '&:hover::after': {
                          width: '80%',
                        }
                      }}
                    >
                      Contact
                    </Button>
                    <Button 
                      component="a"
                      href="/demande-devis"
                      variant="contained" 
                      color="primary" 
                      sx={{ ml: 2, px: 3 }}
                    >
                      Demander un devis
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      component="a" 
                      href="tel:0465845488"
                      startIcon={<PhoneIcon />}
                      sx={{ ml: 2 }}
                    >
                      04 65 84 54 88
                    </Button>
                    <IconButton 
                      color="success" 
                      component="a" 
                      href="https://wa.me/330756875025" 
                      target="_blank"
                      sx={{ 
                        ml: 1,
                        bgcolor: 'rgba(37, 211, 102, 0.1)',
                        '&:hover': {
                          bgcolor: 'rgba(37, 211, 102, 0.2)',
                        }
                      }}
                    >
                      <WhatsAppIcon />
                    </IconButton>
                  </Box>
                )
              )}
            </Toolbar>
          </Container>
        </AppBar>
      </Slide>
      
      <Toolbar id="back-to-top-anchor" />
      
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
      >
        {drawer}
      </Drawer>
      
      <ZoomEffect in={showScrollTop}>
        <Box
          onClick={scrollToTop}
          role="presentation"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          <Fab color="primary" size="medium" aria-label="scroll back to top">
            <KeyboardArrowUpIcon />
          </Fab>
        </Box>
      </ZoomEffect>
    </>
  );
};

export default Header;

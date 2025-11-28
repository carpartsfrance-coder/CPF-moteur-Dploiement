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
  Stack,
  Chip
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
import ScienceIcon from '@mui/icons-material/Science';
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
  const pathname = location.pathname || '/';

  const navLinks = [
    { to: '/', label: 'Accueil', icon: HomeIcon },
    { to: '/a-propos', label: 'À propos', icon: InfoIcon },
    { to: '/tests-moteurs', label: 'Tests moteurs', icon: ScienceIcon },
    { to: '/contact', label: 'Contact', icon: ContactsIcon }
  ];

  const drawerHighlights = [
    'Devis < 24h',
    'Garantie 1 an',
    'Livraison suivie'
  ];
  
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
    <Box sx={{ width: { xs: 320, sm: 360 }, height: '100%', display: 'flex', flexDirection: 'column', p: 2.5, bgcolor: 'linear-gradient(180deg, #fdfdfd 0%, #f5f6fb 100%)' }}>
      <Box sx={{ position: 'relative', borderRadius: 3, backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1f2a44 60%)', color: 'white', p: 2.5, mb: 3, overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
          <IconButton edge="end" aria-label="close" onClick={handleDrawerToggle} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '.28em', fontWeight: 700 }}>Menu</Typography>
        <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>Votre interlocuteur moteur dédié</Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
          {drawerHighlights.map((highlight) => (
            <Chip key={highlight} label={highlight} size="small" sx={{ borderRadius: '999px', bgcolor: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} />
          ))}
        </Stack>
      </Box>

      <List sx={{ mb: 1 }}>
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.to;
          return (
            <ListItem
              key={link.to}
              component={RouterLink}
              to={link.to}
              onClick={() => setDrawerOpen(false)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                px: 1.5,
                bgcolor: isActive ? 'rgba(37,99,235,0.1)' : 'transparent',
                color: isActive ? 'primary.main' : 'text.primary',
                '&:hover': { bgcolor: 'rgba(37,99,235,0.08)' }
              }}
            >
              <ListItemIcon sx={{ minWidth: 42, color: isActive ? 'primary.main' : 'text.secondary' }}>
                <Icon />
              </ListItemIcon>
              <ListItemText primary={link.label} primaryTypographyProps={{ sx: { fontWeight: 600 } }} />
            </ListItem>
          );
        })}
      </List>

      <Button
        component="a"
        href="/demande-devis"
        onClick={() => setDrawerOpen(false)}
        variant="contained"
        color="primary"
        startIcon={<RequestQuoteIcon />}
        sx={{ borderRadius: 2, py: 1.3, fontWeight: 700, mb: 2 }}
        fullWidth
      >
        Demander un devis
      </Button>

      {inAdmin && (
        <Box sx={{ bgcolor: 'white', borderRadius: 2, border: '1px solid rgba(15,23,42,0.08)', p: 1.5, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Raccourcis admin</Typography>
          <List dense disablePadding>
            {[
              { to: '/admin/devis', label: 'Admin · Devis' },
              { to: '/admin/images', label: 'Admin · Images' },
              { to: '/admin/engine-pages', label: 'Admin · Fiches moteurs' },
              { to: '/admin/blog', label: 'Admin · Blog' },
              { to: '/admin/redirects', label: 'Admin · Redirections' },
              { to: '/admin/seo-checks', label: 'Admin · Vérifs SEO' },
              { to: '/admin/settings', label: 'Admin · Paramètres' }
            ].map((item) => (
              <ListItem key={item.to} component={RouterLink} to={item.to} onClick={() => setDrawerOpen(false)} sx={{ py: 0.3 }}>
                <ListItemText primary={item.label} primaryTypographyProps={{ sx: { fontSize: '0.85rem' } }} />
              </ListItem>
            ))}
            <ListItem component="button" onClick={handleLogout} sx={{ py: 0.3 }}>
              <ListItemText primary="Déconnexion" primaryTypographyProps={{ sx: { fontSize: '0.85rem', color: 'error.main', fontWeight: 600 } }} />
            </ListItem>
          </List>
        </Box>
      )}

      <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid rgba(15,23,42,0.08)' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Contact express</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Interlocuteur dédié 6j/7 – réponse sous 24h par téléphone ou WhatsApp.
        </Typography>
        <Stack spacing={1.2}>
          <Button 
            variant="outlined" 
            color="primary" 
            component="a" 
            href="tel:0465845488"
            startIcon={<PhoneIcon />}
            fullWidth
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
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          8h30 → 19h • Nice & Rognac
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      <Slide appear={false} direction="down" in={!scrolled}>
        <AppBar 
          position="fixed" 
          color="default" 
          elevation={scrolled ? 6 : 0}
          sx={{
            transition: 'all 0.3s ease-in-out',
            bgcolor: scrolled ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.7)',
            backdropFilter: 'saturate(180%) blur(10px)',
            WebkitBackdropFilter: 'saturate(180%) blur(10px)',
            borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(0, 0, 0, 0.04)',
          }}
        >
          <Container maxWidth="lg">
            <Toolbar disableGutters sx={{ py: 0.75, minHeight: { xs: 64, md: 72 } }}>
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                  <Box component="img" src="/images/logo.png" alt="Car Parts France" sx={{ height: { xs: 40, sm: 48 }, mr: 1 }} />
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
                    <Button component={RouterLink} to="/admin/images" color="inherit" sx={{ fontWeight: 600 }}>Images</Button>
                    <Button component={RouterLink} to="/admin/engine-pages" color="inherit" sx={{ fontWeight: 600 }}>Fiches moteurs</Button>
                    <Button component={RouterLink} to="/admin/blog" color="inherit" sx={{ fontWeight: 600 }}>Blog</Button>
                    <Button component={RouterLink} to="/admin/redirects" color="inherit" sx={{ fontWeight: 600 }}>Redirections</Button>
                    <Button component={RouterLink} to="/admin/seo-checks" color="inherit" sx={{ fontWeight: 600 }}>Vérifs SEO</Button>
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
                        fontWeight: 700,
                        position: 'relative',
                        color: pathname === '/' ? 'primary.main' : 'inherit',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: pathname === '/' ? '80%' : '0%',
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
                        fontWeight: 700,
                        position: 'relative',
                        color: pathname === '/a-propos' ? 'primary.main' : 'inherit',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: pathname === '/a-propos' ? '80%' : '0%',
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
                      to="/tests-moteurs" 
                      color="inherit"
                      sx={{ 
                        fontWeight: 700,
                        position: 'relative',
                        color: pathname === '/tests-moteurs' ? 'primary.main' : 'inherit',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: pathname === '/tests-moteurs' ? '80%' : '0%',
                          height: '3px',
                          bgcolor: 'primary.main',
                          transition: 'width 0.3s ease-in-out',
                        },
                        '&:hover::after': {
                          width: '80%',
                        }
                      }}
                    >
                      Tests moteurs
                    </Button>
                    <Button 
                      component={RouterLink} 
                      to="/contact" 
                      color="inherit"
                      sx={{ 
                        fontWeight: 700,
                        position: 'relative',
                        color: pathname === '/contact' ? 'primary.main' : 'inherit',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: pathname === '/contact' ? '80%' : '0%',
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
                      sx={{ ml: 2, px: 3, borderRadius: 999, boxShadow: '0 8px 18px rgba(37, 99, 235, 0.25)', '&:hover': { boxShadow: '0 12px 26px rgba(37, 99, 235, 0.32)' } }}
                    >
                      Demander un devis
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      component="a" 
                      href="tel:0465845488"
                      startIcon={<PhoneIcon />}
                      sx={{ ml: 2, borderRadius: 999 }}
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

import React from 'react';
import { Box, Container, Typography, Avatar, Paper, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

interface Partner {
  name: string;
  city?: string;
  logo?: string;
}

const partners: Partner[] = [
  { name: 'Centre Porsche Toulon', logo: '/images/partners/logo-porsche.webp' },
  { name: 'Mougins Autosport', logo: '/images/partners/mougins-autosport.webp' },
  { name: 'Sun Motors', logo: '/images/partners/sun-motors.webp' }
];

const getInitials = (name: string) => name
  .split(' ')
  .map((n) => n[0])
  .join('')
  .slice(0, 2)
  .toUpperCase();

const InstalledBySection: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ py: { xs: 6, md: 8 }, position: 'relative', bgcolor: theme.palette.background.default }}>
      {/* Décor discret */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        viewport={{ once: true }}
        sx={{
          position: 'absolute',
          top: '8%',
          right: '6%',
          width: { xs: 90, md: 160 },
          height: { xs: 90, md: 160 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.palette.primary.main}08 0%, ${theme.palette.primary.main}00 70%)`,
          zIndex: 0,
          display: { xs: 'none', md: 'block' }
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}
        >
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.6rem', md: '2.2rem' },
              lineHeight: 1.25,
              mb: 1.5
            }}
          >
            Nos moteurs ont déjà été montés par
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
            Des garages et entreprises partenaires partout en France ont installé nos moteurs avec succès.
          </Typography>
        </Box>

        <Box sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }
        }}>
          {partners.map((p) => (
            <Box key={p.name}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 2.5, bgcolor: 'background.paper' }}>
                {p.logo ? (
                  <Box sx={{
                    p: p.name === 'Mougins Autosport' ? 1 : 0,
                    bgcolor: p.name === 'Mougins Autosport' ? 'white' : 'transparent',
                    borderRadius: 1,
                    border: p.name === 'Mougins Autosport' ? '1px solid rgba(0,0,0,0.06)' : 'none',
                    display: 'inline-flex'
                  }}>
                    <Box
                      component="img"
                      src={p.logo}
                      alt={p.name}
                      sx={{
                        width: {
                          xs: p.name === 'Mougins Autosport' ? 72 : 56,
                          md: p.name === 'Mougins Autosport' ? 120 : 88
                        },
                        height: {
                          xs: p.name === 'Mougins Autosport' ? 72 : 56,
                          md: p.name === 'Mougins Autosport' ? 120 : 88
                        },
                        borderRadius: 1,
                        objectFit: 'contain',
                        backgroundColor: 'transparent'
                      }}
                    />
                  </Box>
                ) : (
                  <Avatar sx={{ width: { xs: 56, md: 88 }, height: { xs: 56, md: 88 }, fontSize: { xs: 18, md: 24 }, bgcolor: `${theme.palette.primary.main}22`, color: theme.palette.primary.main, fontWeight: 700 }}>
                    {getInitials(p.name)}
                  </Avatar>
                )}
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {p.name}
                  </Typography>
                  {p.city && (
                    <Typography variant="body2" color="text.secondary">
                      {p.city}
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default InstalledBySection;

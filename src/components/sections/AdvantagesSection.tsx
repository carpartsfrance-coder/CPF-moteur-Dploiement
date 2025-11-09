import React from 'react';
import { Box, Container, Typography, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HistoryIcon from '@mui/icons-material/History';
import HandshakeIcon from '@mui/icons-material/Handshake';
import VerifiedIcon from '@mui/icons-material/Verified';
import DescriptionIcon from '@mui/icons-material/Description';
import GppGoodIcon from '@mui/icons-material/GppGood';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { styled } from '@mui/material/styles';

const AdvantageIcon = styled(Box)(({ theme }) => ({
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

const AdvantagesSection: React.FC = () => {
  const advantages = [
    {
      icon: <HistoryIcon />,
      title: "Ancienneté et expérience",
      description: "Plus de 10 ans d'expérience dans la fourniture de pièces automobiles d'occasion de qualité."
    },
    {
      icon: <HandshakeIcon />,
      title: "Réseau fiable de fournisseurs",
      description: "Partenariats exclusifs avec des fournisseurs sélectionnés pour la qualité de leurs pièces."
    },
    {
      icon: <VerifiedIcon />,
      title: "Contrôle qualité rigoureux",
      description: "Chaque moteur subit une batterie de tests complets avant d'être proposé à la vente."
    },
    {
      icon: <DescriptionIcon />,
      title: "Rapport de tests unique",
      description: "Documentation détaillée avec preuves vidéos et photos pour chaque moteur testé."
    },
    {
      icon: <GppGoodIcon />,
      title: "Garantie 6 mois incluse",
      description: "Tous nos moteurs sont garantis 6 mois, avec possibilité d'extension de garantie."
    },
    {
      icon: <LocalShippingIcon />,
      title: "Livraison rapide nationale",
      description: "Service de livraison sécurisée partout en France avec suivi en temps réel."
    }
  ];

  return (
    <Box sx={{ py: 10, bgcolor: '#f5f5f5' }}>
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
          Pourquoi choisir Car Parts France Pro
        </Typography>
        
        <Typography 
          variant="h5" 
          align="center" 
          color="text.secondary" 
          paragraph
          sx={{ mb: 6, maxWidth: 800, mx: 'auto' }}
        >
          Notre service exclusif pour les professionnels offre de nombreux avantages
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {advantages.map((advantage, index) => (
            <Box key={index} sx={{ flex: { xs: '1 1 100%', sm: '1 1 50%', md: '1 1 33.33333333333333%' } }}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <AdvantageIcon>
                  {advantage.icon}
                </AdvantageIcon>
                
                <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                  {advantage.title}
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ flexGrow: 1 }}>
                  {advantage.description}
                </Typography>
              </Paper>
            </Box>
          ))}
        </Box>
        
        <Box 
          sx={{ 
            mt: 8, 
            p: 4, 
            borderRadius: 2, 
            bgcolor: 'white',
            boxShadow: 3
          }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center', flexDirection: { xs: 'column', md: 'row' } }}>
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
              <Typography variant="h4" component="h3" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                Notre engagement qualité
              </Typography>
              
              <Typography variant="body1" paragraph>
                Chez Car Parts France, nous nous engageons à fournir uniquement des moteurs d'occasion de qualité, rigoureusement testés et garantis. Notre objectif est de vous offrir une tranquillité d'esprit totale et d'éviter les problèmes coûteux liés aux moteurs défectueux.
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Transparence totale" 
                    secondary="Vous savez exactement ce que vous achetez grâce à notre rapport de test détaillé" 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Satisfaction client" 
                    secondary="Plus de 95% de nos clients professionnels renouvellent leur confiance" 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Service après-vente réactif" 
                    secondary="Une équipe dédiée aux professionnels pour répondre à toutes vos questions" 
                  />
                </ListItem>
              </List>
            </Box>
            
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
              <Box
                component="img"
                src="/images/Client qui a recupéré un moteur.jpg"
                alt="Client satisfait"
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                }}
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AdvantagesSection;

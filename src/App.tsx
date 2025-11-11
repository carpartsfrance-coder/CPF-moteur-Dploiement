import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ContactPage from './pages/ContactPage';
import LegalPage from './pages/LegalPage';
import FloatingQuoteButton from './components/common/FloatingQuoteButton';
import QuoteRequestPage from './pages/QuoteRequestPage';
import RequireAdmin from './components/admin/RequireAdmin';
import AdminLogin from './pages/admin/AdminLogin';
import AdminQuotes from './pages/admin/AdminQuotes';
import AdminGallery from './pages/admin/AdminGallery';
import AdminEnginePages from './pages/admin/AdminEnginePages';
import AdminSettings from './pages/admin/AdminSettings';
import EngineCodePage from './pages/EngineCodePage';
import EnginesListPage from './pages/EnginesListPage';
import EnginesBrandPage from './pages/EnginesBrandPage';
import CGVPage from './pages/CGVPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import AboutPage from './pages/AboutPage';
 

function App() {
  const location = useLocation();

  useEffect(() => {
    const setMeta = (title: string, description: string) => {
      document.title = title;
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    };

    const path = location.pathname;
    if (path === '/a-propos') return; // Géré dans AboutPage

    switch (path) {
      case '/':
        setMeta(
          "Moteur d’occasion testé et garanti 1 an | Car Parts France Moteur",
          "Devis en 24h, compatibilité confirmée (VIN/Code), tests en atelier, logistique suivie. 50 Boulevard Staligrand, 06300 Nice."
        );
        break;
      case '/demande-devis':
        setMeta(
          'Demande de devis moteur d’occasion | Réponse en 24h',
          'Décrivez votre besoin (VIN/code moteur). Compatibilité confirmée et prix sous 24h.'
        );
        break;
      case '/contact':
        setMeta(
          'Contact | Car Parts France Moteur',
          'Contactez‑nous par téléphone, WhatsApp ou email. Réponse rapide.'
        );
        break;
      case '/moteurs':
        setMeta(
          'Moteurs d’occasion testés | Catalogue',
          'Sélection testée, rapports fournis, livraison assurée, garantie 1 an.'
        );
        break;
      case '/mentions-legales':
        setMeta('Mentions légales | Car Parts France Moteur', 'Informations légales de Car Parts France Moteur.');
        break;
      case '/cgv':
        setMeta('Conditions Générales de Vente | Car Parts France Moteur', 'Conditions générales de vente applicables.');
        break;
      case '/politique-de-confidentialite':
        setMeta('Politique de confidentialité | Car Parts France Moteur', 'Politique de confidentialité et gestion des données.');
        break;
      default:
        if (path.startsWith('/codes-moteur')) {
          setMeta('Code moteur | Car Parts France Moteur', 'Compatibilité, disponibilité et conseils pour votre code moteur.');
        } else if (path.startsWith('/moteurs/')) {
          setMeta('Moteurs par marque | Car Parts France Moteur', 'Catalogue de moteurs d’occasion testés par marque.');
        }
    }
  }, [location.pathname]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/a-propos" element={<AboutPage />} />
          <Route path="/demande-devis" element={<QuoteRequestPage />} />
          <Route path="/demande-de-devis" element={<Navigate to="/demande-devis" replace />} />
          <Route path="/mentions-legales" element={<LegalPage />} />
          <Route path="/cgv" element={<CGVPage />} />
          <Route path="/politique-de-confidentialite" element={<PrivacyPolicyPage />} />
          <Route path="/moteurs" element={<EnginesListPage />} />
          <Route path="/moteurs/:marque" element={<EnginesBrandPage />} />
          <Route path="/admin" element={<Navigate to="/admin/devis" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/devis" element={<RequireAdmin><AdminQuotes /></RequireAdmin>} />
          <Route path="/admin/gallery" element={<RequireAdmin><AdminGallery /></RequireAdmin>} />
          <Route path="/admin/engine-pages" element={<RequireAdmin><AdminEnginePages /></RequireAdmin>} />
          <Route path="/admin/settings" element={<RequireAdmin><AdminSettings /></RequireAdmin>} />
          <Route path="/codes-moteur/:slug" element={<EngineCodePage />} />
        </Routes>
      </Box>
      <Footer />
      <FloatingQuoteButton />
    </Box>
  );
}

export default App;

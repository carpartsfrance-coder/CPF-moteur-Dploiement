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
import AdminEnginePages from './pages/admin/AdminEnginePages';
import AdminEngineReport from './pages/admin/AdminEngineReport';
import AdminSettings from './pages/admin/AdminSettings';
import AdminBlogPosts from './pages/admin/AdminBlogPosts';
import AdminRedirects from './pages/admin/AdminRedirects';
import AdminSeoChecks from './pages/admin/AdminSeoChecks';
import AdminImages from './pages/admin/AdminImages';
import EngineCodePage from './pages/EngineCodePage';
import EnginesListPage from './pages/EnginesListPage';
import EnginesBrandPage from './pages/EnginesBrandPage';
import CGVPage from './pages/CGVPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import AboutPage from './pages/AboutPage';
import TestsMoteursPage from './pages/TestsMoteursPage';

function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isEngineReportPrint = location.pathname.startsWith('/admin/rapports-moteur') && location.pathname.endsWith('/print');
  const backendBase = (process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001').replace(/\/$/, '');

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
      case '/tests-moteurs':
        setMeta('Tests moteurs en atelier | Car Parts France Moteur', "Compression, leak-down, endoscopie, pression d’huile, rapport fourni, garantie 1 an.");
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
      {!isEngineReportPrint && <Header />}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          {/* Redirection front -> backend pour toutes les pages blog SSR */}
          <Route path="/blog/*" element={<Navigate to={`${backendBase}${location.pathname}${location.search}`} replace />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/a-propos" element={<AboutPage />} />
          <Route path="/tests-moteurs" element={<TestsMoteursPage />} />
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
          <Route path="/admin/images" element={<RequireAdmin><AdminImages /></RequireAdmin>} />
          <Route path="/admin/engine-pages" element={<RequireAdmin><AdminEnginePages /></RequireAdmin>} />
          <Route path="/admin/rapports-moteur/:quoteId" element={<RequireAdmin><AdminEngineReport /></RequireAdmin>} />
          <Route path="/admin/rapports-moteur/:quoteId/print" element={<RequireAdmin><AdminEngineReport /></RequireAdmin>} />
          <Route path="/admin/redirects" element={<RequireAdmin><AdminRedirects /></RequireAdmin>} />
          <Route path="/admin/seo-checks" element={<RequireAdmin><AdminSeoChecks /></RequireAdmin>} />
          <Route path="/admin/blog" element={<RequireAdmin><AdminBlogPosts /></RequireAdmin>} />
          <Route path="/admin/settings" element={<RequireAdmin><AdminSettings /></RequireAdmin>} />
          <Route path="/codes-moteur/:slug" element={<EngineCodePage />} />
        </Routes>
      </Box>
      {!isEngineReportPrint && <Footer />}
      {!isAdmin && !isEngineReportPrint && <FloatingQuoteButton />}
    </Box>
  );
}

export default App;

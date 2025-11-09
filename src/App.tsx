import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<ContactPage />} />
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

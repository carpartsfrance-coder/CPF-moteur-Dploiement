import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import HeroSection from '../components/sections/HeroSection';
import QuoteFormSection from '../components/sections/QuoteFormSection';
import InstalledBySection from '../components/sections/InstalledBySection';

const ComparisonSectionLazy = lazy(() => import('../components/sections/ProblemSection'));
const MotorsShowcaseSectionLazy = lazy(() => import('../components/sections/MotorsShowcaseSection'));
const TestsGalleryLazy = lazy(() => import('../components/sections/TestsGallery'));

const LazyOnView: React.FC<{ children: React.ReactNode; rootMargin?: string }> = ({ children, rootMargin = '200px' }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { setVisible(true); obs.disconnect(); break; }
      }
    }, { root: null, rootMargin, threshold: 0.01 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [visible, rootMargin]);
  return <div ref={ref}>{visible ? children : <Box sx={{ height: { xs: 380, md: 460 } }} />}</div>;
};

const HomePage: React.FC = () => {
  return (
    <Box>
      <HeroSection />
      <LazyOnView>
        <Suspense fallback={<Box sx={{ height: { xs: 320, md: 420 } }} />}> 
          <Box sx={{ mt: -2 }}>
            <MotorsShowcaseSectionLazy />
          </Box>
        </Suspense>
      </LazyOnView>
      <LazyOnView>
        <Suspense fallback={<Box sx={{ height: { xs: 240, md: 320 } }} />}> 
          <Box sx={{ mt: -2 }}>
            <ComparisonSectionLazy />
          </Box>
        </Suspense>
      </LazyOnView>
      {/* Positionner la section "Nos moteurs ont déjà été montés par" au-dessus du processus qualité */}
      <InstalledBySection />
      {/* Section "Notre processus de contrôle qualité" */}
      <LazyOnView>
        <Suspense fallback={<Box sx={{ height: { xs: 420, md: 520 } }} />}> 
          <TestsGalleryLazy />
        </Suspense>
      </LazyOnView>
      <QuoteFormSection />
    </Box>
  );
};

export default HomePage;

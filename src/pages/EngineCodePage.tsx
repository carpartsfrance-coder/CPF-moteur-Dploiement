import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
  TextField,
  InputAdornment,
} from '@mui/material';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PhoneIcon from '@mui/icons-material/Phone';

interface EnginePageData {
  code: string;
  marque: string;
  cylindree?: string;
  carburant?: string;
  annees?: string;
  slug: string;
  title?: string;
  seoTitle?: string;
  seoDescription?: string;
  contentHtml?: string;
  faq?: Array<{ q: string; a: string }>;
  status: 'draft' | 'published';
  image?: string;
  images?: string[];
  availability?: 'in_stock' | 'backorder';
}

const EngineCodePage: React.FC = () => {
  const { slug = '' } = useParams();
  const base = useMemo(() => {
    const env = process.env.REACT_APP_BACKEND_URL || '';
    if (env.trim()) return env.trim().replace(/\/$/, '');
    if (typeof window !== 'undefined') {
      const isLocal = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
      return isLocal ? 'http://localhost:3001' : '';
    }
    return '';
  }, []);
  const whatsappUrl = useMemo(() => (process.env.REACT_APP_WHATSAPP_URL || 'https://wa.me/33756875025'), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<EnginePageData | null>(null);
  const [cbName, setCbName] = useState('');
  const [cbPhone, setCbPhone] = useState('');
  const [cbImmat, setCbImmat] = useState('');
  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${base}/api/public/engine-pages/${encodeURIComponent(slug)}`);
        if (!res.ok) throw new Error('not_found');
        const json = await res.json();
        if (!aborted) setData(json?.page || null);
      } catch (e: any) {
        if (!aborted) setError('not_found');
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => { aborted = true; };
  }, [base, slug]);

  // (moteurs similaires retirés du rendu pour simplifier)

  const title = data?.title || (data ? `Moteur ${data.code} — ${data.marque} ${data.cylindree || ''}`.trim() : '');
  const pageTitle = (data?.seoTitle && data.seoTitle.trim()) ? data.seoTitle.trim() : (title || '');
  const pageDescription = (data?.seoDescription && data.seoDescription.trim())
    ? data.seoDescription.trim()
    : (data ? `Moteur ${data.code} ${data.marque} ${data.cylindree || ''} testé et garanti 12 mois. Livraison rapide. Demandez un devis.`.replace(/\s+/g, ' ').trim() : '');
  const canonicalUrl = useMemo(() => {
    const origin = window.location.origin;
    return `${origin}/codes-moteur/${encodeURIComponent(slug || '')}`;
  }, [slug]);
  const ogImage = process.env.REACT_APP_OG_IMAGE || '';
  const isAvailable = data?.availability !== 'backorder';

  const quoteUrl = useMemo(() => {
    if (!data) return '/demande-devis';
    const p = new URLSearchParams();
    if (data.code) p.set('code', data.code);
    if (data.marque) p.set('marque', data.marque);
    if (data.cylindree) p.set('cylindree', data.cylindree);
    return `/demande-devis?${p.toString()}`;
  }, [data]);

  const whatsappCTA = useMemo(() => {
    const msg = data ? `Bonjour, je souhaite un devis pour le moteur ${data.code} ${data.marque} ${data.cylindree || ''}`.trim() : '';
    const sep = whatsappUrl.includes('?') ? '&' : '?';
    return `${whatsappUrl}${msg ? `${sep}text=${encodeURIComponent(msg)}` : ''}`;
  }, [whatsappUrl, data]);

  const whatsappHelpUrl = useMemo(() => {
    const msg = data
      ? `Bonjour, je cherche un moteur ${data.code} ${data.marque} ${data.cylindree || ''}. Pouvez-vous m'aider à vérifier la compatibilité ?`.trim()
      : 'Bonjour, je cherche un moteur. Pouvez-vous m\'aider à vérifier la compatibilité ?';
    const sep = whatsappUrl.includes('?') ? '&' : '?';
    return `${whatsappUrl}${sep}text=${encodeURIComponent(msg)}`;
  }, [whatsappUrl, data]);

  const gallery = useMemo(() => {
    const arr: string[] = [];
    if (data && Array.isArray((data as any).images)) arr.push(...((data as any).images as string[]));
    const single = (data as any)?.image;
    if (single) arr.push(String(single));
    if (ogImage) arr.push(ogImage);
    return Array.from(new Set(arr));
  }, [data, ogImage]);

  const handleCallbackSubmit = () => {
    const parts: string[] = [];
    if (cbName) parts.push(`Nom: ${cbName}`);
    if (cbPhone) parts.push(`Téléphone: ${cbPhone}`);
    if (cbImmat) parts.push(`Immat/Châssis: ${cbImmat}`);
    if (data) parts.push(`Moteur: ${data.code} ${data.marque} ${data.cylindree || ''}`.trim());
    const message = `Bonjour, rappel rapide svp.\n${parts.join('\n')}`;
    const sep = whatsappUrl.includes('?') ? '&' : '?';
    const url = `${whatsappUrl}${sep}text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener');
  };

  useEffect(() => {
    if (!data) return;

    document.title = pageTitle;

    const ensureMeta = (selector: string, create: () => HTMLMetaElement): HTMLMetaElement => {
      let el = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = create();
        document.head.appendChild(el);
      }
      return el;
    };

    const setMeta = (nameOrProp: 'name' | 'property', key: string, content: string) => {
      if (!content) return;
      const selector = `meta[${nameOrProp}="${key}"]`;
      const meta = ensureMeta(selector, () => {
        const m = document.createElement('meta');
        m.setAttribute(nameOrProp, key);
        return m as HTMLMetaElement;
      });
      meta.setAttribute('content', content);
    };

    const setLink = (rel: string, href: string) => {
      const selector = `link[rel="${rel}"]`;
      let link = document.head.querySelector(selector) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    if (pageDescription) setMeta('name', 'description', pageDescription);
    setLink('canonical', canonicalUrl);

    setMeta('property', 'og:type', 'product');
    setMeta('property', 'og:title', pageTitle);
    setMeta('property', 'og:description', pageDescription);
    setMeta('property', 'og:url', canonicalUrl);
    if (ogImage) setMeta('property', 'og:image', ogImage);

    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', pageTitle);
    setMeta('name', 'twitter:description', pageDescription);
    if (ogImage) setMeta('name', 'twitter:image', ogImage);
  }, [data, pageTitle, pageDescription, canonicalUrl, ogImage]);

  // JSON-LD Schema.org (Product/Service + FAQ)
  const jsonLd = data ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `Moteur ${data.code}`,
    brand: data.marque,
    description: data.seoDescription || `Moteur ${data.code} ${data.marque} ${data.cylindree || ''} testé et garanti. Demandez un devis sous 24 heures.`,
    additionalProperty: [
      ...(data.cylindree ? [{ '@type': 'PropertyValue', name: 'Cylindrée', value: data.cylindree }] : []),
      ...(data.carburant ? [{ '@type': 'PropertyValue', name: 'Carburant', value: data.carburant }] : []),
      ...(data.annees ? [{ '@type': 'PropertyValue', name: 'Années', value: data.annees }] : []),
    ]
  } : null;
  const faqLd = data?.faq && data.faq.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  } : null;

  const breadcrumbLd = data ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: `${window.location.origin}/`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: pageTitle || title,
        item: canonicalUrl
      }
    ]
  } : null;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Page introuvable</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ce code moteur n’est pas encore disponible. Demandez‑nous un devis, on vous répond sous 24h.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="center">
            <Button variant="contained" component={RouterLink} to="/demande-devis">Demander un devis</Button>
            <Button variant="outlined" component="a" href={whatsappUrl} target="_blank" rel="noopener">WhatsApp</Button>
          </Stack>
        </Paper>
      </Container>
    );
  }
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            <RouterLink to="/" style={{ textDecoration: 'none' }}>Accueil</RouterLink>
            {' '}/{' '}
            <RouterLink to={`/moteurs/${encodeURIComponent(data.marque)}`} style={{ textDecoration: 'none' }}>Moteurs {data.marque}</RouterLink>
            {' '}/{' '}
            <strong>{title}</strong>
          </Typography>

          <Paper variant="outlined" sx={{ p: 1.5, mb: 2, borderRadius: 2 }}>
            <Typography variant="body2">
              Pas besoin de connaître le code moteur: contactez-nous sur WhatsApp et on s’occupe de tout.
              <Button size="small" component="a" href={whatsappHelpUrl} target="_blank" rel="noopener" startIcon={<WhatsAppIcon />} sx={{ ml: 1 }}>
                Aide sur WhatsApp
              </Button>
            </Typography>
          </Paper>
          <Box sx={{ mb: 2 }}>
            {gallery.length > 0 ? (
              <>
                <Box component="img" src={gallery[Math.max(0, Math.min(activeImg, gallery.length - 1))]} alt={title} onClick={() => setLightboxOpen(true)} sx={{ width: '100%', height: { xs: 200, sm: 260 }, objectFit: 'cover', borderRadius: 2, cursor: 'zoom-in' }} loading="lazy" decoding="async" />
                {gallery.length > 1 && (
                  <ImageList cols={Math.min(4, gallery.length)} gap={8} sx={{ mt: 1 }}>
                    {gallery.map((src, idx) => (
                      <ImageListItem key={src} sx={{ cursor: 'pointer', border: idx === activeImg ? '2px solid rgba(37,99,235,0.6)' : '2px solid transparent', borderRadius: 1, overflow: 'hidden' }}>
                        <Box component="img" src={src} alt={`${title} ${idx + 1}`} onClick={() => setActiveImg(idx)} sx={{ width: '100%', height: 70, objectFit: 'cover', display: 'block' }} loading="lazy" decoding="async" />
                      </ImageListItem>
                    ))}
                  </ImageList>
                )}
              </>
            ) : (
              <Box sx={{ height: { xs: 140, sm: 180 }, borderRadius: 2, background: 'linear-gradient(135deg, rgba(2,0,36,0.05) 0%, rgba(0,212,255,0.08) 100%)' }} />
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1.1 }}>{title}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
              <Chip icon={<CheckCircleOutlineIcon />} label={isAvailable ? 'Disponible' : 'Sur commande'} color={isAvailable ? 'success' : 'default'} variant="filled" />
              <Chip label="Moteur testé" color="success" variant="outlined" />
              <Chip label="Garantie 1 an" color="primary" variant="outlined" />
              <Chip label="Devis sous 24h" variant="outlined" />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ mt: 2 }}>
              <Button variant="contained" component={RouterLink} to={quoteUrl}>Demander un devis</Button>
              <Button variant="outlined" component="a" href={whatsappCTA} target="_blank" rel="noopener" startIcon={<WhatsAppIcon />}>WhatsApp</Button>
            </Stack>

            <Box sx={{ mt: 1.5 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: { xs: 1.5, md: 2 },
                  px: { xs: 1.25, md: 1.5 },
                  py: { xs: 0.75, md: 1 },
                  borderRadius: 999,
                  border: '1px solid rgba(0,0,0,0.08)',
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.04) 100%)'
                }}
              >
                <Box component="img" src="/images/partners/logo-porsche.webp" alt="Porsche" sx={{ height: { xs: 18, md: 22 }, display: 'block', opacity: 0.9 }} loading="lazy" decoding="async" />
                <Box component="img" src="/images/partners/mougins-autosport.webp" alt="Mougins Autosport" sx={{ height: { xs: 18, md: 22 }, display: 'block', opacity: 0.9, bgcolor: 'white', borderRadius: 0.5, p: 0.3 }} loading="lazy" decoding="async" />
                <Box component="img" src="/images/partners/sun-motors.webp" alt="Sun Motors" sx={{ height: { xs: 18, md: 22 }, display: 'block', opacity: 0.9 }} loading="lazy" decoding="async" />
              </Box>
            </Box>

            <Paper variant="outlined" sx={{ mt: 2, p: 2, borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                “Service rapide et sérieux, moteur conforme et bien emballé. Devis reçu dans la journée.”
              </Typography>
              <Typography variant="caption" color="text.secondary">— Julien, garagiste à Lyon</Typography>
            </Paper>

            <Paper sx={{ mt: 2, p: { xs: 2, md: 2.5 }, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Vous cherchez un moteur complet ?</Typography>
              <Typography variant="body1" sx={{ mb: 1.5 }}>
                Le code {data.code} est l’identifiant du moteur. Pas besoin de tout connaître: on s’occupe de vérifier la compatibilité pour vous.
              </Typography>
              <Stack spacing={0.75} sx={{ mb: 1.5 }}>
                <Typography variant="body2">1. Demandez un devis en 1 minute</Typography>
                <Typography variant="body2">2. On confirme la compatibilité et la disponibilité</Typography>
                <Typography variant="body2">3. Livraison rapide et garantie 1 an</Typography>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button variant="contained" component={RouterLink} to={quoteUrl}>Commencer mon devis</Button>
                <Button variant="outlined" component="a" href={whatsappHelpUrl} target="_blank" rel="noopener" startIcon={<WhatsAppIcon />}>Aide sur WhatsApp</Button>
              </Stack>
            </Paper>

            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>C’est quoi le code moteur ? Où le trouver ?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Le code moteur identifie précisément le bloc moteur (ex: {data.code}). Il peut se trouver dans la baie moteur, sur l’étiquette constructeur, ou dans la documentation.
                </Typography>
                <Typography variant="body2">Si vous ne l’avez pas, contactez-nous via WhatsApp. Nous vérifions la compatibilité pour vous.</Typography>
              </AccordionDetails>
            </Accordion>
          </Box>

          <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Compatibilités et informations</Typography>
            <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' } }}>
              <Box><Typography variant="body2" color="text.secondary">Code</Typography><Typography sx={{ fontWeight: 700 }}>{data.code}</Typography></Box>
              <Box><Typography variant="body2" color="text.secondary">Marque</Typography><Typography sx={{ fontWeight: 700 }}>{data.marque}</Typography></Box>
              {data.cylindree && (<Box><Typography variant="body2" color="text.secondary">Cylindrée</Typography><Typography sx={{ fontWeight: 700 }}>{data.cylindree}</Typography></Box>)}
              {data.carburant && (<Box><Typography variant="body2" color="text.secondary">Carburant</Typography><Typography sx={{ fontWeight: 700 }}>{data.carburant}</Typography></Box>)}
              {data.annees && (<Box><Typography variant="body2" color="text.secondary">Années</Typography><Typography sx={{ fontWeight: 700 }}>{data.annees}</Typography></Box>)}
            </Box>
          </Paper>

          <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Prix, délais et garantie</Typography>
            <Stack spacing={1}>
              <Typography variant="body2">Prix sur devis selon stock et kilométrage.</Typography>
              <Typography variant="body2">Livraison rapide partout en France (24 à 72h selon région).</Typography>
              <Typography variant="body2">Moteur testé et garanti 1 an.</Typography>
            </Stack>
          </Paper>

          <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Présentation</Typography>
            {data.contentHtml ? (
              <Box sx={{ '& p': { mb: 1.2 } }} dangerouslySetInnerHTML={{ __html: data.contentHtml }} />
            ) : (
              <Typography variant="body1" color="text.secondary">
                Ce moteur {data.code} {data.marque} {data.cylindree || ''} est contrôlé et testé avant expédition. Demandez votre devis, réponse sous 24 heures.
              </Typography>
            )}
          </Paper>

          <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Notre processus qualité</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              {[
                { t: 'Contrôles & tests', d: 'Inspection visuelle, endoscopie, compression / étanchéité.' },
                { t: 'Préparation & emballage', d: 'Nettoyage, scellés et emballage sécurisé sur palette.' },
                { t: 'Garantie & suivi', d: 'Garantie 1 an, assistance et traçabilité de la commande.' },
              ].map((s, i) => (
                <Paper key={i} variant="outlined" sx={{ p: 2, flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>{s.t}</Typography>
                  <Typography variant="body2" color="text.secondary">{s.d}</Typography>
                </Paper>
              ))}
            </Stack>
          </Paper>

          {data.faq && data.faq.length > 0 && (
            <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>FAQ</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1.5}>
                {data.faq.map((f, i) => (
                  <Box key={i}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{f.q}</Typography>
                    <Typography variant="body2" color="text.secondary">{f.a}</Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          )}
        </Box>
        <Box sx={{ width: { md: 320 }, flexShrink: 0, display: { xs: 'none', md: 'block' } }}>
          <Paper sx={{ p: 2.5, position: 'sticky', top: 96, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Votre devis rapide</Typography>
            <Stack spacing={1.2}>
              <Button fullWidth variant="contained" component={RouterLink} to={quoteUrl}>Demander un devis</Button>
              <Button fullWidth variant="outlined" component="a" href={whatsappCTA} target="_blank" rel="noopener" startIcon={<WhatsAppIcon />}>WhatsApp</Button>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">Réponse sous 24h. Garantie 1 an. Livraison rapide.</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip size="small" label="Garantie 1 an" />
              <Chip size="small" label="Testé & validé" color="success" variant="outlined" />
              <Chip size="small" label="Stock vérifié" variant="outlined" />
            </Stack>

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>Rappel express</Typography>
            <Stack spacing={1.2}>
              <TextField size="small" label="Nom" value={cbName} onChange={(e) => setCbName(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><PersonOutlineIcon sx={{ color: 'primary.main' }} /></InputAdornment>) }} />
              <TextField size="small" label="Téléphone" value={cbPhone} onChange={(e) => setCbPhone(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><PhoneIcon sx={{ color: 'primary.main' }} /></InputAdornment>) }} />
              <TextField size="small" label="Immatriculation / N° châssis" value={cbImmat} onChange={(e) => setCbImmat(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><DirectionsCarIcon sx={{ color: 'primary.main' }} /></InputAdornment>) }} />
              <Button onClick={handleCallbackSubmit} variant="outlined" startIcon={<WhatsAppIcon />}>Envoyer sur WhatsApp</Button>
            </Stack>
          </Paper>
        </Box>
      </Stack>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      {faqLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      )}
      {breadcrumbLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      )}
      <Box sx={{ position: 'fixed', bottom: 12, left: 12, right: 12, display: { xs: 'flex', md: 'none' }, zIndex: 1200, gap: 1 }}>
        <Button fullWidth variant="contained" component={RouterLink} to={quoteUrl}>Demander un devis</Button>
        <Button fullWidth variant="outlined" component="a" href={whatsappHelpUrl} target="_blank" rel="noopener" startIcon={<WhatsAppIcon />}>Aide WhatsApp</Button>
      </Box>
      <Dialog open={lightboxOpen} onClose={() => setLightboxOpen(false)} maxWidth="lg">
        <Box sx={{ position: 'relative' }}>
          <IconButton onClick={() => setLightboxOpen(false)} sx={{ position: 'absolute', top: 4, right: 4, zIndex: 1 }}>
            <CloseIcon />
          </IconButton>
          {gallery.length > 0 && (
            <Box component="img" src={gallery[Math.max(0, Math.min(activeImg, gallery.length - 1))]} alt={title} sx={{ maxWidth: '90vw', maxHeight: '80vh' }} />
          )}
        </Box>
      </Dialog>
    </Container>
  );
};

export default EngineCodePage;

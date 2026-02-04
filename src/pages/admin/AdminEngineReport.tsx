import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

type CylinderRow = {
  index: number | null;
  compression: string;
  endoscopy: string;
  oilPressure: string;
};

type EngineReport = {
  id?: string;
  quoteId: string;
  reportDate: string;
  technicianName: string;
  brandModel: string;
  engineSerial: string;
  engineRef: string;
  cylinders: CylinderRow[];
  summary: string;
  noiseAnalysis: string;
  oilAnalysis: string;
  visualCheck: string;
  photoUrls: string[];
  footerNote?: string;
  createdAt?: string;
  updatedAt?: string;
};

type QuoteSummary = {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleId: string;
  message: string;
};

function getBackendPrefix() {
  const env = (process as any).env.REACT_APP_BACKEND_URL || '';
  if (String(env).trim()) return String(env).trim().replace(/\/$/, '');
  if (typeof window !== 'undefined') {
    const isLocal = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
    return isLocal ? 'http://localhost:3001' : '';
  }
  return '';
}

const defaultNoiseAnalysis = 'Moteur silencieux, aucun bruit anormal.';
const defaultOilAnalysis = "Huile de couleur normale, absence de limaille ou de liquide de refroidissement.";
const defaultVisualCheck = 'Aucune anomalie détectée.';

function formatReportDate(value: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  try {
    return d.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return value;
  }
}

const AdminEngineReport: React.FC = () => {
  const { quoteId = '' } = useParams<{ quoteId: string }>();
  const location = useLocation();
  const locationState = location as typeof location & { state?: { quote?: QuoteSummary } };
  const navigate = useNavigate();

  const quoteFromState = locationState.state?.quote;

  const [, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'success' });

  const [reportId, setReportId] = useState<string | undefined>(undefined);
  const [reportDate, setReportDate] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [brandModel, setBrandModel] = useState('');
  const [engineSerial, setEngineSerial] = useState('');
  const [engineRef, setEngineRef] = useState('');
  const [summary, setSummary] = useState('');
  const [noiseAnalysis, setNoiseAnalysis] = useState(defaultNoiseAnalysis);
  const [oilAnalysis, setOilAnalysis] = useState(defaultOilAnalysis);
  const [visualCheck, setVisualCheck] = useState(defaultVisualCheck);
  const [photoUrlsText, setPhotoUrlsText] = useState('');
  const [footerNote, setFooterNote] = useState('Photos supplémentaires et vidéos d\'endoscopie envoyées par e-mail.');
  const [cylinders, setCylinders] = useState<CylinderRow[]>([]);
  const [quote, setQuote] = useState<QuoteSummary | null>(quoteFromState || null);

  const parsedPhotoUrls = useMemo(
    () =>
      photoUrlsText
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean),
    [photoUrlsText]
  );

  useEffect(() => {
    if (!quote && quoteFromState) {
      setQuote(quoteFromState);
    }
  }, [quoteFromState, quote]);

  useEffect(() => {
    if (!quoteId) return;
    let aborted = false;
    const run = async () => {
      try {
        setLoading(true);
        const prefix = getBackendPrefix();
        const token = (process as any).env.REACT_APP_BACKEND_TOKEN || '';
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        const url = `${prefix}/api/admin/engine-reports/by-quote/${encodeURIComponent(quoteId)}`;
        const res = await fetch(url, { headers, credentials: 'include' });
        if (!res.ok) {
          return;
        }
        const data = await res.json();
        const r: EngineReport | null = data?.report || null;
        if (!r || aborted) return;

        setReportId(r.id);
        setReportDate(r.reportDate || '');
        setTechnicianName(r.technicianName || '');
        setBrandModel(r.brandModel || '');
        setEngineSerial(r.engineSerial || '');
        setEngineRef(r.engineRef || '');
        setSummary(r.summary || '');
        setNoiseAnalysis(r.noiseAnalysis || defaultNoiseAnalysis);
        setOilAnalysis(r.oilAnalysis || defaultOilAnalysis);
        setVisualCheck(r.visualCheck || defaultVisualCheck);
        setFooterNote((prev) => r.footerNote || prev);
        const cyl = Array.isArray(r.cylinders) && r.cylinders.length
          ? r.cylinders
          : Array.from({ length: 6 }, (_, i) => ({ index: i + 1, compression: '', endoscopy: '', oilPressure: '' }));
        setCylinders(cyl.map((c) => ({
          index: typeof c.index === 'number' ? c.index : Number.isFinite(Number(c.index)) ? Number(c.index) : null,
          compression: c.compression || '',
          endoscopy: c.endoscopy || '',
          oilPressure: c.oilPressure || '',
        })));
        setPhotoUrlsText((r.photoUrls || []).join('\n'));
      } finally {
        if (!aborted) setLoading(false);
      }
    };
    void run();
    return () => {
      aborted = true;
    };
  }, [quoteId]);

  useEffect(() => {
    if (cylinders.length === 0) {
      const base = Array.from({ length: 6 }, (_, i) => ({ index: i + 1, compression: '', endoscopy: '', oilPressure: '' }));
      setCylinders(base);
    }
  }, [cylinders.length]);

  const handleChangeCylinder = (rowIndex: number, key: keyof CylinderRow, value: string) => {
    setCylinders((prev) =>
      prev.map((row, i) => (i === rowIndex ? { ...row, [key]: key === 'index' ? Number(value) || null : value } : row))
    );
  };

  const handleSave = async () => {
    if (!quoteId) {
      setSnackbar({ open: true, message: 'Identifiant de devis manquant.', severity: 'error' });
      return;
    }
    try {
      setSaving(true);
      const prefix = getBackendPrefix();
      const token = (process as any).env.REACT_APP_BACKEND_TOKEN || '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const body: EngineReport = {
        id: reportId,
        quoteId,
        reportDate: reportDate || new Date().toISOString(),
        technicianName,
        brandModel,
        engineSerial,
        engineRef,
        cylinders: cylinders.filter((c) => c.index != null || c.compression || c.endoscopy || c.oilPressure),
        summary,
        noiseAnalysis,
        oilAnalysis,
        visualCheck,
        photoUrls: parsedPhotoUrls,
        footerNote: footerNote || undefined,
      };

      const res = await fetch(`${prefix}/api/admin/engine-reports`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setSnackbar({ open: true, message: 'Échec de sauvegarde du rapport.', severity: 'error' });
        return;
      }
      const data = await res.json();
      const r: EngineReport | null = data?.report || null;
      if (r?.id) setReportId(r.id);
      setSnackbar({ open: true, message: 'Rapport enregistré.', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Erreur réseau lors de la sauvegarde.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const isPrint = (location.pathname || '').endsWith('/print');

  useEffect(() => {
    if (!isPrint) return;
    if (typeof window === 'undefined') return;
    const id = window.setTimeout(() => {
      window.print();
    }, 300);
    return () => {
      window.clearTimeout(id);
    };
  }, [isPrint]);

  const handlePrint = () => {
    if (!quoteId) return;
    const basePath = `/admin/rapports-moteur/${encodeURIComponent(quoteId)}/print`;
    if (typeof window !== 'undefined') {
      window.open(basePath, '_blank');
    } else {
      navigate(basePath);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const quoteTitle = quote ? `${quote.name || 'Client'} – ${quote.vehicleId || ''}` : `Devis ${quoteId}`;
  const printableCylinders = cylinders.length
    ? cylinders
    : Array.from({ length: 6 }, (_, i) => ({ index: i + 1, compression: '', endoscopy: '', oilPressure: '' }));

  const formattedReportDate = formatReportDate(reportDate);

  const printView = (
    <Box className="engine-report-print">
      <div className="engine-report-print-page">
        <div className="engine-report-print-header">
          <div className="engine-report-print-header-left">
            <div className="engine-report-print-logo-row">
              <img src="/images/logo.png" alt="Car Parts France" className="engine-report-print-logo" />
              <div className="engine-report-print-company">CAR PARTS FRANCE MOTEUR</div>
            </div>
            <div className="engine-report-print-title">RAPPORT DE TEST MOTEUR</div>
            <div className="engine-report-print-subtitle">Essais réalisés en atelier avant mise à disposition</div>
          </div>
          <div className="engine-report-print-header-right">
            <div className="engine-report-print-contact">
              50 Boulevard Stalingrad, 06300 Nice<br />
              04 65 84 54 88 · contact@cpfmoteur.fr<br />
              www.cpfmoteur.fr
            </div>
            <div className="engine-report-print-accent" />
          </div>
        </div>

        <div className="engine-report-print-section engine-report-print-section-meta">
          <div className="engine-report-print-meta-column">
            <div className="engine-report-print-meta-label">Informations rapport</div>
            <p>Rapport n° {reportId || '........................'}</p>
            <p>Date : {formattedReportDate || '........................'}</p>
            <p>Technicien : {technicianName || '........................'}</p>
            <p>Devis : {quoteId}</p>
          </div>
          <div className="engine-report-print-meta-column">
            <div className="engine-report-print-meta-label">Véhicule / Client</div>
            <p>Client : {quote?.name || '........................'}</p>
            <p>Véhicule : {quote?.vehicleId || '........................'}</p>
            <p>Marque et modèle : {brandModel || '........................'}</p>
            <p>Référence moteur : {engineRef || '........................'}</p>
            <p>Numéro de série moteur : {engineSerial || '........................'}</p>
          </div>
        </div>

        <div className="engine-report-print-section">
          <div className="engine-report-print-section-title">Relevé technique</div>
          <table className="engine-report-print-table">
            <thead>
              <tr>
                <th>Cylindre</th>
                <th>Compression</th>
                <th>Endoscopie</th>
                <th>Pression huile</th>
              </tr>
            </thead>
            <tbody>
              {printableCylinders.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.index ?? ''}</td>
                  <td>{row.compression}</td>
                  <td>{row.endoscopy}</td>
                  <td>{row.oilPressure}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="engine-report-print-bottom">
          <div className="engine-report-print-bottom-left">
            <div className="engine-report-print-section-title">Synthèse / verdict final</div>
            <p className="engine-report-print-text">{summary || 'Moteur testé et conforme.'}</p>
          </div>
          <div className="engine-report-print-bottom-right">
            <div className="engine-report-print-section-title">Autres éléments de vérification</div>
            <p className="engine-report-print-text">
              <strong>Analyse de bruit :</strong>{' '}
              {noiseAnalysis || defaultNoiseAnalysis}
            </p>
            <p className="engine-report-print-text">
              <strong>Analyse d'huile :</strong>{' '}
              {oilAnalysis || defaultOilAnalysis}
            </p>
            <p className="engine-report-print-text">
              <strong>Contrôle visuel externe :</strong>{' '}
              {visualCheck || defaultVisualCheck}
            </p>
            {footerNote && (
              <p className="engine-report-print-text">
                <strong>Note :</strong> {footerNote}
              </p>
            )}
          </div>
        </div>

        <div className="engine-report-print-signatures">
          <div className="engine-report-print-signature-block">
            <div className="engine-report-print-section-title">Visa atelier CAR PARTS FRANCE</div>
            <div className="engine-report-print-signature-line" />
            <p className="engine-report-print-signature-text">Nom, date et signature</p>
          </div>
          <div className="engine-report-print-signature-block">
            <div className="engine-report-print-section-title">Visa client</div>
            <div className="engine-report-print-signature-line" />
            <p className="engine-report-print-signature-text">Nom, date et signature</p>
          </div>
        </div>

        <div className="engine-report-print-footer">
          <div className="engine-report-print-footer-bar" />
          <div className="engine-report-print-page-number">1 / 1</div>
        </div>
      </div>
    </Box>
  );

  if (isPrint) {
    return printView;
  }

  return (
    <>
      <Box className="engine-report-editor" sx={{ bgcolor: 'background.default', py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }} sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Rapport de test moteur</Typography>
              <Typography variant="body2" color="text.secondary">
                Devis lié : {quoteTitle}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
              <Button variant="outlined" onClick={() => navigate('/admin/devis')}>Retour aux devis</Button>
              <Button variant="outlined" onClick={handlePrint}>Imprimer / PDF</Button>
              <Button variant="contained" onClick={handleSave} disabled={saving}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </Stack>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.1fr) minmax(0, 1.6fr)' },
              gap: 3,
            }}
          >
            <Box>
              <Paper elevation={4} sx={{ p: 2, borderRadius: 3, mb: 3 }}>
                <Stack spacing={2}>
                  <TextField
                    label="Date du rapport"
                    type="datetime-local"
                    value={reportDate ? reportDate : ''}
                    onChange={(e) => setReportDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  <TextField
                    label="Technicien"
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Marque et modèle"
                    value={brandModel}
                    onChange={(e) => setBrandModel(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Numéro de série moteur"
                    value={engineSerial}
                    onChange={(e) => setEngineSerial(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Référence moteur"
                    value={engineRef}
                    onChange={(e) => setEngineRef(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Synthèse / verdict final"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    multiline
                    minRows={3}
                    fullWidth
                  />
                </Stack>
              </Paper>

              <Paper elevation={4} sx={{ p: 2, borderRadius: 3 }}>
                <Stack spacing={2}>
                  <TextField
                    label="Analyse de bruit"
                    value={noiseAnalysis}
                    onChange={(e) => setNoiseAnalysis(e.target.value)}
                    multiline
                    minRows={2}
                    fullWidth
                  />
                  <TextField
                    label="Analyse d'huile"
                    value={oilAnalysis}
                    onChange={(e) => setOilAnalysis(e.target.value)}
                    multiline
                    minRows={2}
                    fullWidth
                  />
                  <TextField
                    label="Contrôle visuel externe"
                    value={visualCheck}
                    onChange={(e) => setVisualCheck(e.target.value)}
                    multiline
                    minRows={2}
                    fullWidth
                  />
                </Stack>
              </Paper>
            </Box>

            <Box>
              <Paper elevation={4} sx={{ p: 2, borderRadius: 3, mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Relevé technique</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Cylindre</TableCell>
                      <TableCell>Compression</TableCell>
                      <TableCell>Endoscopie</TableCell>
                      <TableCell>Pression huile</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cylinders.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell width={80}>
                          <TextField
                            type="number"
                            value={row.index ?? ''}
                            onChange={(e) => handleChangeCylinder(idx, 'index', e.target.value)}
                            inputProps={{ min: 1, style: { textAlign: 'center' } }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={row.compression}
                            onChange={(e) => handleChangeCylinder(idx, 'compression', e.target.value)}
                            size="small"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={row.endoscopy}
                            onChange={(e) => handleChangeCylinder(idx, 'endoscopy', e.target.value)}
                            size="small"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={row.oilPressure}
                            onChange={(e) => handleChangeCylinder(idx, 'oilPressure', e.target.value)}
                            size="small"
                            fullWidth
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>

              <Paper elevation={4} sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Photos (URLs, une par ligne)</Typography>
                <TextField
                  value={photoUrlsText}
                  onChange={(e) => setPhotoUrlsText(e.target.value)}
                  multiline
                  minRows={4}
                  fullWidth
                />
                <TextField
                  sx={{ mt: 2 }}
                  label="Texte de bas de page"
                  value={footerNote}
                  onChange={(e) => setFooterNote(e.target.value)}
                  fullWidth
                />

                {parsedPhotoUrls.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Aperçu photos</Typography>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                        gap: 1,
                      }}
                    >
                      {parsedPhotoUrls.map((url, idx) => (
                        <Box
                          key={idx}
                          component="img"
                          src={url}
                          alt={`Photo ${idx + 1}`}
                          sx={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 1 }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>
        </Container>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>

      {printView}
    </>
  );
};

export default AdminEngineReport;

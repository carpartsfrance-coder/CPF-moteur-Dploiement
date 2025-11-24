import React, { useMemo, useState, useReducer, useRef } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Chip,
  Stack,
  TextField,
  Select,
  MenuItem,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tabs,
  Tab,
  Snackbar,
  Alert
} from '@mui/material';
import { InputAdornment } from '@mui/material';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReplyIcon from '@mui/icons-material/Reply';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AddIcon from '@mui/icons-material/Add';
import { getQuotes, updateQuote, deleteQuote, QuoteItem, saveQuotes, addResponseToQuote } from '../../utils/quotesStore';

type ReplyChannel = 'email' | 'whatsapp';

type AttachmentInput = { filename: string; content: string; type?: string; size?: number };
type ItemInput = { product: string; reference: string; price?: string; warranty?: string; availability?: string };
type ClientReply = { id: string; channel: 'client'; fromName: string; fromEmail: string; message: string; createdAt: string };

const formatDate = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
};

const AdminQuotes: React.FC = () => {
  const [query, setQuery] = useState('');
  const [, forceRender] = useReducer((x: number) => x + 1, 0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [replyingQuote, setReplyingQuote] = useState<QuoteItem | null>(null);
  const [replyChannel, setReplyChannel] = useState<ReplyChannel>('email');
  const [replyMessage, setReplyMessage] = useState('');
  const [attachments, setAttachments] = useState<AttachmentInput[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [price, setPrice] = useState('');
  const [mileageKm, setMileageKm] = useState('');
  const [delivery, setDelivery] = useState('');
  const [reference, setReference] = useState('');
  const [items, setItems] = useState<ItemInput[]>([]);
  const [tests, setTests] = useState({
    compression: false,
    endoscopy: false,
    oilPressure: false,
    oilAnalysis: false,
    visualInspection: false,
  });
  const [defectObserved, setDefectObserved] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [clientReplies, setClientReplies] = useState<ClientReply[]>([]);
  const [clientRepliesLoading, setClientRepliesLoading] = useState(false);

  // Lire les devis à chaque rendu; 'tick' force un re-render lorsque l'on modifie les données
  const quotes = getQuotes();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = quotes;
    if (!q) return list;
    return list.filter((x) =>
      [x.name, x.email, x.phone, x.vehicleId, x.message]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [quotes, query]);

  const handleStatus = (id: string, status: QuoteItem['status']) => {
    updateQuote(id, { status });
    forceRender();
  };

  const handleDelete = (id: string) => {
    deleteQuote(id);
    forceRender();
  };

  const handleCopy = async (q: QuoteItem) => {
    const text = `Devis\n\nNom: ${q.name}\nEmail: ${q.email}\nTéléphone: ${q.phone}\nIdentifiant véhicule: ${q.vehicleId}\nMessage: ${q.message}\nCanal: ${q.channel || 'n/a'}\nCréé le: ${formatDate(q.createdAt)}\nID: ${q.id}`;
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  const loadClientReplies = async (id: string) => {
    try {
      setClientRepliesLoading(true);
      const base = process.env.REACT_APP_BACKEND_URL;
      const token = process.env.REACT_APP_BACKEND_TOKEN;
      if (!base) { setClientReplies([]); return; }
      const headers: Record<string,string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${base.replace(/\/$/, '')}/api/replies/${id}`, {
        headers,
        credentials: 'include',
      });
      if (!res.ok) throw new Error('HTTP');
      const data = await res.json();
      const list = Array.isArray(data?.replies) ? (data.replies as ClientReply[]) : [];
      setClientReplies(list);
    } catch {
      setClientReplies([]);
    } finally {
      setClientRepliesLoading(false);
    }
  };

  const openReplyDialog = (quote: QuoteItem) => {
    setReplyingQuote(quote);
    setReplyChannel('email');
    setReplyMessage([
      `Bonjour ${quote.name},`,
      '',
      "Merci d'avoir contacté CAR PARTS FRANCE concernant votre demande.",
      '',
      'Voici notre proposition personnalisée ci-dessous.',
      '',
      'N’hésitez pas à revenir vers moi pour confirmer ce devis ou pour toute question complémentaire.',
      '',
      'Bien cordialement Killian,',
      'CAR PARTS FRANCE',
    ].join('\n'));
    setAttachments([]);
    setPrice('');
    setMileageKm('');
    setDelivery('');
    setReference('');
    setItems([]);
    setTests({ compression: false, endoscopy: false, oilPressure: false, oilAnalysis: false, visualInspection: false });
    setDefectObserved('');
    void loadClientReplies(quote.id);
  };

  const closeReplyDialog = () => {
    setReplyingQuote(null);
    setReplyMessage('');
    setAttachments([]);
    setPrice('');
    setMileageKm('');
    setDelivery('');
    setReference('');
    setItems([]);
    setTests({ compression: false, endoscopy: false, oilPressure: false, oilAnalysis: false, visualInspection: false });
    setDefectObserved('');
    setClientReplies([]);
    setClientRepliesLoading(false);
  };

  // Lecture fichier -> data URL (base64)
  const readFileAsDataURL = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // Estime les octets d'un dataURL base64
  const estimateBytesFromDataURL = (dataUrl: string) => {
    try {
      const b64 = dataUrl.split(',')[1] || '';
      return Math.floor((b64.length * 3) / 4);
    } catch {
      return 0;
    }
  };

  // Compression basique via canvas (format JPEG par défaut)
  const compressImageFile = async (
    file: File,
    opts: { maxW?: number; maxH?: number; quality?: number; mime?: string } = {}
  ): Promise<{ dataUrl: string; filename: string; size: number; type: string }> => {
    const { maxW = 1600, maxH = 1600, quality = 0.82, mime = 'image/jpeg' } = opts;
    try {
      const srcUrl = await readFileAsDataURL(file);
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = srcUrl;
      });
      const { naturalWidth: w, naturalHeight: h } = img as any;
      if (!w || !h) throw new Error('invalid image');
      const ratio = Math.min(1, maxW / w, maxH / h);
      const targetW = Math.max(1, Math.round(w * ratio));
      const targetH = Math.max(1, Math.round(h * ratio));
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('no ctx');
      ctx.drawImage(img, 0, 0, targetW, targetH);
      const outType = mime;
      const outUrl = canvas.toDataURL(outType, quality);
      const outSize = estimateBytesFromDataURL(outUrl);
      // Ajuste le nom de fichier si on a changé le format
      const base = file.name.replace(/\.[^.]+$/,'');
      const ext = outType === 'image/webp' ? '.webp' : outType === 'image/jpeg' ? '.jpg' : (file.name.match(/\.[^.]+$/)?.[0] || '');
      return { dataUrl: outUrl, filename: base + ext, size: outSize, type: outType };
    } catch {
      // Fallback sans compression
      const dataUrl = await readFileAsDataURL(file);
      return { dataUrl, filename: file.name, size: file.size, type: file.type };
    }
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files) return;
    const MAX_ATTACHMENTS = 5;
    const MAX_PER_FILE_BYTES = 5 * 1024 * 1024; // 5 Mo
    const current = attachments.length;
    const selected = Array.from(files).slice(0, MAX_ATTACHMENTS - current);
    const prepared: AttachmentInput[] = [];
    for (const f of selected) {
      try {
        if (f.type.startsWith('image/')) {
          // Compresse l'image avec une qualité raisonnable
          const { dataUrl, filename, size, type } = await compressImageFile(f, {
            maxW: 1600,
            maxH: 1600,
            quality: 0.82,
            mime: 'image/jpeg',
          });
          if (size > MAX_PER_FILE_BYTES) {
            // si toujours trop gros après compression, on ignore
            continue;
          }
          prepared.push({ filename, content: dataUrl, type, size });
        } else {
          // PDF ou autres: pas de compression, mais filtrage taille
          if (f.size > MAX_PER_FILE_BYTES) continue;
          const dataUrl = await readFileAsDataURL(f);
          prepared.push({ filename: f.name, content: dataUrl, type: f.type, size: f.size });
        }
      } catch {}
    }
    if (prepared.length) setAttachments((prev) => [...prev, ...prepared]);
  };

  const removeAttachmentAt = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  // Gestion des articles proposés
  const addItemRow = () => {
    setItems((prev) => [...prev, { product: '', reference: '', price: '', warranty: '', availability: '' }]);
  };
  const removeItemRow = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };
  const updateItemField = (idx: number, key: keyof ItemInput, value: string) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [key]: value } : it)));
  };

  const handleSendReply = async () => {
    if (!replyingQuote) return;
    const response = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
      channel: replyChannel,
      message: replyMessage,
      createdAt: new Date().toISOString(),
    } as const;
    if (replyChannel === 'email') {
      const subject = `Réponse à votre devis - Car Parts France Pro`;
      const base = process.env.REACT_APP_BACKEND_URL;
      const token = process.env.REACT_APP_BACKEND_TOKEN;
      try {
        if (base) {
          const headers: Record<string,string> = { 'Content-Type': 'application/json' };
          if (token) headers.Authorization = `Bearer ${token}`;
          const res = await fetch(`${base.replace(/\/$/, '')}/api/devis/${replyingQuote.id}/reponse`, {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify({
              quoteId: replyingQuote.id,
              channel: 'email',
              message: replyMessage,
              toEmail: replyingQuote.email,
              toName: replyingQuote.name,
              subject,
              attachments: attachments.map(a => ({ filename: a.filename, content: a.content, type: a.type })),
              extras: {
                price: price.trim() || undefined,
                mileageKm: mileageKm.trim() || undefined,
                delivery: delivery.trim() || undefined,
                reference: reference.trim() || undefined,
                items: items
                  .map((it) => ({
                    product: (it.product || '').trim(),
                    reference: (it.reference || '').trim(),
                    price: (it.price || '').trim() || undefined,
                    warranty: (it.warranty || '').trim() || undefined,
                    availability: (it.availability || '').trim() || undefined,
                  }))
                  .filter((it) => it.product || it.reference),
                testsPerformed: [
                  tests.compression ? 'Compression' : null,
                  tests.endoscopy ? 'Endoscopie' : null,
                  tests.oilPressure ? "Test pression d'huile" : null,
                  tests.oilAnalysis ? "Analyse d'huile" : null,
                  tests.visualInspection ? 'Inspection visuelle' : null,
                ].filter(Boolean),
                defectObserved: defectObserved.trim() || undefined,
              },
            }),
          });
          if (!res.ok) throw new Error('API non OK');
          addResponseToQuote(replyingQuote.id, response);
          forceRender();
          setSnackbar({ open: true, message: 'Email envoyé via MailerSend.', severity: 'success' });
        } else {
          // Fallback mailto si backend non configuré
          const mailto = `mailto:${replyingQuote.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(replyMessage)}`;
          window.location.href = mailto;
          addResponseToQuote(replyingQuote.id, response);
          forceRender();
          setSnackbar({ open: true, message: 'Ouverture client email (fallback).', severity: 'info' });
        }
      } catch (e) {
        setSnackbar({ open: true, message: "Échec d'envoi via MailerSend", severity: 'error' });
        return; // ne pas fermer la fenêtre pour permettre correction
      }
    } else {
      const waNumber = replyingQuote.phone.replace(/\D/g, '');
      const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(replyMessage)}`;
      window.open(url, '_blank');
      addResponseToQuote(replyingQuote.id, response);
      forceRender();
      setSnackbar({ open: true, message: 'Ouverture WhatsApp.', severity: 'success' });
    }
    closeReplyDialog();
  };

  const handleOpenConfirm = () => setConfirmOpen(true);
  const handleCloseConfirm = () => setConfirmOpen(false);
  const handleConfirmClear = () => {
    saveQuotes([]);
    forceRender();
    setConfirmOpen(false);
  };

  const handleCloseSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  return (
    <Box sx={{ bgcolor: 'background.default', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Devis reçus (local)</Typography>
          <Stack direction="row" spacing={1}>
            <TextField size="small" placeholder="Rechercher..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <Tooltip title="Rafraîchir">
              <IconButton onClick={() => forceRender()}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button variant="outlined" color="error" onClick={handleOpenConfirm}>Tout supprimer</Button>
          </Stack>
        </Stack>

        <Paper elevation={4} sx={{ p: 2, borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Véhicule</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Canal</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((q) => (
                <TableRow key={q.id} hover>
                  <TableCell>{formatDate(q.createdAt)}</TableCell>
                  <TableCell>{q.name}</TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <span>{q.email}</span>
                      <span>{q.phone}</span>
                    </Stack>
                  </TableCell>
                  <TableCell>{q.vehicleId}</TableCell>
                  <TableCell sx={{ maxWidth: 360, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.message}</TableCell>
                  <TableCell>
                    <Chip size="small" label={q.channel || 'n/a'} color={q.channel === 'api' ? 'success' : q.channel === 'whatsapp' ? 'primary' : q.channel === 'email' ? 'secondary' : 'default'} />
                  </TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={q.status || 'nouveau'}
                      onChange={(e) => handleStatus(q.id, e.target.value as any)}
                    >
                      <MenuItem value="nouveau">Nouveau</MenuItem>
                      <MenuItem value="en_cours">En cours</MenuItem>
                      <MenuItem value="termine">Terminé</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Copier">
                      <IconButton onClick={() => handleCopy(q)}>
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Répondre">
                      <IconButton color="primary" onClick={() => openReplyDialog(q)}>
                        <ReplyIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton color="error" onClick={() => handleDelete(q.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                 </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography variant="body2" color="text.secondary">Aucun devis pour le moment.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Container>

      <Dialog open={confirmOpen} onClose={handleCloseConfirm}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Voulez-vous vraiment supprimer tous les devis stockés localement ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Annuler</Button>
          <Button onClick={handleConfirmClear} color="error" variant="contained">Supprimer</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(replyingQuote)} onClose={closeReplyDialog} fullWidth maxWidth="md">
        <DialogTitle>
          Répondre au devis
          <IconButton onClick={closeReplyDialog} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        {replyingQuote && (
          <DialogContent dividers>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{replyingQuote.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {replyingQuote.email} • Téléphone: {replyingQuote.phone}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Identifiant véhicule: {replyingQuote.vehicleId}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Demande initiale: {replyingQuote.message}
              </Typography>
            </Box>

            <Tabs
              value={replyChannel}
              onChange={(_, v) => setReplyChannel(v)}
              aria-label="Choix du canal de réponse"
              sx={{ mb: 2 }}
            >
              <Tab icon={<EmailIcon />} iconPosition="start" label="Réponse Email" value="email" />
              <Tab icon={<WhatsAppIcon />} iconPosition="start" label="Réponse WhatsApp" value="whatsapp" />
            </Tabs>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Message à envoyer
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={6}
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
            />

            {replyChannel === 'email' && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Pièces jointes (max 5, 5 Mo chacune)</Typography>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  hidden
                  onChange={(e) => handleFilesSelected(e.target.files)}
                />
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    startIcon={<AttachFileIcon />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Joindre des fichiers
                  </Button>
                </Stack>
                {attachments.length > 0 && (
                  <Stack spacing={1}>
                    {attachments.map((a, idx) => (
                      <Paper key={idx} variant="outlined" sx={{ p: 1, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ overflow: 'hidden', minWidth: 0 }}>
                          <AttachFileIcon fontSize="small" />
                          <Typography variant="body2" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 360 }}>
                            {a.filename}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{Math.round((a.size || 0)/1024)} Ko</Typography>
                        </Stack>
                        <Button size="small" color="error" onClick={() => removeAttachmentAt(idx)}>Supprimer</Button>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Box>
            )}

            {replyChannel === 'email' && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Détails de l'offre (facultatif)</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 1 }}>
                  <TextField
                    label="Prix TTC"
                    placeholder="ex: 249.90"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    fullWidth
                    InputProps={{ endAdornment: <InputAdornment position="end">€</InputAdornment> }}
                  />
                  <TextField
                    label="Kilométrage"
                    placeholder="ex: 120000"
                    value={mileageKm}
                    onChange={(e) => setMileageKm(e.target.value)}
                    fullWidth
                    InputProps={{ endAdornment: <InputAdornment position="end">km</InputAdornment> }}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Délai de livraison"
                    placeholder="ex: 48h, 3-5 jours"
                    value={delivery}
                    onChange={(e) => setDelivery(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Référence"
                    placeholder="ex: CPF-12345"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    fullWidth
                  />
                </Stack>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Tests effectués (cocher si réalisés)</Typography>
                  <FormGroup row>
                    <FormControlLabel control={<Checkbox checked={tests.compression} onChange={(e) => setTests((t) => ({ ...t, compression: e.target.checked }))} />} label="Compression" />
                    <FormControlLabel control={<Checkbox checked={tests.endoscopy} onChange={(e) => setTests((t) => ({ ...t, endoscopy: e.target.checked }))} />} label="Endoscopie" />
                    <FormControlLabel control={<Checkbox checked={tests.oilPressure} onChange={(e) => setTests((t) => ({ ...t, oilPressure: e.target.checked }))} />} label={"Test pression d'huile"} />
                    <FormControlLabel control={<Checkbox checked={tests.oilAnalysis} onChange={(e) => setTests((t) => ({ ...t, oilAnalysis: e.target.checked }))} />} label={"Analyse d'huile"} />
                    <FormControlLabel control={<Checkbox checked={tests.visualInspection} onChange={(e) => setTests((t) => ({ ...t, visualInspection: e.target.checked }))} />} label="Inspection visuelle" />
                  </FormGroup>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Défaut constaté (facultatif)</Typography>
                  <TextField
                    placeholder="Décrire le(s) défaut(s) observé(s)..."
                    value={defectObserved}
                    onChange={(e) => setDefectObserved(e.target.value)}
                    fullWidth
                    multiline
                    minRows={3}
                  />
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Articles proposés (facultatif)</Typography>
                  <Stack spacing={1}>
                    {items.map((it, idx) => (
                      <Paper key={idx} variant="outlined" sx={{ p: 1, borderRadius: 2 }}>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ xs: 'stretch', md: 'center' }}>
                          <TextField
                            label="Produit"
                            placeholder="ex: Moteur 1.5 dCi"
                            value={it.product}
                            onChange={(e) => updateItemField(idx, 'product', e.target.value)}
                            fullWidth
                          />
                          <TextField
                            label="Référence"
                            placeholder="ex: CPF-12345"
                            value={it.reference}
                            onChange={(e) => updateItemField(idx, 'reference', e.target.value)}
                            fullWidth
                          />
                          <TextField
                            label="Prix TTC"
                            placeholder="ex: 1890"
                            value={it.price || ''}
                            onChange={(e) => updateItemField(idx, 'price', e.target.value)}
                            fullWidth
                            InputProps={{ endAdornment: <InputAdornment position="end">€</InputAdornment> }}
                          />
                          <TextField
                            label="Garantie"
                            placeholder="ex: 6 mois"
                            value={it.warranty || ''}
                            onChange={(e) => updateItemField(idx, 'warranty', e.target.value)}
                            fullWidth
                          />
                          <TextField
                            label="Disponibilité"
                            placeholder="ex: En stock"
                            value={it.availability || ''}
                            onChange={(e) => updateItemField(idx, 'availability', e.target.value)}
                            fullWidth
                          />
                          <Button color="error" onClick={() => removeItemRow(idx)}>Supprimer</Button>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                  <Box sx={{ mt: 1 }}>
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={addItemRow}>Ajouter un article</Button>
                  </Box>
                </Box>
              </Box>
            )}

            <Box sx={{ mt: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mr: 1 }}>Historique des réponses</Typography>
                <Tooltip title="Rafraîchir les réponses client">
                  <span>
                    <IconButton size="small" onClick={() => replyingQuote && loadClientReplies(replyingQuote.id)} disabled={clientRepliesLoading}>
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                {clientRepliesLoading && <Typography variant="caption" color="text.secondary">Chargement…</Typography>}
              </Stack>
              {(() => {
                const sent = (replyingQuote.responses || []).map((r) => ({ id: r.id, channel: r.channel as any, message: r.message, createdAt: r.createdAt }));
                const received = clientReplies.map((c) => ({ id: c.id, channel: 'client' as const, message: `${c.fromName} <${c.fromEmail}>\n\n${c.message}`, createdAt: c.createdAt }));
                const merged = [...sent, ...received].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                return merged.length ? (
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    {merged.map((res) => (
                      <Paper key={res.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                          <Chip size="small" label={res.channel} color={res.channel === 'email' ? 'secondary' : res.channel === 'client' ? 'success' : 'primary'} />
                          <Typography variant="caption" color="text.secondary">{formatDate(res.createdAt)}</Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>{res.message}</Typography>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Aucune réponse pour le moment.
                  </Typography>
                );
              })()}
            </Box>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={closeReplyDialog}>Annuler</Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ReplyIcon />}
            onClick={handleSendReply}
            disabled={!replyMessage.trim()}
          >
            Envoyer
          </Button>
        </DialogActions>
      </Dialog>

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
  );
};

export default AdminQuotes;

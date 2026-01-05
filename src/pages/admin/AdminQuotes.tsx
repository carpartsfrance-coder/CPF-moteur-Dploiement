import React, { useMemo, useState, useReducer, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableContainer,
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
import { getQuotes, updateQuote, deleteQuote, QuoteItem, QuoteResponse, saveQuotes, addResponseToQuote } from '../../utils/quotesStore';

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
  const [attachmentSeq, setAttachmentSeq] = useState(1);
  const [price, setPrice] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [mileageKm, setMileageKm] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [delivery, setDelivery] = useState('Entre 8 et 12 jours');
  const [reference, setReference] = useState('');
  const [deliveryCost, setDeliveryCost] = useState('189');
  const [warranty, setWarranty] = useState('1 an');
  const [configuration, setConfiguration] = useState('Moteur avec accessoires');
  const [items, setItems] = useState<ItemInput[]>([]);
  const [tests, setTests] = useState({
    compression: true,
    endoscopy: true,
    oilPressure: true,
    oilAnalysis: true,
    visualInspection: true,
  });
  const [defectObserved, setDefectObserved] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [adminResponses, setAdminResponses] = useState<QuoteResponse[]>([]);
  const [clientReplies, setClientReplies] = useState<ClientReply[]>([]);
  const [clientRepliesLoading, setClientRepliesLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createVehicleId, setCreateVehicleId] = useState('');
  const [createMessage, setCreateMessage] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Lire les devis à chaque rendu; 'tick' force un re-render lorsque l'on modifie les données
  const [remoteQuotes, setRemoteQuotes] = useState<QuoteItem[]>([]);
  type StorageInfo = {
    storage: 'mongo' | 'file';
    mongo: { enabled: boolean; connected: boolean; count: number | null; error: string | null };
    file: { count: number | null };
  };
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [storageLoading, setStorageLoading] = useState(false);
  const isLocalHost = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
  const reloadQuotes = async () => {
    try {
      const token = (process as any).env.REACT_APP_BACKEND_TOKEN || '';
      const prefix = (() => {
        const env = (process as any).env.REACT_APP_BACKEND_URL || '';
        if (String(env).trim()) return String(env).trim().replace(/\/$/, '');
        if (typeof window !== 'undefined') {
          const isLocal = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
          return isLocal ? 'http://localhost:3001' : '';
        }
        return '';
      })();
      const url = `${prefix}/api/admin/quotes`;
      const headers: Record<string,string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(url, { headers, credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data?.quotes) ? data.quotes : [];
      const mapped: QuoteItem[] = list.map((m: any) => ({
        id: String(m.id || ''),
        name: String(m.name || ''),
        email: String(m.email || ''),
        phone: String(m.phone || ''),
        vehicleId: String(m.vehicleId || ''),
        message: String(m.message || ''),
        createdAt: String(m.createdAt || new Date().toISOString()),
        channel: 'api',
        status: (m.status || 'nouveau') as QuoteItem['status'],
        followUpAt: m.followUpAt ? String(m.followUpAt) : undefined,
        lastOpenedAt: m.lastOpenedAt ? String(m.lastOpenedAt) : undefined,
        openCount: typeof m.openCount === 'number' ? m.openCount : undefined,
        responses: [],
      }));
      setRemoteQuotes(mapped);
    } catch {}
  };
  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const token = (process as any).env.REACT_APP_BACKEND_TOKEN || '';
        const prefix = (() => {
          const env = (process as any).env.REACT_APP_BACKEND_URL || '';
          if (String(env).trim()) return String(env).trim().replace(/\/$/, '');
          if (typeof window !== 'undefined') {
            const isLocal = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
            return isLocal ? 'http://localhost:3001' : '';
          }
          return '';
        })();
        const url = `${prefix}/api/admin/quotes`;
        const headers: Record<string,string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(url, { headers, credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data?.quotes) ? data.quotes : [];
        const mapped: QuoteItem[] = list.map((m: any) => ({
          id: String(m.id || ''),
          name: String(m.name || ''),
          email: String(m.email || ''),
          phone: String(m.phone || ''),
          vehicleId: String(m.vehicleId || ''),
          message: String(m.message || ''),
          createdAt: String(m.createdAt || new Date().toISOString()),
          channel: 'api',
          status: (m.status || 'nouveau') as QuoteItem['status'],
          followUpAt: m.followUpAt ? String(m.followUpAt) : undefined,
          lastOpenedAt: m.lastOpenedAt ? String(m.lastOpenedAt) : undefined,
          openCount: typeof m.openCount === 'number' ? m.openCount : undefined,
          responses: [],
        }));
        if (!aborted) setRemoteQuotes(mapped);
      } catch {}
    })();
    return () => { aborted = true; };
  }, []);
  const localQuotes = useMemo(() => {
    if (!isLocalHost) return [];
    return getQuotes();
  }, [isLocalHost]);
  const quotes: QuoteItem[] = useMemo(() => {
    if (!isLocalHost) return remoteQuotes;
    if (!remoteQuotes.length) return localQuotes;
    return [
      ...remoteQuotes,
      ...localQuotes.filter((lq) => !remoteQuotes.some((rq) => rq.id === lq.id)),
    ];
  }, [remoteQuotes, localQuotes, isLocalHost]);

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

  const fetchStorageInfo = async () => {
    try {
      setStorageLoading(true);
      const token = (process as any).env.REACT_APP_BACKEND_TOKEN || '';
      const prefix = (() => {
        const env = (process as any).env.REACT_APP_BACKEND_URL || '';
        if (String(env).trim()) return String(env).trim().replace(/\/$/, '');
        if (typeof window !== 'undefined') {
          const isLocal = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
          return isLocal ? 'http://localhost:3001' : '';
        }
        return '';
      })();
      const url = `${prefix}/api/admin/storage-info`;
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(url, { headers, credentials: 'include' });
      if (!res.ok) throw new Error('http');
      const data = await res.json();
      setStorageInfo(data?.info || null);
    } catch (err) {
      setStorageInfo(null);
      setSnackbar({ open: true, message: 'Impossible de lire le diagnostic stockage.', severity: 'error' });
    } finally {
      setStorageLoading(false);
    }
  };

  useEffect(() => {
    fetchStorageInfo();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatus = async (id: string, status: QuoteItem['status']) => {
    try {
      // Optimiste: met à jour l'état local et remote immédiatement
      updateQuote(id, { status });
      setRemoteQuotes((prev) => prev.map((q) => q.id === id ? { ...q, status } : q));
      forceRender();

      const token = (process as any).env.REACT_APP_BACKEND_TOKEN || '';
      const prefix = (() => {
        const env = (process as any).env.REACT_APP_BACKEND_URL || '';
        if (String(env).trim()) return String(env).trim().replace(/\/$/, '');
        if (typeof window !== 'undefined') {
          const isLocal = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
          return isLocal ? 'http://localhost:3001' : '';
        }
        return '';
      })();
      const headers: Record<string,string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${prefix}/api/admin/quotes/${id}/status`, {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('HTTP');
      // Option: recharger depuis le serveur pour être sûr
      // await reloadQuotes();
    } catch (e) {
      setSnackbar({ open: true, message: 'Échec de mise à jour du statut.', severity: 'error' });
    }
  };

  // Helpers pour calcul auto du prix de vente
  const parseEuro = (s: string) => {
    try {
      const cleaned = String(s).replace(/[^0-9,\.]/g, '').replace(',', '.');
      const n = Number(cleaned);
      return Number.isFinite(n) ? n : NaN;
    } catch { return NaN; }
  };
  const computeSalePrice = (buy: number) => {
    if (!Number.isFinite(buy) || buy <= 0) return NaN;
    if (buy <= 700) return buy * 2;
    if (buy <= 1500) return buy + 500;
    if (buy <= 3500) return buy * 1.45;
    return buy * 1.4;
  };

  const extractYearFromText = (s: string) => {
    try {
      const current = new Date().getFullYear();
      const matches = String(s || '').match(/\b(19\d{2}|20\d{2})\b/g) || [];
      for (const m of matches) {
        const y = parseInt(m, 10);
        if (y >= 1990 && y <= current) return y;
      }
      return NaN;
    } catch { return NaN; }
  };

  const getMileageBoundsForYear = (y: number) => {
    if (!Number.isFinite(y)) return { min: 10000, max: 30000 };
    if (y <= 2004) return { min: 102000, max: 130000 };
    if (y <= 2009) return { min: 95000, max: 125000 };
    if (y <= 2014) return { min: 90000, max: 115000 };
    if (y <= 2016) return { min: 100000, max: 110000 };
    if (y <= 2019) return { min: 80000, max: 90000 };
    if (y <= 2021) return { min: 60000, max: 75000 };
    if (y <= 2023) return { min: 35000, max: 55000 };
    return { min: 15000, max: 30000 };
  };

  const generateMileageForYear = (y: number) => {
    const { min, max } = getMileageBoundsForYear(y);
    const minK = Math.round(min / 1000) * 1000;
    const maxK = Math.round(max / 1000) * 1000;
    const steps = Math.max(1, Math.floor((maxK - minK) / 1000));
    const idx = Math.floor(Math.random() * (steps + 1));
    return minK + idx * 1000;
  };

  const handleDelete = async (id: string) => {
    // Supprime de la copie locale (stockage navigateur)
    deleteQuote(id);
    // Supprime immédiatement du tableau de devis distants pour mettre à jour l'UI
    setRemoteQuotes((prev) => prev.filter((q) => q.id !== id));
    forceRender();

    try {
      // Appeler le backend uniquement si ce devis provient des données distantes
      const isRemote = remoteQuotes.some((q) => q.id === id);
      if (!isRemote) return;

      const token = (process as any).env.REACT_APP_BACKEND_TOKEN || '';
      const prefix = (() => {
        const env = (process as any).env.REACT_APP_BACKEND_URL || '';
        if (String(env).trim()) return String(env).trim().replace(/\/$/, '');
        if (typeof window !== 'undefined') {
          const isLocal = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
          return isLocal ? 'http://localhost:3001' : '';
        }
        return '';
      })();
      if (prefix) {
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`${prefix}/api/admin/quotes/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers,
          credentials: 'include',
        });
        if (!res.ok && res.status !== 404) throw new Error('HTTP');
      }
    } catch (e) {
      setSnackbar({ open: true, message: 'Échec de suppression du devis côté serveur.', severity: 'error' });
    }
  };

  const handleCopy = async (q: QuoteItem) => {
    const text = `Devis\n\nNom: ${q.name}\nEmail: ${q.email}\nTéléphone: ${q.phone}\nIdentifiant véhicule: ${q.vehicleId}\nMessage: ${q.message}\nCanal: ${q.channel || 'n/a'}\nCréé le: ${formatDate(q.createdAt)}\nID: ${q.id}`;
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  const loadClientReplies = async (id: string) => {
    try {
      setClientRepliesLoading(true);
      const token = process.env.REACT_APP_BACKEND_TOKEN;
      const prefix = (() => {
        const env = (process as any).env.REACT_APP_BACKEND_URL || '';
        if (String(env).trim()) return String(env).trim().replace(/\/$/, '');
        if (typeof window !== 'undefined') {
          const isLocal = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
          return isLocal ? 'http://localhost:3001' : '';
        }
        return '';
      })();
      const headers: Record<string,string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      // Réponses admin (MongoDB)
      try {
        const resAdmin = await fetch(`${prefix}/api/admin/quote-responses/${id}`, {
          headers,
          credentials: 'include',
        });
        if (resAdmin.ok) {
          const data = await resAdmin.json();
          const list = Array.isArray(data?.responses) ? (data.responses as QuoteResponse[]) : [];
          setAdminResponses(list);
        } else {
          setAdminResponses([]);
        }
      } catch {
        setAdminResponses([]);
      }

      // Réponses client (fichier JSON)
      try {
        const res = await fetch(`${prefix}/api/replies/${id}`, {
          headers,
          credentials: 'include',
        });
        if (!res.ok) throw new Error('HTTP');
        const data = await res.json();
        const list = Array.isArray(data?.replies) ? (data.replies as ClientReply[]) : [];
        setClientReplies(list);
      } catch {
        setClientReplies([]);
      }
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
      'N’hésitez pas à revenir vers nous pour confirmer ce devis ou pour toute question complémentaire.',
      '',
      'Bien cordialement,',
      'CAR PARTS FRANCE',
    ].join('\n'));
    setAttachments([]);
    setAttachmentSeq(1);
    setPrice('');
    setBuyPrice('');
    setMileageKm('');
    setVehicleYear('');
    setDelivery('Entre 8 et 12 jours');
    setReference('');
    setDeliveryCost('189');
    setWarranty('1 an');
    setConfiguration('Moteur avec accessoires');
    setItems([]);
    setTests({ compression: true, endoscopy: true, oilPressure: true, oilAnalysis: true, visualInspection: true });
    setDefectObserved('');
    setAdminResponses([]);
    try {
      const yr = extractYearFromText(`${quote.vehicleId || ''} ${quote.message || ''}`);
      if (Number.isFinite(yr)) {
        setVehicleYear(String(yr));
        setMileageKm(String(generateMileageForYear(yr)));
      }
    } catch {}
    (async () => {
      try {
        const res = await fetch('/rapports/exemple-rapport-tests-moteur.pdf', { cache: 'no-store' });
        if (!res.ok) return;
        const blob = await res.blob();
        const dataUrl: string = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        const type = blob.type || 'application/pdf';
        const size = estimateBytesFromDataURL(dataUrl);
        let ext = '.pdf';
        if (type === 'image/webp') ext = '.webp';
        else if (type === 'image/jpeg' || type === 'image/jpg') ext = '.jpg';
        else if (type === 'image/png') ext = '.png';
        setAttachments((prev) => [...prev, { filename: `CPF MOTEUR 1${ext}`, content: dataUrl, type, size }]);
        setAttachmentSeq((s) => s + 1);
      } catch {}
    })();
    void loadClientReplies(quote.id);
  };

  const closeReplyDialog = () => {
    setReplyingQuote(null);
    setReplyMessage('');
    setAttachments([]);
    setPrice('');
    setBuyPrice('');
    setMileageKm('');
    setVehicleYear('');
    setDelivery('');
    setReference('');
    setDeliveryCost('');
    setWarranty('');
    setConfiguration('');
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
    if (prepared.length) {
      const renamed = prepared.map((a, idx) => {
        const m = a.filename.match(/\.[^.]+$/);
        let ext = m ? m[0] : '';
        if (!ext) {
          if (a.type === 'application/pdf') ext = '.pdf';
          else if (a.type === 'image/webp') ext = '.webp';
          else if (a.type === 'image/jpeg' || a.type === 'image/jpg') ext = '.jpg';
          else if (a.type === 'image/png') ext = '.png';
        }
        const num = attachmentSeq + idx;
        return { ...a, filename: `CPF MOTEUR ${num}${ext || ''}` };
      });
      setAttachments((prev) => [...prev, ...renamed]);
      setAttachmentSeq(attachmentSeq + renamed.length);
    }
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
    // Validation: référence / code moteur obligatoire
    if (!reference.trim()) {
      setSnackbar({ open: true, message: 'Veuillez renseigner la Référence / code moteur (obligatoire).', severity: 'error' });
      return;
    }
    const nowIso = new Date().toISOString();
    const response: QuoteResponse = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
      channel: replyChannel === 'email' ? 'email' : 'whatsapp',
      message: replyMessage,
      createdAt: nowIso,
      extras: {
        price: price.trim() || undefined,
        mileageKm: mileageKm.trim() || undefined,
        delivery: delivery.trim() || undefined,
        reference: reference.trim() || undefined,
        deliveryCost: deliveryCost.trim() || undefined,
        warranty: warranty.trim() || undefined,
        configuration: configuration.trim() || undefined,
        vehicleId: replyingQuote.vehicleId || undefined,
        engineCode: reference.trim() || undefined,
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
        ].filter(Boolean) as string[],
        defectObserved: defectObserved.trim() || undefined,
      },
      attachments: attachments.map(a => ({
        filename: a.filename,
        type: a.type,
        size: a.size,
        content: a.content,
      })),
    };
    if (replyChannel === 'email') {
      const subject = `Réponse à votre devis - Car Parts France Pro`;
      const token = process.env.REACT_APP_BACKEND_TOKEN;
      try {
        const prefix = (() => {
          const env = (process as any).env.REACT_APP_BACKEND_URL || '';
          if (String(env).trim()) return String(env).trim().replace(/\/$/, '');
          if (typeof window !== 'undefined') {
            const isLocal = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
            return isLocal ? 'http://localhost:3001' : '';
          }
          return '';
        })();
        if (true) {
          const headers: Record<string,string> = { 'Content-Type': 'application/json' };
          if (token) headers.Authorization = `Bearer ${token}`;
          const res = await fetch(`${prefix}/api/devis/${replyingQuote.id}/reponse`, {
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
              extras: response.extras,
            }),
          });
          if (!res.ok) throw new Error('API non OK');
          addResponseToQuote(replyingQuote.id, response);
          setAdminResponses((prev) => [...prev, response]);
          // Met à jour le statut localement (et prochain rappel J+2)
          const fu = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
          updateQuote(replyingQuote.id, { status: 'en_attente_client', followUpAt: fu });
          setRemoteQuotes((prev) => prev.map((q) => q.id === replyingQuote.id ? { ...q, status: 'en_attente_client', followUpAt: fu } : q));
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
      setAdminResponses((prev) => [...prev, response]);
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

  const resetCreateForm = () => {
    setCreateName('');
    setCreateEmail('');
    setCreatePhone('');
    setCreateVehicleId('');
    setCreateMessage('');
  };

  const handleCreateQuote = async () => {
    const name = createName.trim();
    const email = createEmail.trim();
    const phone = createPhone.trim();
    const vehicleId = createVehicleId.trim();
    const message = createMessage.trim();
    if (!vehicleId || (!email && !phone)) {
      setSnackbar({ open: true, message: 'Renseignez au minimum le véhicule et un email ou un téléphone.', severity: 'error' });
      return;
    }
    try {
      setCreateLoading(true);
      const token = (process as any).env.REACT_APP_BACKEND_TOKEN || '';
      const prefix = (() => {
        const env = (process as any).env.REACT_APP_BACKEND_URL || '';
        if (String(env).trim()) return String(env).trim().replace(/\/$/, '');
        if (typeof window !== 'undefined') {
          const isLocal = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
          return isLocal ? 'http://localhost:3001' : '';
        }
        return '';
      })();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${prefix}/api/admin/quotes`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          name,
          email,
          phone,
          vehicleId,
          message,
          source: 'manual',
          createdAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error('HTTP');
      const data = await res.json();
      const q = data?.quote || {};
      const newQuote: QuoteItem = {
        id: String(q.id || ''),
        name: String(q.name || name),
        email: String(q.email || email),
        phone: String(q.phone || phone),
        vehicleId: String(q.vehicleId || vehicleId),
        message: String(q.message || message),
        createdAt: String(q.createdAt || new Date().toISOString()),
        channel: 'api',
        status: (q.status || 'nouveau') as QuoteItem['status'],
        followUpAt: q.followUpAt ? String(q.followUpAt) : undefined,
        lastOpenedAt: q.lastOpenedAt ? String(q.lastOpenedAt) : undefined,
        openCount: typeof q.openCount === 'number' ? q.openCount : undefined,
        responses: [],
      };
      setRemoteQuotes((prev) => [newQuote, ...prev]);
      resetCreateForm();
      setCreateOpen(false);
      setSnackbar({ open: true, message: 'Devis ajouté.', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: "Échec de création du devis.", severity: 'error' });
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Stack spacing={2} sx={{ mb: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Devis reçus</Typography>
            <Stack direction="row" spacing={1}>
              <TextField size="small" placeholder="Rechercher..." value={query} onChange={(e) => setQuery(e.target.value)} />
              <Tooltip title="Rafraîchir">
                <IconButton onClick={() => { void reloadQuotes(); }}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>Ajouter un devis</Button>
              <Button variant="outlined" color="error" onClick={handleOpenConfirm}>Tout supprimer</Button>
            </Stack>
          </Stack>

          <Alert
            severity={storageInfo?.storage === 'mongo' && storageInfo.mongo.connected ? 'success' : 'warning'}
            action={
              <Button color="inherit" size="small" onClick={() => { void fetchStorageInfo(); }} disabled={storageLoading}>
                {storageLoading ? '...' : 'Actualiser'}
              </Button>
            }
          >
            {storageInfo ? (
              storageInfo.storage === 'mongo' && storageInfo.mongo.connected ? (
                <>
                  Stockage actuel : <strong>MongoDB</strong> ({storageInfo.mongo.count ?? '—'} documents).
                </>
              ) : (
                <>
                  Stockage actuel : <strong>fichier local</strong>. Configure MongoDB sur Vercel pour sécuriser les devis ({storageInfo.file.count ?? '0'} devis enregistrés localement).
                </>
              )
            ) : (
              <>Diagnostic du stockage en cours…</>
            )}
          </Alert>
        </Stack>

        <Paper elevation={4} sx={{ p: 0, borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: { xs: 'calc(100vh - 260px)', md: '70vh' }, overflowX: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Véhicule</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Canal</TableCell>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      right: { xs: 160, md: 200 },
                      zIndex: 3,
                      backgroundColor: (theme) => theme.palette.background.paper,
                      whiteSpace: 'nowrap',
                      minWidth: { xs: 160, md: 200 },
                      width: { xs: 160, md: 200 },
                      maxWidth: { xs: 160, md: 200 },
                      boxShadow: 'inset 6px 0 6px -6px rgba(15,23,42,0.18)',
                    }}
                  >
                    Statut
                  </TableCell>
                  <TableCell>Lecture</TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      position: 'sticky',
                      right: 0,
                      zIndex: 3,
                      backgroundColor: (theme) => theme.palette.background.paper,
                      whiteSpace: 'nowrap',
                      minWidth: { xs: 160, md: 200 },
                      width: { xs: 160, md: 200 },
                      maxWidth: { xs: 160, md: 200 },
                      boxShadow: 'inset 6px 0 6px -6px rgba(15,23,42,0.2)',
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              {filtered.map((q) => (
                <TableRow key={q.id} hover sx={{ '& td': { verticalAlign: 'top' } }}>
                  <TableCell>{formatDate(q.createdAt)}</TableCell>
                  <TableCell>{q.name}</TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <span>{q.email}</span>
                      <span>{q.phone}</span>
                    </Stack>
                  </TableCell>
                  <TableCell>{q.vehicleId}</TableCell>
                  <TableCell sx={{ maxWidth: { xs: 240, sm: 360 }, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.message}</TableCell>
                  <TableCell>
                    <Chip size="small" label={q.channel || 'n/a'} color={q.channel === 'api' ? 'success' : q.channel === 'whatsapp' ? 'primary' : q.channel === 'email' ? 'secondary' : 'default'} />
                  </TableCell>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      right: { xs: 130, md: 180 },
                      zIndex: 2,
                      backgroundColor: (theme) => theme.palette.background.paper,
                      whiteSpace: 'nowrap',
                      minWidth: { xs: 140, md: 160 },
                      boxShadow: 'inset 6px 0 6px -6px rgba(15,23,42,0.12)',
                    }}
                  >
                    <Select
                      size="small"
                      value={q.status || 'nouveau'}
                      onChange={(e) => handleStatus(q.id, e.target.value as any)}
                    >
                      <MenuItem value="nouveau">Nouveau</MenuItem>
                      <MenuItem value="en_attente_client">En attente client</MenuItem>
                      <MenuItem value="en_cours">En cours</MenuItem>
                      <MenuItem value="termine">Terminé</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {q.lastOpenedAt
                      ? (
                        <Stack spacing={0}>
                          <span>Ouvert: {formatDate(q.lastOpenedAt)}</span>
                          <span style={{ color: '#64748b', fontSize: 12 }}>{(q.openCount ?? 1)} fois</span>
                        </Stack>
                      )
                      : <span style={{ color: '#9ca3af' }}>Jamais</span>}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      position: 'sticky',
                      right: 0,
                      backgroundColor: (theme) => theme.palette.background.paper,
                      whiteSpace: 'nowrap',
                      zIndex: 2,
                      boxShadow: 'inset 6px 0 6px -6px rgba(15,23,42,0.15)',
                    }}
                  >
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end" flexWrap="wrap">
                      <Tooltip title="Copier">
                        <IconButton size="small" onClick={() => handleCopy(q)}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Répondre">
                        <IconButton size="small" color="primary" onClick={() => openReplyDialog(q)}>
                          <ReplyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton size="small" color="error" onClick={() => handleDelete(q.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
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
          </TableContainer>
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

      <Dialog open={createOpen} onClose={() => { if (!createLoading) { setCreateOpen(false); resetCreateForm(); } }} fullWidth maxWidth="sm">
        <DialogTitle>Ajouter un devis manuel</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nom du client"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              fullWidth
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Email"
                type="email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                fullWidth
              />
              <TextField
                label="Téléphone"
                value={createPhone}
                onChange={(e) => setCreatePhone(e.target.value)}
                fullWidth
              />
            </Stack>
            <TextField
              label="Immatriculation / identifiant véhicule"
              value={createVehicleId}
              onChange={(e) => setCreateVehicleId(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Message / détails de la demande"
              value={createMessage}
              onChange={(e) => setCreateMessage(e.target.value)}
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { if (!createLoading) { setCreateOpen(false); resetCreateForm(); } }}>Annuler</Button>
          <Button onClick={() => { if (!createLoading) { void handleCreateQuote(); } }} variant="contained" disabled={createLoading}>Enregistrer</Button>
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
                    label="Prix d'achat TTC (interne)"
                    placeholder="ex: 900"
                    value={buyPrice}
                    onChange={(e) => {
                      const v = e.target.value;
                      setBuyPrice(v);
                      const n = parseEuro(v);
                      const s = computeSalePrice(n);
                      if (Number.isFinite(s)) {
                        setPrice(String(Math.round(s)));
                      }
                    }}
                    fullWidth
                    InputProps={{ endAdornment: <InputAdornment position="end">€</InputAdornment> }}
                  />
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
                  <Button
                    variant="outlined"
                    onClick={() => {
                      const y = parseInt(vehicleYear, 10);
                      if (Number.isFinite(y) && y >= 1990 && y <= new Date().getFullYear()) {
                        setMileageKm(String(generateMileageForYear(y)));
                      }
                    }}
                    disabled={!/^((19|20)\d{2})$/.test(vehicleYear)}
                  >
                    Régénérer
                  </Button>
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Délai de livraison"
                    placeholder="ex: 48h, 3-5 jours"
                    value={delivery}
                    onChange={(e) => setDelivery(e.target.value)}
                    disabled
                    fullWidth
                  />
                  <TextField
                    label="Année du véhicule"
                    placeholder="ex: 2015"
                    value={vehicleYear}
                    onChange={(e) => {
                      const raw = (e.target.value || '').replace(/[^0-9]/g, '').slice(0, 4);
                      setVehicleYear(raw);
                      if (raw.length === 4) {
                        const y = parseInt(raw, 10);
                        if (y >= 1990 && y <= new Date().getFullYear()) {
                          setMileageKm(String(generateMileageForYear(y)));
                        }
                      }
                    }}
                    fullWidth
                  />
                  <TextField
                    label="Référence / code moteur"
                    placeholder="ex: CPF-12345"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    required
                    helperText={reference.trim() ? '' : 'Obligatoire'}
                    fullWidth
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
                  <TextField
                    label="Frais de livraison TTC"
                    placeholder="ex: 149"
                    value={deliveryCost}
                    onChange={(e) => setDeliveryCost(e.target.value)}
                    fullWidth
                    InputProps={{ endAdornment: <InputAdornment position="end">€</InputAdornment> }}
                  />
                  <TextField
                    select
                    label="Garantie"
                    value={warranty}
                    onChange={(e) => setWarranty(String(e.target.value))}
                    fullWidth
                  >
                    <MenuItem value="6 mois">6 mois</MenuItem>
                    <MenuItem value="1 an">1 an</MenuItem>
                  </TextField>
                  <TextField
                    select
                    label="Configuration"
                    value={configuration}
                    onChange={(e) => setConfiguration(String(e.target.value))}
                    fullWidth
                  >
                    <MenuItem value="Moteur avec accessoires">Moteur avec accessoires</MenuItem>
                    <MenuItem value="Moteur sans accessoires">Moteur sans accessoires</MenuItem>
                  </TextField>
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
                <Tooltip title="Rafraîchir l'historique">
                  <span>
                    <IconButton size="small" onClick={() => replyingQuote && loadClientReplies(replyingQuote.id)} disabled={clientRepliesLoading}>
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                {clientRepliesLoading && <Typography variant="caption" color="text.secondary">Chargement…</Typography>}
              </Stack>
              {(() => {
                const src = adminResponses.length ? adminResponses : (replyingQuote.responses || []);
                const sent = src.map((r) => {
                  const lines: string[] = [];
                  const e = r.extras || {};
                  if (e.price) lines.push(`Prix TTC proposé : ${e.price}`);
                  if (e.mileageKm) lines.push(`Kilométrage : ${e.mileageKm} km`);
                  if (e.warranty) lines.push(`Garantie : ${e.warranty}`);
                  if (e.delivery) lines.push(`Délai de livraison : ${e.delivery}`);
                  if (e.deliveryCost) lines.push(`Frais de port : ${e.deliveryCost} €`);
                  if (e.configuration) lines.push(`Configuration : ${e.configuration}`);
                  if (Array.isArray(e.items) && e.items.length) {
                    lines.push('Articles proposés :');
                    for (const it of e.items) {
                      const parts = [it.product, it.reference, it.price ? `${it.price} €` : undefined, it.warranty].filter(Boolean);
                      if (parts.length) lines.push(` • ${parts.join(' / ')}`);
                    }
                  }
                  if (Array.isArray(e.testsPerformed) && e.testsPerformed.length) {
                    lines.push(`Tests réalisés : ${e.testsPerformed.join(', ')}`);
                  }
                  if (e.defectObserved) {
                    lines.push(`Défaut constaté : ${e.defectObserved}`);
                  }
                  if (Array.isArray(r.attachments) && r.attachments.length) {
                    lines.push(`Pièces jointes : ${r.attachments.map(a => a.filename).join(', ')}`);
                  }
                  const fullMessage = lines.length ? [lines.join('\n'), '', r.message].join('\n') : r.message;
                  return { id: r.id, channel: r.channel as any, message: fullMessage, createdAt: r.createdAt, attachments: r.attachments || [] } as any;
                });
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
                        {Array.isArray((res as any).attachments) && (res as any).attachments.some((a: any) => a && typeof a.content === 'string' && a.content.startsWith('data:image')) && (
                          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                            {(res as any).attachments.map((a: any, idx: number) => {
                              const src = typeof a.content === 'string' ? a.content : '';
                              const t = typeof a.type === 'string' ? a.type : '';
                              const isImage = src.startsWith('data:image') || t.startsWith('image/');
                              if (!src || !isImage) return null;
                              return (
                                <Box
                                  key={idx}
                                  component="a"
                                  href={src}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{
                                    display: 'inline-block',
                                    mr: 1,
                                    mb: 1,
                                    borderRadius: 1,
                                    border: '1px solid #eee',
                                    overflow: 'hidden',
                                  }}
                                >
                                  <Box
                                    component="img"
                                    src={src}
                                    alt={a.filename || `Pièce jointe ${idx + 1}`}
                                    sx={{ width: 80, height: 80, objectFit: 'cover', display: 'block' }}
                                  />
                                </Box>
                              );
                            })}
                          </Stack>
                        )}
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

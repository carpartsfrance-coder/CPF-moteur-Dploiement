import 'dotenv/config';
import express from 'express';
import compression from 'compression';
import cors from 'cors';
import { MailerSend, EmailParams, Sender, Recipient, Attachment } from 'mailersend';
import crypto from 'crypto';
import { addReply, getReplies, setQuoteMeta, getQuoteMeta } from './storage.js';
import buildReplyEmailHtml from './emailTemplate.js';
import path from 'path';
import fs from 'fs';
import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';
 
let __sharp = null;
async function getSharp() { if (__sharp) return __sharp; const m = await import('sharp'); __sharp = m.default || m; return __sharp; }

const app = express();
// En production (Railway), utiliser PORT. En local, rester sur 3001 par défaut.
const PORT = process.env.PORT || process.env.BACKEND_PORT || 3001;
const TOKEN = process.env.BACKEND_TOKEN || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const SERVER_LOCAL = `http://localhost:${PORT}`;
const SERVER_LOCAL_127 = `http://127.0.0.1:${PORT}`;
const DEFAULT_ALLOWED = ['http://localhost:3000', 'http://localhost:3001', SERVER_LOCAL, SERVER_LOCAL_127];
const VERCEL_ORIGIN = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '';
const ENV_ALLOWED = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const ALLOWED_ORIGINS = Array.from(new Set([...DEFAULT_ALLOWED, VERCEL_ORIGIN, ...ENV_ALLOWED].filter(Boolean)));

// Utilitaire: attente
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Utilitaire: envoi avec retry simple
async function sendWithRetry(mailerSend, emailParams, attempts = 2) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await mailerSend.email.send(emailParams);
    } catch (err) {
      lastErr = err;
      const code = err?.code || err?.response?.status;
      console.error(`[sendWithRetry] tentative ${i + 1}/${attempts} échouée`, code || '', err?.message || '');
      // petit backoff progressif
      await sleep(800 * (i + 1));
    }
  }
  throw lastErr;
}

// CORS
app.use(cors({
  origin: (origin, cb) => {
    // Autoriser les outils sans origin (curl, SSR, etc.)
    if (!origin) return cb(null, true);

    // Autoriser toutes les origines localhost/127.0.0.1, quel que soit le port (ex: 127.0.0.1:59657)
    if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return cb(null, true);
    }

    // Sinon, vérifier la liste blanche explicite
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);

    return cb(new Error('Not allowed by CORS'));
  },
  methods: ['POST', 'GET', 'OPTIONS', 'DELETE', 'PATCH', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Compression HTTP (gzip/deflate)
app.use(compression({ level: 6 }));

// Augmente la limite pour supporter des pièces jointes encodées en base64 dans le JSON
app.use(express.json({ limit: '15mb' }));

// Galerie publique d'images (statique + listing JSON) — placée AVANT l'auth middleware
const GALLERY_DIR = process.env.GALLERY_DIR || '';
if (GALLERY_DIR) {
  // Sert les fichiers du dossier local en statique, avec cache long
  app.use('/gallery', express.static(GALLERY_DIR, {
    maxAge: '7d',
    immutable: true,
    etag: true
  }));

  // Version optimisée WebP pour les fichiers locaux
  app.get('/gallery-opt/*', async (req, res) => {
    try {
      const rel = req.params[0] || '';
      const filePath = path.join(GALLERY_DIR, rel);
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
      res.setHeader('Vary', 'Accept');
      const ext = path.extname(filePath).toLowerCase();
      const wantsWebp = acceptsWebp(req) && ['.jpg','.jpeg','.png','.webp'].includes(ext);
      if (!wantsWebp || ext === '.webp') {
        return res.sendFile(filePath);
      }
      const rs = fs.createReadStream(filePath);
      res.setHeader('Content-Type', 'image/webp');
      rs.on('error', () => res.status(404).end());
      const sharp = await getSharp();
      rs.pipe(sharp().webp({ quality: 82 })).on('error', () => res.status(500).end()).pipe(res);
    } catch (e) {
      console.error('[gallery-opt] error', e);
      res.status(500).end();
    }
  });

  // Endpoint public pour lister les images disponibles
  // Remplacé ci-dessous par la version MongoDB/GridFS si configurée
}

// ==== MongoDB / GridFS pour la galerie ====
const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB = process.env.MONGODB_DB || 'carparts';
let mongoClient = null;
let mongoDb = null;
let galleryBucket = null;

async function initMongo() {
  if (!MONGODB_URI) return null;
  if (mongoClient && mongoDb && galleryBucket) return { mongoClient, mongoDb, galleryBucket };
  mongoClient = new MongoClient(MONGODB_URI);
  await mongoClient.connect();
  mongoDb = mongoClient.db(MONGODB_DB);
  galleryBucket = new GridFSBucket(mongoDb, { bucketName: 'gallery' });
  return { mongoClient, mongoDb, galleryBucket };
}

function detectStatusFromName(name = '') {
  const lower = String(name).toLowerCase();
  if (/hs|casse|panne|defect|defaut|crack|endom/.test(lower)) return 'hs';
  if (/ok|valide|test|clean|parfait/.test(lower)) return 'ok';
  return 'unknown';
}

function acceptsWebp(req) {
  const acc = String(req.headers['accept'] || '');
  return acc.includes('image/webp');
}

// Flux public d'un fichier stocké en GridFS
app.get('/gallery-file/:id', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).json({ ok: false, error: 'mongo_not_configured' });
    await initMongo();
    const id = new ObjectId(String(req.params.id));
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    res.setHeader('Vary', 'Accept');
    const stream = galleryBucket.openDownloadStream(id);
    let originalCt = 'application/octet-stream';
    let transformed = false;
    stream.on('file', async (file) => {
      originalCt = (file && (file.contentType || file.metadata?.contentType)) || 'application/octet-stream';
      const wantsWebp = acceptsWebp(req) && originalCt.startsWith('image/') && originalCt !== 'image/webp';
      if (wantsWebp) {
        res.setHeader('Content-Type', 'image/webp');
        transformed = true;
        const sharp = await getSharp();
        const transformer = sharp().webp({ quality: 82 });
        stream.pipe(transformer).on('error', (err) => {
          console.error('[sharp] transform error', err?.message || err);
          if (!res.headersSent) res.status(500).end();
        }).pipe(res);
      } else {
        res.setHeader('Content-Type', originalCt);
        stream.pipe(res);
      }
    });
    stream.on('error', (e) => {
      console.error('[gridfs] stream error', e?.message || e);
      res.status(404).end();
    });
    // Si pour une raison on n'est pas passé dans 'file', fallback pipe brut
    stream.on('end', () => {
      if (!transformed && !res.headersSent) {
        res.setHeader('Content-Type', originalCt);
      }
    });
  } catch (err) {
    console.error('[gridfs] open error', err);
    res.status(400).json({ ok: false, error: 'invalid_id' });
  }
});

// Upload direct en base64 vers GridFS (protégé par token)
app.post('/api/gallery/upload', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).json({ ok: false, error: 'mongo_not_configured' });
    await initMongo();
    const { filename, content, contentType, status } = req.body || {};
    if (!filename || !content) return res.status(400).json({ ok: false, error: 'missing_fields' });
    const dataUrlMatch = String(content).match(/^data:([^;]+);base64,(.+)$/);
    const base64 = dataUrlMatch ? dataUrlMatch[2] : String(content);
    const ct = dataUrlMatch ? dataUrlMatch[1] : (contentType || 'image/jpeg');
    const buffer = Buffer.from(base64, 'base64');
    let insertedId = null;
    await new Promise((resolve, reject) => {
      const upload = galleryBucket.openUploadStream(String(filename), { contentType: ct, metadata: { status: status || detectStatusFromName(filename) } });
      upload.on('error', reject);
      upload.on('finish', (f) => { insertedId = f._id; resolve(null); });
      upload.end(buffer);
    });
    res.json({ ok: true, id: String(insertedId) });
  } catch (err) {
    console.error('[gallery] upload error:', err);
    res.status(500).json({ ok: false, error: 'upload_failed' });
  }
});

// Suppression d'une image GridFS (protégé par token)
app.delete('/api/gallery/:id', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).json({ ok: false, error: 'mongo_not_configured' });
    await initMongo();
    const id = new ObjectId(String(req.params.id));
    await galleryBucket.delete(id);
    res.json({ ok: true });
  } catch (err) {
    console.error('[gallery] delete error:', err);
    res.status(400).json({ ok: false, error: 'delete_failed' });
  }
});

// Mise à jour du statut (metadata) d'une image (protégé par token)
app.patch('/api/gallery/:id', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).json({ ok: false, error: 'mongo_not_configured' });
    await initMongo();
    const id = new ObjectId(String(req.params.id));
    const { status } = req.body || {};
    if (!status) return res.status(400).json({ ok: false, error: 'missing_status' });
    const filesCol = mongoDb.collection('gallery.files');
    await filesCol.updateOne({ _id: id }, { $set: { 'metadata.status': String(status) } });
    res.json({ ok: true });
  } catch (err) {
    console.error('[gallery] patch error:', err);
    res.status(400).json({ ok: false, error: 'patch_failed' });
  }
});

// Liste admin détaillée (protégé par token)
app.get('/api/gallery/admin', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).json({ ok: false, error: 'mongo_not_configured' });
    await initMongo();
    const files = await galleryBucket.find({}, { sort: { uploadDate: -1 } }).toArray();
    const items = files.map((f) => ({
      id: String(f._id),
      filename: f.filename,
      length: f.length,
      uploadDate: f.uploadDate,
      contentType: f.contentType,
      status: f.metadata?.status || detectStatusFromName(f.filename),
      url: `/gallery-file/${String(f._id)}`
    }));
    res.json({ ok: true, items });
  } catch (err) {
    console.error('[gallery] admin list error:', err);
    res.status(500).json({ ok: false, error: 'admin_list_failed' });
  }
});

// Liste publique des images de la galerie depuis MongoDB/GridFS (fallback sur FS si Mongo non configuré)
app.get('/api/public/gallery', async (req, res) => {
  try {
    if (MONGODB_URI) {
      await initMongo();
      const cursor = galleryBucket.find({}, { sort: { uploadDate: -1 } });
      const files = await cursor.toArray();
      const images = files.map((f) => ({
        name: f.filename,
        url: `/gallery-file/${String(f._id)}`,
        status: f.metadata?.status || detectStatusFromName(f.filename)
      }));
      return res.json({ ok: true, images });
    }
    // Fallback: lecture dossier local si Mongo non configuré
    const dir = GALLERY_DIR;
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    const allowed = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
    const images = entries
      .filter((d) => d.isFile())
      .map((d) => d.name)
      .filter((name) => allowed.has(path.extname(name).toLowerCase()))
      .map((name) => ({ name, url: `/gallery-opt/${encodeURIComponent(name)}`, status: detectStatusFromName(name) }));
    return res.json({ ok: true, images });
  } catch (err) {
    console.error('[gallery] listing error:', err);
    res.status(500).json({ ok: false, error: 'gallery_list_error' });
  }
});

// === SEO: Sitemap et Robots publics ===
function getWebsiteOrigin() {
  const raw = (process.env.COMPANY_WEBSITE_URL || process.env.FRONTEND_URL || 'http://localhost:3000').trim();
  try {
    const u = new URL(raw);
    return u.origin;
  } catch {
    // Si non valide, tenter d'ajouter https://
    try { return new URL('https://' + raw.replace(/^https?:\/\//, '')).origin; } catch { return 'http://localhost:3000'; }
  }
}

// Sitemap XML (inclut pages statiques + fiches moteur publiées)
app.get('/sitemap.xml', async (req, res) => {
  try {
    const origin = getWebsiteOrigin();
    const urls = [
      { loc: `${origin}/`, changefreq: 'weekly', priority: '0.9' },
      { loc: `${origin}/contact`, changefreq: 'yearly', priority: '0.4' },
      { loc: `${origin}/demande-devis`, changefreq: 'monthly', priority: '0.6' },
      { loc: `${origin}/mentions-legales`, changefreq: 'yearly', priority: '0.1' },
      { loc: `${origin}/moteurs`, changefreq: 'weekly', priority: '0.7' },
    ];

    // Ajouter les fiches moteur publiées si MongoDB configuré
    if (MONGODB_URI) {
      await initMongo();
      const col = mongoDb.collection('engine_pages');
      const cursor = col.find({ status: 'published' }, { projection: { slug: 1, updatedAt: 1 } });
      const docs = await cursor.toArray();
      for (const d of docs) {
        const loc = `${origin}/codes-moteur/${encodeURIComponent(String(d.slug || ''))}`;
        const lastmod = d.updatedAt ? new Date(d.updatedAt).toISOString() : undefined;
        urls.push({ loc, changefreq: 'weekly', priority: '0.8', lastmod });
      }

      // Ajouter quelques pages marque /moteurs/:marque (top 20)
      const brandsAgg = [
        { $match: { status: 'published' } },
        { $group: { _id: '$marque', count: { $sum: 1 } } },
        { $project: { _id: 0, brand: '$_id', count: 1 } },
        { $sort: { count: -1, brand: 1 } },
        { $limit: 20 },
      ];
      const topBrands = await col.aggregate(brandsAgg).toArray();
      for (const b of topBrands) {
        const brand = String(b.brand || '').trim();
        if (!brand) continue;
        urls.push({ loc: `${origin}/moteurs/${encodeURIComponent(brand)}`, changefreq: 'weekly', priority: '0.6' });
      }
    }

    const xmlParts = [];
    xmlParts.push('<?xml version="1.0" encoding="UTF-8"?>');
    xmlParts.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    for (const u of urls) {
      xmlParts.push('<url>');
      xmlParts.push(`<loc>${u.loc}</loc>`);
      if (u.lastmod) xmlParts.push(`<lastmod>${u.lastmod}</lastmod>`);
      if (u.changefreq) xmlParts.push(`<changefreq>${u.changefreq}</changefreq>`);
      if (u.priority) xmlParts.push(`<priority>${u.priority}</priority>`);
      xmlParts.push('</url>');
    }
    xmlParts.push('</urlset>');
    const xml = xmlParts.join('');
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (err) {
    console.error('[sitemap] error', err);
    res.status(500).send('');
  }
});

// Robots.txt
app.get('/robots.txt', (req, res) => {
  try {
    const origin = getWebsiteOrigin();
    const lines = [
      'User-agent: *',
      'Disallow: /admin',
      '',
      `Sitemap: ${origin}/sitemap.xml`,
      ''
    ];
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(lines.join('\n'));
  } catch (err) {
    console.error('[robots] error', err);
    res.status(500).send('');
  }
});

// Redirection 301: ancienne route -> nouvelle route
app.get('/demande-de-devis', (req, res) => {
  try { return res.redirect(301, '/demande-devis'); }
  catch { return res.redirect(302, '/demande-devis'); }
});

// === Admin: Paramètres du site ===
app.get('/api/admin/settings', async (req, res) => {
  try {
    // Guard auth (cookie de session OU Bearer <token>)
    try {
      const cookies = parseCookies(req.headers.cookie || '');
      const sess = verifySession(cookies['admin_session']);
      if (!sess) {
        const auth = req.headers.authorization || '';
        if (!TOKEN || !auth.startsWith('Bearer ') || auth.slice('Bearer '.length).trim() !== TOKEN) {
          return res.status(401).json({ ok: false, error: 'Unauthorized' });
        }
      }
    } catch {}
    await initMongo();
    if (!mongoDb) return res.status(503).json({ ok: false, error: 'mongo_not_configured' });
    const col = mongoDb.collection('site_settings');
    const found = await col.findOne({ _id: 'site' });
    const defaults = {
      companyName: process.env.COMPANY_NAME || 'CAR PARTS FRANCE',
      phone: process.env.COMPANY_PHONE || '',
      whatsappUrl: process.env.COMPANY_WHATSAPP_URL || '',
      websiteOrigin: getWebsiteOrigin(),
      defaultOgImage: process.env.DEFAULT_OG_IMAGE || process.env.MAILERSEND_LOGO_URL || ''
    };
    const doc = found ? { companyName: found.companyName || defaults.companyName, phone: found.phone || defaults.phone, whatsappUrl: found.whatsappUrl || defaults.whatsappUrl, websiteOrigin: found.websiteOrigin || defaults.websiteOrigin, defaultOgImage: found.defaultOgImage || defaults.defaultOgImage } : defaults;
    res.json({ ok: true, settings: doc });
  } catch (err) {
    console.error('[settings] get error', err);
    res.status(500).json({ ok: false, error: 'get_failed' });
  }
});

app.put('/api/admin/settings', async (req, res) => {
  try {
    // Guard auth (cookie de session OU Bearer <token>)
    try {
      const cookies = parseCookies(req.headers.cookie || '');
      const sess = verifySession(cookies['admin_session']);
      if (!sess) {
        const auth = req.headers.authorization || '';
        if (!TOKEN || !auth.startsWith('Bearer ') || auth.slice('Bearer '.length).trim() !== TOKEN) {
          return res.status(401).json({ ok: false, error: 'Unauthorized' });
        }
      }
    } catch {}
    await initMongo();
    if (!mongoDb) return res.status(503).json({ ok: false, error: 'mongo_not_configured' });
    const b = req.body || {};
    const clean = (v) => String(v || '').trim();
    let websiteOrigin = clean(b.websiteOrigin);
    if (websiteOrigin) {
      try { websiteOrigin = new URL(websiteOrigin).origin; } catch { websiteOrigin = getWebsiteOrigin(); }
    } else {
      websiteOrigin = getWebsiteOrigin();
    }
    const payload = {
      companyName: clean(b.companyName),
      phone: clean(b.phone),
      whatsappUrl: clean(b.whatsappUrl),
      websiteOrigin,
      defaultOgImage: clean(b.defaultOgImage),
      updatedAt: new Date().toISOString()
    };
    const col = mongoDb.collection('site_settings');
    await col.updateOne({ _id: 'site' }, { $set: payload, $setOnInsert: { _id: 'site', createdAt: new Date().toISOString() } }, { upsert: true });
    res.json({ ok: true });
  } catch (err) {
    console.error('[settings] put error', err);
    res.status(500).json({ ok: false, error: 'put_failed' });
  }
});

// Utils pour signer un lien public de réponse client
const SIGN_SECRET = process.env.REPLY_SIGN_SECRET || TOKEN;
function makeSignature(quoteId) {
  return crypto.createHmac('sha256', String(SIGN_SECRET)).update(String(quoteId)).digest('hex');
}
function isValidSignature(quoteId, sig) {
  try { return makeSignature(quoteId) === sig; } catch { return false; }
}

// === Auth admin par cookie de session (HMAC) ===
const ADMIN_SIGN_SECRET = process.env.ADMIN_SIGN_SECRET || TOKEN;
function parseCookies(header = '') {
  const out = {};
  String(header || '')
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)
    .forEach((pair) => {
      const idx = pair.indexOf('=');
      if (idx === -1) return;
      const k = pair.slice(0, idx).trim();
      const v = pair.slice(idx + 1).trim();
      out[k] = decodeURIComponent(v || '');
    });
  return out;
}
function signSession(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', String(ADMIN_SIGN_SECRET)).update(data).digest('base64url');
  return `${data}.${sig}`;
}
function verifySession(cookieVal) {
  try {
    const [data, sig] = String(cookieVal || '').split('.');
    if (!data || !sig) return null;
    const expected = crypto.createHmac('sha256', String(ADMIN_SIGN_SECRET)).update(data).digest('base64url');
    if (sig !== expected) return null;
    const json = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (!json || json.role !== 'admin') return null;
    if (json.exp && Date.now() > Number(json.exp)) return null;
    return json;
  } catch {
    return null;
  }
}

// === Routes d'auth ===
app.post('/api/auth/login', (req, res) => {
  try {
    const { password } = req.body || {};
    if (!ADMIN_PASSWORD) return res.status(500).json({ ok: false, error: 'server_not_configured' });
    if (String(password || '') !== String(ADMIN_PASSWORD)) return res.status(401).json({ ok: false, error: 'invalid_credentials' });
    const now = Date.now();
    const week = 7 * 24 * 60 * 60 * 1000;
    const token = signSession({ role: 'admin', iat: now, exp: now + week });
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('admin_session', token, { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: week, path: '/' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[auth] login error', err);
    res.status(500).json({ ok: false, error: 'login_failed' });
  }
});
app.post('/api/auth/logout', (req, res) => {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('admin_session', '', { httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 0, expires: new Date(0), path: '/' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[auth] logout error', err);
    res.status(500).json({ ok: false, error: 'logout_failed' });
  }
});
app.get('/api/auth/me', (req, res) => {
  try {
    const cookies = parseCookies(req.headers.cookie || '');
    const sess = verifySession(cookies['admin_session']);
    if (sess) return res.json({ ok: true, admin: true });
    return res.status(401).json({ ok: false, admin: false });
  } catch (err) {
    console.error('[auth] me error', err);
    res.status(500).json({ ok: false, error: 'me_failed' });
  }
});

// Auth middleware (cookie de session OU Bearer <token>)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  const p = req.path || '';
  // Public ou auth endpoints
  if (p === '/reply' || p.startsWith('/api/public/') || p.startsWith('/gallery-file/') || p.startsWith('/api/auth/')) return next();
  // 1) Cookie de session
  try {
    const cookies = parseCookies(req.headers.cookie || '');
    const sess = verifySession(cookies['admin_session']);
    if (sess) return next();
  } catch {}
  // 2) Bearer token (compat)
  const auth = req.headers.authorization || '';
  if (TOKEN) {
    if (!auth.startsWith('Bearer ')) return res.status(401).json({ ok: false, error: 'Unauthorized' });
    const provided = auth.slice('Bearer '.length).trim();
    if (provided !== TOKEN) return res.status(401).json({ ok: false, error: 'Unauthorized' });
    return next();
  }
  // Si pas de cookie valide et pas de token configuré
  return res.status(401).json({ ok: false, error: 'Unauthorized' });
});

// Health
app.get('/health', (_, res) => {
  res.json({ ok: true, service: 'cpf-mailersend-server', ts: new Date().toISOString() });
});

// Page publique pour que le client réponde au devis
app.get('/reply', (req, res) => {
  const { quoteId = '', sig = '', sent = '', name = '', email = '' } = req.query || {};
  if (!quoteId || !sig || !isValidSignature(quoteId, sig)) {
    return res.status(400).send('<!doctype html><html><body><p>Lien invalide.</p></body></html>');
  }
  const thread = (getReplies(String(quoteId)) || []).slice().sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
  const companyName = process.env.COMPANY_NAME || 'CAR PARTS FRANCE';
  const phone = process.env.COMPANY_PHONE || '';
  const whatsapp = process.env.COMPANY_WHATSAPP_URL || '';
  const website = process.env.COMPANY_WEBSITE_URL || '';
  const logoUrl = process.env.MAILERSEND_LOGO_URL || '';
  const sentSuccess = String(sent) === '1';
  const quoteMeta = getQuoteMeta(String(quoteId)) || null;
  const idShort = String(quoteId).split('-')[0].toUpperCase();
  const displayRef = (quoteMeta?.details?.reference && String(quoteMeta.details.reference).trim())
    ? String(quoteMeta.details.reference).trim()
    : `DEV-${idShort}`;
  const prefillName = String(name || '');
  const prefillEmail = String(email || '');
  const escapeAttr = (val) => String(val || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const hasPrefill = Boolean(prefillName || prefillEmail);

  const html = `<!doctype html>
  <html lang="fr"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Répondre au devis</title>
  <style>
    body{font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;background:linear-gradient(180deg,#f5f7fb 0%,#ffffff 100%);margin:0;padding:0;color:#1f2937;}
    .wrap{min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:32px 16px;}
    .card{width:100%;max-width:940px;background:#fff;border:1px solid #e2e8f0;border-radius:18px;box-shadow:0 24px 45px rgba(15,23,42,0.08);overflow:hidden;}
    .head{padding:24px 28px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;gap:16px;background:#f8fafc;}
    .head h1{margin:0;font-size:20px;font-weight:700;color:#1d3557;}
    .logo{height:44px;width:auto;}
    .body{padding:26px 28px;display:grid;grid-template-columns:1fr;gap:24px;}
    @media(min-width:920px){.body{grid-template-columns:1.05fr 0.95fr;}}
    .threadCard{border:1px solid #e2e8f0;border-radius:14px;padding:18px 20px;background:#f8fafc;}
    .quoteCard{border:1px solid #e2e8f0;border-radius:14px;padding:18px 20px;background:#ffffff;}
    .quoteHeader{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
    .quoteHeader h2{margin:0;font-size:16px;font-weight:700;color:#1d3557}
    .quoteRef{font-size:12px;color:#64748b}
    .quoteTable{width:100%;border-collapse:collapse}
    .quoteTable td{padding:8px 6px;border-bottom:1px solid #e2e8f0;vertical-align:top;font-size:14px}
    .quoteTable tr:last-child td{border-bottom:0}
    .quoteLabel{width:38%;max-width:240px;color:#64748b}
    .quoteItems{margin:8px 0 0 18px;padding:0;color:#1f2937}
    .quoteItems li{margin:4px 0}
    .threadHeader{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
    .threadHeader h2{margin:0;font-size:16px;font-weight:700;color:#1d3557;}
    .timeline{max-height:420px;overflow:auto;padding-right:4px;}
    .bubble{border-radius:12px;padding:12px 14px;margin-bottom:12px;border:1px solid #e2e8f0;box-shadow:0 6px 16px rgba(15,23,42,0.05);}
    .bubble--admin{background:#eef4ff;border-color:#d7e3fc;}
    .bubble--client{background:#ffffff;border-color:#e2e8f0;}
    .meta{font-size:12px;color:#475569;margin-bottom:6px;font-weight:600;}
    .bubble p{margin:0;font-size:14px;line-height:1.55;color:#1f2937;white-space:pre-wrap;}
    .empty{font-size:13px;color:#64748b;text-align:center;padding:24px 0;}
    .formCard{border:1px solid #e2e8f0;border-radius:14px;padding:20px 22px;position:relative;}
    .formCard h2{margin:0 0 8px;font-size:18px;font-weight:700;color:#1d3557;}
    .formCard p{margin:0 0 16px;font-size:14px;color:#475569;line-height:1.6;}
    label{display:block;margin:10px 0 6px;font-weight:600;font-size:14px;color:#1f2937;}
    input,textarea{width:100%;padding:12px 14px;border:1px solid #cbd5f5;border-radius:10px;font:inherit;background:#ffffff;box-shadow:0 2px 4px rgba(15,23,42,0.02);transition:border 0.2s,box-shadow 0.2s;}
    input:focus,textarea:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,0.15);}
    textarea{min-height:150px;resize:vertical;}
    .row{display:flex;gap:12px;flex-wrap:wrap;}
    .row>div{flex:1 1 220px;}
    .actions{margin-top:18px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
    .btn{display:inline-block;background:linear-gradient(45deg,#e63946 30%,#ff6b6b 90%);color:#fff;border:none;border-radius:999px;padding:12px 22px;font-weight:700;font-size:15px;cursor:pointer;box-shadow:0 18px 30px rgba(230,57,70,0.25);}
    .muted{color:#64748b;font-size:12px;margin-top:10px;}
    .contactCard{border:1px solid #e2e8f0;border-radius:14px;padding:18px 20px;background:#ffffff;display:flex;flex-direction:column;gap:14px;}
    .contactCard h3{margin:0;font-size:15px;font-weight:700;color:#1d3557;}
    .contactCard a{color:#1d4ed8;text-decoration:none;font-weight:600;}
    .contactCard .btnLink{display:flex;align-items:center;gap:14px;padding:12px 14px;border-radius:14px;border:1px solid #d7e3fc;background:#f7faff;color:#1d3557;text-decoration:none;font-weight:600;transition:transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;}
    .contactCard .btnLink__icon{width:38px;height:38px;border-radius:12px;background:rgba(37,99,235,0.12);color:#1d4ed8;display:flex;align-items:center;justify-content:center;font-size:18px;}
    .contactCard .btnLink__content{display:flex;flex-direction:column;align-items:flex-start;line-height:1.2;}
    .contactCard .btnLink__title{font-size:12px;letter-spacing:0.3px;color:#64748b;text-transform:uppercase;}
    .contactCard .btnLink__subtitle{font-size:15px;font-weight:700;color:#1d3557;}
    .contactCard .btnLink__arrow{margin-left:auto;font-size:16px;color:#94a3b8;}
    .contactCard .btnLink:hover{transform:translateY(-2px);box-shadow:0 10px 22px rgba(15,23,42,0.12);border-color:#c3d5ff;}
    .contactCard .btnLink--whatsapp{border:1px solid #bbf7d0;background:#f4fff8;color:#166534;}
    .contactCard .btnLink--whatsapp .btnLink__icon{background:rgba(34,197,94,0.14);color:#15803d;}
    .contactCard .btnLink--whatsapp .btnLink__subtitle{color:#166534;}
    .contactCard .btnLink--whatsapp:hover{box-shadow:0 10px 22px rgba(22,163,74,0.16);border-color:#9ae6b4;}
    .success{border-radius:12px;padding:12px 14px;background:#dcfce7;border:1px solid #bbf7d0;color:#166534;font-size:14px;margin-bottom:16px;display:flex;align-items:center;gap:8px;font-weight:600;}
    .toggle{margin-top:10px;font-size:12px;color:#1d4ed8;cursor:pointer;text-decoration:underline;}
    .hiddenFields{display:none;margin-top:12px;gap:12px;flex-wrap:wrap;}
    .hiddenFields.visible{display:flex;}
  </style></head>
  <body><div class="wrap"><div class="card"><div class="head">
    ${logoUrl ? `<img class="logo" src="${logoUrl}" alt="${companyName}" />` : ''}
    <div>
      <h1>${companyName} — Réponse à votre devis</h1>
      <div style="font-size:13px;color:#64748b;">Référence devis : ${displayRef}</div>
    </div>
  </div><div class="body">
  <div>
    ${quoteMeta ? `
    <div class="quoteCard">
      <div class="quoteHeader">
        <h2>Récapitulatif du devis</h2>
        <div class="quoteRef">${quoteMeta?.details?.reference ? `Réf. : ${(quoteMeta.details.reference+'').replace(/&/g,'&amp;').replace(/</g,'&lt;')}` : ''}</div>
      </div>
      <table class="quoteTable">
        ${quoteMeta?.details?.price ? `<tr><td class="quoteLabel">Prix</td><td><strong>${(quoteMeta.details.price+'').replace(/&/g,'&amp;').replace(/</g,'&lt;')}</strong></td></tr>` : ''}
        ${quoteMeta?.details?.delivery ? `<tr><td class="quoteLabel">Livraison</td><td>${(quoteMeta.details.delivery+'').replace(/&/g,'&amp;').replace(/</g,'&lt;')}</td></tr>` : ''}
        ${quoteMeta?.details?.mileageKm ? `<tr><td class="quoteLabel">Kilométrage</td><td>${(quoteMeta.details.mileageKm+'').replace(/&/g,'&amp;').replace(/</g,'&lt;')}</td></tr>` : ''}
      </table>
      ${Array.isArray(quoteMeta?.details?.items) && quoteMeta.details.items.length ? `
        <div style="margin-top:10px;color:#1d3557;font-weight:700;font-size:14px;">Articles proposés</div>
        <ul class="quoteItems">
          ${quoteMeta.details.items.map((it)=>`<li>${((it && (it.title||it.name)) ? (it.title||it.name) : JSON.stringify(it)).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</li>`).join('')}
        </ul>
      ` : ''}
    </div>
    ` : ''}
    <div class="threadCard">
      <div class="threadHeader">
        <h2>Historique des échanges</h2>
        <div style="font-size:12px;color:#64748b;">Dernière mise à jour : ${thread.length ? new Date(thread[thread.length - 1].createdAt || Date.now()).toLocaleString() : new Date().toLocaleString()}</div>
      </div>
      <div class="timeline" id="timeline">
        ${thread.length ? thread.map(m => `
          <div class="bubble ${m.channel==='client' ? 'bubble--client' : 'bubble--admin'}">
            <div class="meta">${m.channel==='client' ? (m.fromName ? `${m.fromName} &lt;${m.fromEmail || ''}&gt;` : 'Client') : companyName} • ${new Date(m.createdAt || Date.now()).toLocaleString()}</div>
            <p>${(m.message || '').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br />')}</p>
          </div>
        `).join('') : '<div class="empty">Aucun échange pour le moment. Soyez le premier à répondre ✉️</div>'}
      </div>
    </div>
    <div class="contactCard" style="margin-top:20px;">
      <h3>Besoin d’une aide immédiate ?</h3>
      ${phone ? `<a class="btnLink" href="tel:${phone.replace(/\s+/g,'').replace(/^\+/, '')}">
        <span class="btnLink__icon">📞</span>
        <span class="btnLink__content"><span class="btnLink__title">Appeler</span><span class="btnLink__subtitle">${phone}</span></span>
        <span class="btnLink__arrow">➜</span>
      </a>` : ''}
      ${whatsapp ? `<a class="btnLink btnLink--whatsapp" href="${whatsapp}" target="_blank" rel="noopener">
        <span class="btnLink__icon">💬</span>
        <span class="btnLink__content"><span class="btnLink__title">WhatsApp</span><span class="btnLink__subtitle">Réponse rapide</span></span>
        <span class="btnLink__arrow">➜</span>
      </a>` : ''}
      ${website ? `<a href="${website}" target="_blank" rel="noopener">Visiter notre site</a>` : ''}
      <p style="font-size:12px;color:#64748b;margin:0;">Nous répondons rapidement pour confirmer votre commande ou ajuster le devis.</p>
    </div>
  </div>
  <div>
    <div class="formCard">
      ${sentSuccess ? `<div class="success">✅ Merci ! Votre message a bien été envoyé. Nous vous recontactons très vite.</div>` : ''}
      <h2>Envoyer votre réponse</h2>
      <p>Expliquez-nous vos questions, précisions ou confirmation concernant ce devis.</p>
  <form method="post" action="/api/public/replies" onsubmit="this.btn.disabled=true;this.btn.innerText='Envoi...';">
    <input type="hidden" name="quoteId" value="${String(quoteId)}" />
    <input type="hidden" name="sig" value="${String(sig)}" />
    <div class="row hiddenFields ${hasPrefill ? '' : 'visible'}" id="contactFields">
      <div>
        <label>Votre nom</label>
        <input ${hasPrefill ? '' : 'required'} name="fromName" placeholder="Ex: Dupont" value="${escapeAttr(prefillName)}" />
      </div>
      <div>
        <label>Votre email</label>
        <input ${hasPrefill ? '' : 'required'} type="email" name="fromEmail" placeholder="vous@example.com" value="${escapeAttr(prefillEmail)}" />
      </div>
    </div>
    ${hasPrefill ? `<input type="hidden" name="fromName" value="${escapeAttr(prefillName)}" id="hiddenName" />
    <input type="hidden" name="fromEmail" value="${escapeAttr(prefillEmail)}" id="hiddenEmail" />
    <div class="toggle" id="toggleContact">Modifier mes informations de contact</div>` : ''}
    <label>Votre message</label>
    <textarea required name="message" placeholder="Bonjour... Je confirme ma commande / J’ai besoin d’une précision..."></textarea>
    <div class="actions"><button class="btn" name="btn" type="submit">Envoyer ma réponse</button><span style="font-size:12px;color:#94a3b8;">Temps de réponse moyen : moins de 4h (jours ouvrés)</span></div>
    <div class="muted">Votre réponse est envoyée de façon sécurisée à ${companyName}. Nous ne partagerons jamais vos informations.</div>
  </form>
    </div>
  </div>
  </div></div></div>
  <script>
    (function(){
      const timeline = document.getElementById('timeline');
      if (timeline) {
        timeline.scrollTop = timeline.scrollHeight || 0;
      }
    })();
    (function(){
      const toggle = document.getElementById('toggleContact');
      const fields = document.getElementById('contactFields');
      const hiddenName = document.getElementById('hiddenName');
      const hiddenEmail = document.getElementById('hiddenEmail');
      if (!toggle || !fields) return;
      toggle.addEventListener('click', function(){
        const visible = fields.classList.toggle('visible');
        if (visible) {
          if (hiddenName) hiddenName.parentNode.removeChild(hiddenName);
          if (hiddenEmail) hiddenEmail.parentNode.removeChild(hiddenEmail);
          const inputs = fields.querySelectorAll('input');
          inputs.forEach((input) => input.setAttribute('required', 'required'));
          toggle.textContent = 'Conserver les informations recommandées';
        } else {
          const form = document.querySelector('form');
          if (!form) return;
          const nameInput = fields.querySelector('input[name="fromName"]');
          const emailInput = fields.querySelector('input[name="fromEmail"]');
          const hiddenNameInput = document.createElement('input');
          hiddenNameInput.type = 'hidden';
          hiddenNameInput.name = 'fromName';
          hiddenNameInput.id = 'hiddenName';
          hiddenNameInput.value = nameInput ? nameInput.value : '';
          const hiddenEmailInput = document.createElement('input');
          hiddenEmailInput.type = 'hidden';
          hiddenEmailInput.name = 'fromEmail';
          hiddenEmailInput.id = 'hiddenEmail';
          hiddenEmailInput.value = emailInput ? emailInput.value : '';
          form.appendChild(hiddenNameInput);
          form.appendChild(hiddenEmailInput);
          const inputs = fields.querySelectorAll('input');
          inputs.forEach((input) => input.removeAttribute('required'));
          toggle.textContent = 'Modifier mes informations de contact';
        }
      });
    })();
  </script>
  </body></html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// Réception publique de la réponse client (form-urlencoded)
app.post('/api/public/replies', express.urlencoded({ extended: true, limit: '1mb' }), (req, res) => {
  const { quoteId, sig, fromName, fromEmail, message } = req.body || {};
  if (!quoteId || !sig || !isValidSignature(quoteId, sig)) {
    return res.status(400).json({ ok: false, error: 'Lien invalide' });
  }
  if (!fromName || !fromEmail || !message) {
    return res.status(400).json({ ok: false, error: 'Champs requis manquants' });
  }
  const saved = addReply(String(quoteId), {
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    channel: 'client',
    kind: 'client-message',
    fromName: String(fromName),
    fromEmail: String(fromEmail),
    message: String(message),
    createdAt: new Date().toISOString(),
  });
  const redirectUrl = `/reply?quoteId=${encodeURIComponent(String(quoteId))}&sig=${encodeURIComponent(String(sig))}&sent=1`;
  if (req.accepts(['html', 'json']) === 'json') {
    return res.json({ ok: true, replies: saved, redirect: redirectUrl });
  }
  return res.redirect(303, redirectUrl);
});

app.post('/api/public/quote-request', async (req, res) => {
  try {
    const b = req.body || {};
    const name = String(b.name || '');
    const email = String(b.email || '');
    const phone = String(b.phone || '');
    const vehicleId = String(b.vehicleId || '');
    const message = String(b.message || '');
    const source = String(b.source || '');
    const createdAt = String(b.createdAt || new Date().toISOString());
    if (!vehicleId.trim() || (!phone.trim() && !email.trim())) {
      return res.status(400).json({ ok: false, error: 'invalid_input' });
    }
    const apiKey = process.env.MAILERSEND_API_KEY;
    const fromEmail = process.env.MAILERSEND_FROM_EMAIL;
    const fromName = process.env.MAILERSEND_FROM_NAME || 'Car Parts France';
    const toEmail = process.env.SUPPORT_EMAIL || fromEmail;
    const isVercel = !!process.env.VERCEL;
    const dryRun = (!apiKey || !fromEmail || !toEmail) && !isVercel;
    if (!apiKey || !fromEmail || !toEmail) {
      console.warn('[quote-request] Mailer non configuré', { hasApiKey: !!apiKey, hasFrom: !!fromEmail, hasTo: !!toEmail, NODE_ENV: process.env.NODE_ENV, VERCEL: process.env.VERCEL });
      if (dryRun) {
        return res.json({ ok: true, dryRun: true });
      }
      return res.status(500).json({ ok: false, error: 'mailer_not_configured' });
    }
    const mailerSend = new MailerSend({ apiKey });
    const prettyRef = `DEV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const subject = `Nouvelle demande de devis [${prettyRef}]`;
    const text = [
      `Référence: ${prettyRef}`,
      'Demande de devis',
      `Nom: ${name || 'Non précisé'}`,
      `Email: ${email || 'Non précisé'}`,
      `Téléphone: ${phone || 'Non précisé'}`,
      `Identifiant véhicule: ${vehicleId || 'Non précisé'}`,
      `Message: ${message || 'Non précisé'}`,
      source ? `Source: ${source}` : '',
      `Date: ${createdAt}`,
    ].filter(Boolean).join('\n');
    const safe = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const html = `<pre style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;white-space:pre-wrap">${safe}</pre>`;
    const params = new EmailParams()
      .setFrom(new Sender(fromEmail, fromName))
      .setTo([new Recipient(toEmail, toEmail)])
      .setSubject(subject)
      .setText(text)
      .setHtml(html);
    await mailerSend.email.send(params);

    // Accusé de réception au client (si un email a été fourni)
    let sentAck = false;
    if (email && /.+@.+/.test(email)) {
      try {
        const companyName = process.env.COMPANY_NAME || fromName || 'Car Parts France';
        const fromDisplay = process.env.MAILERSEND_FROM_NAME || companyName;
        const secondaryColor = process.env.MAILERSEND_SECONDARY_COLOR || '#1d3557';
        const textPrimary = process.env.MAILERSEND_TEXT_PRIMARY || '#111827';
        const websiteUrl = process.env.COMPANY_WEBSITE_URL || '';
        const logoUrl = process.env.MAILERSEND_LOGO_URL || (websiteUrl ? websiteUrl.replace(/\/$/, '') + '/images/logo.png' : '');
        const ackSubject = `Nous avons bien reçu votre demande de devis — ${companyName} [${prettyRef}]`;
        const ackText = [
          `Bonjour ${name || ''},`,
          '',
          `Nous avons bien reçu votre demande de devis${vehicleId ? ` (référence véhicule: ${vehicleId})` : ''}.`,
          'Notre équipe vous répondra sous 24 heures ouvrées.',
          '',
          (process.env.COMPANY_PHONE ? `Téléphone: ${process.env.COMPANY_PHONE}` : '').trim(),
          (process.env.COMPANY_WHATSAPP_URL ? `WhatsApp: ${process.env.COMPANY_WHATSAPP_URL}` : '').trim(),
          (process.env.COMPANY_WEBSITE_URL ? `Site: ${process.env.COMPANY_WEBSITE_URL}` : '').trim(),
        ].filter(Boolean).join('\n');

        const safeVehicle = String(vehicleId || '').replace(/&/g,'&amp;').replace(/</g,'&lt;');
        const safeName = String(name || '').replace(/&/g,'&amp;').replace(/</g,'&lt;');
        const safeMsg = String(message || '').trim().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/\n/g,'<br />');
        const logoImg = logoUrl ? `<img src="${logoUrl}" alt="${companyName}" style="height:42px;max-width:180px;display:block" />` : '';
        const ackHtml = `
          <div style="font-family:-apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height:1.55; color:${textPrimary}; background:#f8fafc; padding:20px">
            <div style="max-width:720px; margin:0 auto; background:#ffffff; border:1px solid #e5e7eb; border-radius:16px; overflow:hidden; box-shadow:0 16px 40px rgba(15,23,42,0.08)">
              <div style="height:6px; background:linear-gradient(135deg,#e63946 0%,#ff6b6b 100%)"></div>
              <div style="display:flex; align-items:center; gap:12px; padding:16px 18px; background:#f8fafc; border-bottom:1px solid #e5e7eb">
                ${logoImg}
                <div style="font-weight:800; color:${secondaryColor}; font-size:16px">${companyName}</div>
              </div>
              <div style="padding:22px 22px 8px 22px">
                <div style="font-weight:900; font-size:20px; margin-bottom:8px; color:${secondaryColor}">Merci, nous avons bien reçu votre demande</div>
                <div>${safeName ? `Bonjour ${safeName},` : 'Bonjour,'}</div>
                <div style="margin-top:10px">Nous avons bien reçu votre demande de devis${vehicleId ? ` (référence véhicule: <strong>${safeVehicle}</strong>)` : ''}. Notre équipe vous répondra sous 24 heures ouvrées.</div>
                ${safeMsg ? `<div style="margin-top:12px;padding:12px;border:1px solid #e5e7eb;border-radius:10px;background:#f9fafb"><div style="font-weight:700;margin-bottom:6px;color:${secondaryColor}">Votre message</div><div style="color:${textPrimary}">${safeMsg}</div></div>` : ''}
                <div style="margin-top:12px;padding:12px;border:1px solid #e5e7eb;border-radius:10px;background:#f9fafb">
                  <div style="font-weight:700;margin-bottom:6px;color:${secondaryColor}">Résumé de votre demande</div>
                  <div>Nom: ${String(name || 'Non précisé').replace(/&/g,'&amp;')}</div>
                  <div>Email: ${String(email || 'Non précisé').replace(/&/g,'&amp;')}</div>
                  <div>Téléphone: ${String(phone || 'Non précisé').replace(/&/g,'&amp;')}</div>
                  <div>Identifiant véhicule: ${safeVehicle || 'Non précisé'}</div>
                </div>
                
                <div style="margin-top:18px;color:#6b7280">Cordialement,<br />${companyName}</div>
              </div>
              <div style="height:6px;background:linear-gradient(135deg,#e63946 0%,#ff6b6b 100%)"></div>
            </div>
          </div>`;

        const ackParams = new EmailParams()
          .setFrom(new Sender(fromEmail, fromDisplay))
          .setTo([new Recipient(email, name || email)])
          .setSubject(ackSubject)
          .setText(ackText)
          .setHtml(ackHtml)
          .setReplyTo(new Sender(process.env.MAILERSEND_REPLY_TO || fromEmail, fromDisplay));
        await mailerSend.email.send(ackParams);
        sentAck = true;
      } catch (e) {
        console.warn('[quote-request] ack_send_failed', e?.message || e);
      }
    }
    return res.json({ ok: true, sentAck, ref: prettyRef });
  } catch (err) {
    console.error('[quote-request] send_failed', err?.message || err);
    return res.status(500).json({ ok: false, error: 'send_failed' });
  }
});

// Lecture admin des réponses client (protégé par token)
app.get('/api/replies/:id', (req, res) => {
  const { id } = req.params;
  const list = getReplies(String(id));
  res.json({ ok: true, replies: list });
});

// Send reply to quote (email)
app.post('/api/devis/:id/reponse', async (req, res) => {
  try {
    const { id } = req.params;
    const { quoteId, channel, message, toEmail, toName, subject, attachments, extras } = req.body || {};

    if (!id || !quoteId || id !== quoteId) {
      return res.status(400).json({ ok: false, error: 'quoteId manquant ou invalide' });
    }
    if (channel !== 'email') {
      return res.status(400).json({ ok: false, error: "Canal non supporté ici (utilisez 'email')" });
    }
    if (!message || !toEmail) {
      return res.status(400).json({ ok: false, error: 'message et toEmail sont requis' });
    }

    const apiKey = process.env.MAILERSEND_API_KEY;
    const fromEmail = process.env.MAILERSEND_FROM_EMAIL;
    const fromName = process.env.MAILERSEND_FROM_NAME || 'Car Parts France';

    if (!apiKey || !fromEmail) {
      return res.status(500).json({ ok: false, error: 'MailerSend non configuré côté serveur' });
    }

    const mailerSend = new MailerSend({ apiKey });

    // Construire un HTML propre et brandé pour l'email
    const companyName = process.env.COMPANY_NAME || fromName || 'Car Parts France';
    const brandColor = process.env.MAILERSEND_BRAND_COLOR || '#e63946';
    const primaryColor = process.env.MAILERSEND_PRIMARY_COLOR || '#e63946';
    const primaryLight = process.env.MAILERSEND_PRIMARY_LIGHT || '#ff6b6b';
    const secondaryColor = process.env.MAILERSEND_SECONDARY_COLOR || '#1d3557';
    const textPrimary = process.env.MAILERSEND_TEXT_PRIMARY || '#212529';
    const logoUrl = process.env.MAILERSEND_LOGO_URL || '';
    const websiteUrl = process.env.COMPANY_WEBSITE_URL || '';
    const supportEmail = process.env.SUPPORT_EMAIL || fromEmail;
    const prettyRef = (extras?.reference && String(extras.reference).trim())
      ? String(extras.reference).trim()
      : `DEV-${String(id).split('-')[0].toUpperCase()}`;
    const finalSubject = `${subject || 'Réponse à votre devis - Car Parts France'} [${prettyRef}]`;
    // Nous ne proposons plus de lien de réponse par email, uniquement téléphone/WhatsApp
    const replyLink = '';
    const replyNotice = `Pour répondre, merci de nous contacter par téléphone ou via WhatsApp. Ne répondez pas directement à cet email.`;
    const replyOptions = {
      phone: process.env.COMPANY_PHONE || '',
      whatsapp: process.env.COMPANY_WHATSAPP_URL || '',
    };

    const metaDetails = {
      price: extras?.price,
      mileageKm: extras?.mileageKm,
      delivery: extras?.delivery,
      reference: extras?.reference,
      items: Array.isArray(extras?.items) ? extras.items : undefined,
      testsPerformed: Array.isArray(extras?.testsPerformed) ? extras.testsPerformed : undefined,
      defectObserved: extras?.defectObserved,
    };

    const html = buildReplyEmailHtml({
      companyName,
      logoUrl,
      brandColor,
      primaryColor,
      primaryLight,
      secondaryColor,
      textPrimary,
      subject: finalSubject,
      toName: toName || toEmail,
      message,
      websiteUrl,
      supportEmail,
      replyLink,
      replyNotice,
      replyOptions,
      // Détails de devis (facultatifs)
      details: metaDetails,
      companyInfo: {
        name: process.env.COMPANY_NAME || companyName,
        siren: process.env.COMPANY_SIREN || '',
        phone: process.env.COMPANY_PHONE || '',
        address: process.env.COMPANY_ADDRESS || '',
        instagramUrl: process.env.COMPANY_INSTAGRAM_URL || '',
      },
    });

    // Enregistrer ou mettre à jour le récap du devis (meta)
    try {
      setQuoteMeta(String(id), {
        toEmail: toEmail,
        toName: toName || '',
        subject: finalSubject,
        createdAt: new Date().toISOString(),
        details: metaDetails,
        websiteUrl,
        companyName,
        logoUrl,
      });
    } catch {}

    const emailParams = new EmailParams()
      .setFrom(new Sender(fromEmail, fromName))
      .setTo([new Recipient(toEmail, toName || toEmail)])
      .setSubject(finalSubject)
      .setReplyTo(new Sender(process.env.MAILERSEND_REPLY_TO || 'no-reply@carpartsfrance.fr', companyName))
      .setText(message)
      .setHtml(html);

    // Traiter d'éventuelles pièces jointes (attachments: [{ filename, content(base64|dataUrl), type? }])
    // Sécurité: limite nombre et taille totale (≈9 Mo décodés) pour éviter les timeouts côté API
    let truncatedAttachmentsNote = '';
    let attachCountLogged = 0;
    let attachBytesLogged = 0;
    if (Array.isArray(attachments) && attachments.length) {
      const MAX_ATTACHMENTS = 5;
      const MAX_TOTAL_BYTES = 9 * 1024 * 1024; // ~9 Mo côté API (marge sous 10 Mo)
      let totalBytes = 0;
      const safeList = [];

      for (const a of attachments.slice(0, MAX_ATTACHMENTS)) {
        try {
          const filename = String(a.filename || 'piece-jointe');
          let base64 = String(a.content || '').trim();
          // Si data URL, extraire la partie base64
          const dataUrlIdx = base64.indexOf(',');
          if (base64.startsWith('data:') && dataUrlIdx !== -1) {
            base64 = base64.slice(dataUrlIdx + 1);
          }
          // Estimation poids décodé (base64 ~4/3)
          const approxBytes = Math.floor((base64.length * 3) / 4);
          if (totalBytes + approxBytes > MAX_TOTAL_BYTES) {
            truncatedAttachmentsNote = 'Certaines pièces jointes ont été ignorées car la taille totale dépasse la limite.';
            break;
          }
          totalBytes += approxBytes;
          const att = new Attachment(base64, filename);
          // MailerSend v2: le constructeur prend (contentBase64, fileName). Pas de setType.
          safeList.push(att);
        } catch {
          // on ignore silencieusement les entrées invalides
        }
      }
      if (safeList.length) {
        emailParams.setAttachments(safeList);
      }
      attachCountLogged = safeList.length;
      attachBytesLogged = totalBytes;
    }

    let result;
    try {
      result = await sendWithRetry(mailerSend, emailParams, 2);
    } catch (err) {
      console.error('MailerSend error (avec pièces jointes)', err?.response?.body || err);
      // Repli: tenter sans pièces jointes pour garantir la réception du message
      try {
        const emailParamsNoAtt = new EmailParams()
          .setFrom(new Sender(fromEmail, fromName))
          .setTo([new Recipient(toEmail, toName || toEmail)])
          .setSubject(finalSubject)
          .setText(message)
          .setHtml(html + `<p style="color:#64748b;font-size:12px;margin-top:12px;">Note: pièces jointes non envoyées en raison d'une erreur technique.${truncatedAttachmentsNote ? ' ' + truncatedAttachmentsNote : ''}</p>`);
        result = await sendWithRetry(mailerSend, emailParamsNoAtt, 2);
      } catch (err2) {
        console.error('MailerSend error (sans pièces jointes)', err2?.response?.body || err2);
        return res.status(502).json({ ok: false, error: 'Erreur envoi MailerSend', details: err2?.response?.body || null });
      }
    }

    const msgId = result?.messageId || null;
    console.log(`[mailer] Email envoyé à ${toEmail} (id: ${msgId || 'n/a'}) attachments=${attachCountLogged} ~${Math.round(attachBytesLogged/1024)}Ko${truncatedAttachmentsNote ? ' note=' + truncatedAttachmentsNote : ''}`);
    // Enregistrer le message envoyé côté admin dans le fil
    try {
      addReply(String(id), {
        id: (result && result.messageId) || (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)),
        channel: 'email',
        kind: 'admin-email',
        fromName: companyName,
        fromEmail: fromEmail,
        subject: finalSubject,
        message,
        createdAt: new Date().toISOString(),
      });
    } catch {}

    res.status(201).json({ ok: true, id, providerResponse: msgId });
  } catch (err) {
    console.error('MailerSend error', err);
    res.status(500).json({ ok: false, error: 'Erreur envoi MailerSend' });
  }
});

// ===== Engine Pages (MongoDB) =====
// Utilitaires pour Engine Pages
function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}

let enginePagesIndexEnsured = false;
async function ensureEnginePagesIndexes() {
  if (enginePagesIndexEnsured) return;
  await initMongo();
  const col = mongoDb.collection('engine_pages');
  try {
    await col.createIndex({ slug: 1 }, { unique: true });
  } catch {}
  try {
    await col.createIndex({ code: 1, marque: 1 });
  } catch {}
  enginePagesIndexEnsured = true;
}

// Public: lire une page par slug (status=published)
app.get('/api/public/engine-pages/:slug', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).json({ ok: false, error: 'mongo_not_configured' });
    await initMongo();
    const slug = String(req.params.slug || '').trim();
    const doc = await mongoDb.collection('engine_pages').findOne({ slug, status: 'published' }, { projection: { _id: 0 } });
    if (!doc) return res.status(404).json({ ok: false, error: 'not_found' });
    res.json({ ok: true, page: doc });
  } catch (err) {
    console.error('[enginePages] public get error:', err);
    res.status(500).json({ ok: false, error: 'public_get_failed' });
  }
});

// Public: liste paginée (optionnelle)
app.get('/api/public/engine-pages', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).json({ ok: false, error: 'mongo_not_configured' });
    await initMongo();
    const q = String(req.query.q || '').trim();
    const brand = String(req.query.brand || '').trim();
    const codeQ = String(req.query.code || '').trim();
    const p = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
    const l = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10) || 20));
    const filter = { status: 'published' };
    if (q) {
      filter.$or = [
        { code: { $regex: q, $options: 'i' } },
        { marque: { $regex: q, $options: 'i' } },
        { cylindree: { $regex: q, $options: 'i' } },
      ];
    }
    if (brand) filter.marque = { $regex: brand, $options: 'i' };
    if (codeQ) filter.code = { $regex: codeQ, $options: 'i' };
    const col = mongoDb.collection('engine_pages');
    const total = await col.countDocuments(filter);
    const items = await col
      .find(filter, { projection: { contentHtml: 0 } })
      .sort({ code: 1 })
      .skip((p - 1) * l)
      .limit(l)
      .toArray();
    const mapped = items.map(({ _id, ...rest }) => ({ id: String(_id), ...rest }));
    res.json({ ok: true, page: p, limit: l, total, items: mapped });
  } catch (err) {
    console.error('[enginePages] public list error:', err);
    res.status(500).json({ ok: false, error: 'public_list_failed' });
  }
});

// Public: liste des marques avec compteur
app.get('/api/public/engine-pages/brands', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).json({ ok: false, error: 'mongo_not_configured' });
    await initMongo();
    const col = mongoDb.collection('engine_pages');
    const agg = [
      { $match: { status: 'published' } },
      { $group: { _id: '$marque', count: { $sum: 1 } } },
      { $project: { _id: 0, brand: '$_id', count: 1 } },
      { $sort: { count: -1, brand: 1 } },
      { $limit: 500 }
    ];
    const docs = await col.aggregate(agg).toArray();
    res.json({ ok: true, items: docs });
  } catch (err) {
    console.error('[enginePages] brands error:', err);
    res.status(500).json({ ok: false, error: 'brands_failed' });
  }
});

// Admin: liste paginée/filtrée
app.get('/api/admin/engine-pages', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).json({ ok: false, error: 'mongo_not_configured' });
    await initMongo();
    const q = String(req.query.q || '').trim();
    const brand = String(req.query.brand || '').trim();
    const status = String(req.query.status || '').trim();
    const p = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
    const l = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10) || 20));
    const filter = {};
    if (q) {
      filter.$or = [
        { code: { $regex: q, $options: 'i' } },
        { marque: { $regex: q, $options: 'i' } },
        { cylindree: { $regex: q, $options: 'i' } },
        { slug: { $regex: q, $options: 'i' } },
      ];
    }
    if (brand) filter.marque = { $regex: brand, $options: 'i' };
    if (status) filter.status = status;
    const col = mongoDb.collection('engine_pages');
    const total = await col.countDocuments(filter);
    const items = await col
      .find(filter)
      .sort({ updatedAt: -1 })
      .skip((p - 1) * l)
      .limit(l)
      .toArray();
    const mapped = items.map(({ _id, ...rest }) => ({ id: String(_id), ...rest }));
    res.json({ ok: true, page: p, limit: l, total, items: mapped });
  } catch (err) {
    console.error('[enginePages] admin list error:', err);
    res.status(500).json({ ok: false, error: 'admin_list_failed' });
  }
});

// Admin: création
app.post('/api/admin/engine-pages', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).json({ ok: false, error: 'mongo_not_configured' });
    await initMongo();
    await ensureEnginePagesIndexes();
    const body = req.body || {};
    const code = String(body.code || '').trim();
    const marque = String(body.marque || '').trim();
    if (!code || !marque) return res.status(400).json({ ok: false, error: 'missing_fields' });
    const cylindree = body.cylindree ? String(body.cylindree) : '';
    const carburant = body.carburant ? String(body.carburant) : '';
    const annees = body.annees ? String(body.annees) : '';
    const desiredSlug = body.slug ? String(body.slug) : '';
    const finalSlug = slugify(desiredSlug || `${code} ${marque} ${cylindree}`);
    const now = new Date().toISOString();
    const doc = {
      code, marque, cylindree, carburant, annees,
      slug: finalSlug,
      title: body.title ? String(body.title) : `Moteur ${code} — ${marque} ${cylindree}`.trim(),
      seoTitle: body.seoTitle ? String(body.seoTitle) : undefined,
      seoDescription: body.seoDescription ? String(body.seoDescription) : undefined,
      contentHtml: body.contentHtml ? String(body.contentHtml) : '',
      faq: Array.isArray(body.faq) ? body.faq.slice(0, 12) : [],
      image: body.image ? String(body.image) : '',
      images: Array.isArray(body.images)
        ? body.images.map((s) => String(s || '').trim()).filter(Boolean)
        : (typeof body.images === 'string' ? String(body.images).split(',').map((s) => s.trim()).filter(Boolean) : []),
      availability: body.availability === 'backorder' ? 'backorder' : 'in_stock',
      status: body.status === 'published' ? 'published' : 'draft',
      createdAt: now,
      updatedAt: now,
    };
    const col = mongoDb.collection('engine_pages');
    const result = await col.insertOne(doc);
    res.status(201).json({ ok: true, id: String(result.insertedId), slug: finalSlug });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ ok: false, error: 'duplicate_slug' });
    }
    console.error('[enginePages] admin create error:', err);
    res.status(500).json({ ok: false, error: 'admin_create_failed' });
  }
});

// Admin: mise à jour
app.put('/api/admin/engine-pages/:id', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).json({ ok: false, error: 'mongo_not_configured' });
    await initMongo();
    await ensureEnginePagesIndexes();
    const id = String(req.params.id || '').trim();
    let oid;
    try { oid = new ObjectId(id); } catch { return res.status(400).json({ ok: false, error: 'invalid_id' }); }
    const body = req.body || {};
    const patch = {};
    const fields = ['code','marque','cylindree','carburant','annees','title','seoTitle','seoDescription','contentHtml','status','image','images','availability'];
    for (const k of fields) {
      if (k in body) patch[k] = body[k];
    }
    // Normaliser champs media et disponibilité
    if ('image' in body) {
      patch.image = String(body.image || '');
    }
    if ('images' in body) {
      patch.images = Array.isArray(body.images)
        ? body.images.map((s) => String(s || '').trim()).filter(Boolean)
        : (typeof body.images === 'string' ? String(body.images).split(',').map((s) => s.trim()).filter(Boolean) : []);
    }
    if ('availability' in body) {
      patch.availability = body.availability === 'backorder' ? 'backorder' : 'in_stock';
    }
    // Mettre à jour le slug si fourni explicitement, sinon le recalculer si code/marque/cylindree changent
    if ('slug' in body) {
      patch.slug = slugify(String(body.slug || ''));
    } else if ('code' in patch || 'marque' in patch || 'cylindree' in patch) {
      // récupérer doc existant pour recalcul
      const current = await mongoDb.collection('engine_pages').findOne({ _id: oid }, { projection: { code: 1, marque: 1, cylindree: 1, slug: 1 } });
      const baseCode = 'code' in patch ? String(patch.code || '') : String(current?.code || '');
      const baseMarque = 'marque' in patch ? String(patch.marque || '') : String(current?.marque || '');
      const baseCyl = 'cylindree' in patch ? String(patch.cylindree || '') : String(current?.cylindree || '');
      patch.slug = slugify(`${baseCode} ${baseMarque} ${baseCyl}`);
    }
    patch.updatedAt = new Date().toISOString();
    const resu = await mongoDb.collection('engine_pages').updateOne({ _id: oid }, { $set: patch });
    if (!resu.matchedCount) return res.status(404).json({ ok: false, error: 'not_found' });
    res.json({ ok: true });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ ok: false, error: 'duplicate_slug' });
    }
    console.error('[enginePages] admin update error:', err);
    res.status(500).json({ ok: false, error: 'admin_update_failed' });
  }
});

// Admin: suppression
app.delete('/api/admin/engine-pages/:id', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).json({ ok: false, error: 'mongo_not_configured' });
    await initMongo();
    const id = String(req.params.id || '').trim();
    let oid;
    try { oid = new ObjectId(id); } catch { return res.status(400).json({ ok: false, error: 'invalid_id' }); }
    const resu = await mongoDb.collection('engine_pages').deleteOne({ _id: oid });
    if (!resu.deletedCount) return res.status(404).json({ ok: false, error: 'not_found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[enginePages] admin delete error:', err);
    res.status(500).json({ ok: false, error: 'admin_delete_failed' });
  }
});

// Admin: import JSON/CSV (contenu envoyé dans le body JSON)
function csvParseLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') { cur += '"'; i++; }
        else { inQuotes = false; }
      } else { cur += ch; }
    } else {
      if (ch === ',') { out.push(cur); cur = ''; }
      else if (ch === '"') { inQuotes = true; }
      else { cur += ch; }
    }
  }
  out.push(cur);
  return out;
}
function parseCSV(text) {
  const lines = String(text || '').split(/\r?\n/).filter(l => l.trim().length > 0);
  if (!lines.length) return [];
  const header = csvParseLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = csvParseLine(lines[i]);
    if (!cols.length) continue;
    const obj = {};
    for (let j = 0; j < header.length; j++) {
      obj[String(header[j] || '').trim()] = String(cols[j] || '').trim();
    }
    rows.push(obj);
  }
  return rows;
}
function buildHtmlForEngine({ code, marque, cylindree, carburant, annees }) {
  const parts = [];
  parts.push(`<p>Moteur <strong>${code}</strong> ${marque}${cylindree ? ' ' + cylindree : ''} testé et vérifié avant expédition. Demandez votre devis, réponse sous 24 heures.</p>`);
  const meta = [];
  if (cylindree) meta.push(`Cylindrée: <strong>${cylindree}</strong>`);
  if (carburant) meta.push(`Carburant: <strong>${carburant}</strong>`);
  if (annees) meta.push(`Années: <strong>${annees}</strong>`);
  if (meta.length) parts.push(`<p>${meta.join(' • ')}</p>`);
  parts.push('<p>Contrôles réalisés: inspection visuelle, endoscopie, test de compression / étanchéité, vérification pression et analyse d’huile.</p>');
  parts.push('<p>Garantie et livraison en France. Installation possible via nos partenaires.</p>');
  return parts.join('\n');
}
function buildFaqForEngine({ code, marque }) {
  return [
    { q: `Ce moteur ${code} est-il compatible avec mon véhicule ?`, a: `La compatibilité dépend des variantes. Indiquez-nous votre immatriculation, VIN ou code moteur exact pour vérifier.` },
    { q: `Le moteur ${code} ${marque} est-il garanti ?`, a: `Oui, chaque moteur testé est couvert par une garantie. Nous fournissons un rapport de test.` },
    { q: 'Quel est le délai de livraison ?', a: 'Sous quelques jours ouvrés selon la disponibilité et la destination. Nous confirmons le délai dans votre devis.' },
    { q: 'Proposez-vous le montage ?', a: 'Oui, via des partenaires installateurs. Demandez-nous une mise en relation lors de votre devis.' },
  ];
}
app.post('/api/admin/engine-pages/import', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).json({ ok: false, error: 'mongo_not_configured' });
    await initMongo();
    await ensureEnginePagesIndexes();
    const { filename = '', content = '', format = '', published = false, dryRun = false } = req.body || {};
    let fmt = String(format || '').toLowerCase().trim();
    if (!fmt) {
      const ext = String(filename || '').toLowerCase();
      fmt = ext.endsWith('.json') ? 'json' : 'csv';
    }
    let rows = [];
    if (fmt === 'json') {
      try { rows = JSON.parse(String(content || '')); }
      catch { return res.status(400).json({ ok: false, error: 'invalid_json' }); }
    } else {
      rows = parseCSV(String(content || ''));
    }
    const data = rows.map((r) => ({
      code: String(r.code || r.CODE || '').trim(),
      marque: String(r.marque || r.MARQUE || '').trim(),
      cylindree: String(r.cylindree || r.CYLINDREE || r.cylindre || r.CYLINDRE || '').trim(),
      carburant: String(r.carburant || r.CARBURANT || '').trim(),
      annees: String(r.annees || r.ANNEES || r.annee || r.ANNEE || '').trim(),
    })).filter((r) => r.code && r.marque);

    if (!data.length) return res.status(400).json({ ok: false, error: 'no_rows' });

    if (dryRun) return res.json({ ok: true, total: data.length, upserts: 0, modified: 0 });

    const now = new Date().toISOString();
    const col = mongoDb.collection('engine_pages');
    const status = published ? 'published' : 'draft';
    const ops = data.map((r) => {
      const slug = slugify(`${r.code} ${r.marque} ${r.cylindree}`);
      const title = `Moteur ${r.code} — ${r.marque} ${r.cylindree || ''}`.trim();
      const seoTitle = `Moteur ${r.code} ${r.marque} ${r.cylindree || ''} | Testé + Garantie | Devis 24h`;
      const seoDescription = `Moteur ${r.code} (${r.marque} ${r.cylindree || ''}) testé et garanti. Livraison rapide. Demandez un devis en 2 minutes.`;
      const contentHtml = buildHtmlForEngine(r);
      const faq = buildFaqForEngine(r);
      return {
        updateOne: {
          filter: { slug },
          update: {
            $setOnInsert: { createdAt: now, slug },
            $set: { code: r.code, marque: r.marque, cylindree: r.cylindree, carburant: r.carburant, annees: r.annees, title, seoTitle, seoDescription, contentHtml, faq, status, updatedAt: now },
          },
          upsert: true,
        }
      };
    });

    let upserts = 0, modified = 0;
    const chunkSize = 1000;
    for (let i = 0; i < ops.length; i += chunkSize) {
      const chunk = ops.slice(i, i + chunkSize);
      const resu = await col.bulkWrite(chunk, { ordered: false });
      upserts += (resu?.upsertedCount || 0);
      modified += (resu?.modifiedCount || 0);
    }

    res.json({ ok: true, total: data.length, upserts, modified });
  } catch (err) {
    console.error('[enginePages] admin import error:', err);
    res.status(500).json({ ok: false, error: 'admin_import_failed' });
  }
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[server] MailerSend server listening on :${PORT}`);
  });
}

export default app;

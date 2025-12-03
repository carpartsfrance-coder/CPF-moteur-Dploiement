import dotenv from 'dotenv';
import express from 'express';
import compression from 'compression';
import cors from 'cors';
import { MailerSend, EmailParams, Sender, Recipient, Attachment } from 'mailersend';
import crypto from 'crypto';
import { addReply, getReplies, setQuoteMeta, getQuoteMeta, listQuoteMetas } from './storage.js';
import buildReplyEmailHtml, { buildAckEmailHtml } from './emailTemplate.js';
import path from 'path';
import fs from 'fs';
import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';
import ejs from 'ejs';
import { fileURLToPath } from 'url';

let __sharp = null;
async function getSharp() { if (__sharp) return __sharp; const m = await import('sharp'); __sharp = m.default || m; return __sharp; }

const app = express();
// EJS view engine (SSR des pages moteurs)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Charger .env locaux (priorité au server/.env puis fallback vers ../.env)
try { dotenv.config({ path: path.join(__dirname, '.env') }); } catch {}
try { dotenv.config({ path: path.join(__dirname, '..', '.env') }); } catch {}
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
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

// Fichiers statiques (CSS/JS/images) pour les pages SSR (blog, etc.)
try {
  const pubDir = path.join(__dirname, 'public');
  if (fs.existsSync(pubDir)) {
    app.use('/assets', express.static(pubDir, { maxAge: '7d', etag: true, immutable: false }));
  }
} catch {}

// Normalisation d'URL (anti-duplicate) + redirections depuis la base
app.use(async (req, res, next) => {
  try {
    if (req.method !== 'GET') return next();
    const original = req.originalUrl || req.url || '';
    const [rawPath, qs = ''] = original.split('?');
    // Exclusions (APIs et médias)
    if (rawPath.startsWith('/api') || rawPath.startsWith('/gallery') || rawPath.startsWith('/gallery-file')) {
      return next();
    }
    // Normalise: lowercase + sans trailing slash (sauf racine)
    let normPath = rawPath.toLowerCase();
    if (normPath.length > 1 && normPath.endsWith('/')) normPath = normPath.slice(0, -1);
    if (normPath !== rawPath) {
      const loc = normPath + (qs ? `?${qs}` : '');
      try { return res.redirect(301, loc); } catch { return res.redirect(302, loc); }
    }
    // Redirections stockées en base
    if (MONGODB_URI) {
      await initMongo();
      const red = await mongoDb.collection('redirects').findOne({ from: rawPath });

// === Admin: Cloudflare Images (upload direct, liste, suppression, renommage) ===
app.post('/api/admin/images/direct-upload', async (req, res) => {
  try {
    const ADMIN_TOKEN = (process.env.CF_IMAGES_ADMIN_TOKEN || process.env.BACKEND_TOKEN || process.env.GALLERY_UPLOAD_TOKEN || '').trim();
    const AUTH = String(req.headers?.authorization || '');
    if (!ADMIN_TOKEN || AUTH !== `Bearer ${ADMIN_TOKEN}`) return res.status(401).json({ ok: false, error: 'unauthorized' });

    const ACCOUNT_ID = String(process.env.CLOUDFLARE_ACCOUNT_ID || '').trim();
    const API_TOKEN = String(process.env.CLOUDFLARE_IMAGES_TOKEN || '').trim();
    if (!ACCOUNT_ID || !API_TOKEN) return res.status(500).json({ ok: false, error: 'missing_cloudflare_env' });

    const name = String((req.body || {}).name || '').trim();
    const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/images/v2/direct_upload`;
    const headers = { Authorization: `Bearer ${API_TOKEN}` };
    let body;
    if (name) {
      body = new URLSearchParams({ metadata: JSON.stringify({ name }) });
    }
    const r = await fetch(url, { method: 'POST', headers, body });
    const data = await r.json();
    if (!data?.success) return res.status(502).json({ ok: false, error: 'cloudflare_error', details: data });
    res.setHeader('Cache-Control', 'no-store');
    return res.json({ ok: true, result: data.result });
  } catch (err) {
    console.error('[admin images direct-upload] error', err);
    return res.status(500).json({ ok: false, error: 'direct_upload_error' });
  }
});

app.get('/api/admin/images/list', async (req, res) => {
  try {
    const ADMIN_TOKEN = (process.env.CF_IMAGES_ADMIN_TOKEN || process.env.BACKEND_TOKEN || process.env.GALLERY_UPLOAD_TOKEN || '').trim();
    const AUTH = String(req.headers?.authorization || '');
    if (!ADMIN_TOKEN || AUTH !== `Bearer ${ADMIN_TOKEN}`) return res.status(401).json({ ok: false, error: 'unauthorized' });

    const ACCOUNT_ID = String(process.env.CLOUDFLARE_ACCOUNT_ID || '').trim();
    const API_TOKEN = String(process.env.CLOUDFLARE_IMAGES_TOKEN || '').trim();
    if (!ACCOUNT_ID || !API_TOKEN) return res.status(500).json({ ok: false, error: 'missing_cloudflare_env' });

    const page = Math.max(1, parseInt(String((req.query || {}).page || '1'), 10) || 1);
    const perPage = Math.min(100, Math.max(1, parseInt(String((req.query || {}).per_page || '24'), 10) || 24));
    const url = new URL(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/images/v1`);
    url.searchParams.set('page', String(page));
    url.searchParams.set('per_page', String(perPage));
    const r = await fetch(url, { headers: { Authorization: `Bearer ${API_TOKEN}` } });
    const data = await r.json();
    if (!data?.success) return res.status(502).json({ ok: false, error: 'cloudflare_error', details: data });
    res.setHeader('Cache-Control', 'no-store');
    return res.json({ ok: true, page, per_page: perPage, total: data?.result?.total_count || 0, images: data?.result?.images || [] });
  } catch (err) {
    console.error('[admin images list] error', err);
    return res.status(500).json({ ok: false, error: 'list_error' });
  }
});

app.delete('/api/admin/images/:id', async (req, res) => {
  try {
    const ADMIN_TOKEN = (process.env.CF_IMAGES_ADMIN_TOKEN || process.env.BACKEND_TOKEN || process.env.GALLERY_UPLOAD_TOKEN || '').trim();
    const AUTH = String(req.headers?.authorization || '');
    if (!ADMIN_TOKEN || AUTH !== `Bearer ${ADMIN_TOKEN}`) return res.status(401).json({ ok: false, error: 'unauthorized' });

    const ACCOUNT_ID = String(process.env.CLOUDFLARE_ACCOUNT_ID || '').trim();
    const API_TOKEN = String(process.env.CLOUDFLARE_IMAGES_TOKEN || '').trim();
    if (!ACCOUNT_ID || !API_TOKEN) return res.status(500).json({ ok: false, error: 'missing_cloudflare_env' });

    const id = String(req.params.id || '').trim();
    if (!id) return res.status(400).json({ ok: false, error: 'missing_id' });
    const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/images/v1/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${API_TOKEN}` } });
    const data = await r.json();
    if (!data?.success) return res.status(502).json({ ok: false, error: 'cloudflare_error', details: data });
    return res.json({ ok: true });
  } catch (err) {
    console.error('[admin images delete] error', err);
    return res.status(500).json({ ok: false, error: 'delete_error' });
  }
});

app.patch('/api/admin/images/:id', async (req, res) => {
  try {
    const ADMIN_TOKEN = (process.env.CF_IMAGES_ADMIN_TOKEN || process.env.BACKEND_TOKEN || process.env.GALLERY_UPLOAD_TOKEN || '').trim();
    const AUTH = String(req.headers?.authorization || '');
    if (!ADMIN_TOKEN || AUTH !== `Bearer ${ADMIN_TOKEN}`) return res.status(401).json({ ok: false, error: 'unauthorized' });

    const ACCOUNT_ID = String(process.env.CLOUDFLARE_ACCOUNT_ID || '').trim();
    const API_TOKEN = String(process.env.CLOUDFLARE_IMAGES_TOKEN || '').trim();
    if (!ACCOUNT_ID || !API_TOKEN) return res.status(500).json({ ok: false, error: 'missing_cloudflare_env' });

    const id = String(req.params.id || '').trim();
    if (!id) return res.status(400).json({ ok: false, error: 'missing_id' });
    const body = req.body || {};
    const metadata = {};
    if (typeof body.name === 'string' && body.name.trim()) Object.assign(metadata, { name: body.name.trim() });
    const payload = {};
    if (Object.keys(metadata).length) Object.assign(payload, { metadata });
    if (typeof body.requireSignedURLs === 'boolean') Object.assign(payload, { requireSignedURLs: !!body.requireSignedURLs });
    const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/images/v1/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${API_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await r.json();
    if (!data?.success) return res.status(502).json({ ok: false, error: 'cloudflare_error', details: data });
    return res.json({ ok: true, result: data.result });
  } catch (err) {
    console.error('[admin images patch] error', err);
    return res.status(500).json({ ok: false, error: 'patch_error' });
  }
});

// Public: listage des fiches moteurs (recherche + marque + pagination)
app.get('/api/public/engine-pages', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.json({ ok: true, page: 1, limit: 0, total: 0, items: [] });
    await initMongo();
    const { q = '', brand = '', page = '1', limit = '24' } = req.query || {};
    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const l = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 24));
    const filter = { status: 'published' };
    const and = [];
    if (String(brand || '').trim()) {
      and.push({ marque: { $regex: `^${String(brand).trim()}$`, $options: 'i' } });
    }
    if (String(q || '').trim()) {
      const s = String(q).trim();
      and.push({ $or: [
        { code: { $regex: s, $options: 'i' } },
        { cylindree: { $regex: s, $options: 'i' } },
        { carburant: { $regex: s, $options: 'i' } },
        { annees: { $regex: s, $options: 'i' } },
      ]});
    }
    if (and.length) Object.assign(filter, { $and: and });
    const col = mongoDb.collection('engine_pages');
    const total = await col.countDocuments(filter);
    const items = await col.find(filter, { projection: { slug: 1, code: 1, marque: 1, cylindree: 1, carburant: 1, annees: 1, title: 1 } })
      .sort({ updatedAt: -1 })
      .skip((p - 1) * l)
      .limit(l)
      .toArray();
    res.json({ ok: true, page: p, limit: l, total, items });
  } catch (err) {
    console.error('[public engine-pages] error', err);
    res.status(500).json({ ok: false, error: 'list_failed' });
  }
});

// === Admin: Redirections SEO (from -> to) ===
app.get('/api/admin/redirects', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).json({ ok: false, error: 'mongo_not_configured' });
    await initMongo();
    await ensureRedirectsIndexes();
    const col = mongoDb.collection('redirects');
    const items = await col.find({}, { projection: { from: 1, to: 1 } }).sort({ from: 1 }).limit(1000).toArray();
    const out = items.map(({ _id, from, to }) => ({ id: String(_id), from, to }));
    res.json({ ok: true, items: out });
  } catch (err) {
    console.error('[redirects] admin list error:', err);
    res.status(500).json({ ok: false, error: 'admin_list_failed' });
  }
});

app.post('/api/admin/redirects', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).json({ ok: false, error: 'mongo_not_configured' });
    await initMongo();
    await ensureRedirectsIndexes();
    const b = req.body || {};
    const from = String(b.from || '').trim();
    const to = String(b.to || '').trim();
    if (!from || !to) return res.status(400).json({ ok: false, error: 'missing_fields' });
    const col = mongoDb.collection('redirects');
    await col.updateOne({ from }, { $set: { from, to, updatedAt: new Date().toISOString() }, $setOnInsert: { createdAt: new Date().toISOString() } }, { upsert: true });
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error('[redirects] admin create error:', err);
    res.status(500).json({ ok: false, error: 'admin_create_failed' });
  }
});

app.delete('/api/admin/redirects/:id', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).json({ ok: false, error: 'mongo_not_configured' });
    await initMongo();
    const id = String(req.params.id || '').trim();
    let oid; try { oid = new ObjectId(id); } catch { return res.status(400).json({ ok: false, error: 'invalid_id' }); }
    const col = mongoDb.collection('redirects');
    const r = await col.deleteOne({ _id: oid });
    if (!r.deletedCount) return res.status(404).json({ ok: false, error: 'not_found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[redirects] admin delete error:', err);
    res.status(500).json({ ok: false, error: 'admin_delete_failed' });
  }
});

// Hubs SSR: /moteurs/:marque
app.get('/moteurs/:marque', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).send('<!doctype html><html><body><p>Base non configurée.</p></body></html>');
    await initMongo();
    const brand = String(req.params.marque || '').trim();
    const pageNum = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
    const limit = Math.min(48, Math.max(1, parseInt(String(req.query.limit || '24'), 10) || 24));
    const col = mongoDb.collection('engine_pages');
    const filter = { status: 'published', marque: { $regex: `^${brand}$`, $options: 'i' } };
    const total = await col.countDocuments(filter);
    const items = await col.find(filter, { projection: { brandSlug: 1, modelSlug: 1, codeSlug: 1, code: 1, marque: 1, cylindree: 1, carburant: 1, annees: 1, slug: 1, title: 1 } })
      .sort({ updatedAt: -1 })
      .skip((pageNum - 1) * limit)
      .limit(limit)
      .toArray();
    const origin = getWebsiteOrigin();
    const serverBase = `${req.protocol}://${req.get('host')}`;
    const publicBase = (process.env.COMPANY_WEBSITE_URL && process.env.COMPANY_WEBSITE_URL.trim())
      ? process.env.COMPANY_WEBSITE_URL.trim().replace(/\/$/, '')
      : (VERCEL_ORIGIN || serverBase);
    const replyId = 'r-' + crypto.randomBytes(4).toString('hex');
    const assetsOrigin = `${req.protocol}://${req.get('host')}`;
    const pathUrl = `/moteurs/${encodeURIComponent(slugify(brand))}`;
    const title = `Moteurs ${brand} — Catalogue par code moteur`;
    const description = `Catalogue des moteurs testés & garantis pour ${brand}. Recherchez par code moteur et demandez un devis.`;
    const canonical = `${origin}${pathUrl}`;
    res.setHeader('Cache-Control', 'no-store');
    return res.render('hub-brand', { origin, pathUrl, title, description, canonical, brand, page: pageNum, limit, total, items, gsc: process.env.GOOGLE_SITE_VERIFICATION || '' });
  } catch (err) {
    console.error('[hub marque] error', err);
    return res.status(500).send('<!doctype html><html><body><p>Erreur serveur.</p></body></html>');
  }
});

// Hubs SSR: /moteur/:brand/:model (liste des codes de ce modèle)
app.get('/moteur/:brand/:model', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).send('<!doctype html><html><body><p>Base non configurée.</p></body></html>');
    await initMongo();
    const brandSlug = slugify(req.params.brand || '');
    const modelSlug = slugify(req.params.model || '');
    const pageNum = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
    const limit = Math.min(48, Math.max(1, parseInt(String(req.query.limit || '24'), 10) || 24));
    const col = mongoDb.collection('engine_pages');
    const filter = { status: 'published', brandSlug, modelSlug };
    const total = await col.countDocuments(filter);
    const items = await col.find(filter, { projection: { codeSlug: 1, code: 1, marque: 1, model: 1, cylindree: 1, carburant: 1, annees: 1, slug: 1, title: 1 } })
      .sort({ updatedAt: -1 })
      .skip((pageNum - 1) * limit)
      .limit(limit)
      .toArray();
    const origin = getWebsiteOrigin();
    const pathUrl = `/moteur/${encodeURIComponent(brandSlug)}/${encodeURIComponent(modelSlug)}`;
    const title = `Moteurs ${req.params.brand} ${req.params.model} — Codes moteur`;
    const description = `Tous les moteurs ${req.params.brand} ${req.params.model} testés & garantis. Codes, compatibilités et disponibilité.`;
    const canonical = `${origin}${pathUrl}`;
    res.setHeader('Cache-Control', 'no-store');
    return res.render('hub-model', { origin, pathUrl, title, description, canonical, brand: req.params.brand, model: req.params.model, page: pageNum, limit, total, items, gsc: process.env.GOOGLE_SITE_VERIFICATION || '' });
  } catch (err) {
    console.error('[hub modele] error', err);
    return res.status(500).send('<!doctype html><html><body><p>Erreur serveur.</p></body></html>');
  }
});
      if (red && red.to) {
        const loc = String(red.to) + (qs ? `?${qs}` : '');
        try { return res.redirect(301, loc); } catch { return res.redirect(302, loc); }
      }
    }
    return next();
  } catch { return next(); }
});

// === Auth admin (simple) — top-level ===
function getCookie(req, name) {
  try {
    const raw = String(req.headers.cookie || '');
    const parts = raw.split(';').map(s => s.trim());
    for (const p of parts) {
      if (!p) continue;
      const i = p.indexOf('=');
      if (i === -1) continue;
      const k = p.slice(0, i).trim();
      const v = p.slice(i + 1).trim();
      if (k === name) return decodeURIComponent(v);
    }
  } catch {}
  return '';
}

app.post('/api/auth/login', async (req, res) => {
  try {
    const pass = String((req.body || {}).password || '').trim();
    const expected = String(process.env.ADMIN_PASSWORD || '').trim();
    if (!expected) return res.status(503).json({ ok: false, error: 'admin_password_not_set' });
    if (pass !== expected) return res.status(401).json({ ok: false, error: 'invalid_password' });
    res.setHeader('Set-Cookie', `cpf_admin=1; Max-Age=604800; Path=/; HttpOnly; SameSite=Lax`);
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false, error: 'login_failed' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const v = getCookie(req, 'cpf_admin');
    if (v === '1') return res.json({ ok: true });
    return res.status(401).json({ ok: false });
  } catch {
    return res.status(401).json({ ok: false });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    res.setHeader('Set-Cookie', `cpf_admin=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`);
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false });
  }
});

// === Admin: Cloudflare Images (upload direct, liste, suppression, renommage) — top-level ===
// Upload en une étape: le front envoie multipart/form-data (file) ici, on proxie vers Cloudflare
app.post('/api/admin/images/upload', async (req, res) => {
  try {
    const ADMIN_TOKEN = (process.env.CF_IMAGES_ADMIN_TOKEN || process.env.BACKEND_TOKEN || process.env.GALLERY_UPLOAD_TOKEN || '').trim();
    const AUTH = String(req.headers?.authorization || '');
    if (!ADMIN_TOKEN || AUTH !== `Bearer ${ADMIN_TOKEN}`) return res.status(401).json({ ok: false, error: 'unauthorized' });

    const ACCOUNT_ID = String(process.env.CLOUDFLARE_ACCOUNT_ID || '').trim();
    const API_TOKEN = String(process.env.CLOUDFLARE_IMAGES_TOKEN || '').trim();
    if (!ACCOUNT_ID || !API_TOKEN) return res.status(500).json({ ok: false, error: 'missing_cloudflare_env' });

    const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/images/v1`;
    const h = { Authorization: `Bearer ${API_TOKEN}` };
    const ct = String(req.headers['content-type'] || '');
    if (ct) h['Content-Type'] = ct;

    const r = await fetch(url, { method: 'POST', headers: h, body: req, duplex: 'half' });
    const text = await r.text();
    let data; try { data = JSON.parse(text); } catch { data = { success: false, raw: text }; }
    if (!data?.success) return res.status(502).json({ ok: false, error: 'cloudflare_error', details: data });
    return res.json({ ok: true, result: data.result });
  } catch (err) {
    console.error('[admin images upload proxy] error', err);
    return res.status(500).json({ ok: false, error: 'upload_proxy_error' });
  }
});

app.post('/api/admin/images/direct-upload', async (req, res) => {
  try {
    const ADMIN_TOKEN = (process.env.CF_IMAGES_ADMIN_TOKEN || process.env.BACKEND_TOKEN || process.env.GALLERY_UPLOAD_TOKEN || '').trim();
    const AUTH = String(req.headers?.authorization || '');
    if (!ADMIN_TOKEN || AUTH !== `Bearer ${ADMIN_TOKEN}`) return res.status(401).json({ ok: false, error: 'unauthorized' });

    const ACCOUNT_ID = String(process.env.CLOUDFLARE_ACCOUNT_ID || '').trim();
    const API_TOKEN = String(process.env.CLOUDFLARE_IMAGES_TOKEN || '').trim();
    if (!ACCOUNT_ID || !API_TOKEN) return res.status(500).json({ ok: false, error: 'missing_cloudflare_env' });

    const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/images/v2/direct_upload`;
    const r = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${API_TOKEN}` } });
    const data = await r.json();
    if (!data?.success) return res.status(502).json({ ok: false, error: 'cloudflare_error', details: data });
    res.setHeader('Cache-Control', 'no-store');
    return res.json({ ok: true, result: data.result });
  } catch (err) {
    console.error('[admin images direct-upload] error', err);
    return res.status(500).json({ ok: false, error: 'direct_upload_error' });
  }
});

app.get('/api/admin/images/list', async (req, res) => {
  try {
    const ADMIN_TOKEN = (process.env.CF_IMAGES_ADMIN_TOKEN || process.env.BACKEND_TOKEN || process.env.GALLERY_UPLOAD_TOKEN || '').trim();
    const AUTH = String(req.headers?.authorization || '');
    if (!ADMIN_TOKEN || AUTH !== `Bearer ${ADMIN_TOKEN}`) return res.status(401).json({ ok: false, error: 'unauthorized' });

    const ACCOUNT_ID = String(process.env.CLOUDFLARE_ACCOUNT_ID || '').trim();
    const API_TOKEN = String(process.env.CLOUDFLARE_IMAGES_TOKEN || '').trim();
    if (!ACCOUNT_ID || !API_TOKEN) return res.status(500).json({ ok: false, error: 'missing_cloudflare_env' });

    const page = Math.max(1, parseInt(String((req.query || {}).page || '1'), 10) || 1);
    const perPage = Math.min(100, Math.max(1, parseInt(String((req.query || {}).per_page || '24'), 10) || 24));
    const url = new URL(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/images/v1`);
    url.searchParams.set('page', String(page));
    url.searchParams.set('per_page', String(perPage));
    const r = await fetch(url, { headers: { Authorization: `Bearer ${API_TOKEN}` } });
    const data = await r.json();
    if (!data?.success) return res.status(502).json({ ok: false, error: 'cloudflare_error', details: data });
    res.setHeader('Cache-Control', 'no-store');
    return res.json({ ok: true, page, per_page: perPage, total: data?.result?.total_count || 0, images: data?.result?.images || [] });
  } catch (err) {
    console.error('[admin images list] error', err);
    return res.status(500).json({ ok: false, error: 'list_error' });
  }
});

app.delete('/api/admin/images/:id', async (req, res) => {
  try {
    const ADMIN_TOKEN = (process.env.CF_IMAGES_ADMIN_TOKEN || process.env.BACKEND_TOKEN || process.env.GALLERY_UPLOAD_TOKEN || '').trim();
    const AUTH = String(req.headers?.authorization || '');
    if (!ADMIN_TOKEN || AUTH !== `Bearer ${ADMIN_TOKEN}`) return res.status(401).json({ ok: false, error: 'unauthorized' });

    const ACCOUNT_ID = String(process.env.CLOUDFLARE_ACCOUNT_ID || '').trim();
    const API_TOKEN = String(process.env.CLOUDFLARE_IMAGES_TOKEN || '').trim();
    if (!ACCOUNT_ID || !API_TOKEN) return res.status(500).json({ ok: false, error: 'missing_cloudflare_env' });

    const id = String(req.params.id || '').trim();
    if (!id) return res.status(400).json({ ok: false, error: 'missing_id' });
    const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/images/v1/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${API_TOKEN}` } });
    const data = await r.json();
    if (!data?.success) return res.status(502).json({ ok: false, error: 'cloudflare_error', details: data });
    return res.json({ ok: true });
  } catch (err) {
    console.error('[admin images delete] error', err);
    return res.status(500).json({ ok: false, error: 'delete_error' });
  }
});

app.patch('/api/admin/images/:id', async (req, res) => {
  try {
    const ADMIN_TOKEN = (process.env.CF_IMAGES_ADMIN_TOKEN || process.env.BACKEND_TOKEN || process.env.GALLERY_UPLOAD_TOKEN || '').trim();
    const AUTH = String(req.headers?.authorization || '');
    if (!ADMIN_TOKEN || AUTH !== `Bearer ${ADMIN_TOKEN}`) return res.status(401).json({ ok: false, error: 'unauthorized' });

    const ACCOUNT_ID = String(process.env.CLOUDFLARE_ACCOUNT_ID || '').trim();
    const API_TOKEN = String(process.env.CLOUDFLARE_IMAGES_TOKEN || '').trim();
    if (!ACCOUNT_ID || !API_TOKEN) return res.status(500).json({ ok: false, error: 'missing_cloudflare_env' });

    const id = String(req.params.id || '').trim();
    if (!id) return res.status(400).json({ ok: false, error: 'missing_id' });
    const body = req.body || {};
    const metadata = {};
    if (typeof body.name === 'string' && body.name.trim()) Object.assign(metadata, { name: body.name.trim() });
    const payload = {};
    if (Object.keys(metadata).length) Object.assign(payload, { metadata });
    if (typeof body.requireSignedURLs === 'boolean') Object.assign(payload, { requireSignedURLs: !!body.requireSignedURLs });
    const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/images/v1/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${API_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await r.json();
    if (!data?.success) return res.status(502).json({ ok: false, error: 'cloudflare_error', details: data });
    return res.json({ ok: true, result: data.result });
  } catch (err) {
    console.error('[admin images patch] error', err);
    return res.status(500).json({ ok: false, error: 'patch_error' });
  }
});

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

  // Liste les fichiers images disponibles dans GALLERY_DIR (récursif)
  app.get('/api/public/gallery-files', async (req, res) => {
    try {
      const allowed = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif']);
      const out = [];
      const walk = (dir) => {
        let entries = [];
        try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
        for (const ent of entries) {
          const full = path.join(dir, ent.name);
          if (ent.isDirectory()) { walk(full); continue; }
          const ext = path.extname(ent.name).toLowerCase();
          if (!allowed.has(ext)) continue;
          const rel = path.relative(GALLERY_DIR, full).split(path.sep).join('/');
          out.push(rel);
        }
      };
      walk(GALLERY_DIR);
      out.sort();
      res.setHeader('Cache-Control', 'public, max-age=60');
      return res.json({ ok: true, files: out });
    } catch (e) {
      console.error('[gallery-files] error', e);
      return res.status(500).json({ ok: false, files: [] });
    }
  });

  // Blog par catégorie
  app.get('/blog/categorie/:cat', async (req, res) => {
    try {
      if (!MONGODB_URI) return res.status(503).send('<!doctype html><html><body><p>Base non configurée.</p></body></html>');
      await initMongo();
      await ensureBlogIndexes();
      const raw = String(req.params.cat || '').trim();
      const cat = raw.toLowerCase();
      const col = mongoDb.collection('blog_posts');
      const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '12'), 10) || 12));
      const filter = { status: 'published', noindex: { $ne: true }, category: { $in: [raw, cat] } };
      const total = await col.countDocuments(filter);
      const items = await col
        .find(filter, { projection: { title: 1, slug: 1, summary: 1, image: 1, publishedAt: 1 } })
        .sort({ publishedAt: -1, updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();
      const origin = getWebsiteOrigin();
      const pathUrl = `/blog/categorie/${encodeURIComponent(cat)}`;
      const title = `Articles catégorie: ${raw} — Car Parts France`;
      const description = `Tous nos articles de la catégorie ${raw}.`;
      const canonical = `${origin}${pathUrl}`;
      res.setHeader('Cache-Control', 'public, max-age=300');
      return res.render('blog/index', { origin, pathUrl, title, description, canonical, items, page, limit, total });
    } catch (err) {
      return res.status(500).send('<!doctype html><html><body><p>Erreur serveur.</p></body></html>');
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

// Cache simple pour contenus Firecrawl (24h)
const RAG_CACHE = new Map();
const RAG_TTL_MS = 24 * 60 * 60 * 1000;

// --- Helpers pour les pages moteurs ---
function slugify(val = '') {
  return String(val || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function ensureEngineIndexes() {
  if (!mongoDb) return;
  const col = mongoDb.collection('engine_pages');
  // Index pour recherche rapide et unicité par couple brand/model/code
  try { await col.createIndex({ brandSlug: 1, modelSlug: 1, codeSlug: 1 }, { unique: true }); } catch {}
  try { await col.createIndex({ status: 1, updatedAt: -1 }); } catch {}
  try { await col.createIndex({ slug: 1 }); } catch {}
}

async function ensureBlogIndexes() {
  if (!mongoDb) return;
  const col = mongoDb.collection('blog_posts');
  try { await col.createIndex({ slug: 1 }, { unique: true }); } catch {}
  try { await col.createIndex({ status: 1, publishedAt: -1 }); } catch {}
}

async function ensureRedirectsIndexes() {
  if (!mongoDb) return;
  const col = mongoDb.collection('redirects');
  try { await col.createIndex({ from: 1 }, { unique: true }); } catch {}
}

// Détection de contenu faible (noindex auto)
function wordCountFromHtml(html = '') {
  const text = String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return 0; return text.split(' ').length;
}

// Validation qualité contenu IA (structure + interdictions)
function validateArticleHtml(html = '') {
  const s = String(html || '');
  const wc = wordCountFromHtml(s);
  const hasStyleTag = /<style[\s>]/i.test(s);
  const hasScriptTag = /<script[\s>]/i.test(s);
  const hasInlineStyle = /\sstyle\s*=\s*"|\sstyle\s*=\s*'/i.test(s);
  const hasClassAttr = /\sclass\s*=\s*"|\sclass\s*=\s*'/i.test(s);
  const hasDivOrSpan = /<(?:div|span)\b/i.test(s);
  const banned = hasStyleTag || hasScriptTag || hasInlineStyle || hasClassAttr || hasDivOrSpan;
  const low = s.toLowerCase();
  const need = {
    resume: /<h2[^>]*>[^<]*(résumé|vue d[’']ensemble)/i.test(s),
    caract: /<h2[^>]*>[^<]*caract/i.test(s),
    modeles: /<h2[^>]*>[^<]*modèles?[^<]*équipés?/i.test(s),
    problemes: /<h2[^>]*>[^<]*probl[èe]mes?[^<]*courants?/i.test(s),
    entretien: /<h2[^>]*>[^<]*entretien/i.test(s),
    fiabilite: /<h2[^>]*>[^<]*fiabilit/i.test(s),
    offre: /<h2[^>]*>[^<]*notre[^<]*offre/i.test(s),
    faq: /<h2[^>]*>[^<]*faq/i.test(s),
    sources: /<h2[^>]*>[^<]*sources/i.test(s),
  };
  const faqCount = (s.match(/<summary[\s>]/gi) || []).length || (s.match(/<details[\s>]/gi) || []).length;
  const sectionsOk = Object.values(need).every(Boolean);
  const faqOk = faqCount >= 5;
  const pass = wc >= 1200 && sectionsOk && faqOk && !banned;
  const reasons = [];
  if (wc < 1200) reasons.push('article_trop_court');
  if (!sectionsOk) {
    for (const k of Object.keys(need)) { if (!need[k]) reasons.push('section_manquante:' + k); }
  }
  if (!faqOk) reasons.push('faq_insuffisante');
  if (banned) {
    if (hasStyleTag) reasons.push('balise_style_interdite');
    if (hasScriptTag) reasons.push('balise_script_interdite');
    if (hasInlineStyle) reasons.push('style_inline_interdit');
    if (hasClassAttr) reasons.push('attribut_class_interdit');
    if (hasDivOrSpan) reasons.push('balises_div_span_interdites');
  }
  return { pass, wc, sections: need, faqCount, banned: { hasStyleTag, hasScriptTag, hasInlineStyle, hasClassAttr, hasDivOrSpan }, reasons };
}

// Force un résumé meta entre 140 et 160 caractères
function ensureMetaSummaryLength(summary = '', html = '') {
  const s = String(summary || '').replace(/\s+/g, ' ').trim();
  if (s.length >= 140 && s.length <= 160) return s;
  // fallback: extraire texte du contenu
  const text = String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return s.slice(0, 160);
  let cand = text.slice(0, 160);
  // éviter de couper un mot
  const lastSpace = cand.lastIndexOf(' ');
  if (lastSpace > 120) cand = cand.slice(0, lastSpace);
  if (cand.length < 140 && text.length > 180) {
    cand = text.slice(0, 180);
    const ls2 = cand.lastIndexOf(' ');
    if (ls2 > 140) cand = cand.slice(0, ls2);
  }
  cand = cand.replace(/[\.|,|;|:|-]+$/g, '').trim();
  return cand.length ? cand : (s || '');
}

// Ajoute une FAQ minimale si absente (<h2> FAQ + 5 entrées details/summary)
function ensureFaqSection(html = '') {
  let out = String(html || '');
  const hasH2Faq = /<h2[^>]*>[^<]*faq/i.test(out);
  const faqCount = (out.match(/<summary[\s>]/gi) || []).length || (out.match(/<details[\s>]/gi) || []).length;
  if (hasH2Faq && faqCount >= 5) return out;
  const faqBlock = [
    '<h2>FAQ</h2>',
    '<details><summary>Comment vérifier la compatibilité du moteur ?</summary><p>Munissez-vous de votre immatriculation ou de votre VIN : la compatibilité exacte est confirmée à partir de ces données.</p></details>',
    '<details><summary>Quels sont les entretiens prioritaires ?</summary><p>Vidanges régulières, qualité d’huile conforme, filtres et courroies selon périodicités : à confirmer via VIN/documentation.</p></details>',
    '<details><summary>Quels symptômes surveiller ?</summary><p>Bruits anormaux, voyants moteur, fumées ou pertes de puissance : faites contrôler rapidement pour limiter les risques.</p></details>',
    '<details><summary>Quelle garantie pour un moteur fourni ?</summary><p>Nos moteurs sont testés et garantis 12 mois (conditions détaillées dans le devis).</p></details>',
    '<details><summary>Comment obtenir un devis ?</summary><p>Rendez-vous sur notre formulaire en ligne et indiquez votre immatriculation ou votre VIN pour une réponse sous 24h.</p></details>'
  ].join('\n');
  // si déjà une section Sources à la fin, insérer avant
  const m = out.match(/<h2[^>]*>[^<]*sources/i);
  if (m) {
    const idx = out.toLowerCase().lastIndexOf('<h2');
    if (idx !== -1) {
      // insérer le bloc FAQ avant la dernière section h2 si c'est « Sources »
      return out.replace(/(<h2[^>]*>[^<]*sources[^<]*<\/h2>)/i, faqBlock + '\n$1');
    }
  }
  return out + '\n' + faqBlock;
}
function isThinEnginePage(doc = {}) {
  try {
    const words = wordCountFromHtml(doc.contentHtml || '');
    const images = Array.isArray(doc.images) ? doc.images.length : (doc.image ? 1 : 0);
    const hasCompat = Array.isArray(doc.compatibilities) ? doc.compatibilities.length > 0 : false;
    const hasIssues = Array.isArray(doc.knownIssues) ? doc.knownIssues.length > 0 : false;
    const faqCount = Array.isArray(doc.faq) ? doc.faq.length : 0;
    if (words < 800) return true;
    if (!hasCompat || !hasIssues) return true;
    if (faqCount < 5) return true;
    if (images < 3) return true;
    return false;
  } catch { return true; }
}
function isThinBlogPost(doc = {}) {
  try {
    const words = wordCountFromHtml((doc.contentHtml || '') + ' ' + (doc.summary || ''));
    const hasTags = Array.isArray(doc.tags) ? doc.tags.length > 0 : false;
    if (words < 600) return true;
    if (!hasTags) return true;
    return false;
  } catch { return true; }
}

function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c));
}

function rewriteCompatSections(html = '', allowed = []) {
  try {
    const hasAllowed = Array.isArray(allowed) && allowed.filter(Boolean).length > 0;
    let block = '';
    if (hasAllowed) {
      const items = allowed.map((x) => `<li>${escapeHtml(String(x))}</li>`).join('');
      block = `<ul>${items}</ul><p>Toute autre configuration : à confirmer via VIN.</p>`;
    } else {
      block = `<p>Selon variante, à confirmer via VIN. La compatibilité exacte est vérifiée via immatriculation ou VIN.</p>`;
    }
    const re = /(<(h2|h3)[^>]*>[^<]*(mod(?:è|e)les|compatibilit[é|e]s)[^<]*<\/\2>)([\s\S]*?)(?=<h2|<h3|$)/i;
    if (re.test(String(html))) {
      return String(html).replace(re, (_, h) => `${h}${block}`);
    }
    const heading = `<h2>Modèles concernés et années</h2>`;
    return String(html) + heading + block;
  } catch { return String(html || ''); }
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

// === Page moteur SSR: /moteur/:brand/:model/:code ===
app.get('/moteur/:brand/:model/:code', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).send('<!doctype html><html><body><p>Base non configurée.</p></body></html>');
    await initMongo();
    await ensureEngineIndexes();
    const brandSlug = slugify(req.params.brand || '');
    const modelSlug = slugify(req.params.model || '');
    const codeSlug = slugify(req.params.code || '');
    const col = mongoDb.collection('engine_pages');
    const doc = await col.findOne({ brandSlug, modelSlug, codeSlug, status: 'published' });
    if (!doc) return res.status(404).send('<!doctype html><html><body><p>Page moteur introuvable.</p></body></html>');

    const origin = getWebsiteOrigin();
    const pathUrl = `/moteur/${brandSlug}/${modelSlug}/${codeSlug}`;
    const title = (doc.seo && doc.seo.title) ? String(doc.seo.title) : `Moteur ${doc.brand} ${doc.model} ${doc.code} — Fiche, compatibilités et devis`;
    const description = (doc.seo && doc.seo.description) ? String(doc.seo.description) : `Toutes les infos pour le moteur ${doc.brand} ${doc.model} ${doc.code}: caractéristiques, compatibilités, pannes connues, prix et demande de devis.`;
    const canonical = `${origin}${pathUrl}`;
    const ogImage = (doc.images && doc.images[0]) ? (doc.images[0].url || (doc.images[0].id ? `${origin}/gallery-file/${encodeURIComponent(String(doc.images[0].id))}` : '')) : '';
    const noindex = Boolean(doc.noindex) || isThinEnginePage(doc);

    // Liens internes: autres moteurs de la même marque
    const related = await col.find({ brandSlug, status: 'published', _id: { $ne: doc._id } }, { projection: { brandSlug: 1, modelSlug: 1, codeSlug: 1, brand: 1, model: 1, code: 1 } }).limit(6).toArray();
    const relatedLinks = related.map(r => ({
      href: `/moteur/${r.brandSlug}/${r.modelSlug}/${r.codeSlug}`,
      label: `${r.brand} ${r.model} ${r.code}`
    }));

    // Préparer images résolues
    const imageUrls = Array.isArray(doc.images) ? doc.images.map(img => (img && (img.url || (img.id ? `${origin}/gallery-file/${encodeURIComponent(String(img.id))}` : '')))).filter(Boolean) : [];

    res.setHeader('Cache-Control', 'no-store');
    return res.render('engine', {
      origin,
      pathUrl,
      title,
      description,
      canonical,
      ogImage,
      noindex,
      gsc: process.env.GOOGLE_SITE_VERIFICATION || '',
      page: doc,
      imageUrls,
      relatedLinks,
    });
  } catch (err) {
    console.error('[engine ssr] error', err);
    return res.status(500).send('<!doctype html><html><body><p>Erreur serveur.</p></body></html>');
  }
});

// Fallback SSR: /codes-moteur/:slug (doc basé sur slug)
app.get('/codes-moteur/:slug', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).send('<!doctype html><html><body><p>Base non configurée.</p></body></html>');
    await initMongo();
    const slug = String(req.params.slug || '').trim().toLowerCase();
    const col = mongoDb.collection('engine_pages');
    const doc = await col.findOne({ slug, status: 'published' });
    if (!doc) return res.status(404).send('<!doctype html><html><body><p>Page moteur introuvable.</p></body></html>');

    // Si l'URL "propre" existe, rediriger en 301 vers /moteur/:brand/:model/:code
    if (doc.brandSlug && doc.modelSlug && doc.codeSlug) {
      const target = `/moteur/${encodeURIComponent(doc.brandSlug)}/${encodeURIComponent(doc.modelSlug)}/${encodeURIComponent(doc.codeSlug)}`;
      try { return res.redirect(301, target); } catch { return res.redirect(302, target); }
    }

    const origin = getWebsiteOrigin();
    const pathUrl = `/codes-moteur/${encodeURIComponent(slug)}`;
    const title = doc.seoTitle || doc?.seo?.title || doc.title || `Moteur ${doc.code} — ${(doc.marque || doc.brand || '')} ${(doc.cylindree || doc.model || '')}`.trim();
    const description = doc.seoDescription || doc?.seo?.description || `Moteur ${doc.code} ${(doc.marque || '')} ${(doc.cylindree || '')} testé et garanti. Demandez votre devis.`.trim();
    const canonical = `${origin}${pathUrl}`;
    const ogImage = (Array.isArray(doc.images) && doc.images[0])
      ? (typeof doc.images[0] === 'string' ? doc.images[0] : (doc.images[0].url || (doc.images[0].id ? `${origin}/gallery-file/${encodeURIComponent(String(doc.images[0].id))}` : '')))
      : (doc.image || '');
    const noindex = Boolean(doc.noindex) || isThinEnginePage(doc);

    const imageUrls = Array.isArray(doc.images)
      ? doc.images.map((img) => {
          if (!img) return null;
          if (typeof img === 'string') return img;
          if (img.url) return img.url;
          if (img.id) return `${origin}/gallery-file/${encodeURIComponent(String(img.id))}`;
          return null;
        }).filter(Boolean)
      : (doc.image ? [doc.image] : []);

    // Liens internes: autres moteurs de la même marque
    const brandRaw = doc.marque || doc.brand || '';
    let relatedLinks = [];
    if (brandRaw) {
      const related = await col.find(
        { marque: { $regex: `^${brandRaw}$`, $options: 'i' }, status: 'published', slug: { $ne: slug } },
        { projection: { slug: 1, code: 1, marque: 1, cylindree: 1 } }
      ).limit(6).toArray();
      relatedLinks = related.map((r) => ({ href: `/codes-moteur/${encodeURIComponent(r.slug)}`, label: `${r.marque} ${r.cylindree || ''} ${r.code}`.trim() }));
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.render('engine', {
      origin,
      pathUrl,
      title,
      description,
      canonical,
      ogImage,
      noindex,
      gsc: process.env.GOOGLE_SITE_VERIFICATION || '',
      page: doc,
      imageUrls,
      relatedLinks,
    });
  } catch (err) {
    console.error('[engine slug ssr] error', err);
    return res.status(500).send('<!doctype html><html><body><p>Erreur serveur.</p></body></html>');
  }
});

app.get('/blog', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).send('<!doctype html><html><body><p>Base non configurée.</p></body></html>');
    await initMongo();
    await ensureBlogIndexes();
    const col = mongoDb.collection('blog_posts');
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '12'), 10) || 12));
    const filter = { status: 'published' };
    const total = await col.countDocuments(filter);
    const items = await col
      .find(filter, { projection: { title: 1, slug: 1, summary: 1, image: 1, publishedAt: 1, tags: 1 } })
      .sort({ publishedAt: -1, updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    const origin = getWebsiteOrigin();
    const assetsOrigin = '';
    const pathUrl = '/blog';
    const title = 'Blog — Car Parts France';
    const description = 'Conseils moteurs, pannes, compatibilités et entretien.';
    const canonical = page > 1 ? `${origin}${pathUrl}?page=${page}` : `${origin}${pathUrl}`;
    const prevUrl = page > 1 ? `${pathUrl}?page=${page - 1}` : null;
    const nextUrl = (page * limit < total) ? `${pathUrl}?page=${page + 1}` : null;
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.render('blog/index', { origin, assetsOrigin, pathUrl, title, description, canonical, items, page, limit, total, gsc: process.env.GOOGLE_SITE_VERIFICATION || '', prevUrl, nextUrl });
  } catch (err) {
    return res.status(500).send('<!doctype html><html><body><p>Erreur serveur.</p></body></html>');
  }
});

// Blog par tag
app.get('/blog/tag/:tag', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).send('<!doctype html><html><body><p>Base non configurée.</p></body></html>');
    await initMongo();
    await ensureBlogIndexes();
    const raw = String(req.params.tag || '').trim();
    const tag = raw.toLowerCase();
    const col = mongoDb.collection('blog_posts');
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '12'), 10) || 12));
    const filter = { status: 'published', tags: { $in: [raw, tag] } };
    const total = await col.countDocuments(filter);
    const items = await col
      .find(filter, { projection: { title: 1, slug: 1, summary: 1, image: 1, publishedAt: 1 } })
      .sort({ publishedAt: -1, updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    const origin = getWebsiteOrigin();
    const assetsOrigin = '';
    const pathUrl = `/blog/tag/${encodeURIComponent(tag)}`;
    const title = `Articles tag: ${raw} — Car Parts France`;
    const description = `Tous nos articles liés à ${raw}.`;
    const canonical = page > 1 ? `${origin}${pathUrl}?page=${page}` : `${origin}${pathUrl}`;
    const prevUrl = page > 1 ? `${pathUrl}?page=${page - 1}` : null;
    const nextUrl = (page * limit < total) ? `${pathUrl}?page=${page + 1}` : null;
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.render('blog/index', { origin, assetsOrigin, pathUrl, title, description, canonical, items, page, limit, total, gsc: process.env.GOOGLE_SITE_VERIFICATION || '', prevUrl, nextUrl });
  } catch (err) {
    return res.status(500).send('<!doctype html><html><body><p>Erreur serveur.</p></body></html>');
  }
});

app.get('/blog/:slug', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).send('<!doctype html><html><body><p>Base non configurée.</p></body></html>');
    await initMongo();
    await ensureBlogIndexes();
    const slug = String(req.params.slug || '').trim().toLowerCase();
    const col = mongoDb.collection('blog_posts');
    const doc = await col.findOne({ slug, status: 'published' });
    if (!doc) return res.status(404).send('<!doctype html><html><body><p>Article introuvable.</p></body></html>');
    const origin = getWebsiteOrigin();
    const assetsOrigin = '';
    const pathUrl = `/blog/${encodeURIComponent(slug)}`;
    const title = doc.seoTitle || doc.title || 'Article';
    const description = doc.seoDescription || doc.summary || '';
    const canonical = `${origin}${pathUrl}`;
    const ogImage = doc.image || '/assets/blog-cover.svg';
    const noindex = false;
    let related = [];
    if (Array.isArray(doc.tags) && doc.tags.length) {
      related = await col.find(
        { status: 'published', slug: { $ne: slug }, tags: { $in: doc.tags.slice(0, 3) } },
        { projection: { title: 1, slug: 1, image: 1, publishedAt: 1, tags: 1 } }
      ).limit(6).toArray();
    } else {
      related = await col.find(
        { status: 'published', slug: { $ne: slug } },
        { projection: { title: 1, slug: 1, image: 1, publishedAt: 1, tags: 1 } }
      ).sort({ publishedAt: -1 }).limit(6).toArray();
    }
    // Précédent / Suivant basés sur publishedAt
    let prev = null, next = null;
    try {
      if (doc.publishedAt) {
        prev = await col.findOne({ status: 'published', slug: { $ne: slug }, publishedAt: { $lt: doc.publishedAt } }, { projection: { title: 1, slug: 1 } , sort: { publishedAt: -1 } });
      }
    } catch {}
    try {
      if (doc.publishedAt) {
        next = await col.findOne({ status: 'published', slug: { $ne: slug }, publishedAt: { $gt: doc.publishedAt } }, { projection: { title: 1, slug: 1 } , sort: { publishedAt: 1 } });
      }
    } catch {}
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.render('blog/post', { origin, assetsOrigin, pathUrl, title, description, canonical, ogImage, noindex, post: doc, related, prev, next, gsc: process.env.GOOGLE_SITE_VERIFICATION || '' });
  } catch (err) {
    return res.status(500).send('<!doctype html><html><body><p>Erreur serveur.</p></body></html>');
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
    return res.status(500).json({ ok: false, error: 'gallery_list_error' });
  }
});

app.post('/api/public/quote-request', async (req, res) => {
  try {
    const b = req.body || {};
    const name = String(b.name || '').trim();
    const email = String(b.email || '').trim();
    const phone = String(b.phone || '').trim();
    const vehicleId = String(b.vehicleId || '').trim();
    const message = String(b.message || '').trim();
    const source = String(b.source || '').trim();
    const createdAt = String(b.createdAt || new Date().toISOString());

    if (!vehicleId || (!phone && !email)) {
      return res.status(400).json({ ok: false, error: 'invalid_payload' });
    }

    const ref = 'Q-' + crypto.randomBytes(3).toString('hex').toUpperCase();

    const fromEmail = (process.env.MAILERSEND_FROM_EMAIL || 'contact@cpfmoteur.fr').trim();
    const fromName = (process.env.MAILERSEND_FROM_NAME || 'Car Parts France').trim();
    const toEmail = (process.env.MAILERSEND_TO_EMAIL || fromEmail).trim();
    const replyToEmail = (email || process.env.MAILERSEND_REPLY_TO || fromEmail).trim();

    const subject = `Nouvelle demande de devis ${vehicleId ? '— ' + vehicleId : ''} (${ref})`;
    const plain = [
      'Nouvelle demande de devis',
      `Réf: ${ref}`,
      `Nom: ${name || '—'}`,
      `Email: ${email || '—'}`,
      `Téléphone: ${phone || '—'}`,
      `Identifiant véhicule: ${vehicleId || '—'}`,
      `Message: ${message || '—'}`,
      `Source: ${source || '—'}`,
      `Créé le: ${createdAt}`,
    ].join('\n');

    const html = buildReplyEmailHtml({
      subject,
      toName: 'Équipe Car Parts France',
      message: [
        'Nouvelle demande de devis.',
        `Réf: ${ref}`,
        `Nom: ${name || '—'}`,
        `Email: ${email || '—'}`,
        `Téléphone: ${phone || '—'}`,
        `Identifiant véhicule: ${vehicleId || '—'}`,
        `Message: ${message || '—'}`,
        `Source: ${source || '—'}`,
        `Créé le: ${createdAt}`,
      ].join('\n'),
      companyName: 'Car Parts France',
      websiteUrl: process.env.COMPANY_WEBSITE_URL || '',
      supportEmail: fromEmail,
    });

    const apiKey = (process.env.MAILERSEND_API_KEY || '').trim();
    if (!apiKey) console.error('[quote-request] MAILERSEND_API_KEY manquant');
    const mailer = new MailerSend({ apiKey });
    const emailParams = new EmailParams()
      .setFrom(new Sender(fromEmail, fromName))
      .setTo([new Recipient(toEmail, 'Car Parts France')])
      .setSubject(subject)
      .setHtml(html)
      .setText(plain)
      .setReplyTo(new Sender(replyToEmail, name || replyToEmail));

    await sendWithRetry(mailer, emailParams, 2);

    if (email) {
      const userSubject = `Accusé de réception — demande bien reçue (${ref})`;
      const origin = getWebsiteOrigin();
      const socialLogos = [
        { src: `${origin}/images/partners/logo-porsche.webp`, alt: 'Centre Porsche Toulon' },
        { src: `${origin}/images/partners/mougins-autosport.webp`, alt: 'Mougins Autosport' },
        { src: `${origin}/images/partners/sun-motors.webp`, alt: 'Sun Motors' },
      ];
      const userMessage = [
        'Merci pour votre confiance, votre dossier passe en priorité auprès de notre équipe.',
        `Réf: ${ref}`,
        `Identifiant véhicule: ${vehicleId || '—'}`,
        `Message transmis: ${message || '—'}`,
        'Nous revenons vers vous sous 24h ouvrées avec un devis détaillé (garantie 12 mois + rapport de tests).'
      ].join('\n');
      const userPlain = `${userMessage}\n\nÉtapes suivantes :\n1) Validation compatibilité (VIN / plaque)\n2) Rapport de tests envoyé pour validation finale\n3) Organisation de l’expédition assurée (72h à 14 jours)`;
      const nextSteps = [
        'Validation de la compatibilité à partir de votre plaque / VIN et disponibilité stock.',
        'Envoi du rapport de tests (compression, endoscopie, capteurs) pour validation finale.',
        'Organisation de l’expédition assurée (72h à 14 jours) avec suivi WhatsApp et prise de rendez-vous.'
      ];
      const replyNotice = 'Vous pouvez répondre directement à cet e-mail ou utiliser les coordonnées ci-dessous.';
      const replyOptions = {
        phone: '04 65 84 54 88',
        whatsapp: 'https://wa.me/33756875025'
      };
      const testsPageUrl = `${process.env.COMPANY_WEBSITE_URL || origin}/tests-moteurs`;
      const companyInfo = {
        instagramUrl: 'https://www.instagram.com/carpartsfrance/'
      };
      const details = {
        reference: ref,
        delivery: 'Devis détaillé sous 24h ouvrées, expédition 72h à 14 jours (assurance casse/perte)'
      };
      const userHtml = buildAckEmailHtml({
        subject: userSubject,
        toName: name || '',
        message: userMessage,
        companyName: 'Car Parts France',
        websiteUrl: process.env.COMPANY_WEBSITE_URL || '',
        supportEmail: fromEmail,
        logoUrl: `${origin}/images/logo.png`,
        nextSteps,
        replyOptions,
        companyInfo,
      });
      const userParams = new EmailParams()
        .setFrom(new Sender(fromEmail, fromName))
        .setTo([new Recipient(email, name || 'Client')])
        .setSubject(userSubject)
        .setHtml(userHtml)
        .setText(userPlain)
        .setReplyTo(new Sender(fromEmail, fromName));
      try { await sendWithRetry(mailer, userParams, 2); } catch (e) { console.error('[quote-request] user-confirmation failed', e?.message || e); }
    }

    try {
      setQuoteMeta(ref, { name, email, phone, vehicleId, message, source, createdAt, deliveredAt: new Date().toISOString() });
    } catch {}

    // Persistance en base (si MongoDB configuré)
    try {
      if (MONGODB_URI) {
        await initMongo();
        const col = mongoDb.collection('quotes');
        await col.insertOne({
          id: ref,
          name,
          email,
          phone,
          vehicleId,
          message,
          source,
          createdAt,
          deliveredAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.error('[quotes insert] mongo error', e?.message || e);
    }

    return res.json({ ok: true, ref });
  } catch (err) {
    console.error('[quote-request] error', err);
    return res.status(500).json({ ok: false, error: 'send_failed' });
  }
});

// === Admin: liste des devis enregistrés (basés sur les métadonnées stockées) ===
app.get('/api/admin/quotes', async (req, res) => {
  try {
    const ADMIN_TOKEN = String(process.env.BACKEND_TOKEN || '').trim();
    const AUTH = String(req.headers?.authorization || '');
    const APIK = String(req.headers?.['x-api-key'] || '');
    const host = String(req.headers?.host || '');
    const isLocalHost = /^localhost(:\d+)?$|^127\.0\.0\.1(:\d+)?$/i.test(host);
    const remote = String((req.socket && req.socket.remoteAddress) || '');
    const isLocalAddr = /^::1$|^::ffff:127\.0\.0\.1$|^127\.0\.0\.1$/.test(remote);
    const ok = (isLocalHost || isLocalAddr) || (Boolean(ADMIN_TOKEN) && (AUTH === `Bearer ${ADMIN_TOKEN}` || APIK === ADMIN_TOKEN));
    if (!ok) {
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }
    let quotes = [];
    if (MONGODB_URI) {
      try {
        await initMongo();
        const col = mongoDb.collection('quotes');
        const arr = await col.find({}, { sort: { createdAt: -1 } }).limit(500).toArray();
        quotes = arr.map((d) => ({
          id: String(d.id || d._id || ''),
          name: d.name || '',
          email: d.email || '',
          phone: d.phone || '',
          vehicleId: d.vehicleId || '',
          message: d.message || '',
          createdAt: String(d.createdAt || d.deliveredAt || new Date().toISOString()),
          status: d.status || 'nouveau',
          followUpAt: d.followUpAt ? String(d.followUpAt) : undefined,
          lastOpenedAt: d.lastOpenedAt ? String(d.lastOpenedAt) : undefined,
          openCount: typeof d.openCount === 'number' ? d.openCount : undefined,
        }));
      } catch (e) {
        console.error('[admin quotes] mongo read error', e?.message || e);
        quotes = listQuoteMetas();
      }
    } else {
      quotes = listQuoteMetas();
    }
    res.setHeader('Cache-Control', 'no-store');
    return res.json({ ok: true, quotes });
  } catch (err) {
    console.error('[admin quotes] error', err);
    return res.status(500).json({ ok: false, error: 'list_error' });
  }
});

// === Admin: envoi d'une réponse au client (email via MailerSend) ===
app.post('/api/devis/:id/reponse', async (req, res) => {
  try {
    const ADMIN_TOKEN = String(process.env.BACKEND_TOKEN || '').trim();
    const AUTH = String(req.headers?.authorization || '');
    const APIK = String(req.headers?.['x-api-key'] || '');
    const host = String(req.headers?.host || '');
    const isLocalHost = /^localhost(:\d+)?$|^127\.0\.0\.1(:\d+)?$/i.test(host);
    const remote = String((req.socket && req.socket.remoteAddress) || '');
    const isLocalAddr = /^::1$|^::ffff:127\.0\.0\.1$|^127\.0\.0\.1$/.test(remote);
    const ok = (isLocalHost || isLocalAddr) || (Boolean(ADMIN_TOKEN) && (AUTH === `Bearer ${ADMIN_TOKEN}` || APIK === ADMIN_TOKEN));
    if (!ok) {
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }

    const quoteId = String((req.params?.id || req.body?.quoteId || '')).trim();
    const channel = String((req.body?.channel || 'email')).trim();
    if (!quoteId) return res.status(400).json({ ok: false, error: 'missing_quote_id' });
    if (channel !== 'email') return res.status(400).json({ ok: false, error: 'unsupported_channel' });

    const toEmail = String(req.body?.toEmail || '').trim();
    const toName = String(req.body?.toName || '').trim();
    const subject = String(req.body?.subject || 'Réponse à votre devis - Car Parts France').trim();
    const message = String(req.body?.message || '').trim();
    const attachmentsIn = Array.isArray(req.body?.attachments) ? req.body.attachments : [];
    const extras = req.body?.extras || {};

    if (!toEmail || !message) return res.status(400).json({ ok: false, error: 'missing_fields' });

    const fromEmail = (process.env.MAILERSEND_FROM_EMAIL || 'contact@cpfmoteur.fr').trim();
    const fromName = (process.env.MAILERSEND_FROM_NAME || 'Car Parts France').trim();
    const apiKey = (process.env.MAILERSEND_API_KEY || '').trim();
    if (!apiKey) return res.status(500).json({ ok: false, error: 'missing_mailersend_key' });

    const origin = getWebsiteOrigin();
    const replyId = 'r-' + crypto.randomBytes(4).toString('hex');
    const serverBase = `${req.protocol}://${req.get('host')}`;
    const publicBase = (process.env.COMPANY_WEBSITE_URL && process.env.COMPANY_WEBSITE_URL.trim())
      ? process.env.COMPANY_WEBSITE_URL.trim().replace(/\/$/, '')
      : (VERCEL_ORIGIN || serverBase);

    const mailer = new MailerSend({ apiKey });
    const emailParams = new EmailParams()
      .setFrom(new Sender(fromEmail, fromName))
      .setTo([new Recipient(toEmail, toName || 'Client')])
      .setSubject(subject)
      .setHtml(buildReplyEmailHtml({
        subject,
        toName,
        message,
        companyName: 'Car Parts France',
        websiteUrl: process.env.COMPANY_WEBSITE_URL || origin,
        supportEmail: fromEmail,
        logoUrl: `${origin}/images/logo.png`,
        trackingUrl: `${publicBase}/api/track/open/${encodeURIComponent(quoteId)}.gif?rid=${encodeURIComponent(replyId)}`,
        details: {
          price: extras?.price,
          mileageKm: extras?.mileageKm,
          delivery: extras?.delivery,
          deliveryCost: extras?.deliveryCost,
          reference: extras?.reference || quoteId,
          warranty: extras?.warranty,
          vehicleId: extras?.vehicleId,
          engineCode: extras?.engineCode,
          configuration: extras?.configuration,
          items: Array.isArray(extras?.items) ? extras.items : [],
          testsPerformed: Array.isArray(extras?.testsPerformed) ? extras.testsPerformed : [],
          defectObserved: extras?.defectObserved,
        }
      }))
      .setText([message, '', `Référence: ${quoteId}`].join('\n'))
      .setReplyTo(new Sender(fromEmail, fromName));

    // Conversion des pièces jointes: data URL (ou base64 direct) -> Attachment
    const mailerAttachments = [];
    for (const a of attachmentsIn) {
      try {
        const filename = String(a?.filename || 'piece-jointe');
        let type = String(a?.type || 'application/octet-stream');
        let contentB64 = String(a?.content || '');
        const m = /^data:([^;]+);base64,(.+)$/i.exec(contentB64);
        if (m) { type = m[1] || type; contentB64 = m[2] || ''; }
        if (!contentB64) continue;
        // Attachment(content, filename, type)
        mailerAttachments.push(new Attachment(contentB64, filename));
      } catch {}
    }
    if (mailerAttachments.length && typeof emailParams.setAttachments === 'function') {
      emailParams.setAttachments(mailerAttachments);
    }

    await sendWithRetry(mailer, emailParams, 2);

    // Mise à jour du statut et meta après envoi
    const nowIso = new Date().toISOString();
    const followUpAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    // 1) Mise à jour MongoDB si dispo (prod conseillé)
    try {
      if (MONGODB_URI) {
        await initMongo();
        await mongoDb.collection('quotes').updateOne(
          { id: quoteId },
          { $set: { status: 'en_attente_client', followUpAt, lastReplyAt: nowIso, lastReplyId: replyId, updatedAt: nowIso } },
          { upsert: true }
        );
      }
    } catch (e) {
      console.error('[admin reply] mongo status update error', e?.message || e);
    }
    // 2) Écriture locale best-effort (échoue en FS read-only sur Vercel)
    try {
      setQuoteMeta(quoteId, { status: 'en_attente_client', lastReplyAt: nowIso, lastReplyId: replyId, followUpAt });
    } catch (e) {
      console.error('[admin reply] local meta write error', e?.message || e);
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('[admin reply] error', err?.message || err);
    return res.status(500).json({ ok: false, error: 'send_failed' });
  }
});

// === Tracking pixel: enregistre l'ouverture d'un email de réponse ===
app.get('/api/track/open/:id.gif', async (req, res) => {
  try {
    const quoteId = String(req.params.id || '').trim();
    const rid = String((req.query && req.query.rid) || '').trim();
    const ua = String(req.headers['user-agent'] || '');
    const ip = String((req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '')).split(',')[0].trim();
    const nowIso = new Date().toISOString();
    if (quoteId) {
      try {
        const prev = getQuoteMeta(quoteId) || {};
        const openCount = Number(prev.openCount || 0) + 1;
        const firstOpenedAt = prev.firstOpenedAt || nowIso;
        setQuoteMeta(quoteId, { openCount, firstOpenedAt, lastOpenedAt: nowIso, lastOpenedFrom: { ip, ua, rid } });
      } catch {}
      try {
        if (MONGODB_URI) {
          await initMongo();
          await mongoDb.collection('quotes').updateOne(
            { id: quoteId },
            { $set: { lastOpenedAt: nowIso }, $inc: { openCount: 1 } },
            { upsert: false }
          );
        }
      } catch {}
    }
  } catch {}
  try {
    // 1x1 GIF transparent
    const buf = Buffer.from('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', 'base64');
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return res.end(buf);
  } catch {
    return res.status(204).end();
  }
});

// === Admin: lecture des métadonnées d'un devis ===
app.get('/api/admin/quote-meta/:id', async (req, res) => {
  try {
    const ADMIN_TOKEN = String(process.env.BACKEND_TOKEN || '').trim();
    const AUTH = String(req.headers?.authorization || '');
    const APIK = String(req.headers?.['x-api-key'] || '');
    const host = String(req.headers?.host || '');
    const isLocalHost = /^localhost(:\d+)?$|^127\.0\.0\.1(:\d+)?$/i.test(host);
    const remote = String((req.socket && req.socket.remoteAddress) || '');
    const isLocalAddr = /^::1$|^::ffff:127\.0\.0\.1$|^127\.0\.0\.1$/.test(remote);
    const ok = (isLocalHost || isLocalAddr) || (Boolean(ADMIN_TOKEN) && (AUTH === `Bearer ${ADMIN_TOKEN}` || APIK === ADMIN_TOKEN));
    if (!ok) return res.status(401).json({ ok: false, error: 'unauthorized' });
    const id = String(req.params.id || '').trim();
    if (!id) return res.status(400).json({ ok: false, error: 'missing_id' });
    const meta = getQuoteMeta(id) || {};
    let db = {};
    try {
      if (MONGODB_URI) {
        await initMongo();
        const doc = await mongoDb.collection('quotes').findOne({ id });
        if (doc) {
          db = {
            status: doc.status,
            followUpAt: doc.followUpAt,
            lastReplyAt: doc.lastReplyAt,
            lastOpenedAt: doc.lastOpenedAt,
            openCount: doc.openCount
          };
        }
      }
    } catch {}
    res.setHeader('Cache-Control', 'no-store');
    return res.json({ ok: true, id, meta, db });
  } catch (err) {
    console.error('[quote-meta] admin get error:', err);
    return res.status(500).json({ ok: false, error: 'read_error' });
  }
});

// === Admin: récupère les réponses client enregistrées pour un devis donné ===
app.get('/api/replies/:id', async (req, res) => {
  try {
    const ADMIN_TOKEN = String(process.env.BACKEND_TOKEN || '').trim();
    const AUTH = String(req.headers?.authorization || '');
    const APIK = String(req.headers?.['x-api-key'] || '');
    const host = String(req.headers?.host || '');
    const isLocalHost = /^localhost(:\d+)?$|^127\.0\.0\.1(:\d+)?$/i.test(host);
    const remote = String((req.socket && req.socket.remoteAddress) || '');
    const isLocalAddr = /^::1$|^::ffff:127\.0\.0\.1$|^127\.0\.0\.1$/.test(remote);
    const ok = (isLocalHost || isLocalAddr) || (Boolean(ADMIN_TOKEN) && (AUTH === `Bearer ${ADMIN_TOKEN}` || APIK === ADMIN_TOKEN));
    if (!ok) {
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }
    const id = String(req.params.id || '').trim();
    if (!id) return res.status(400).json({ ok: false, error: 'missing_id' });
    const replies = getReplies(id);
    res.setHeader('Cache-Control', 'no-store');
    return res.json({ ok: true, replies });
  } catch (err) {
    console.error('[replies get] error', err);
    return res.status(500).json({ ok: false, error: 'read_error' });
  }
});

// === SEO: Sitemap et Robots publics ===
function getWebsiteOrigin() {
  const raw = (process.env.COMPANY_WEBSITE_URL || process.env.FRONTEND_URL || 'http://localhost:3000').trim();
  try {
    const u = new URL(raw);
    return u.origin;
  } catch {
    try { return new URL('https://' + raw.replace(/^https?:\/\//, '')).origin; } catch { return 'http://localhost:3000'; }
  }
}

// Sitemap XML (pages statiques + moteurs + blog)
app.get('/sitemap.xml', async (req, res) => {
  try {
    const origin = getWebsiteOrigin();
    const urls = [
      { loc: `${origin}/`, changefreq: 'weekly', priority: '0.9' },
      { loc: `${origin}/contact`, changefreq: 'yearly', priority: '0.4' },
      { loc: `${origin}/a-propos`, changefreq: 'yearly', priority: '0.4' },
      { loc: `${origin}/demande-devis`, changefreq: 'monthly', priority: '0.6' },
      { loc: `${origin}/mentions-legales`, changefreq: 'yearly', priority: '0.1' },
      { loc: `${origin}/moteurs`, changefreq: 'weekly', priority: '0.7' },
      { loc: `${origin}/blog`, changefreq: 'weekly', priority: '0.5' },
    ];

    if (MONGODB_URI) {
      await initMongo();
      // Moteurs
      await ensureEngineIndexes();
      const ecol = mongoDb.collection('engine_pages');
      const edocs = await ecol.find(
        { status: 'published', noindex: { $ne: true } },
        { projection: { slug: 1, updatedAt: 1, brandSlug: 1, modelSlug: 1, codeSlug: 1 } }
      ).toArray();
      for (const d of edocs) {
        let loc = '';
        if (d.brandSlug && d.modelSlug && d.codeSlug) {
          loc = `${origin}/moteur/${encodeURIComponent(d.brandSlug)}/${encodeURIComponent(d.modelSlug)}/${encodeURIComponent(d.codeSlug)}`;
        } else {
          loc = `${origin}/codes-moteur/${encodeURIComponent(String(d.slug || ''))}`;
        }
        const lastmod = d.updatedAt ? new Date(d.updatedAt).toISOString() : undefined;
        urls.push({ loc, changefreq: 'weekly', priority: '0.8', lastmod });
      }
      // Marques (top 20)
      const brandsAgg = [
        { $match: { status: 'published', noindex: { $ne: true } } },
        { $group: { _id: '$marque', count: { $sum: 1 } } },
        { $project: { _id: 0, brand: '$_id', count: 1 } },
        { $sort: { count: -1, brand: 1 } },
        { $limit: 20 },
      ];
      const topBrands = await ecol.aggregate(brandsAgg).toArray();
      for (const b of topBrands) {
        const brand = String(b.brand || '').trim();
        if (!brand) continue;
        const bslug = slugify(brand);
        urls.push({ loc: `${origin}/moteurs/${encodeURIComponent(bslug)}`, changefreq: 'weekly', priority: '0.6' });
      }
      // Hubs modèle (top 100 paires brand/model)
      try {
        const modelAgg = [
          { $match: { status: 'published', brandSlug: { $exists: true, $ne: '' }, modelSlug: { $exists: true, $ne: '' }, noindex: { $ne: true } } },
          { $group: { _id: { b: '$brandSlug', m: '$modelSlug' }, c: { $sum: 1 } } },
          { $project: { _id: 0, brandSlug: '$_id.b', modelSlug: '$_id.m', c: 1 } },
          { $sort: { c: -1, brandSlug: 1, modelSlug: 1 } },
          { $limit: 100 }
        ];
        const pairs = await ecol.aggregate(modelAgg).toArray();
        for (const p of pairs) {
          urls.push({ loc: `${origin}/moteur/${encodeURIComponent(p.brandSlug)}/${encodeURIComponent(p.modelSlug)}`, changefreq: 'weekly', priority: '0.5' });
        }
      } catch {}
      // Blog
      await ensureBlogIndexes();
      const bcol = mongoDb.collection('blog_posts');
      const posts = await bcol.find(
        { status: 'published' },
        { projection: { slug: 1, updatedAt: 1, publishedAt: 1 } }
      ).toArray();
      for (const p of posts) {
        const lastmod = (p.updatedAt || p.publishedAt)
          ? new Date(p.updatedAt || p.publishedAt).toISOString()
          : undefined;
        urls.push({ loc: `${origin}/blog/${encodeURIComponent(String(p.slug || ''))}`, changefreq: 'weekly', priority: '0.6', lastmod });
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
      'Disallow: /api',
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

// === Admin: Blog posts CRUD ===
app.get('/api/admin/blog-posts', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).json({ ok: false, error: 'mongo_not_configured' });
    await initMongo();
    await ensureBlogIndexes();
    const { q = '', status = '', page = '1', limit = '20' } = req.query || {};
    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const l = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
    const filter = {};
    if (q) {
      const s = String(q).trim();
      filter.$or = [
        { title: { $regex: s, $options: 'i' } },
        { slug: { $regex: s, $options: 'i' } },
        { summary: { $regex: s, $options: 'i' } },
        { tags: { $in: [s] } },
      ];
    }
    if (status) filter.status = String(status);
    const col = mongoDb.collection('blog_posts');
    const total = await col.countDocuments(filter);
    const items = await col.find(filter).sort({ publishedAt: -1, updatedAt: -1 }).skip((p - 1) * l).limit(l).toArray();
    const mapped = items.map(({ _id, ...rest }) => ({ id: String(_id), ...rest }));
    res.json({ ok: true, page: p, limit: l, total, items: mapped });
  } catch (err) {
    console.error('[blog] admin list error:', err);
    res.status(500).json({ ok: false, error: 'admin_list_failed' });
  }
});

app.post('/api/admin/blog-posts', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).json({ ok: false, error: 'mongo_not_configured' });
    await initMongo();
    await ensureBlogIndexes();
    const b = req.body || {};
    const title = String(b.title || '').trim();
    const slugProvided = String(b.slug || '').trim();
    if (!title) return res.status(400).json({ ok: false, error: 'missing_title' });
    const slug = slugify(slugProvided || title).slice(0, 200);
    const now = new Date().toISOString();
    const doc = {
      title,
      slug,
      summary: String(b.summary || '').trim(),
      contentHtml: String(b.contentHtml || ''),
      image: String(b.image || ''),
      tags: Array.isArray(b.tags) ? b.tags.map((t) => String(t).trim()).filter(Boolean) : [],
      status: b.status === 'published' ? 'published' : 'draft',
      publishedAt: b.publishedAt ? new Date(b.publishedAt).toISOString() : null,
      noindex: Boolean(b.noindex),
      createdAt: now,
      updatedAt: now,
    };
    const col = mongoDb.collection('blog_posts');
    await col.insertOne(doc);
    res.status(201).json({ ok: true, slug });
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ ok: false, error: 'duplicate_slug' });
    console.error('[blog] admin create error:', err);
    res.status(500).json({ ok: false, error: 'admin_create_failed' });
  }
});

app.put('/api/admin/blog-posts/:id', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).json({ ok: false, error: 'mongo_not_configured' });
    await initMongo();
    await ensureBlogIndexes();
    const id = String(req.params.id || '').trim();
    let oid; try { oid = new ObjectId(id); } catch { return res.status(400).json({ ok: false, error: 'invalid_id' }); }
    const b = req.body || {};
    const patch = {};
    if ('title' in b) patch.title = String(b.title || '');
    if ('summary' in b) patch.summary = String(b.summary || '');
    if ('contentHtml' in b) patch.contentHtml = String(b.contentHtml || '');
    if ('image' in b) patch.image = String(b.image || '');
    if ('tags' in b) patch.tags = Array.isArray(b.tags) ? b.tags.map((t) => String(t).trim()).filter(Boolean) : [];
    if ('status' in b) patch.status = (b.status === 'published' ? 'published' : 'draft');
    if ('publishedAt' in b) patch.publishedAt = b.publishedAt ? new Date(b.publishedAt).toISOString() : null;
    if ('slug' in b) patch.slug = slugify(String(b.slug || ''));
    if ('noindex' in b) patch.noindex = Boolean(b.noindex);
    // Recalcule slug si modif titre et pas de slug fourni
    if (!('slug' in b) && 'title' in b) patch.slug = slugify(String(b.title || ''));
    patch.updatedAt = new Date().toISOString();
    const col = mongoDb.collection('blog_posts');
    const r = await col.updateOne({ _id: oid }, { $set: patch });
    if (!r.matchedCount) return res.status(404).json({ ok: false, error: 'not_found' });
    res.json({ ok: true });
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ ok: false, error: 'duplicate_slug' });
    console.error('[blog] admin update error:', err);
    res.status(500).json({ ok: false, error: 'admin_update_failed' });
  }
});

app.delete('/api/admin/blog-posts/:id', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).json({ ok: false, error: 'mongo_not_configured' });
    await initMongo();
    await ensureBlogIndexes();
    const id = String(req.params.id || '').trim();
    let oid; try { oid = new ObjectId(id); } catch { return res.status(400).json({ ok: false, error: 'invalid_id' }); }
    const col = mongoDb.collection('blog_posts');
    const r = await col.deleteOne({ _id: oid });
    if (!r.deletedCount) return res.status(404).json({ ok: false, error: 'not_found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[blog] admin delete error:', err);
    res.status(500).json({ ok: false, error: 'admin_delete_failed' });
  }
});

// === Admin: Blog posts BULK UPDATE (statut / noindex / publishedAt) ===
app.post('/api/admin/blog-posts/bulk-update', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).json({ ok: false, error: 'mongo_not_configured' });
    await initMongo();
    await ensureBlogIndexes();
    const b = req.body || {};
    const ids = Array.isArray(b.ids) ? b.ids : [];
    if (!ids.length) return res.status(400).json({ ok: false, error: 'missing_ids' });
    const oids = [];
    for (const id of ids) { try { oids.push(new ObjectId(String(id))); } catch {} }
    if (!oids.length) return res.status(400).json({ ok: false, error: 'invalid_ids' });

    const set = {};
    if ('status' in b) set.status = (b.status === 'published' ? 'published' : 'draft');
    if ('noindex' in b) set.noindex = Boolean(b.noindex);
    if ('publishedAt' in b) {
      set.publishedAt = b.publishedAt ? new Date(b.publishedAt).toISOString() : null;
    } else if (b.status === 'published') {
      set.publishedAt = new Date().toISOString();
    }
    set.updatedAt = new Date().toISOString();

    if (!Object.keys(set).length) return res.status(400).json({ ok: false, error: 'nothing_to_update' });
    const col = mongoDb.collection('blog_posts');
    const r = await col.updateMany({ _id: { $in: oids } }, { $set: set });
    res.json({ ok: true, matched: r.matchedCount, modified: r.modifiedCount });
  } catch (err) {
    console.error('[blog] admin bulk-update error:', err);
    res.status(500).json({ ok: false, error: 'admin_bulk_update_failed' });
  }
});

// === Admin: Blog posts BULK DELETE ===
app.post('/api/admin/blog-posts/bulk-delete', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).json({ ok: false, error: 'mongo_not_configured' });
    await initMongo();
    await ensureBlogIndexes();
    const b = req.body || {};
    const ids = Array.isArray(b.ids) ? b.ids : [];
    if (!ids.length) return res.status(400).json({ ok: false, error: 'missing_ids' });
    const oids = [];
    for (const id of ids) { try { oids.push(new ObjectId(String(id))); } catch {} }
    if (!oids.length) return res.status(400).json({ ok: false, error: 'invalid_ids' });
    const col = mongoDb.collection('blog_posts');
    const r = await col.deleteMany({ _id: { $in: oids } });
    res.json({ ok: true, deleted: r.deletedCount });
  } catch (err) {
    console.error('[blog] admin bulk-delete error:', err);
    res.status(500).json({ ok: false, error: 'admin_bulk_delete_failed' });
  }
});

app.post('/api/admin/blog-posts/generate', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).json({ ok: false, error: 'mongo_not_configured' });
    const API_BASE = (process.env.AI_API_BASE || '').trim();
    const API_KEY = (process.env.AI_API_KEY || '').trim();
    const PRIMARY_MODEL = (process.env.AI_MODEL || 'gpt-4o-mini').trim();
    const FALLBACK_MODEL = (process.env.AI_MODEL_FALLBACK || 'gpt-4o').trim();
    const MAX_TOKENS = Number(process.env.AI_MAX_TOKENS || 3500);
    const TEMPERATURE = Number(process.env.AI_TEMPERATURE || 0.3);
    if (!API_BASE || !API_KEY || !PRIMARY_MODEL) return res.status(503).json({ ok: false, error: 'ai_not_configured' });

    await initMongo();
    await ensureBlogIndexes();
    const b = req.body || {};
    const marque = String(b.marque || '').trim();
    const code = String(b.code || '').trim();
    const cylindree = String(b.cylindree || '').trim();
    const carburant = String(b.carburant || '').trim();
    const tagsIn = Array.isArray(b.tags) ? b.tags.map((t) => String(t).trim()).filter(Boolean) : [];
    const manualCompat = Array.isArray(b.manualCompat) ? b.manualCompat.map((s)=>String(s).trim()).filter(Boolean) : [];

    // Enrichissement depuis la BDD (fiche moteur la plus proche)
    let engineDoc = null;
    try {
      const ecol = mongoDb.collection('engine_pages');
      const filter = { status: 'published' };
      if (marque) filter.marque = { $regex: `^${marque}$`, $options: 'i' };
      if (code) filter.code = { $regex: `^${code}$`, $options: 'i' };
      engineDoc = await ecol.findOne(filter);
    } catch {}
    // Persistance des compatibilités saisies manuellement (si doc trouvé)
    if (manualCompat.length && engineDoc && engineDoc._id) {
      try {
        const uniq = Array.from(new Set(manualCompat));
        await mongoDb.collection('engine_pages').updateOne({ _id: engineDoc._id }, { $set: { compatibilities: uniq, updatedAt: new Date().toISOString() } });
        engineDoc.compatibilities = uniq;
      } catch {}
    }

    const compatDb = Array.isArray(engineDoc?.compatibilities) ? engineDoc.compatibilities : [];
    const compatEff = manualCompat.length ? manualCompat : compatDb;
    const knownIssues = Array.isArray(engineDoc?.knownIssues) ? engineDoc.knownIssues : [];
    const faqs = Array.isArray(engineDoc?.faq) ? engineDoc.faq : [];

    // Liens internes potentiels
    const origin = getWebsiteOrigin();
    const brandSlug = engineDoc?.brandSlug || (marque ? slugify(marque) : '');
    const modelSlug = engineDoc?.modelSlug || '';
    const codeSlug = engineDoc?.codeSlug || (code ? slugify(code) : '');
    const hubBrandUrl = brandSlug ? `${origin}/moteurs/${encodeURIComponent(brandSlug)}` : '';
    const hubModelUrl = (brandSlug && modelSlug) ? `${origin}/moteur/${encodeURIComponent(brandSlug)}/${encodeURIComponent(modelSlug)}` : '';
    const engineUrl = (brandSlug && modelSlug && codeSlug) ? `${origin}/moteur/${encodeURIComponent(brandSlug)}/${encodeURIComponent(modelSlug)}/${encodeURIComponent(codeSlug)}` : '';
    const data = { marque, code, cylindree, carburant, compatibilities: compatEff, knownIssues, faq: faqs, links: { hubBrandUrl, hubModelUrl, engineUrl } };

    let sourcesCtx = '';
    try {
      const ragEnabled = (b.rag !== false) && Boolean(process.env.SERPAPI_KEY && process.env.FIRECRAWL_API_KEY);
      if (ragEnabled) {
        const serpKey = String(process.env.SERPAPI_KEY || '').trim();
        const fcKey = String(process.env.FIRECRAWL_API_KEY || '').trim();
        const wantSerp = Math.max(3, Math.min(5, Number(b.ragResults || 3)));
        const wantCrawl = Math.max(1, Math.min(2, Number(b.ragResults || 2)));
        const queries = Array.from(new Set([
          [marque, code, 'pannes connues'].filter(Boolean).join(' '),
          [marque, code, 'engine problems'].filter(Boolean).join(' '),
          [marque, code, 'compatibilités'].filter(Boolean).join(' '),
          [marque, code, 'caractéristiques techniques'].filter(Boolean).join(' '),
          [marque, 'cayenne', 'cylindres rayés scoring'].filter(Boolean).join(' '),
          [marque, code, 'cylindres rayés scoring'].filter(Boolean).join(' '),
          [marque, code, 'cylinder scoring'].filter(Boolean).join(' '),
          [marque, code, 'lokasil'].filter(Boolean).join(' '),
          [marque, code, 'tubes de refroidissement plastique'].filter(Boolean).join(' '),
          [marque, code, 'coolant pipe failure'].filter(Boolean).join(' ')
        ].filter(q => q.trim().length > 0)));
        const urlSet = new Set();
        const serpPicks = [];
        let serpCtx = '';
        for (const q of queries) {
          if (serpPicks.length >= wantSerp) break;
          const sUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(q)}&hl=fr&gl=fr&num=${wantSerp}&api_key=${encodeURIComponent(serpKey)}`;
          const sRes = await fetch(sUrl);
          const sJson = await sRes.json().catch(()=>({}));
          const organic = Array.isArray(sJson?.organic_results) ? sJson.organic_results : [];
          for (const r of organic) {
            const url = r?.link || '';
            if (!url || urlSet.has(url)) continue;
            urlSet.add(url);
            serpPicks.push({ url, title: r?.title || '', snippet: r?.snippet || '' });
            serpCtx += `- ${r?.title || url} — ${url}\n  Extrait: ${r?.snippet || ''}\n`;
            if (serpPicks.length >= wantSerp) break;
          }
        }
        const picks = serpPicks.slice(0, wantSerp);
        const chunks = [];
        for (const it of picks) {
          const key = `fc:${it.url}`;
          const cached = RAG_CACHE.get(key);
          if (cached && (Date.now() - cached.ts) < RAG_TTL_MS) { chunks.push({ url: it.url, title: it.title, md: cached.md }); if (chunks.length >= wantCrawl) break; continue; }
          try {
            const fcRes = await fetch('https://api.firecrawl.dev/v1/scrape', { method: 'POST', headers: { 'Authorization': `Bearer ${fcKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ url: it.url, formats: ['markdown'] }) });
            const fcJson = await fcRes.json().catch(()=>({}));
            const md = String(fcJson?.data?.markdown || '').trim();
            const mdClip = md ? md.slice(0, 2000) : '';
            if (mdClip) { chunks.push({ url: it.url, title: it.title, md: mdClip }); RAG_CACHE.set(key, { ts: Date.now(), md: mdClip }); }
          } catch {}
          if (chunks.length >= wantCrawl) break;
        }
        console.log('[ai][rag] serpPicks=%d', serpPicks.length);
        console.log('[ai][rag] crawl_targets=%d', picks.length);
        console.log('[ai][rag] crawled_chunks=%d', chunks.length);
        if (chunks.length) {
          const crawled = chunks.map((c, i) => `[C${i+1}] ${c.title || c.url} — ${c.url}\n${c.md}`).join('\n\n');
          sourcesCtx = `SERP:\n${serpCtx}\n\nPAGES:\n${crawled}`;
        }
      }
    } catch {}

    const sys = 'Tu es un rédacteur technique auto expert (FR). Tu écris un article SEO utile, clair, sans remplissage. Aucune donnée inventée.';
    const cpf = 'Tests compression/endoscopie/pression d\'huile, rapport de test, garantie 1 an, expédition ~4 jours.';
    const brandHints = [];
    try {
      if ((marque && /porsche/i.test(marque)) || /cayenne/i.test(`${marque} ${code}`) || /m48/i.test(code)) {
        brandHints.push('- Inclure un H3 "Cylindres rayés (scoring)" : symptômes (claquement à froid, ratés), causes possibles (alésage/Lokasil, lubrification, segments), risques, diagnostic (endoscopie, tests compression), solutions (échange standard, réalésage), prévention.');
        brandHints.push('- Mentionner les pannes connues: tubes de refroidissement plastiques (remplacement/kit alu), pompe à eau, bobines d\'allumage, consommation d\'huile.');
      }
    } catch {}
    const extraHints = brandHints.length ? `\n\nPoints critiques à traiter:\n${brandHints.join('\n')}\n` : '';

    const userPrompt = `Réponds en JSON strict {"title":"...","summary":"...","tags":["..."],"html":"..."}. Écris ~1500 mots en HTML SÉMANTIQUE UNIQUEMENT (aucun style, aucune classe, aucun <script>, aucune balise <style>, pas de <div> ni <span>, pas d'images). Balises autorisées: h2,h3,p,ul,ol,li,table,thead,tbody,tr,th,td,details,summary,strong,em,a.

Structure OBLIGATOIRE du HTML (H1 géré par le template, NE PAS inclure de H1):
- h2 « Résumé / Vue d’ensemble » (150–200 mots)
- h2 « Caractéristiques techniques du moteur ${marque} ${code} » (texte + tableau ou liste: architecture, cylindrée, puissance, couple, injection, techno, norme Euro, période)
- h2 « Modèles équipés du moteur ${code} » (liste modèles/générations/années) + phrase: compatibilité exacte à confirmer via VIN
- h2 « Problèmes courants du moteur ${code} » avec ≥4 h3 problèmes; sous chaque h3: paragraphes « Symptômes », « Causes », « Risques », « Solutions », « Prévention »
- h2 « Entretien et bonnes pratiques » (tableau ou liste: périodicités, contrôles, recommandations)
- h2 « Fiabilité » (avis global, cas problématiques, budget ordre de grandeur, conseils d’achat)
- h2 « Notre offre pour le moteur ${marque} ${code} » (tests, rapport, garantie 12 mois, délais, CTA textuel invitant à faire un devis)
- h2 « FAQ » (5 à 8 entrées) sous forme <details><summary>Question</summary><p>Réponse…</p></details> ou liste avec <strong>Question</strong> + <p>Réponse</p>
- h2 « Sources » (2–4 liens externes)

Contraintes de fond:
- Compatibilités: utiliser UNIQUEMENT data.compatibilities si présentes; sinon écrire « à confirmer via VIN » (ne pas extrapoler).
- Inclure 2–3 liens internes si fournis (${hubBrandUrl || '—'}, ${hubModelUrl || '—'}, ${engineUrl || '—'}).
- Mentionner l’offre CPF: ${cpf}. Ton expert, spécifique au moteur, pas de banalités, pas d’invention; si incertain: « à confirmer via VIN/documentation ».${extraHints}

Contexte (SERP+pages):
${sourcesCtx || '(aucune)'}

Données internes:
${JSON.stringify(data)}`;

    const models = Array.from(new Set([PRIMARY_MODEL, FALLBACK_MODEL].filter(Boolean)));
    try { console.log('[ai] sourcesLen=%d dataLen=%d', sourcesCtx.length || 0, JSON.stringify(data).length); } catch {}
    let j = null, lastTxt = '';
    for (const m of models) {
      const body = { model: m, temperature: TEMPERATURE, max_tokens: MAX_TOKENS, response_format: { type: 'json_object' }, messages: [ { role: 'system', content: sys }, { role: 'user', content: userPrompt } ] };
      let r;
      try {
        r = await fetch(`${API_BASE.replace(/\/$/, '')}/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` }, body: JSON.stringify(body) });
      } catch (e) { lastTxt = `network: ${e?.message || e}`; continue; }
      if (!r.ok) { const t = await r.text().catch(()=> ''); lastTxt = `${r.status} ${r.statusText} :: ${t}`; continue; }
      j = await r.json();
      break;
    }
    if (!j) {
      console.error('[ai] chat.completions failed', { models, details: (lastTxt || '').slice(0, 512) });
      return res.status(502).json({ ok: false, error: 'ai_failed', details: lastTxt.slice(0,512) });
    }
    const content = j?.choices?.[0]?.message?.content || '';
    let out;
    try {
      out = JSON.parse(content);
    } catch {
      try {
        const cleaned = String(content || '').replace(/```json|```/gi, '').trim();
        const first = cleaned.indexOf('{');
        const last = cleaned.lastIndexOf('}');
        if (first !== -1 && last !== -1 && last > first) {
          out = JSON.parse(cleaned.slice(first, last + 1));
        }
      } catch {}
    }
    if (!out || typeof out !== 'object') {
      console.error('[ai] parse_failed content preview:', String(content).slice(0, 280));
      return res.status(502).json({ ok: false, error: 'ai_parse_failed' });
    }
    const title = String(out?.title || `${marque} ${code} — guide`).trim();
    const summary = String(out?.summary || '').trim();
    const outTags = Array.isArray(out?.tags) ? out.tags.map((t)=>String(t).trim()).filter(Boolean) : tagsIn;
    // ...
    let finalHtml = String(out?.html || '').trim();
    if (!finalHtml) return res.status(502).json({ ok: false, error: 'ai_empty' });
    let wc = wordCountFromHtml(finalHtml);
    console.log('[ai] wc_initial=%d', wc);
    if (wc < 1200) {
      try {
        for (let pass = 0; pass < 3 && wc < 1200; pass++) {
          console.log('[ai] augment_pass=%d wc=%d', pass + 1, wc);
          const augmentUser = `Améliore et allonge l'article pour 1200–1800 mots en RESTANT 100% SÉMANTIQUE (aucun style, aucune classe, pas de <div>/<span>/<style>/<script>, pas d'images). Respecte la structure h2/h3 demandée, les tableaux thead/tbody, et les contraintes (compatibilités, liens internes, offre CPF). Réponds en JSON strict {"html":"..."}.

Contexte sources:
${sourcesCtx || '(aucune)'}

Données internes:
${JSON.stringify(data)}

Article actuel (HTML):
${finalHtml}`;
          let j2 = null, last2 = '';
          for (const m of models) {
            const body2 = { model: m, temperature: TEMPERATURE, max_tokens: MAX_TOKENS, messages: [ { role: 'system', content: sys }, { role: 'user', content: augmentUser } ] };
            let r2;
            try {
              r2 = await fetch(`${API_BASE.replace(/\/$/, '')}/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` }, body: JSON.stringify(body2) });
            } catch (e) { last2 = `network: ${e?.message || e}`; continue; }
            if (!r2.ok) { const t2 = await r2.text().catch(()=> ''); last2 = `${r2.status} ${r2.statusText} :: ${t2}`; continue; }
            j2 = await r2.json();
            break;
          }
          if (j2) {
            const c2 = j2?.choices?.[0]?.message?.content || '';
            try {
              let o2 = null;
              try { o2 = JSON.parse(c2); }
              catch {
                const cleaned2 = String(c2 || '').replace(/```json|```/gi, '').trim();
                const f2 = cleaned2.indexOf('{');
                const l2 = cleaned2.lastIndexOf('}');
                if (f2 !== -1 && l2 !== -1 && l2 > f2) o2 = JSON.parse(cleaned2.slice(f2, l2 + 1));
              }
              if (o2 && o2.html) {
                finalHtml = String(o2.html || '').trim();
                wc = wordCountFromHtml(finalHtml);
                console.log('[ai] wc_after_pass=%d', wc);
              }
            } catch {}
          } else {
            console.error('[ai] augment_failed', last2.slice(0, 280));
          }
        }
        // Force expand si encore trop court
        if (wc < 1200) {
          try {
            const forceUser = `Complète et développe l'article pour atteindre 1400–1700 mots en renforçant « Pannes spécifiques » et « FAQ ». Garde la même structure sémantique (aucun style/classe/<div>/<span>/<style>/<script>), ajoute du détail concret (symptômes → causes → risques → solutions). Réponds en JSON strict {"html":"..."}.

Rappels:${extraHints}

Article actuel (HTML):
${finalHtml}`;
            let jf = null, lastf = '';
            for (const m of models) {
              const bodyf = { model: m, temperature: TEMPERATURE, max_tokens: MAX_TOKENS, messages: [ { role: 'system', content: sys }, { role: 'user', content: forceUser } ] };
              let rf;
              try {
                rf = await fetch(`${API_BASE.replace(/\/$/, '')}/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` }, body: JSON.stringify(bodyf) });
              } catch (e) { lastf = `network: ${e?.message || e}`; continue; }
              if (!rf.ok) { const tf = await rf.text().catch(()=> ''); lastf = `${rf.status} ${rf.statusText} :: ${tf}`; continue; }
              jf = await rf.json();
              break;
            }
            if (jf) {
              const cf = jf?.choices?.[0]?.message?.content || '';
              try {
                let of = null;
                try { of = JSON.parse(cf); }
                catch {
                  const cleanedf = String(cf || '').replace(/```json|```/gi, '').trim();
                  const ff = cleanedf.indexOf('{');
                  const lf = cleanedf.lastIndexOf('}');
                  if (ff !== -1 && lf !== -1 && lf > ff) of = JSON.parse(cleanedf.slice(ff, lf + 1));
                }
                if (of && of.html) {
                  finalHtml = String(of.html || '').trim();
                  wc = wordCountFromHtml(finalHtml);
                  console.log('[ai] wc_after_force=%d', wc);
                }
              } catch {}
            } else {
              console.error('[ai] force_expand_failed', lastf.slice(0, 280));
            }
          } catch (e) { console.error('[ai] force_expand_error', e?.message || e); }
        }
      } catch (e) { console.error('[ai] augment_error', e?.message || e); }
    }

    // Réécriture stricte des compatibilités dans le HTML
    try { finalHtml = rewriteCompatSections(finalHtml, compatEff); } catch {}
    // Garanties obligatoires: FAQ et meta description 140–160
    try { finalHtml = ensureFaqSection(finalHtml); } catch {}
    const fixedSummary = ensureMetaSummaryLength(summary, finalHtml);
    // Contrôle qualité
    const qc = validateArticleHtml(finalHtml);

    const slugBase = title || `${marque} ${code}`;
    const slug = slugify(slugBase).slice(0, 200);
    const now = new Date().toISOString();
    const col = mongoDb.collection('blog_posts');
    const doc = { title, slug, summary: fixedSummary, contentHtml: finalHtml, image: '', tags: outTags, status: 'draft', noindex: true, publishedAt: null, createdAt: now, updatedAt: now, sources: [], quality: qc };
    const ins = await col.insertOne(doc);
    return res.status(201).json({ ok: true, id: String(ins.insertedId), slug, qc });
  } catch (err) {
    const msg = (err && (err.message || String(err))) ? String(err.message || err) : '';
    console.error('[blog] ai generate error:', msg);
    return res.status(500).json({ ok: false, error: 'ai_generate_failed', details: msg.slice(0, 300) });
  }
});

app.post('/api/admin/blog-posts/:id/improve', async (req, res) => {
  try {
    if (!MONGODB_URI) return res.status(503).json({ ok: false, error: 'mongo_not_configured' });
    const API_BASE = (process.env.AI_API_BASE || '').trim();
    const API_KEY = (process.env.AI_API_KEY || '').trim();
    const PRIMARY_MODEL = (process.env.AI_MODEL || 'gpt-4o-mini').trim();
    const FALLBACK_MODEL = (process.env.AI_MODEL_FALLBACK || 'gpt-4o').trim();
    const MAX_TOKENS = Number(process.env.AI_MAX_TOKENS || 3500);
    const TEMPERATURE = Number(process.env.AI_TEMPERATURE || 0.3);
    if (!API_BASE || !API_KEY || !PRIMARY_MODEL) return res.status(503).json({ ok: false, error: 'ai_not_configured' });

    await initMongo();
    await ensureBlogIndexes();
    const id = String(req.params.id || '').trim();
    let oid; try { oid = new ObjectId(id); } catch { return res.status(400).json({ ok: false, error: 'invalid_id' }); }
    const col = mongoDb.collection('blog_posts');
    const orig = await col.findOne({ _id: oid });
    if (!orig) return res.status(404).json({ ok: false, error: 'not_found' });

    const b = req.body || {};
    const marque = String(b.marque || '').trim();
    const code = String(b.code || '').trim();
    const cylindree = String(b.cylindree || '').trim();
    const carburant = String(b.carburant || '').trim();
    const tagsIn = Array.isArray(b.tags) ? b.tags.map((t) => String(t).trim()).filter(Boolean) : (Array.isArray(orig.tags) ? orig.tags : []);
    const manualCompat = Array.isArray(b.manualCompat) ? b.manualCompat.map((s)=>String(s).trim()).filter(Boolean) : [];

    let engineDoc = null;
    try {
      if (marque || code) {
        const ecol = mongoDb.collection('engine_pages');
        const filter = { status: 'published' };
        if (marque) filter.marque = { $regex: `^${marque}$`, $options: 'i' };
        if (code) filter.code = { $regex: `^${code}$`, $options: 'i' };
        engineDoc = await ecol.findOne(filter);
      }
    } catch {}
    // Persistance des compatibilités saisies manuellement (si doc trouvé)
    if (manualCompat.length && engineDoc && engineDoc._id) {
      try {
        const uniq = Array.from(new Set(manualCompat));
        await mongoDb.collection('engine_pages').updateOne({ _id: engineDoc._id }, { $set: { compatibilities: uniq, updatedAt: new Date().toISOString() } });
        engineDoc.compatibilities = uniq;
      } catch {}
    }

    const compatDb = Array.isArray(engineDoc?.compatibilities) ? engineDoc.compatibilities : [];
    const compatEff = manualCompat.length ? manualCompat : compatDb;
    const knownIssues = Array.isArray(engineDoc?.knownIssues) ? engineDoc.knownIssues : [];
    const faqs = Array.isArray(engineDoc?.faq) ? engineDoc.faq : [];

    const origin = getWebsiteOrigin();
    const brandSlug = engineDoc?.brandSlug || (marque ? slugify(marque) : '');
    const modelSlug = engineDoc?.modelSlug || '';
    const codeSlug = engineDoc?.codeSlug || (code ? slugify(code) : '');
    const hubBrandUrl = brandSlug ? `${origin}/moteurs/${encodeURIComponent(brandSlug)}` : '';
    const hubModelUrl = (brandSlug && modelSlug) ? `${origin}/moteur/${encodeURIComponent(brandSlug)}/${encodeURIComponent(modelSlug)}` : '';
    const engineUrl = (brandSlug && modelSlug && codeSlug) ? `${origin}/moteur/${encodeURIComponent(brandSlug)}/${encodeURIComponent(modelSlug)}/${encodeURIComponent(codeSlug)}` : '';
    const data = { marque, code, cylindree, carburant, compatibilities: compatEff, knownIssues, faq: faqs, links: { hubBrandUrl, hubModelUrl, engineUrl } };

    let sourcesCtx = '';
    try {
      const ragEnabled = (b.rag !== false) && Boolean(process.env.SERPAPI_KEY && process.env.FIRECRAWL_API_KEY);
      if (ragEnabled) {
        const serpKey = String(process.env.SERPAPI_KEY || '').trim();
        const fcKey = String(process.env.FIRECRAWL_API_KEY || '').trim();
        const wantSerp = Math.max(3, Math.min(5, Number(b.ragResults || 3)));
        const wantCrawl = Math.max(1, Math.min(2, Number(b.ragResults || 2)));
        const queries = Array.from(new Set([
          [marque, code, 'pannes connues'].filter(Boolean).join(' '),
          [marque, code, 'engine problems'].filter(Boolean).join(' '),
          [marque, code, 'compatibilités'].filter(Boolean).join(' '),
          [marque, code, 'caractéristiques techniques'].filter(Boolean).join(' '),
          [marque, 'cayenne', 'cylindres rayés scoring'].filter(Boolean).join(' '),
          [marque, code, 'cylindres rayés scoring'].filter(Boolean).join(' '),
          [marque, code, 'cylinder scoring'].filter(Boolean).join(' '),
          [marque, code, 'lokasil'].filter(Boolean).join(' '),
          [marque, code, 'tubes de refroidissement plastique'].filter(Boolean).join(' '),
          [marque, code, 'coolant pipe failure'].filter(Boolean).join(' ')
        ].filter(q => q.trim().length > 0)));
        const urlSet = new Set();
        const serpPicks = [];
        let serpCtx = '';
        for (const q of queries) {
          if (serpPicks.length >= wantSerp) break;
          const sUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(q)}&hl=fr&gl=fr&num=${wantSerp}&api_key=${encodeURIComponent(serpKey)}`;
          const sRes = await fetch(sUrl);
          const sJson = await sRes.json().catch(()=>({}));
          const organic = Array.isArray(sJson?.organic_results) ? sJson.organic_results : [];
          for (const r of organic) {
            const url = r?.link || '';
            if (!url || urlSet.has(url)) continue;
            urlSet.add(url);
            serpPicks.push({ url, title: r?.title || '', snippet: r?.snippet || '' });
            serpCtx += `- ${r?.title || url} — ${url}\n  Extrait: ${r?.snippet || ''}\n`;
            if (serpPicks.length >= wantSerp) break;
          }
        }
        const picks = serpPicks.slice(0, wantSerp);
        const chunks = [];
        for (const it of picks) {
          const key = `fc:${it.url}`;
          const cached = RAG_CACHE.get(key);
          if (cached && (Date.now() - cached.ts) < RAG_TTL_MS) { chunks.push({ url: it.url, title: it.title, md: cached.md }); if (chunks.length >= wantCrawl) break; continue; }
          try {
            const fcRes = await fetch('https://api.firecrawl.dev/v1/scrape', { method: 'POST', headers: { 'Authorization': `Bearer ${fcKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ url: it.url, formats: ['markdown'] }) });
            const fcJson = await fcRes.json().catch(()=>({}));
            const md = String(fcJson?.data?.markdown || '').trim();
            const mdClip = md ? md.slice(0, 2000) : '';
            if (mdClip) { chunks.push({ url: it.url, title: it.title, md: mdClip }); RAG_CACHE.set(key, { ts: Date.now(), md: mdClip }); }
          } catch {}
          if (chunks.length >= wantCrawl) break;
        }
        if (chunks.length) {
          const crawled = chunks.map((c, i) => `[C${i+1}] ${c.title || c.url} — ${c.url}\n${c.md}`).join('\n\n');
          sourcesCtx = `SERP:\n${serpCtx}\n\nPAGES:\n${crawled}`;
        }
      }
    } catch {}

    const sys = 'Tu es un rédacteur technique auto expert (FR). Tu écris un article SEO utile, clair, sans remplissage. Aucune donnée inventée.';
    const cpf = 'Tests compression/endoscopie/pression d\'huile, rapport de test, garantie 1 an, expédition ~4 jours.';
    const brandHints = [];
    try {
      if ((marque && /porsche/i.test(marque)) || /cayenne/i.test(`${marque} ${code}`) || /m48/i.test(code)) {
        brandHints.push('- Inclure un H3 "Cylindres rayés (scoring)" : symptômes (claquement à froid, ratés), causes possibles (alésage/Lokasil, lubrification, segments), risques, diagnostic (endoscopie, tests compression), solutions (échange standard, réalésage), prévention.');
        brandHints.push('- Mentionner les pannes connues: tubes de refroidissement plastiques (remplacement/kit alu), pompe à eau, bobines d\'allumage, consommation d\'huile.');
      }
    } catch {}
    const extraHints = brandHints.length ? `\n\nPoints critiques à traiter:\n${brandHints.join('\n')}\n` : '';

    const baseHtml = String(orig.contentHtml || '').trim();
    if (!baseHtml) return res.status(400).json({ ok: false, error: 'empty_doc' });
    const userPrompt = `Réponds en JSON strict {"summary":"...","tags":["..."],"html":"..."}. Réécris et améliore l'article pour 1200–1800 mots en HTML SÉMANTIQUE UNIQUEMENT (aucun style, aucune classe, aucun <script>, aucune balise <style>, pas de <div> ni <span>, pas d'images). Balises autorisées: h2,h3,p,ul,ol,li,table,thead,tbody,tr,th,td,details,summary,strong,em,a.

Structure OBLIGATOIRE du HTML (H1 géré par le template, NE PAS inclure de H1):
- h2 « Résumé / Vue d’ensemble » (150–200 mots)
- h2 « Caractéristiques techniques du moteur ${marque} ${code} » (texte + tableau ou liste: architecture, cylindrée, puissance, couple, injection, techno, norme Euro, période)
- h2 « Modèles équipés du moteur ${code} » (liste modèles/générations/années) + phrase: compatibilité exacte à confirmer via VIN
- h2 « Problèmes courants du moteur ${code} » avec ≥4 h3 problèmes; sous chaque h3: paragraphes « Symptômes », « Causes », « Risques », « Solutions », « Prévention »
- h2 « Entretien et bonnes pratiques » (tableau ou liste: périodicités, contrôles, recommandations)
- h2 « Fiabilité » (avis global, cas problématiques, budget ordre de grandeur, conseils d’achat)
- h2 « Notre offre pour le moteur ${marque} ${code} » (tests, rapport, garantie 12 mois, délais, CTA textuel invitant à faire un devis)
- h2 « FAQ » (5 à 8 entrées) sous forme <details><summary>Question</summary><p>Réponse…</p></details> ou liste avec <strong>Question</strong> + <p>Réponse</p>
- h2 « Sources » (2–4 liens externes)

Contraintes de fond:
- Compatibilités: utiliser UNIQUEMENT data.compatibilities si présentes; sinon écrire « à confirmer via VIN » (ne pas extrapoler).
- Inclure 2–3 liens internes (${hubBrandUrl || '—'}, ${hubModelUrl || '—'}, ${engineUrl || '—'}).
- Offre CPF: ${cpf}. Ton expert, spécifique au moteur, pas de banalités, pas d’invention; si incertain: « à confirmer via VIN/documentation ».${extraHints}

Contexte (SERP+pages):
${sourcesCtx || '(aucune)'}

Données internes:
${JSON.stringify(data)}

Article actuel (HTML):
${baseHtml}`;

    const models = Array.from(new Set([PRIMARY_MODEL, FALLBACK_MODEL].filter(Boolean)));
    let j = null, lastTxt = '';
    for (const m of models) {
      const body = { model: m, temperature: TEMPERATURE, max_tokens: MAX_TOKENS, response_format: { type: 'json_object' }, messages: [ { role: 'system', content: sys }, { role: 'user', content: userPrompt } ] };
      const r = await fetch(`${API_BASE.replace(/\/$/, '')}/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` }, body: JSON.stringify(body) });
      if (!r.ok) { lastTxt = await r.text().catch(()=> ''); continue; }
      j = await r.json();
      break;
    }
    if (!j) return res.status(502).json({ ok: false, error: 'ai_failed', details: String(lastTxt || '').slice(0, 500) });

    const content = j?.choices?.[0]?.message?.content || '';
    let out;
    try { out = JSON.parse(content); }
    catch {
      try {
        const cleaned = String(content || '').replace(/```json|```/gi, '').trim();
        const first = cleaned.indexOf('{');
        const last = cleaned.lastIndexOf('}');
        if (first !== -1 && last !== -1 && last > first) out = JSON.parse(cleaned.slice(first, last + 1));
      } catch {}
    }
    if (!out || typeof out !== 'object') return res.status(502).json({ ok: false, error: 'ai_parse_failed' });
    let finalHtml = String(out?.html || '').trim();
    let newSummary = String(out?.summary || orig.summary || '').trim();
    let newTags = Array.isArray(out?.tags) ? out.tags.map((t)=>String(t).trim()).filter(Boolean) : tagsIn;
    if (!finalHtml) return res.status(502).json({ ok: false, error: 'ai_empty' });

    let wc = wordCountFromHtml(finalHtml);
    for (let pass = 0; pass < 3 && wc < 1200; pass++) {
      const augmentUser = `Complète l'article pour atteindre 1200 à 1800 mots avec plus de détails concrets. Réponds en JSON strict {\"html\":\"...\"}.\n\nRappels:${extraHints}\n\nArticle actuel (HTML):\n${finalHtml}`;
      let j2 = null; let last2 = '';
      for (const m of models) {
        const body2 = { model: m, temperature: TEMPERATURE, max_tokens: MAX_TOKENS, response_format: { type: 'json_object' }, messages: [ { role: 'system', content: sys }, { role: 'user', content: augmentUser } ] };
        const r2 = await fetch(`${API_BASE.replace(/\/$/, '')}/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` }, body: JSON.stringify(body2) });
        if (!r2.ok) { last2 = await r2.text().catch(()=> ''); continue; }
        j2 = await r2.json();
        break;
      }
      if (j2) {
        const c2 = j2?.choices?.[0]?.message?.content || '';
        try {
          let o2 = null;
          try { o2 = JSON.parse(c2); }
          catch {
            const cleaned2 = String(c2 || '').replace(/```json|```/gi, '').trim();
            const f2 = cleaned2.indexOf('{');
            const l2 = cleaned2.lastIndexOf('}');
            if (f2 !== -1 && l2 !== -1 && l2 > f2) o2 = JSON.parse(cleaned2.slice(f2, l2 + 1));
          }
          if (o2 && o2.html) {
            finalHtml = String(o2.html || '').trim();
            wc = wordCountFromHtml(finalHtml);
          }
        } catch {}
      }
    }

    if (brandHints.length && !/cylindres\s*ray[ée]s|cylinder\s*scoring/i.test(finalHtml || '')) {
      const scoringUser = `Ajoute une section H3 "Cylindres rayés (scoring)" avec symptômes, causes (Lokasil), diagnostic (endoscopie + compression), risques, solutions et prévention. Réponds en JSON strict {\"html\":\"...\"}.\n\nArticle actuel (HTML):\n${finalHtml}`;
      let js = null; let lasts = '';
      for (const m of models) {
        const bodys = { model: m, temperature: Math.min(TEMPERATURE, 0.15), max_tokens: MAX_TOKENS, response_format: { type: 'json_object' }, messages: [ { role: 'system', content: sys }, { role: 'user', content: scoringUser } ] };
        const rs2 = await fetch(`${API_BASE.replace(/\/$/, '')}/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` }, body: JSON.stringify(bodys) });
        if (!rs2.ok) { lasts = await rs2.text().catch(()=> ''); continue; }
        js = await rs2.json();
        break;
      }
      if (js) {
        const cs = js?.choices?.[0]?.message?.content || '';
        try {
          let os = null;
          try { os = JSON.parse(cs); }
          catch {
            const cleaneds = String(cs || '').replace(/```json|```/gi, '').trim();
            const fs = cleaneds.indexOf('{');
            const ls = cleaneds.lastIndexOf('}');
            if (fs !== -1 && ls !== -1 && ls > fs) os = JSON.parse(cleaneds.slice(fs, ls + 1));
          }
          if (os && os.html) {
            finalHtml = String(os.html || '').trim();
            wc = wordCountFromHtml(finalHtml);
          }
        } catch {}
      }
    }

    // Réécriture stricte des compatibilités dans le HTML
    try { finalHtml = rewriteCompatSections(finalHtml, compatEff); } catch {}
    // Garanties obligatoires: FAQ et meta description 140–160
    try { finalHtml = ensureFaqSection(finalHtml); } catch {}
    const fixedSummary2 = ensureMetaSummaryLength(newSummary, finalHtml);
    // Contrôle qualité et noindex protecteur
    const qc = validateArticleHtml(finalHtml);
    const set = { contentHtml: finalHtml, summary: fixedSummary2, tags: newTags, updatedAt: new Date().toISOString(), quality: qc };
    if (orig.status === 'published' && !qc.pass) set.noindex = true;
    await col.updateOne({ _id: oid }, { $set: set });
    return res.json({ ok: true, qc });
  } catch (err) {
    const msg = (err && (err.message || String(err))) ? String(err.message || err) : '';
    console.error('[blog] ai improve error:', msg);
    return res.status(500).json({ ok: false, error: 'ai_improve_failed', details: msg.slice(0, 300) });
  }
});

function csvParseLine(line) {
  const out = [];
  let cur = '', inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (i + 1 < line.length && line[i + 1] === '"') { cur += '"'; i++; }
      else { inQuotes = false; }
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
    await ensureEngineIndexes();
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

// Vérifs SEO publiques (compteurs + GSC + prévision sitemap index)
app.get('/api/public/seo-check', async (req, res) => {
  try {
    const origin = getWebsiteOrigin();
    const hasGsc = Boolean(process.env.GOOGLE_SITE_VERIFICATION);
    let engines = 0, posts = 0, brands = 0, modelPairs = 0;
    if (MONGODB_URI) {
      await initMongo();
      const ecol = mongoDb.collection('engine_pages');
      engines = await ecol.countDocuments({ status: 'published', noindex: { $ne: true } });
      try {
        const distinctBrands = await ecol.distinct('marque', { status: 'published', noindex: { $ne: true } });
        brands = Array.isArray(distinctBrands) ? distinctBrands.filter(Boolean).length : 0;
      } catch {}
      try {
        const agg = [
          { $match: { status: 'published', noindex: { $ne: true }, brandSlug: { $exists: true, $ne: '' }, modelSlug: { $exists: true, $ne: '' } } },
          { $group: { _id: { b: '$brandSlug', m: '$modelSlug' }, c: { $sum: 1 } } },
          { $count: 'pairs' }
        ];
        const arr = await ecol.aggregate(agg).toArray();
        modelPairs = (arr && arr[0] && arr[0].pairs) ? Number(arr[0].pairs) : 0;
      } catch {}
      const bcol = mongoDb.collection('blog_posts');
      posts = await bcol.countDocuments({ status: 'published', noindex: { $ne: true } });
    }
    const staticCount = 7; // pages statiques déclarées
    const sitemapTotal = staticCount + engines + Math.min(20, brands) + Math.min(100, modelPairs) + posts;
    const sitemapIndex = sitemapTotal > 5000;
    res.json({ ok: true, websiteOrigin: origin, hasGsc, counts: { static: staticCount, engines, brands, modelPairs, posts, sitemapTotal }, sitemapIndex });
  } catch (e) {
    console.error('[seo-check] error', e);
    res.status(500).json({ ok: false });
  }
});

if (!process.env.VERCEL) {
  app.get('/api/public/status', (req, res) => {
    try {
      res.json({
        ok: true,
        service: 'backend',
        version: process.env.APP_VERSION || 'dev',
        time: new Date().toISOString(),
        mongoConfigured: Boolean(MONGODB_URI),
      });
    } catch (e) {
      res.status(500).json({ ok: false });
    }
  });

  app.get('/api/public/_debug-auth', (req, res) => {
    try {
      const t = String(process.env.BACKEND_TOKEN || '');
      const auth = String(req.headers['authorization'] || '');
      const apik = String(req.headers['x-api-key'] || '');
      const host = String(req.headers['host'] || '');
      const isLocalHost = /^localhost(:\d+)?$|^127\.0\.0\.1(:\d+)?$/i.test(host);
      const mask = (s) => s ? (s.length <= 6 ? s : (s.slice(0,3) + '...' + s.slice(-3))) : '';
      res.json({ ok: true, tokenLen: t.length, tokenMasked: mask(t), authMasked: mask(auth), xApiKeyMasked: mask(apik), host, isLocalHost });
    } catch (e) {
      res.status(500).json({ ok: false });
    }
  });

  app.listen(PORT, () => {
    console.log(`[server] MailerSend server listening on :${PORT}`);
  });
}

export default app;

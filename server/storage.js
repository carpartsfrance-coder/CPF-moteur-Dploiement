// Simple JSON storage for inbound replies
// ESM module
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const FILE = path.join(DATA_DIR, 'replies.json');
const ENGINE_REPORTS_KEY = '__engineReports';

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify({}), 'utf8');
}

export function readAll() {
  ensureStore();
  try {
    const raw = fs.readFileSync(FILE, 'utf8');
    return JSON.parse(raw || '{}');
  } catch {
    return {};
  }
}

export function writeAll(obj) {
  ensureStore();
  fs.writeFileSync(FILE, JSON.stringify(obj, null, 2), 'utf8');
}

export function addReply(quoteId, reply) {
  const all = readAll();
  if (!all[quoteId]) all[quoteId] = [];
  all[quoteId].push(reply);
  writeAll(all);
  return all[quoteId];
}

export function getReplies(quoteId) {
  const all = readAll();
  return all[quoteId] || [];
}

// --- Quote meta management (stored under top-level key __meta) ---
export function setQuoteMeta(quoteId, meta) {
  const all = readAll();
  if (!all.__meta) all.__meta = {};
  all.__meta[quoteId] = { ...(all.__meta[quoteId] || {}), ...meta };
  writeAll(all);
  return all.__meta[quoteId];
}

export function getQuoteMeta(quoteId) {
  const all = readAll();
  return (all.__meta && all.__meta[quoteId]) ? all.__meta[quoteId] : null;
}

export function listQuoteMetas() {
  const all = readAll();
  const metas = all.__meta || {};
  const arr = Object.entries(metas).map(([id, meta]) => ({ id, ...(meta || {}) }));
  arr.sort((a, b) => {
    const da = new Date(a.createdAt || a.deliveredAt || 0).getTime();
    const db = new Date(b.createdAt || b.deliveredAt || 0).getTime();
    return db - da;
  });
  return arr;
}

export function deleteQuoteMeta(quoteId) {
  const all = readAll();
  if (all.__meta && all.__meta[quoteId]) {
    delete all.__meta[quoteId];
    writeAll(all);
  }
}

export function saveEngineReport(report) {
  const all = readAll();
  if (!all[ENGINE_REPORTS_KEY]) all[ENGINE_REPORTS_KEY] = {};
  const col = all[ENGINE_REPORTS_KEY];
  const id = String(report && report.id ? report.id : '').trim();
  if (!id) {
    throw new Error('engine report id required');
  }
  col[id] = { ...(col[id] || {}), ...report };
  writeAll(all);
  return col[id];
}

export function getEngineReport(id) {
  const all = readAll();
  const col = all[ENGINE_REPORTS_KEY] || {};
  const key = String(id || '').trim();
  if (!key) return null;
  return col[key] || null;
}

export function findEngineReportByQuoteId(quoteId) {
  const all = readAll();
  const col = all[ENGINE_REPORTS_KEY] || {};
  const qid = String(quoteId || '').trim();
  if (!qid) return null;
  const values = Object.values(col || {}).filter((r) => r && r.quoteId === qid);
  if (!values.length) return null;
  values.sort((a, b) => {
    const da = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const db = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return db - da;
  });
  return values[0];
}

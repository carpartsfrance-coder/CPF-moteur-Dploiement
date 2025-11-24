import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB = process.env.MONGODB_DB || 'carparts';

if (!MONGODB_URI) {
  console.error('[import] MONGODB_URI manquant dans .env du dossier server/');
  process.exit(1);
}

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}

function parseArgs() {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.error('Usage: node scripts/importEngineCodes.js <fichier.csv|json> [--published]');
    process.exit(1);
  }
  const file = path.resolve(process.cwd(), args[0]);
  const published = args.includes('--published');
  return { file, published };
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (!lines.length) return [];
  const header = csvParseLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = csvParseLine(lines[i]);
    if (!cols.length) continue;
    const obj = {};
    for (let j = 0; j < header.length; j++) {
      obj[header[j].trim()] = (cols[j] || '').trim();
    }
    rows.push(obj);
  }
  return rows;
}

function csvParseLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        // double quote escape
        if (i + 1 < line.length && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === ',') {
        out.push(cur);
        cur = '';
      } else if (ch === '"') {
        inQuotes = true;
      } else {
        cur += ch;
      }
    }
  }
  out.push(cur);
  return out;
}

function buildHtml({ code, marque, cylindree, carburant, annees }) {
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

function buildFaq({ code, marque }) {
  return [
    { q: `Ce moteur ${code} est-il compatible avec mon véhicule ?`, a: `La compatibilité dépend des variantes. Indiquez-nous votre immatriculation, VIN ou code moteur exact pour vérifier.` },
    { q: `Le moteur ${code} ${marque} est-il garanti ?`, a: `Oui, chaque moteur testé est couvert par une garantie. Nous fournissons un rapport de test.` },
    { q: 'Quel est le délai de livraison ?', a: 'Sous quelques jours ouvrés selon la disponibilité et la destination. Nous confirmons le délai dans votre devis.' },
    { q: 'Proposez-vous le montage ?', a: 'Oui, via des partenaires installateurs. Demandez-nous une mise en relation lors de votre devis.' },
  ];
}

async function main() {
  const { file, published } = parseArgs();
  if (!fs.existsSync(file)) {
    console.error('[import] Fichier introuvable:', file);
    process.exit(1);
  }
  const ext = path.extname(file).toLowerCase();
  let rows = [];
  if (ext === '.json') {
    rows = JSON.parse(fs.readFileSync(file, 'utf8'));
  } else {
    rows = parseCSV(fs.readFileSync(file, 'utf8'));
  }
  // normaliser clés attendues
  const data = rows.map((r) => ({
    code: String(r.code || r.CODE || '').trim(),
    marque: String(r.marque || r.MARQUE || '').trim(),
    cylindree: String(r.cylindree || r.CYLINDREE || r.cylindre || r.CYLINDRE || '').trim(),
    carburant: String(r.carburant || r.CARBURANT || '').trim(),
    annees: String(r.annees || r.ANNEES || r.annee || r.ANNEE || '').trim(),
  })).filter((r) => r.code && r.marque);

  console.log(`[import] ${data.length} lignes à traiter…`);
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);
  const col = db.collection('engine_pages');
  try {
    await col.createIndex({ slug: 1 }, { unique: true });
    await col.createIndex({ code: 1, marque: 1 });
  } catch {}

  const now = new Date().toISOString();
  const ops = [];
  for (const r of data) {
    const slug = slugify(`${r.code} ${r.marque} ${r.cylindree}`);
    const title = `Moteur ${r.code} — ${r.marque} ${r.cylindree || ''}`.trim();
    const seoTitle = `Moteur ${r.code} ${r.marque} ${r.cylindree || ''} | Testé + Garantie | Devis 24h`;
    const seoDescription = `Moteur ${r.code} (${r.marque} ${r.cylindree || ''}) testé et garanti. Livraison rapide. Demandez un devis en 2 minutes.`;
    const contentHtml = buildHtml(r);
    const faq = buildFaq(r);
    const status = published ? 'published' : 'draft';

    ops.push({
      updateOne: {
        filter: { slug },
        update: {
          $setOnInsert: { createdAt: now, slug },
          $set: { code: r.code, marque: r.marque, cylindree: r.cylindree, carburant: r.carburant, annees: r.annees, title, seoTitle, seoDescription, contentHtml, faq, status, updatedAt: now },
        },
        upsert: true,
      }
    });
  }

  const chunkSize = 1000;
  let written = 0;
  for (let i = 0; i < ops.length; i += chunkSize) {
    const chunk = ops.slice(i, i + chunkSize);
    const res = await col.bulkWrite(chunk, { ordered: false });
    written += (res?.upsertedCount || 0) + (res?.modifiedCount || 0) + 0;
    console.log(`[import] Traitement ${Math.min(i + chunk.length, ops.length)}/${ops.length}`);
  }

  await client.close();
  console.log(`[import] Terminé. Upserts/updates: ${written}.`);
}

main().catch((e) => {
  console.error('[import] Erreur:', e);
  process.exit(1);
});

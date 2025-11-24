import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Charge d'abord server/.env puis fallback vers racine
try { dotenv.config({ path: path.join(__dirname, '..', '.env'), override: true }); } catch {}
try { dotenv.config({ path: path.join(__dirname, '..', '..', '.env'), override: true }); } catch {}

// URIs et DB
const LOCAL_URI = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017';
const TARGET_URI = process.env.TARGET_MONGODB_URI || process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || 'carparts';

if (!TARGET_URI) {
  console.error('[migrate] TARGET (MONGODB_URI) manquant. Renseigne MONGODB_URI dans .env');
  process.exit(1);
}

async function main() {
  const srcClient = new MongoClient(LOCAL_URI);
  const dstClient = new MongoClient(TARGET_URI);
  try {
    console.log('[migrate] Connexion source (local):', LOCAL_URI);
    await srcClient.connect();
    console.log('[migrate] Connexion cible (Atlas):', TARGET_URI.replace(/(:)([^:@\/]{3,})(@)/, '$1***$3'));
    await dstClient.connect();

    const srcDb = srcClient.db(DB_NAME);
    const dstDb = dstClient.db(DB_NAME);
    const srcCol = srcDb.collection('blog_posts');
    const dstCol = dstDb.collection('blog_posts');

    const total = await srcCol.countDocuments();
    console.log(`[migrate] Documents source à traiter: ${total}`);

    const cursor = srcCol.find({}, { sort: { updatedAt: -1 } });
    let ok = 0, skipped = 0, failed = 0;
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const { _id, ...rest } = doc;
      const slug = String(rest.slug || '').trim();
      if (!slug) { skipped++; continue; }
      try {
        // Normalise dates
        const nowIso = new Date().toISOString();
        const setData = { ...rest };
        // Ne pas définir createdAt dans $set pour éviter le conflit avec $setOnInsert
        delete setData.createdAt;
        setData.updatedAt = setData.updatedAt || nowIso;

        const onInsert = { createdAt: (rest.createdAt || nowIso) };

        // Upsert par slug
        await dstCol.updateOne(
          { slug },
          { $set: setData, $setOnInsert: onInsert },
          { upsert: true }
        );
        ok++;
      } catch (e) {
        failed++;
        console.error('[migrate] échec slug=%s -> %s', slug, e?.message || e);
      }
    }

    console.log(`[migrate] Terminé. ok=${ok}, skipped=${skipped}, failed=${failed}`);
  } finally {
    await srcClient.close().catch(()=>{});
    await dstClient.close().catch(()=>{});
  }
}

main().catch((e) => { console.error('[migrate] fatal', e); process.exit(1); });

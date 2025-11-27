#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { MongoClient, GridFSBucket } from 'mongodb';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isImage(p) {
  const ext = path.extname(p).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
}
function contentTypeOf(p) {
  const ext = path.extname(p).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
}
async function walk(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    let entries = [];
    try {
      entries = await fs.promises.readdir(d, { withFileTypes: true });
    } catch (e) {
      continue;
    }
    for (const ent of entries) {
      const full = path.join(d, ent.name);
      if (ent.isDirectory()) stack.push(full);
      else if (ent.isFile() && isImage(full)) out.push(full);
    }
  }
  return out;
}

async function main() {
  const uri = process.env.MONGODB_URI || '';
  const dbName = process.env.MONGODB_DB || '';
  const dir = process.env.GALLERY_DIR_UPLOAD || process.argv[2] || '';
  if (!uri || !dbName) {
    console.error('Erreur: définir MONGODB_URI et MONGODB_DB dans l\'environnement.');
    process.exit(1);
  }
  if (!dir) {
    console.error('Usage: GALLERY_DIR_UPLOAD="/chemin/vers/dossier" node scripts/upload-gallery.mjs');
    process.exit(1);
  }
  const stat = await fs.promises.stat(dir).catch(() => null);
  if (!stat || !stat.isDirectory()) {
    console.error('Erreur: le dossier source est introuvable:', dir);
    process.exit(1);
  }

  console.log('Connexion MongoDB...');
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const bucket = new GridFSBucket(db, { bucketName: 'gallery' });

  const files = await walk(dir);
  if (!files.length) {
    console.log('Aucune image à uploader.');
    await client.close();
    return;
  }

  console.log(`Images détectées: ${files.length}`);
  let ok = 0, fail = 0;
  for (const f of files) {
    const name = path.basename(f);
    const contentType = contentTypeOf(f);
    try {
      await new Promise((resolve, reject) => {
        const rs = fs.createReadStream(f);
        const up = bucket.openUploadStream(name, { contentType, metadata: { contentType } });
        rs.on('error', reject);
        up.on('error', reject);
        up.on('finish', resolve);
        rs.pipe(up);
      });
      ok++;
      if (ok % 10 === 0) console.log(`Progression: ${ok}/${files.length}`);
      await sleep(50);
    } catch (e) {
      fail++;
      console.error('Echec upload:', name, e?.message || e);
    }
  }

  console.log(`Terminé. Réussis: ${ok}, échecs: ${fail}`);
  await client.close();
}

main().catch((e) => {
  console.error('Erreur fatale:', e?.message || e);
  process.exit(1);
});

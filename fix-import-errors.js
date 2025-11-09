const fs = require('fs');
const path = require('path');

// Liste des fichiers à corriger
const filesToFix = [
  'src/components/layout/Footer.tsx',
  'src/components/sections/AdvantagesSection.tsx',
  'src/components/sections/ProblemSection.tsx',
  'src/components/sections/ProcessStepsSection.tsx',
  'src/components/sections/QuoteFormSection.tsx'
];

// Fonction pour corriger un fichier
function fixImportErrors(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`Le fichier ${fullPath} n'existe pas.`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Corriger les virgules en trop dans les imports
  content = content.replace(/import\s+\{([^}]*?),\s*,\s*([^}]*?)\}\s+from/g, (match, before, after) => {
    return `import { ${before}, ${after} } from`;
  });
  
  // Corriger les accolades manquantes dans les propriétés sx
  content = content.replace(/sx=\{\s*([^{}]+?):\s*/g, (match, prop) => {
    return `sx={{ ${prop}: `;
  });
  
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Fichier corrigé: ${filePath}`);
}

// Corriger tous les fichiers
filesToFix.forEach(fixImportErrors);

console.log('Tous les fichiers ont été corrigés avec succès!');

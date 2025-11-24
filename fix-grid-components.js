const fs = require('fs');
const path = require('path');

// Liste des fichiers à corriger
const filesToFix = [
  'src/components/layout/Footer.tsx',
  'src/components/sections/AdvantagesSection.tsx',
  'src/components/sections/ProblemSection.tsx',
  'src/components/sections/ProcessStepsSection.tsx',
  'src/components/sections/QuoteFormSection.tsx',
  'src/components/sections/SolutionSection.tsx',
  'src/components/sections/TestimonialSection.tsx',
  'src/components/sections/TestProcessSection.tsx',
  'src/pages/ContactPage.tsx'
];

// Fonction pour corriger un fichier
function fixGridComponents(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`Le fichier ${fullPath} n'existe pas.`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Remplacer les Grid item par Grid
  content = content.replace(/<Grid\s+item(\s+[^>]+)>/g, '<Grid$1>');
  
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Fichier corrigé: ${filePath}`);
}

// Corriger tous les fichiers
filesToFix.forEach(fixGridComponents);

console.log('Tous les fichiers ont été corrigés avec succès!');

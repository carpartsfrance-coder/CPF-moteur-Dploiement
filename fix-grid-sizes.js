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
function fixGridSizes(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`Le fichier ${fullPath} n'existe pas.`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Remplacer les attributs de taille Grid xs, sm, md, lg par sx={{ gridSize: { xs: n, sm: n, md: n, lg: n } }}
  content = content.replace(/<Grid\s+([^>]*?)xs=\{(\d+)\}([^>]*?)>/g, (match, before, xsValue, after) => {
    // Extraire les autres tailles si elles existent
    const smMatch = after.match(/sm=\{(\d+)\}/);
    const mdMatch = after.match(/md=\{(\d+)\}/);
    const lgMatch = after.match(/lg=\{(\d+)\}/);
    
    // Supprimer les attributs de taille du 'after'
    let cleanAfter = after.replace(/\s*sm=\{\d+\}/g, '')
                         .replace(/\s*md=\{\d+\}/g, '')
                         .replace(/\s*lg=\{\d+\}/g, '');
    
    // Construire l'objet gridSize
    let gridSizeObj = `{ xs: ${xsValue}`;
    if (smMatch) gridSizeObj += `, sm: ${smMatch[1]}`;
    if (mdMatch) gridSizeObj += `, md: ${mdMatch[1]}`;
    if (lgMatch) gridSizeObj += `, lg: ${lgMatch[1]}`;
    gridSizeObj += ' }';
    
    // Vérifier si sx existe déjà
    if (before.includes('sx=') || cleanAfter.includes('sx=')) {
      // Remplacer sx existant ou ajouter gridSize à sx existant
      content = content.replace(/sx=\{([^}]+)\}/g, (match, sxContent) => {
        return `sx={{ ${sxContent}, gridSize: ${gridSizeObj} }}`;
      });
      return `<Grid ${before}${cleanAfter}>`;
    } else {
      // Ajouter un nouvel attribut sx
      return `<Grid ${before}sx={{ gridSize: ${gridSizeObj} }}${cleanAfter}>`;
    }
  });
  
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Fichier corrigé: ${filePath}`);
}

// Corriger tous les fichiers
filesToFix.forEach(fixGridSizes);

console.log('Tous les fichiers ont été corrigés avec succès!');

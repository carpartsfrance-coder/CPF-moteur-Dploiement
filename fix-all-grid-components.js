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
  'src/components/sections/TestProcessSection.tsx'
];

// Fonction pour corriger un fichier
function fixGridComponents(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`Le fichier ${fullPath} n'existe pas.`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // 1. Supprimer l'import Grid s'il existe
  content = content.replace(/import\s+\{([^}]*?)Grid([^}]*?)\}\s+from\s+['"]@mui\/material['"];/g, (match, before, after) => {
    return `import {${before}${after}} from '@mui/material';`;
  });
  
  // 2. Remplacer les Grid container par des Box avec flexbox
  content = content.replace(/<Grid\s+container([^>]*)>/g, (match, attrs) => {
    // Extraire les attributs spacing et alignItems s'ils existent
    const spacingMatch = attrs.match(/spacing=\{(\d+)\}/);
    const alignItemsMatch = attrs.match(/alignItems=["']([^"']+)["']/);
    const justifyContentMatch = attrs.match(/justifyContent=["']([^"']+)["']/);
    
    let boxStyles = '{ display: \'flex\', flexWrap: \'wrap\'';
    
    if (spacingMatch) {
      const spacing = parseInt(spacingMatch[1]);
      boxStyles += `, gap: ${spacing}`;
    }
    
    if (alignItemsMatch) {
      boxStyles += `, alignItems: '${alignItemsMatch[1]}'`;
    }
    
    if (justifyContentMatch) {
      boxStyles += `, justifyContent: '${justifyContentMatch[1]}'`;
    }
    
    boxStyles += ', flexDirection: { xs: \'column\', md: \'row\' } }';
    
    return `<Box sx=${boxStyles}>`;
  });
  
  // 3. Remplacer les Grid item par des Box avec flex
  content = content.replace(/<Grid\s+([^>]*?)xs=\{(\d+)\}([^>]*?)>/g, (match, before, xsValue, after) => {
    // Extraire les autres tailles si elles existent
    const smMatch = after.match(/sm=\{(\d+)\}/);
    const mdMatch = after.match(/md=\{(\d+)\}/);
    const lgMatch = after.match(/lg=\{(\d+)\}/);
    
    let flexStyles = '{ flex: { xs: \'1 1 100%\'';
    
    if (smMatch) {
      const smPercent = (parseInt(smMatch[1]) / 12) * 100;
      flexStyles += `, sm: '1 1 ${smPercent}%'`;
    }
    
    if (mdMatch) {
      const mdPercent = (parseInt(mdMatch[1]) / 12) * 100;
      flexStyles += `, md: '1 1 ${mdPercent}%'`;
    }
    
    if (lgMatch) {
      const lgPercent = (parseInt(lgMatch[1]) / 12) * 100;
      flexStyles += `, lg: '1 1 ${lgPercent}%'`;
    }
    
    flexStyles += ' } }';
    
    // Conserver les autres attributs comme key
    const keyMatch = before.match(/key=\{([^}]+)\}/);
    const keyAttr = keyMatch ? ` key={${keyMatch[1]}}` : '';
    
    return `<Box sx=${flexStyles}${keyAttr}>`;
  });
  
  // 4. Remplacer les balises fermantes </Grid> par </Box>
  content = content.replace(/<\/Grid>/g, '</Box>');
  
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Fichier corrigé: ${filePath}`);
}

// Corriger tous les fichiers
filesToFix.forEach(fixGridComponents);

console.log('Tous les fichiers ont été corrigés avec succès!');

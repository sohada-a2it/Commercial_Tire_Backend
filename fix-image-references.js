import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Updating image references from PNG/JPG to WebP...\n');

// Read categories.json
const categoriesPath = path.join(__dirname, 'public', 'categories.json');
let categoriesContent = fs.readFileSync(categoriesPath, 'utf-8');

// Count replacements
let replacementCount = 0;

// Replace all .png, .jpg, .jpeg with .webp
const updatedContent = categoriesContent.replace(/\.(png|jpg|jpeg)(["'\)])/gi, (match, ext, suffix) => {
  replacementCount++;
  return `.webp${suffix}`;
});

// Write back to file
fs.writeFileSync(categoriesPath, updatedContent, 'utf-8');

console.log(`✅ Updated ${replacementCount} image references in categories.json`);
console.log('   All PNG/JPG/JPEG references changed to WebP\n');

// Also check and update any other JSON files with image references
const publicDir = path.join(__dirname, 'public');
const otherJsonFiles = ['popup.json'];

otherJsonFiles.forEach(file => {
  const filePath = path.join(publicDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let count = 0;
    
    const updated = content.replace(/\.(png|jpg|jpeg)(["'\)])/gi, (match, ext, suffix) => {
      count++;
      return `.webp${suffix}`;
    });
    
    if (count > 0) {
      fs.writeFileSync(filePath, updated, 'utf-8');
      console.log(`✅ Updated ${count} image references in ${file}`);
    }
  }
});

console.log('\n✅ All image references updated successfully!');

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');

// Process images recursively
async function processImages(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await processImages(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      
      // Only process image files
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        const webpPath = fullPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        
        // Skip if webp already exists
        if (fs.existsSync(webpPath)) {
          console.log(`Skipped (exists): ${path.relative(publicDir, webpPath)}`);
          continue;
        }

        try {
          await sharp(fullPath)
            .webp({ quality: 80 })
            .toFile(webpPath);
          
          console.log(`✓ Converted: ${path.relative(publicDir, fullPath)} → ${path.basename(webpPath)}`);
        } catch (error) {
          console.error(`✗ Failed: ${path.relative(publicDir, fullPath)}`, error.message);
        }
      }
    }
  }
}

console.log('Starting image optimization...\n');
processImages(publicDir)
  .then(() => console.log('\n✓ Image optimization complete!'))
  .catch(console.error);

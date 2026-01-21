import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.join(__dirname, 'public', 'assets');

// Track statistics
const stats = {
  duplicatesRemoved: 0,
  filesOptimized: 0,
  originalSize: 0,
  optimizedSize: 0,
  errors: []
};

// Function to get file size
function getFileSize(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch (err) {
    return 0;
  }
}

// Function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Function to find all image files recursively
function findImageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findImageFiles(filePath, fileList);
    } else if (/\.(png|jpg|jpeg|webp)$/i.test(file)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to remove duplicate PNG files where WebP exists
async function removeDuplicates() {
  console.log('\n🔍 Step 1: Checking for duplicate images...\n');
  
  const allFiles = findImageFiles(assetsDir);
  const toRemove = [];
  
  allFiles.forEach(file => {
    if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      const baseName = file.replace(/\.(png|jpg|jpeg)$/i, '');
      const webpVersion = baseName + '.webp';
      
      if (fs.existsSync(webpVersion)) {
        toRemove.push(file);
      }
    }
  });
  
  console.log(`Found ${toRemove.length} duplicate files to remove\n`);
  
  for (const file of toRemove) {
    const size = getFileSize(file);
    const relativePath = path.relative(assetsDir, file);
    
    try {
      fs.unlinkSync(file);
      stats.duplicatesRemoved++;
      stats.originalSize += size;
      console.log(`✓ Removed: ${relativePath} (${formatBytes(size)})`);
    } catch (err) {
      stats.errors.push(`Failed to remove ${relativePath}: ${err.message}`);
      console.log(`✗ Failed: ${relativePath}`);
    }
  }
}

// Function to optimize large images
async function optimizeImages() {
  console.log('\n🔧 Step 2: Optimizing large images...\n');
  
  const allFiles = findImageFiles(assetsDir);
  const largeFiles = allFiles.filter(file => {
    const size = getFileSize(file);
    return size > 500 * 1024; // Files larger than 500KB
  });
  
  console.log(`Found ${largeFiles.length} files larger than 500KB to optimize\n`);
  
  for (const file of largeFiles) {
    const originalSize = getFileSize(file);
    const relativePath = path.relative(assetsDir, file);
    const ext = path.extname(file).toLowerCase();
    
    try {
      let sharpInstance = sharp(file);
      const metadata = await sharpInstance.metadata();
      
      // Resize if too large (max width/height 2000px)
      if (metadata.width > 2000 || metadata.height > 2000) {
        sharpInstance = sharpInstance.resize(2000, 2000, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }
      
      // Optimize based on file type
      if (ext === '.webp') {
        await sharpInstance
          .webp({ quality: 85, effort: 6 })
          .toFile(file + '.tmp');
      } else if (ext === '.png') {
        await sharpInstance
          .png({ quality: 85, compressionLevel: 9, adaptiveFiltering: true })
          .toFile(file + '.tmp');
      } else if (ext === '.jpg' || ext === '.jpeg') {
        await sharpInstance
          .jpeg({ quality: 85, progressive: true })
          .toFile(file + '.tmp');
      }
      
      const optimizedSize = getFileSize(file + '.tmp');
      
      // Only replace if optimization actually reduced size
      if (optimizedSize < originalSize && optimizedSize > 0) {
        fs.unlinkSync(file);
        fs.renameSync(file + '.tmp', file);
        
        stats.filesOptimized++;
        stats.originalSize += originalSize;
        stats.optimizedSize += optimizedSize;
        
        const savings = originalSize - optimizedSize;
        const savingsPercent = ((savings / originalSize) * 100).toFixed(1);
        
        console.log(`✓ Optimized: ${relativePath}`);
        console.log(`  ${formatBytes(originalSize)} → ${formatBytes(optimizedSize)} (${savingsPercent}% reduction)\n`);
      } else {
        // Remove temp file if optimization didn't help
        if (fs.existsSync(file + '.tmp')) {
          fs.unlinkSync(file + '.tmp');
        }
        console.log(`⊘ Skipped: ${relativePath} (already optimized)\n`);
      }
      
    } catch (err) {
      // Clean up temp file on error
      if (fs.existsSync(file + '.tmp')) {
        fs.unlinkSync(file + '.tmp');
      }
      stats.errors.push(`Failed to optimize ${relativePath}: ${err.message}`);
      console.log(`✗ Failed: ${relativePath} - ${err.message}\n`);
    }
  }
}

// Main function
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  IMAGE OPTIMIZATION AND CLEANUP TOOL');
  console.log('═══════════════════════════════════════════════════════\n');
  
  try {
    // Step 1: Remove duplicates
    await removeDuplicates();
    
    // Step 2: Optimize large files
    await optimizeImages();
    
    // Print summary
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  SUMMARY');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(`Duplicate files removed: ${stats.duplicatesRemoved}`);
    console.log(`Files optimized: ${stats.filesOptimized}`);
    console.log(`Total space saved: ${formatBytes(stats.originalSize - stats.optimizedSize)}`);
    
    if (stats.errors.length > 0) {
      console.log(`\n⚠️  Errors encountered: ${stats.errors.length}`);
      stats.errors.forEach(err => console.log(`  - ${err}`));
    }
    
    console.log('\n✅ Image optimization complete!\n');
    
  } catch (err) {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  }
}

// Run the script
main();

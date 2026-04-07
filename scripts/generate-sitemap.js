// scripts/generate-sitemap.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSitemap() {
  try {
    const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asianimportexport.com';

    // Static routes
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/products</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/aboutUs</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/shipping</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/search</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;

    const fetchJson = async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Request failed for ${url}: ${response.status}`);
      }
      return response.json();
    };

    const [categoriesPayload, productsPayload] = await Promise.all([
      fetchJson(`${backendUrl}/api/categories?all=true&isActive=true`),
      fetchJson(`${backendUrl}/api/categories/public/products?all=true`),
    ]);

    const categories = Array.isArray(categoriesPayload?.categories) ? categoriesPayload.categories : [];
    const products = Array.isArray(productsPayload?.products) ? productsPayload.products : [];

    // Add all products
    products.forEach(product => {
      if (product?.id === undefined || product?.id === null || product?.id === '') return;

      sitemap += `
  <url>
    <loc>${baseUrl}/product/${product.id}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    // Helper function to convert name to URL slug
    const nameToSlug = (name) => {
      return name.replace(/\s+/g, '-');
    };

    // Add category filters with new URL format
    categories.forEach(category => {
      const categorySlug = nameToSlug(category.name);
      sitemap += `
  <url>
    <loc>${baseUrl}/products/c/${categorySlug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
      
      if (category.subcategories) {
        category.subcategories.forEach(subcategory => {
          const subcategorySlug = nameToSlug(subcategory.name);
          sitemap += `
  <url>
    <loc>${baseUrl}/products/c/${subcategorySlug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>`;
        });
      }
    });

    sitemap += `
</urlset>`;

    // Write to public directory
    const outputPath = path.join(path.dirname(__dirname), 'public', 'sitemap.xml');
    fs.writeFileSync(outputPath, sitemap);
    
    const urlCount = sitemap.match(/<url>/g).length;
    console.log('✓ Static sitemap.xml generated successfully!');
    console.log(`✓ Total URLs: ${urlCount}`);
    console.log(`✓ Base URL: ${baseUrl}`);
    
    return true;
  } catch (error) {
    console.error('✗ Error generating sitemap:', error);
    return false;
  }
}

// Run if called directly
generateSitemap()
  .then((ok) => process.exit(ok ? 0 : 1))
  .catch(() => process.exit(1));

export default generateSitemap;

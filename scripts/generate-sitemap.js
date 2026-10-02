import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://anti-theft.sultanahmad.site';
const today = new Date().toISOString().split('T')[0];

const routes = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: 'download', priority: '0.95', changefreq: 'daily' },
  { path: 'pricing', priority: '0.9', changefreq: 'weekly' },
  { path: 'about', priority: '0.8', changefreq: 'weekly' },
  { path: 'contact', priority: '0.8', changefreq: 'monthly' },
  { path: 'login', priority: '0.7', changefreq: 'monthly' },
  { path: 'forgot-password', priority: '0.4', changefreq: 'monthly' },
  { path: 'privacy-policy', priority: '0.5', changefreq: 'monthly' },
  { path: 'terms', priority: '0.5', changefreq: 'monthly' },
];

const generateSitemap = () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${routes
  .map(
    (route) => `  <url>
    <loc>${BASE_URL}/${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  const outputPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf8');
  console.log(`Dynamic sitemap successfully generated at ${outputPath}`);
};

generateSitemap();

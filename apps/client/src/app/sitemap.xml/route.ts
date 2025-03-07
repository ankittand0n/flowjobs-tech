import { MetadataRoute } from "next";
import sitemap from "../sitemap";

export async function GET() {
  const sitemapData = await sitemap();
  
  // Convert the sitemap data to XML format
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapData.map((route) => `
    <url>
      <loc>${route.url}</loc>
      <lastmod>${route.lastModified ? new Date(route.lastModified).toISOString() : new Date().toISOString()}</lastmod>
      <changefreq>${route.changeFrequency || 'weekly'}</changefreq>
      <priority>${route.priority || 0.5}</priority>
    </url>
  `).join('')}
</urlset>`;

  // Return the response with the correct content type
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, must-revalidate',
    },
  });
} 
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:5173'
    : (process.env.NEXT_PUBLIC_APP_URL || 'https://flowjobs.tech');

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
} 
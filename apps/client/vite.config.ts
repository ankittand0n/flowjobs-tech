/// <reference types='vitest' />

import { defineConfig, searchForWorkspaceRoot } from "vite";
import { generateSitemap } from './src/utils/generate-sitemap';
import fs from 'fs';
import path from 'path';
import react from "@vitejs/plugin-react";
import { lingui } from "@lingui/vite-plugin";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import type { Connect } from 'vite';

export default defineConfig({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/apps/client",

  define: {
    appVersion: JSON.stringify(process.env.npm_package_version),
  },

  server: {
    port: 5173,
    host: "localhost",
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd())],
    },
    proxy: {
      '/sitemap.xml': {
        target: 'http://localhost:5173',
        bypass: (req, res) => {
          const sitemap = generateSitemap('http://localhost:5173');
          res.setHeader('Content-Type', 'application/xml');
          res.end(sitemap);
        },
      },
      '/robots.txt': {
        target: 'http://localhost:5173',
        bypass: (req, res) => {
          const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: http://localhost:5173/sitemap.xml`;
          res.setHeader('Content-Type', 'text/plain');
          res.end(robotsTxt);
        },
      },
    },
  },

  plugins: [
    react({
      babel: {
        plugins: ["macros"],
      },
    }),
    lingui(),
    nxViteTsPaths(),
    {
      name: 'generate-sitemap',
      writeBundle() {
        const baseUrl = process.env.NODE_ENV === 'development'
          ? 'http://localhost:5173'
          : 'https://flowjobs.tech';

        const sitemap = generateSitemap(baseUrl);
        
        // Write directly to the build output directory
        const outDir = path.resolve(__dirname, '../../dist/apps/client');
        if (!fs.existsSync(outDir)) {
          fs.mkdirSync(outDir, { recursive: true });
        }

        // Write sitemap.xml
        fs.writeFileSync(
          path.resolve(outDir, 'sitemap.xml'),
          sitemap,
          'utf8'
        );

        // Write robots.txt
        const robotsTxt = [
          'User-agent: *',
          'Allow: /',
          '',
          '# Sitemaps',
          `Sitemap: ${baseUrl}/sitemap.xml`,
          '' // Add empty line at end of file
        ].join('\n');

        fs.writeFileSync(
          path.resolve(outDir, 'robots.txt'),
          robotsTxt,
          'utf8'
        );

        console.log('✓ Generated sitemap.xml and robots.txt');
      },
    },
  ],

  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".po": "text",
      },
    },
  },

  build: {
    outDir: "../../dist/apps/client",
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },

  test: {
    globals: true,
    cache: {
      dir: "../../node_modules/.vitest",
    },
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    reporters: ["default"],
    coverage: {
      reportsDirectory: "../../coverage/apps/client",
      provider: "v8",
    },
  },
});

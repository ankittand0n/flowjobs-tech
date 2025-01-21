import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';
import sharp from 'sharp';

export default defineConfig({
  server: {
    host: true,  // Listen on all available network interfaces
    port: 6174,  // Changed extension to 6174
    strictPort: true,
  },
  build: {
    outDir: 'dist/apps/extension',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup.tsx'),
        content: resolve(__dirname, 'src/content.ts'),
        background: resolve(__dirname, 'src/background.ts')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  plugins: [
    react(),
    {
      name: 'copy-assets',
      async writeBundle() {
        // Ensure directory exists
        if (!fs.existsSync('dist/apps/extension/assets')) {
          fs.mkdirSync('dist/apps/extension/assets', { recursive: true });
        }

        // Copy manifest
        fs.copyFileSync(
          'apps/extension/manifest.json',
          'dist/apps/extension/manifest.json'
        );

        // Convert SVG to PNGs
        const svg = fs.readFileSync('apps/client/public/logo/light.svg');
        
        await Promise.all([
          sharp(svg).resize(16, 16).toFile('dist/apps/extension/assets/icon16.png'),
          sharp(svg).resize(48, 48).toFile('dist/apps/extension/assets/icon48.png'),
          sharp(svg).resize(128, 128).toFile('dist/apps/extension/assets/icon128.png')
        ]);

        // Copy HTML file
        fs.copyFileSync(
          'apps/extension/src/popup.html',
          'dist/apps/extension/popup.html'
        );
      }
    }
  ],
  css: {
    postcss: {
      plugins: [require('tailwindcss'), require('autoprefixer')],
    },
  },
  resolve: {
    alias: {
      '@reactive-resume/ui': resolve(__dirname, '../../libs/ui/src'),
      '@reactive-resume/hooks': resolve(__dirname, '../../libs/hooks/src'),
      '@reactive-resume/utils': resolve(__dirname, '../../libs/utils/src'),
      '@reactive-resume/dto': resolve(__dirname, '../../libs/dto/src'),
      '@/client': resolve(__dirname, '../../apps/client/src')
    }
  }
}); 
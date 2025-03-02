import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@reactive-resume/ui': resolve(__dirname, '../../libs/ui/src'),
      '@reactive-resume/utils': resolve(__dirname, '../../libs/utils/src'),
      '@reactive-resume/hooks': resolve(__dirname, '../../libs/hooks/src')
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/background.ts'),
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
  server: {
    port: 5173,
  },
}); 
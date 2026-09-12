// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
  },
  // 👇 This tells Vite to fallback to index.html for all routes
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});

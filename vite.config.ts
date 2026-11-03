import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    // three.js only loads lazily with the spark field, after first paint.
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          gsap: ['gsap', 'lenis'],
        },
      },
    },
  },
});

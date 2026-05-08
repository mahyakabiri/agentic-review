import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: (id) => !id.startsWith('.') && !id.startsWith('/'),
      output: {
        banner: '#!/usr/bin/env node',
      },
    },
    target: 'node18',
    outDir: 'dist',
    minify: false,
  },
});

import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.mjs' : 'index.cjs'),
    },
    sourcemap: true,
    rollupOptions: {
      external: [
        'bip39',
        '@hyperbitjs/chains',
        '@hyperbitjs/coinkey',
        '@hyperbitjs/hdkey',
        '@metamask/browser-passworder',
      ],
      output: {
        sourcemapExcludeSources: false,
      },
    },
  },
});

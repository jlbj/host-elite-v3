import { defineConfig } from 'vite';

export default defineConfig({
  assetsInclude: ['**/*.ttf', '**/*.woff', '**/*.woff2', '**/*.eot'],
  optimizeDeps: {
    exclude: ['monaco-editor']
  }
});
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    cors: true,
    allowedHosts: true,
  },
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  build: {
    outDir: path.resolve(__dirname, '../../dist/listing-editor'),
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, 'main.tsx'),
      name: 'ListingEditor',
      fileName: 'listing-editor',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
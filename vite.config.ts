import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
        emptyOutDir: true,
        rollupOptions: {
          input: {
            main: path.resolve(__dirname, 'index.html')
          }
        }
      },
      // ✅ ADD THIS - Fix MIME type issues
      server: {
        fs: {
          strict: false,
          allow: ['.'],
        },
        hmr: true,
      },
      optimizeDeps: {
        include: ['react', 'react-dom', '@google/genai'],
        esbuildOptions: {
          loader: {
            '.ts': 'tsx',
            '.tsx': 'tsx',
          },
        },
      },
    };
});

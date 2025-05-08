import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  base: '/',
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          'chart-vendor': ['recharts']
        }
      }
    }
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    proxy: {
      '/api/v3': {
        target: 'https://api.binance.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/v3/, '/api/v3')
      },
      '/api/coingecko': {
        target: 'https://api.coingecko.com/api/v3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/coingecko/, ''),
        configure: (proxy, options) => {
          // Add CoinGecko API key to all requests
          proxy.on('proxyReq', (proxyReq, req, res) => {
            const url = new URL(proxyReq.path, 'https://api.coingecko.com');
            url.searchParams.append('x_cg_api_key', 'CG-vfbBd2nG74YmzzoytroimuaZ');
            proxyReq.path = `${url.pathname}${url.search}`;
          });
        }
      }
    },
    hmr: {
      clientPort: 443,
      protocol: 'wss',
      timeout: 120000
    },
    watch: {
      usePolling: true
    }
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
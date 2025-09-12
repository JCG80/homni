
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Auto-detect if we need hash routing (for Lovable preview or static hosting)
  const isLovablePreview = process.env.NODE_ENV === 'production' && !process.env.VITE_ROUTER_MODE;
  const isStaticBuild = mode === 'production' && process.env.VITE_ROUTER_MODE !== 'browser';
  const routerMode = isStaticBuild ? 'hash' : (isLovablePreview ? 'hash' : 'browser');
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    define: {
      // Inject router mode into the app
      'import.meta.env.VITE_ROUTER_MODE': JSON.stringify(
        process.env.VITE_ROUTER_MODE || routerMode
      ),
    },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          charts: ['recharts', 'chart.js'],
          utils: ['lodash', 'date-fns', 'clsx']
        }
      }
    },
    target: 'esnext',
    minify: 'terser',
    sourcemap: mode === 'development'
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom'],
  },
  assetsInclude: ['**/*.md'], // Enable markdown imports
  optimizeDeps: {
    include: [
      'react', 
      'react-dom',
      '@radix-ui/react-progress',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-context-menu',
      '@radix-ui/react-hover-card',
      '@radix-ui/react-label',
      '@radix-ui/react-menubar',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-toggle',
      '@radix-ui/react-toggle-group',
      '@radix-ui/react-tooltip'
    ],
  },
    test: {
      globals: true,
      environment: 'jsdom',
    }
  };
});

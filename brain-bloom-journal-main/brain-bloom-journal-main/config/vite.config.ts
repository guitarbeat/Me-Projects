import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: "::",
    port: 8080,
    strictPort: true,
    hmr: {
      host: 'localhost'
    }
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    mode === 'production' && visualizer({
      open: false,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: '/',
        navigateFallbackDenylist: [/^\/api\//, /\.html$/]
      },
      manifest: {
        name: 'Tampana - Emotional Wellness Tracker',
        short_name: 'Tampana',
        description: 'Track and analyze emotional patterns with intelligent insights',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icon-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/icon-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          
          // All Radix UI components in one chunk
          if (id.includes('node_modules/@radix-ui')) {
            return 'ui-radix';
          }
          
          // Animation library
          if (id.includes('node_modules/framer-motion')) {
            return 'motion';
          }
          
          // Lucide icons (centralized import)
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
          
          // Data management
          if (id.includes('node_modules/@tanstack/react-query') || 
              id.includes('node_modules/@supabase/supabase-js')) {
            return 'data-vendor';
          }
          
          // Routing
          if (id.includes('node_modules/react-router-dom')) {
            return 'router';
          }
          
          // UI utilities
          if (id.includes('node_modules/clsx') || 
              id.includes('node_modules/class-variance-authority') ||
              id.includes('node_modules/tailwind-merge') ||
              id.includes('node_modules/tailwindcss-animate')) {
            return 'ui-utils';
          }
          
          // Date utilities
          if (id.includes('node_modules/date-fns')) {
            return 'date-utils';
          }
          
          // Command palette
          if (id.includes('node_modules/cmdk') || id.includes('node_modules/next-themes')) {
            return 'ui-extras';
          }
          
          // Feature modules - Chat
          if (id.includes('src/components/features/chat')) {
            return 'feature-chat';
          }
          
          // Feature modules - Navigation
          if (id.includes('src/components/features/navigation')) {
            return 'feature-navigation';
          }
          
          // Newspaper generators (large strategy pattern implementations)
          if (id.includes('src/components/newspaper') && 
              (id.includes('generator') || id.includes('strategy'))) {
            return 'feature-newspaper-gen';
          }
          
          // Split screen functionality
          if (id.includes('src/hooks/split-screen')) {
            return 'feature-split-screen';
          }
        },
      },
      // Tree-shaking optimization
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    // Enable source maps for debugging but remove in production
    sourcemap: mode !== 'production',
    // Target modern browsers for smaller bundles
    target: 'es2020',
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
    ],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    globals: true,
  }
}));


import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
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
  build: {
    // Optimize bundle size and performance
    target: 'es2015',
    minify: mode === 'production' ? 'esbuild' : false,
    // Use esbuild for faster builds, fallback to terser if needed
    // minify: mode === 'production' ? 'terser' : false,
    // terserOptions: mode === 'production' ? {
    //   compress: {
    //     drop_console: true,
    //     drop_debugger: true,
    //   },
    // } : undefined,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui') || id.includes('radix-ui')) {
              return 'ui-vendor';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
            if (id.includes('@supabase/supabase-js')) {
              return 'supabase-vendor';
            }
            if (id.includes('recharts') || id.includes('lucide-react')) {
              return 'chart-vendor';
            }
            // Other vendor dependencies
            return 'vendor';
          }

          // Feature-based chunks for application code
          if (id.includes('/pages/') && (id.includes('Dashboard') || id.includes('dashboard'))) {
            return 'dashboard';
          }
          if (id.includes('/pages/') && (id.includes('Analytics') || id.includes('analytics'))) {
            return 'analytics';
          }
          if (id.includes('/pages/') && (id.includes('Order') || id.includes('order'))) {
            return 'orders';
          }
          if (id.includes('/components/analytics/')) {
            return 'analytics';
          }
          if (id.includes('/components/testing/')) {
            return 'testing';
          }
        },
      },
    },
    // Increase chunk size warning limit for better optimization
    chunkSizeWarningLimit: 1000,
  },
  // Performance optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'recharts',
      'lucide-react'
    ],
  },
}));

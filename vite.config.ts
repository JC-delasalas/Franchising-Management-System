
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
    // Emergency simplified build configuration
    target: 'es2015',
    minify: mode === 'production',
    sourcemap: false,
    // Remove manual chunks to avoid circular dependency issues
    rollupOptions: {
      output: {
        // Let Vite handle chunking automatically
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  // Simplified optimizeDeps
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
    ],
  },
}));

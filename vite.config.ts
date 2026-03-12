import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'pdf-engine': ['html2canvas', 'jspdf'],
          'vendor': ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})

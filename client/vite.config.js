// client/vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html' // Use index.html as the entry point
      }
    },
    outDir: 'dist', // Output directory for the build files
  },
  // This ensures Vite will expose all env variables prefixed with VITE_  
  envPrefix: 'VITE_',
  
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  
  // Remove or modify the define block as it's interfering with env variables
  // define: {
  //   'process.env': {}
  // }
})
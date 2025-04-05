import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })


export default {
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // This allows the app to be accessible from the network
    port: 5173,        // Optional: You can change the port if needed
  }
};
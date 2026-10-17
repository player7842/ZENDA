import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Vite necesita estos plugins para entender React y Tailwind
export default defineConfig({
  plugins: [react(), tailwindcss()],
})

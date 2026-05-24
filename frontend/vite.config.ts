import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

// Load environment variables from the root .dev.vars file
const env = dotenv.config({ path: '../.dev.vars' }).parsed || {}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Expose only the safe public keys to the Vite frontend
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.SUPABASE_URL),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY)
  }
})

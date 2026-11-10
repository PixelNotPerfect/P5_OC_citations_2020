import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  server: { port: 3000 },
  // Nitro produit la sortie serveur. Sur Vercel, il détecte la plateforme
  // et génère automatiquement le dossier `.vercel/output`.
  plugins: [tanstackStart(), nitro(), viteReact()],
})

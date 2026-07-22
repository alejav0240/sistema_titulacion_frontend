import { defineConfig } from 'vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'
import contentCollections from '@content-collections/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    // ponytail: edgeFunctions emulation crashes vite dev (fetch fails without
    // outbound network, e.g. inside docker) — no Edge Functions used here.
    netlify({ dev: { edgeFunctions: { enabled: false } } }),
    contentCollections(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  server: {
    allowedHosts: ['titulaciones.soceisi.com'],
  },
})

export default config

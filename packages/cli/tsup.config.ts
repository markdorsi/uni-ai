import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false,
  clean: true,
  minify: false,
  sourcemap: true,
  target: 'es2022',
  banner: {
    js: '#!/usr/bin/env node',
  },
})

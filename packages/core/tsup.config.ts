import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'providers/index': 'src/providers/index.ts',
  },
  format: ['esm'],
  dts: false, // Temporarily disabled - will fix later
  clean: true,
  sourcemap: true,
  minify: true,
  treeshake: true,
  splitting: false,
  target: 'es2022',
})

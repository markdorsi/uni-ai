import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'providers/index': 'src/providers/index.ts',
  },
  format: ['esm'],
  dts: false, // Generated separately via tsc
  clean: true,
  sourcemap: true,
  minify: true,
  treeshake: true,
  splitting: false,
  target: 'es2022',
})

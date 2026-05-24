import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  target: 'node20',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  // Bundle shared inline so the output is fully self-contained at runtime
  noExternal: ['@browser-arena/shared'],
});

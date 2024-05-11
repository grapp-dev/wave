import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  splitting: false,
  sourcemap: false,
  outDir: './lib',
  format: ['esm', 'cjs'],
  clean: true,
  dts: true,
  external: ['wonka', 'react'],
});

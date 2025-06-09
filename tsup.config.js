/** @type {import('tsup').Options} */
module.exports = {
  dts: true,
  minify: false,
  bundle: true, // Changed from false to true
  sourcemap: true,
  treeshake: true,
  splitting: true,
  clean: true,
  outDir: 'dist',
  entry: ['src/index.ts'],
  format: ['cjs'],
};

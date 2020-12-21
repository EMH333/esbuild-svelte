const esbuild = require("esbuild");
const sveltePlugin = require("esbuild-svelte");

esbuild.build({
  entryPoints: ['./entry.js'],
  outdir: './dist',
  format: "esm",
  minify: true,
  bundle: true,
  splitting: true,
  plugins: [sveltePlugin(),]
}).catch((err) => {
  console.error(err)
  process.exit(1)
})

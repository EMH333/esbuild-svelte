const esbuild_svelte = require("esbuild-svelte");
const esbuild = require("esbuild");

esbuild.build({
  entryPoints: ['./entry.js'],
  outdir: './dist',
  format: "esm",
  minify: true,
  bundle: true,
  splitting: true,
  plugins: [esbuild_svelte,]
}).catch((err) => {
  console.error(err)
  process.exit(1)
})

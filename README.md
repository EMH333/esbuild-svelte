# esbuild-svelte

[![npm version](https://badge.fury.io/js/esbuild-svelte.svg)](https://badge.fury.io/js/esbuild-svelte)

Plugin to compile svelte components for bundling with esbuild.

## Install

Install both this plugin and [esbuild](https://github.com/evanw/esbuild) (esbuild must be above 0.8.1). 

A simple build script looks like
```javascript
const esbuild = require('esbuild');
const sveltePlugin = require('esbuild-svelte');

esbuild.build({
  entryPoints: ['app.js'],
  bundle: true,
  outfile: 'out.js',
  plugins: [sveltePlugin()],
  logLevel: 'info',
}).catch(() => process.exit(1))
```

The `example` folder of this repository is a great starting off point for a "complete" project.

### CSS Output

By default, `esbuild-svelte` emits external css files from Svelte for `esbuild` to process. If this isn't desired, use a configuration that turns off external css output and instead includes it in the javascript output. For example: `sveltePlugin({compileOptions: {css: true}})`

## Advanced

You can see the full API [here](https://github.com/EMH333/esbuild-svelte/blob/main/dist/index.d.ts), which also includes support for Svelte's compiler options and preprocessing API.

## Developing

Clone, `npm install`, `npm link` and it's good to go! Releases are automated (with the right permissions), just by running `npm version patch|minor|major`.

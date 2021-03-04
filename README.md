# esbuild-svelte

[![npm version](https://badge.fury.io/js/esbuild-svelte.svg)](https://badge.fury.io/js/esbuild-svelte)[![npm downloads](http://img.shields.io/npm/dm/esbuild-svelte.svg)](https://www.npmjs.org/package/esbuild-svelte)[![DeepScan grade](https://deepscan.io/api/teams/13110/projects/16122/branches/339411/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=13110&pid=16122&bid=339411)

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

### Typescript and Other Svelte Preprocessing

In order to support Typescript and other languages that require preprocessing before being fed into the Svelte compiler, simply add the preprocessor to the `preprocess` option (which accepts both a single preprocessor or an array of them). The example script below is a great place to start. **NOTE: This will break sourcemaps as of the current release, fixes are in progress**

```javascript
const sveltePreprocess = require('svelte-preprocess');
const esbuildSvelte = require('esbuild-svelte');
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['index.js'],
  bundle: true,
  outdir: './dist',
  plugins: [esbuildSvelte({
    preprocess: sveltePreprocess()
  })],
}).catch(() => process.exit(1));
```

## Advanced

You can see the full API for this plugin [here](https://github.com/EMH333/esbuild-svelte/blob/main/dist/index.d.ts), which includes support for Svelte's compiler options, preprocessing API, and more.

## Developing

Clone, `npm install`, `npm link` and it's good to go! Releases are automated (with the right permissions), just by running `npm version patch|minor|major`.

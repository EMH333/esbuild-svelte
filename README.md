# esbuild-svelte

[![npm version](https://badge.fury.io/js/esbuild-svelte.svg)](https://badge.fury.io/js/esbuild-svelte)

Plugin to compile svelte components for bundling with esbuild.

## Install

Install both this plugin and [esbuild](https://github.com/evanw/esbuild) (esbuild must be above 0.8.1). 

An super simple build script looks like
```javascript
require('esbuild').build({
  entryPoints: ['app.js'],
  bundle: true,
  outfile: 'out.js',
  plugins: [require('esbuild-svelte')],
  logLevel: 'info',
}).catch(() => process.exit(1))
```

The examples folder of this repository is a great starting off point as well if you change the `require('../index')` in the buildscript to `require('esbuild-svelte')`.

### CSS Output

By default, `esbuild-svelte` emits external css files from Svelte for `esbuild` to process. If this isn't desired, use a configuration that turns off external css output and instead embed it in the javascript output. For example: `require('esbuild-svelte/configurable')({compileOptions: {css: true}})`

## Advanced

If it is desired to change Svelte compiler options, simply import `esbuild-svelte/configurable` instead of `esbuild-svelte` and call it as a function. For example, to enable dev mode in Svelte instead of `require('esbuild-svelte')`, use `require('esbuild-svelte/configurable')({compileOptions: {dev: true}})`. `compileOptions` represents Svelte compile options.

You can see the full API [here](https://github.com/EMH333/esbuild-svelte/blob/main/configurable/index.d.ts), which also includes support for Svelte's preprocessing API.

## TODO
- Unifiy APIs for 1.0.0 release

# esbuild-svelte

[![npm version](https://badge.fury.io/js/esbuild-svelte.svg)](https://badge.fury.io/js/esbuild-svelte)

With the introduction of plugins coming to esbuild soon, there will be demand for a svelte plugin to automaticly resolve .svelte files. This plugin will be updated once plugin support is officially announced for esbuild. 

This original version is copied directly from Evan Wallace's example but will be modified to work in more circumstances in the future

## Install

Install both this plugin and versions of [esbuild](https://github.com/evanw/esbuild) above 0.8.1. 

An example build script looks like
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

## Advanced

If it is desired to change Svelte compiler options, simply import `esbuild-svelte/configurable` instead of `esbuild-svelte` and call it as a function. For example, to enable dev mode in Svelte instead of `require('esbuild-svelte')`, use `require('esbuild-svelte/configurable')({dev: true})`. This API may change in the future

## TODO
- Figure out CSS support
- Add more functionality
- Add Svelte pre-processor support

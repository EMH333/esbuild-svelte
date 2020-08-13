# esbuild-svelte

[![npm version](https://badge.fury.io/js/esbuild-svelte.svg)](https://badge.fury.io/js/esbuild-svelte)

With the introduction of plugins coming to esbuild soon, there will be demand for a svelte plugin to automaticly resolve .svelte files. This plugin will be updated once plugin support is officially announced for esbuild. 

This original version is copied directly from Evan Wallace's example but will be modified to work in more circumstances in the future

## Install

Right now (as of esbuild version 0.6.22), esbuild doesn't offically support plugins. This means you need to reinstall the esbuild package with plugin support. To do this:

- Clone the [esbuild repo](https://github.com/evanw/esbuild)
- Check out the `plugins` branch
- Run `make platform-neutral platform-<your_platform>`
- Copy all files from esbuild's `npm/esbuild` folder to the esbuild folder of your `node_modules`
- Copy the binary from esbuild's `npm/esbuild-<your_platform>/bin` folder to your `node_modules/esbuild/bin` folder replacing the existing JS file
- Run your script!

Note that updating esbuild will require you to repeat these steps until plugin support is offical. The examples folder of this repository is a great starting off point as long as you change the `require('../index')` in the buildscript to `require('esbuild-svelte')`.

## TODO
- Figure out CSS support
- Expose Svelte options
- Add more functionality
- Add Svelte pre-processor support

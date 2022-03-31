# esbuild-svelte

[![npm version](https://badge.fury.io/js/esbuild-svelte.svg)](https://badge.fury.io/js/esbuild-svelte) [![npm downloads](http://img.shields.io/npm/dm/esbuild-svelte.svg)](https://www.npmjs.org/package/esbuild-svelte) [![CI](https://github.com/EMH333/esbuild-svelte/actions/workflows/ci.yml/badge.svg)](https://github.com/EMH333/esbuild-svelte/actions/workflows/ci.yml)

Plugin to compile svelte components for bundling with esbuild.

## Install

Install this plugin, [esbuild](https://github.com/evanw/esbuild) and [Svelte](https://github.com/sveltejs/svelte).

A simple build script looks like

```javascript
import esbuild from "esbuild";
import sveltePlugin from "esbuild-svelte";

esbuild
  .build({
    entryPoints: ["app.js"],
    mainFields: ["svelte", "browser", "module", "main"],
    bundle: true,
    outfile: "out.js",
    plugins: [sveltePlugin()],
    logLevel: "info",
  })
  .catch(() => process.exit(1));
```

The `example` folder of this repository is a great starting off point for a "complete" project.

### CSS Output

By default, `esbuild-svelte` emits external css files from Svelte for `esbuild` to process. If this isn't desired, use a configuration that turns off external css output and instead includes it in the javascript output. For example: `sveltePlugin({compilerOptions: {css: true}})`

### Typescript and Other Svelte Preprocessing

In order to support Typescript and other languages that require preprocessing before being fed into the Svelte compiler, simply add the preprocessor to the `preprocess` option (which accepts both a single preprocessor or an array of them). The example script below is a great place to start.

```javascript
import esbuild from "esbuild";
import esbuildSvelte from "esbuild-svelte";
import sveltePreprocess from "svelte-preprocess";

esbuild
  .build({
    entryPoints: ["index.js"],
    mainFields: ["svelte", "browser", "module", "main"],
    bundle: true,
    outdir: "./dist",
    plugins: [
      esbuildSvelte({
        preprocess: sveltePreprocess(),
      }),
    ],
  })
  .catch(() => process.exit(1));
```

## Advanced

For incremental or watch build modes, esbuild-svelte will automatically cache files if they haven't changed. This allows esbuild to skip the Svelte compiler for those files altogether, saving time. Setting `cache: false` will disable this file level cache if an issue arises (please report).

You can see the full API for this plugin [here](https://github.com/EMH333/esbuild-svelte/blob/main/dist/index.d.ts), which includes support for Svelte's compiler options, preprocessing API, and more.

## Developing

Clone, `npm install`, `npm link` and it's good to go! Releases are automated (with the right permissions), just by running `npm version patch|minor|major`.

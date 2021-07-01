//original version from https://github.com/evanw/esbuild/blob/plugins/docs/plugin-examples.md
import { preprocess, compile } from 'svelte/compiler';
import { relative } from 'path';
import { promisify } from 'util';
import { readFile, statSync } from 'fs';

import type { CompileOptions, Warning } from 'svelte/types/compiler/interfaces';
import type { PreprocessorGroup } from 'svelte/types/compiler/preprocess/types';
import type { OnLoadResult, Plugin } from 'esbuild';

interface esbuildSvelteOptions {
    /**
     * Svelte compiler options
     */
    compileOptions?: CompileOptions

    /**
     * The preprocessor(s) to run the Svelte code through before compiling
     */
    preprocess?: PreprocessorGroup | PreprocessorGroup[]

    /**
     * Attempts to cache compiled files if the mtime of the file hasn't changed since last run.
     * Only works with incremental or watch mode builds
     */
    cache?: boolean
}

const convertMessage = ({ message, start, end, filename, frame }: Warning) => ({
    text: message,
    location: start && end && {
        file: filename,
        line: start.line,
        column: start.column,
        length: start.line === end.line ? end.column - start.column : 0,
        lineText: frame,
    },
})

export default function sveltePlugin(options?: esbuildSvelteOptions): Plugin {
    return {
        name: 'esbuild-svelte',
        setup(build) {
            // see if we are incrementally building or watching for changes and enable the cache
            // also checks if it has already been defined and ignores this if it has
            // Disable auto-cache enabling if there are preprocessors. Detailed in https://github.com/EMH333/esbuild-svelte/issues/59
            // TODO: There is a better way to do this, but requires more complex cache invalidation
            if (options?.cache == undefined && !options?.preprocess && (build.initialOptions.incremental || build.initialOptions.watch)) {
                if (!options) {
                    options = {};
                }
                options.cache = true;
            }

            //Store generated css code for use in fake import
            const cssCode = new Map<string, string>();
            const fileCache = new Map<string, { data: OnLoadResult, time: Date }>();

            //main loader
            build.onLoad({ filter: /\.svelte$/ }, async (args) => {

                // if told to use the cache, check if it contains the file,
                // and if the modified time is not greater than the time when it was cached
                // if so, return the cached data
                if (options?.cache === true && fileCache.has(args.path)) {
                    const cachedFile = fileCache.get(args.path);
                    if (cachedFile && statSync(args.path).mtime < cachedFile.time) {
                        return cachedFile.data
                    }
                }

                let source = await promisify(readFile)(args.path, 'utf8')
                let filename = relative(process.cwd(), args.path)
                try {
                    //do preprocessor stuff if it exists
                    if (options?.preprocess) {
                        source = (await preprocess(source, options.preprocess, { filename })).code;
                    }

                    let compileOptions = { css: false, ...(options?.compileOptions) };

                    let { js, css, warnings } = compile(source, { ...compileOptions, filename })
                    let contents = js.code + `\n//# sourceMappingURL=` + js.map.toUrl()

                    //if svelte emits css seperately, then store it in a map and import it from the js
                    if (!compileOptions.css && css.code) {
                        let cssPath = args.path.replace(".svelte", ".esbuild-svelte-fake-css").replace(/\\/g, "/");
                        cssCode.set(cssPath, css.code + `/*# sourceMappingURL=${css.map.toUrl()}*/`);
                        contents = contents + `\nimport "${cssPath}";`;
                    }

                    const result: OnLoadResult = { contents, warnings: warnings.map(convertMessage) };

                    // if we are told to cache, then cache
                    if (options?.cache === true) {
                        fileCache.set(args.path, { data: result, time: new Date() });
                    }

                    return result;
                } catch (e) {
                    return { errors: [convertMessage(e)] }
                }
            })


            //if the css exists in our map, then output it with the css loader
            build.onResolve({ filter: /\.esbuild-svelte-fake-css$/ }, ({ path }) => {
                return { path, namespace: 'fakecss' }
            })

            build.onLoad({ filter: /\.esbuild-svelte-fake-css$/, namespace: 'fakecss' }, ({ path }) => {
                const css = cssCode.get(path);
                return css ? { contents: css, loader: "css" } : null;
            })
        },
    }
}

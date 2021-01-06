//original version from https://github.com/evanw/esbuild/blob/plugins/docs/plugin-examples.md
import { preprocess, compile } from 'svelte/compiler';
import { relative } from 'path';
import { promisify } from 'util';
import { readFile } from 'fs';

import type { CompileOptions, Warning } from 'svelte/types/compiler/interfaces';
import type { PreprocessorGroup } from 'svelte/types/compiler/preprocess';
import type { Plugin } from 'esbuild';

interface esbuildSvelteOptions {
    compileOptions?: CompileOptions
    preprocessor?: PreprocessorGroup | PreprocessorGroup[]
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
            //Store generated css code for use in fake import
            const cssCode = new Map();

            //main loader
            build.onLoad({ filter: /\.svelte$/ }, async (args) => {
                let source = await promisify(readFile)(args.path, 'utf8');
                const filename = relative(process.cwd(), args.path);

                let compileOptions = { css: false, ...(options && options.compileOptions) };

                try {
                    //do preprocessor stuff if it exists
                    if (options && options.preprocessor) {
                        const processed = await preprocess(source, options.preprocessor, { filename });
                        source = processed.code;
                        if (processed.map) {
                            compileOptions.sourcemap = processed.map;
                        }
                    }

                    const { js, css, warnings } = compile(source, { ...compileOptions, filename });

                    // a terrible solution if there ever was one, but grab the orignal file to prepopulate sourcesContent for the source map
                    // TODO insure the source map works if importing files as a part of pre-processing, right now it assumes only one file is outputed in the sources from pre-processing and compiling which might be broken with SASS and others
                    js.map.sourcesContent = [await promisify(readFile)(args.path, 'utf8')]

                    // add sourcemap
                    let contents = js.code + `\n//# sourceMappingURL=` + js.map.toUrl()

                    //if svelte emits css seperately, then store it in a map and import it from the js
                    if (!compileOptions.css && css.code) {
                        const cssPath = args.path.replace(".svelte", ".esbuild-svelte-fake-css").replace(/\\/g, "/");
                        cssCode.set(cssPath, css.code + `/*# sourceMappingURL=${css.map.toUrl()}*/`);
                        contents = contents + `\nimport "${cssPath}";`;
                    }

                    return { contents, warnings: warnings.map(convertMessage) };
                } catch (e) {
                    return { errors: [convertMessage(e)] }
                }
            })

            //if the css exists in our map, then output it with the css loader
            build.onLoad({ filter: /\.esbuild-svelte-fake-css$/ }, (args) => {
                const css = cssCode.get(args.path);
                return css ? { contents: css, loader: "css" } : null;
            })
        },
    }
}

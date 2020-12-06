//original version from https://github.com/evanw/esbuild/blob/plugins/docs/plugin-examples.md
const svelte = require('svelte/compiler')
const path = require('path')
const util = require('util')
const fs = require('fs')

const convertMessage = ({ message, start, end, filename, frame }) => ({
    text: message,
    location: start && end && {
        file: filename,
        line: start.line,
        column: start.column,
        length: start.line === end.line ? end.column - start.column : 0,
        lineText: frame,
    },
})

const sveltePlugin = options => {
    return {
        name: 'esbuild-svelte',
        setup(build) {
            //Store generated css code for use in fake import
            const cssCode = new Map();

            //main loader
            build.onLoad({ filter: /\.svelte$/ }, async (args) => {
                let source = await util.promisify(fs.readFile)(args.path, 'utf8')
                let filename = path.relative(process.cwd(), args.path)
                try {
                    //do preprocessor stuff if it exists
                    if (options && options.preprocessor) {
                        source = (await svelte.preprocess(source, options.preprocessor, { filename })).code;
                    }

                    let compileOptions = { css: false, ...(options && options.compileOptions) };

                    let { js, css, warnings } = svelte.compile(source, { ...compileOptions, filename })
                    let contents = js.code + `\n//# sourceMappingURL=` + js.map.toUrl()

                    //if svelte emits css seperately, then store it in a map and import it from the js
                    if (!compileOptions.css && css.code) {
                        let cssPath = args.path.replace(".svelte", ".esbuild-svelte-fake-css").replace(/\\/g, "/");
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


module.exports = sveltePlugin;

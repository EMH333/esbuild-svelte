//original version from https://github.com/evanw/esbuild/blob/plugins/docs/plugin-examples.md
let svelte = require('svelte/compiler')
let path = require('path')
let util = require('util')
let fs = require('fs')

let convertMessage = ({ message, start, end, filename, frame }) => ({
    text: message,
    location: start && end && {
        file: filename,
        line: start.line,
        column: start.column,
        length: start.line === end.line ? end.column - start.column : 0,
        lineText: frame,
    },
})

let sveltePlugin = options => {
    return {
        name: 'esbuild-svelte',
        setup(build) {
            build.onLoad({ filter: /\.svelte$/ }, async (args) => {
                let source = await util.promisify(fs.readFile)(args.path, 'utf8')
                let filename = path.relative(process.cwd(), args.path)
                try {
                    //do preprocessor stuff if it exists
                    if (options && options.preprocessor) {
                        source = (await svelte.preprocess(source, options.preprocessor, { filename })).code;
                    }

                    let compileOptions = { css: true, ...(options && options.compileOptions) };

                    let { js, warnings } = svelte.compile(source, { ...compileOptions, filename })
                    let contents = js.code + `//# sourceMappingURL=` + js.map.toUrl()
                    return { contents, warnings: warnings.map(convertMessage) };
                } catch (e) {
                    return { errors: [convertMessage(e)] }
                }
            })
        },
    }
}


module.exports = sveltePlugin;